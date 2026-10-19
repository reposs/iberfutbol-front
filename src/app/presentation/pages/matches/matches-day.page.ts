import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import { Match } from '../../../domain/entities/football.models';
import { MatchCardComponent } from '../../components/match-card.component';
import {
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingSkeletonComponent,
} from '../../components/ui-states.component';
import { AdPlaceholderComponent } from '../../components/ad-placeholder.component';

@Component({
  selector: 'app-matches-day-page',
  standalone: true,
  imports: [
    RouterLink,
    MatchCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    AdPlaceholderComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Page Header + Day Switcher -->
      <div
        class="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div>
          <span
            class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1"
          >
            CENTRAL DE MARCADORES · {{ activeDateIso() || 'TEMPORADA 2026/27' }}
          </span>
          <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
            {{ pageTitle() }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Resultados en vivo, horarios oficiales, goleadores y acceso directo al centro estadístico de cada partido.
          </p>
        </div>

        <!-- Day Tabs: Ayer | Hoy | Mañana | Calendario -->
        <div
          class="inline-flex flex-wrap items-center gap-1.5 bg-pitch-950 p-1.5 rounded-2xl border border-white/10 self-start"
        >
          @for (tab of dayTabs; track tab.day) {
            <a
              [routerLink]="tab.route"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-bold transition-all"
              [class.bg-brand-red]="activeDay() === tab.day"
              [class.text-white]="activeDay() === tab.day"
              [class.text-slate-400]="activeDay() !== tab.day"
              [class.hover:text-white]="activeDay() !== tab.day"
            >
              {{ tab.label }}
            </a>
          }
        </div>
      </div>

      <!-- Competition Filters (Section 15: Todos, LaLiga, Segunda, Primera Federación, Segunda Federación, Copa, Selección) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        @for (filter of competitionFilters; track filter.slug) {
          <button
            type="button"
            (click)="selectCompetition(filter.slug)"
            [class]="
              selectedCompetition() === filter.slug
                ? 'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all bg-emerald-500 text-pitch-950 border-emerald-400'
                : 'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all bg-slate-900/80 text-slate-300 border-white/10 hover:text-white'
            "
          >
            {{ filter.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <app-loading-skeleton />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="loadMatches()" />
      } @else if (matches().length === 0) {
        <app-empty-state
          title="No hay partidos programados con este filtro"
          description="Selecciona 'Todos' o cambia entre Ayer, Hoy, Mañana y Calendario Completo para consultar más encuentros."
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (match of matches(); track match.id) {
            <app-match-card [match]="match" />
          }
        </div>
      }

      <app-ad-placeholder
        slot="MATCHES-LIST-FOOTER"
        label="Patrocinio oficial de marcadores en vivo · IberFútbol Data Center"
      />
    </main>
  `,
})
export class MatchesDayPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly activeDay = signal<string>('hoy');
  readonly activeDateIso = signal<string>('');
  readonly selectedCompetition = signal<string>('todos');
  readonly matches = signal<Match[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly dayTabs = [
    { day: 'ayer', label: 'Ayer', route: '/partidos/ayer' },
    { day: 'hoy', label: 'Hoy', route: '/partidos/hoy' },
    { day: 'manana', label: 'Mañana', route: '/partidos/manana' },
    { day: 'calendario', label: 'Calendario', route: '/calendario' },
  ];

  readonly competitionFilters = [
    { slug: 'todos', label: 'Todos' },
    { slug: 'laliga-ea-sports', label: 'LaLiga' },
    { slug: 'laliga-hypermotion', label: 'Segunda' },
    { slug: 'primera-federacion', label: 'Primera Federación' },
    { slug: 'segunda-federacion', label: 'Segunda Federación' },
    { slug: 'copa-del-rey', label: 'Copa' },
    { slug: 'seleccion-espanola', label: 'Selección' },
  ];

  pageTitle(): string {
    switch (this.activeDay()) {
      case 'ayer':
        return 'Resultados de Ayer';
      case 'manana':
        return 'Partidos de Mañana';
      case 'calendario':
        return 'Calendario de la Jornada';
      case 'hoy':
      default:
        return 'Partidos de Hoy';
    }
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const fixedMode = data['mode'] as string | undefined;
      const dayData = data['day'] as string | undefined;
      if (fixedMode === 'calendario') {
        this.activeDay.set('calendario');
        this.loadMatches();
      } else if (dayData) {
        this.activeDay.set(dayData);
        this.loadMatches();
      }
    });
  }

  selectCompetition(slug: string): void {
    this.selectedCompetition.set(slug);
    this.loadMatches();
  }

  loadMatches(): void {
    this.loading.set(true);
    this.error.set(null);

    this.seo.updatePageSeo({
      title: `${this.pageTitle()} — Horarios y Resultados en Directo`,
      description: `Consulta todos los ${this.pageTitle().toLowerCase()} de LaLiga EA Sports, LaLiga Hypermotion, Primera Federación, Segunda Federación, Copa del Rey y Selección.`,
    });

    if (this.activeDay() === 'calendario') {
      this.facade
        .getCalendarMatches(this.selectedCompetition())
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (items) => {
            this.activeDateIso.set('JORNADA COMPLETA');
            this.matches.set(items);
          },
          error: () =>
            this.error.set('Error al cargar el calendario de partidos.'),
        });
      return;
    }

    this.facade
      .getMatchesByDay(this.activeDay(), this.selectedCompetition())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.activeDateIso.set(res.dateIso);
          this.matches.set(res.matches);
        },
        error: () =>
          this.error.set('Error al cargar los partidos de la fecha indicada.'),
      });
  }
}
