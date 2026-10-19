import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import {
  Competition,
  Match,
  StandingTable,
} from '../../../domain/entities/football.models';
import { MatchCardComponent } from '../../components/match-card.component';
import { LeagueTableComponent } from '../../components/league-table.component';
import { SectionHeaderComponent } from '../../components/section-header.component';
import {
  ErrorStateComponent,
  LoadingSkeletonComponent,
} from '../../components/ui-states.component';

@Component({
  selector: 'app-competitions-page',
  standalone: true,
  imports: [RouterLink, LoadingSkeletonComponent],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div class="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8">
        <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
          ESTRUCTURA PIRAMIDAL Y TORNEOS RFEF / LALIGA
        </span>
        <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
          Competiciones del Fútbol Español
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Cobertura integral desde la élite profesional hasta las categorías federativas nacionales y la Selección.
        </p>
      </div>

      @if (loading()) {
        <app-loading-skeleton />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (comp of competitions(); track comp.slug) {
            <div
              class="rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 p-6 flex flex-col justify-between transition-all shadow-lg"
            >
              <div>
                <div class="flex items-center justify-between gap-3 mb-4">
                  <span
                    class="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-white text-sm shadow-md"
                    [style.background-color]="comp.accentColor"
                  >
                    {{ comp.logoText }}
                  </span>
                  <span class="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                    Temporada {{ comp.currentSeason }} · J{{ comp.currentMatchday }}/{{ comp.totalMatchdays }}
                  </span>
                </div>
                <h2 class="font-display text-xl font-black text-white mb-2">
                  {{ comp.name }}
                </h2>
                <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  {{ comp.description }}
                </p>
              </div>

              <div class="pt-4 border-t border-white/10 flex items-center justify-between gap-2 text-xs font-semibold">
                <a
                  [routerLink]="['/competiciones', comp.slug]"
                  class="text-emerald-400 hover:underline"
                >
                  Ver centro de competición →
                </a>
                @if (comp.type === 'LEAGUE') {
                  <a
                    [routerLink]="['/clasificacion', comp.slug]"
                    class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                  >
                    Clasificación
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </main>
  `,
})
export class CompetitionsPageComponent implements OnInit {
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly competitions = signal<Competition[]>([]);
  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    this.seo.updatePageSeo({
      title: 'Competiciones del Fútbol Español — LaLiga, Segunda, 1ª RFEF, Copa y Selección',
      description:
        'Explora todas las competiciones oficiales del fútbol español: LaLiga EA Sports, LaLiga Hypermotion, Primera Federación, Segunda Federación, Copa del Rey y Selección.',
    });
    this.loading.set(true);
    this.facade
      .getCompetitions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.competitions.set(data));
  }
}

@Component({
  selector: 'app-competition-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    MatchCardComponent,
    LeagueTableComponent,
    SectionHeaderComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      @if (loading()) {
        <app-loading-skeleton />
      } @else if (error() || !competition()) {
        <app-error-state [message]="error() || 'Competición no encontrada'" />
      } @else {
        @if (competition(); as comp) {
        <section class="rounded-3xl bg-slate-900/80 border border-white/15 p-6 sm:p-10">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-white text-lg"
                [style.background-color]="comp.accentColor"
              >
                {{ comp.logoText }}
              </div>
              <div>
                <span class="text-xs font-mono text-emerald-400 uppercase">
                  Temporada {{ comp.currentSeason }} · Jornada {{ comp.currentMatchday }} de {{ comp.totalMatchdays }}
                </span>
                <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
                  {{ comp.name }}
                </h1>
                <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                  {{ comp.description }}
                </p>
              </div>
            </div>
            <a
              routerLink="/competiciones"
              class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
            >
              ← Todas las competiciones
            </a>
          </div>
        </section>

        @if (matches().length > 0) {
          <section>
            <app-section-header
              eyebrow="ENCUENTROS DE LA JORNADA"
              [title]="'Partidos de ' + comp.shortName"
            />
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (m of matches(); track m.id) {
                <app-match-card [match]="m" />
              }
            </div>
          </section>
        }

        @if (standings(); as table) {
          <section>
            <app-section-header
              eyebrow="TABLA OFICIAL"
              [title]="'Clasificación ' + comp.name"
            />
            <app-league-table [rows]="table.rows" [legend]="table.legend" />
          </section>
        }
        }
      }
    </main>
  `,
})
export class CompetitionDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly competition = signal<Competition | null>(null);
  readonly matches = signal<Match[]>([]);
  readonly standings = signal<StandingTable | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadDetail(slug);
      }
    });
  }

  loadDetail(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      comp: this.facade.getCompetitionBySlug(slug),
      matches: this.facade.getCalendarMatches(slug),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ comp, matches }) => {
          this.competition.set(comp);
          this.matches.set(matches);
          this.seo.updatePageSeo({
            title: `${comp.name} ${comp.currentSeason} — Resultados, Clasificación y Equipos`,
            description: comp.description,
          });
          if (comp.type === 'LEAGUE') {
            this.facade.getStandings(comp.slug).subscribe({
              next: (st) => this.standings.set(st),
              error: () => this.standings.set(null),
            });
          }
        },
        error: () => this.error.set('No se encontró la competición.'),
      });
  }
}
