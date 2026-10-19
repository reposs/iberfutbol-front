import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import {
  GeneratedContent,
  StandingTable,
} from '../../../domain/entities/football.models';
import { LeagueTableComponent } from '../../components/league-table.component';
import {
  ErrorStateComponent,
  LoadingSkeletonComponent,
} from '../../components/ui-states.component';
import { AdPlaceholderComponent } from '../../components/ad-placeholder.component';
import { AiEditorialCardComponent } from '../../components/ai-editorial-card.component';
import { BreadcrumbNavComponent } from '../../components/breadcrumb-nav.component';

@Component({
  selector: 'app-standings-page',
  standalone: true,
  imports: [
    RouterLink,
    LeagueTableComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    AdPlaceholderComponent,
    AiEditorialCardComponent,
    BreadcrumbNavComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <app-breadcrumb-nav
        [items]="[
          { label: 'Inicio', path: '/' },
          { label: 'Competiciones', path: '/competiciones' },
          { label: 'Clasificación ' + (table()?.competitionName || 'LaLiga'), path: '/clasificacion/' + activeSlug() }
        ]"
      />
      <!-- Header & Competition Switcher -->
      <div
        class="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div>
          <span
            class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1"
          >
            CLASIFICACIONES OFICIALES · TEMPORADA {{ table()?.season || '2026/27' }}
          </span>
          <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
            {{ table()?.competitionName || 'Clasificación del Fútbol Español' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Puntos, diferencia de goles, racha de los últimos 5 partidos y zonas de acceso a Champions, Europa, Ascenso y Descenso.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          @for (comp of leagueTabs; track comp.slug) {
            <a
              [routerLink]="['/clasificacion', comp.slug]"
              [class]="
                activeSlug() === comp.slug
                  ? 'px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-bold border transition-all bg-brand-red border-brand-red text-white'
                  : 'px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-bold border transition-all bg-pitch-950 border-white/10 text-slate-300 hover:text-white'
              "
            >
              {{ comp.label }}
            </a>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading-skeleton />
      } @else if (error() || !table()) {
        <app-error-state
          [message]="error() || 'Clasificación no disponible'"
          (retry)="loadStandings(activeSlug())"
        />
      } @else {
        @if (table(); as t) {
          <app-league-table [rows]="t.rows" [legend]="t.legend" />

          <app-ai-editorial-card
            [content]="roundAiContent()"
            [loading]="aiLoading()"
            (refreshRequested)="loadRoundAi(activeSlug(), true)"
          />
        }
      }

      <app-ad-placeholder slot="STANDINGS-FOOTER" />
    </main>
  `,
})
export class StandingsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly activeSlug = signal<string>('laliga-ea-sports');
  readonly table = signal<StandingTable | null>(null);
  readonly roundAiContent = signal<GeneratedContent | null>(null);
  readonly aiLoading = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly leagueTabs = [
    { slug: 'laliga-ea-sports', label: 'LaLiga EA Sports' },
    { slug: 'laliga-hypermotion', label: 'LaLiga Hypermotion' },
    { slug: 'primera-federacion', label: 'Primera Federación' },
    { slug: 'segunda-federacion', label: 'Segunda Federación' },
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const comp = params.get('competition') || 'laliga-ea-sports';
      const normalized =
        comp === 'laliga'
          ? 'laliga-ea-sports'
          : comp === 'segunda'
            ? 'laliga-hypermotion'
            : comp;
      this.activeSlug.set(normalized);
      this.loadStandings(normalized);
    });
  }

  loadStandings(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.facade
      .getStandings(slug)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.table.set(data);
          this.seo.updatePageSeo({
            title: `Clasificación ${data.competitionName} ${data.season} — Jornada ${data.matchday}`,
            description: `Tabla de clasificación actualizada de ${data.competitionName}: puntos, partidos ganados, goles a favor, forma reciente y puestos de Champions, ascenso y descenso.`,
            canonicalPath: `/clasificacion/${data.competitionSlug}`,
            breadcrumbs: [
              { label: 'Inicio', path: '/' },
              { label: 'Competiciones', path: '/competiciones' },
              { label: `Clasificación ${data.competitionName}`, path: `/clasificacion/${data.competitionSlug}` },
            ],
            structuredData: this.seo.buildCompetitionSchema(
              data.competitionName,
              data.competitionSlug,
              data.season,
            ),
          });
          this.loadRoundAi(slug, false);
        },
        error: () => {
          this.error.set(
            'No se pudo cargar la tabla de clasificación solicitada.',
          );
        },
      });
  }

  loadRoundAi(slug: string, refresh: boolean): void {
    this.aiLoading.set(true);
    this.facade
      .getRoundAiContent(slug, refresh)
      .pipe(finalize(() => this.aiLoading.set(false)))
      .subscribe({
        next: (content) => this.roundAiContent.set(content),
        error: () => undefined,
      });
  }
}
