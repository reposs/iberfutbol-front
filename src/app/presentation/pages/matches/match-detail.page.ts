import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import {
  GeneratedContent,
  Match,
  StandingTable,
} from '../../../domain/entities/football.models';
import { TeamBadgeComponent } from '../../components/team-badge.component';
import { LeagueTableComponent } from '../../components/league-table.component';
import { SectionHeaderComponent } from '../../components/section-header.component';
import {
  ErrorStateComponent,
  LoadingSkeletonComponent,
} from '../../components/ui-states.component';
import { AdPlaceholderComponent } from '../../components/ad-placeholder.component';
import { AiEditorialCardComponent } from '../../components/ai-editorial-card.component';
import { BreadcrumbNavComponent } from '../../components/breadcrumb-nav.component';

@Component({
  selector: 'app-match-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    TeamBadgeComponent,
    LeagueTableComponent,
    SectionHeaderComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    AdPlaceholderComponent,
    AiEditorialCardComponent,
    BreadcrumbNavComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      @if (loading()) {
        <app-loading-skeleton />
      } @else if (error() || !match()) {
        <app-error-state
          [message]="error() || 'Partido no encontrado'"
          (retry)="loadMatch(currentSlug)"
        />
      } @else {
        @if (match(); as m) {
        <app-breadcrumb-nav
          [items]="[
            { label: 'Inicio', path: '/' },
            { label: 'Partidos de Hoy', path: '/partidos/hoy' },
            { label: m.competitionName, path: '/competiciones/' + m.competitionSlug },
            { label: m.homeTeam.shortName + ' vs ' + m.awayTeam.shortName, path: '/partidos/' + m.slug }
          ]"
        />
        <!-- BROADCAST SCOREBOARD HERO -->
        <section
          [class]="
            m.status === 'LIVE'
              ? 'relative rounded-3xl overflow-hidden border border-brand-red/50 bg-gradient-to-br from-rose-950/60 via-slate-900 to-pitch-950 p-6 sm:p-10 pitch-grid-pattern shadow-2xl'
              : 'relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900 to-pitch-950 p-6 sm:p-10 pitch-grid-pattern shadow-2xl'
          "
        >
          <!-- Top Meta: Competition, Round, Stadium, Referee -->
          <div
            class="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 text-xs text-slate-300"
          >
            <div class="flex flex-wrap items-center gap-2.5">
              <a
                [routerLink]="['/clasificacion', m.competitionSlug]"
                class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 font-mono font-bold text-white uppercase tracking-wider"
              >
                {{ m.competitionName }}
              </a>
              <span class="font-mono text-slate-400">{{ m.roundLabel }}</span>
              <span>·</span>
              <span>🏟️ {{ m.stadium }} ({{ m.city }})</span>
            </div>

            <div class="flex items-center gap-3 font-mono text-slate-400">
              <span>📅 {{ m.dateIso }} · {{ m.kickoffTime }}h</span>
              @if (m.referee) {
                <span class="hidden sm:inline">· ⚖️ {{ m.referee }}</span>
              }
            </div>
          </div>

          <!-- Scoreboard Grid -->
          <div
            class="py-8 grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center"
          >
            <!-- Home Team -->
            <a
              [routerLink]="['/equipos', m.homeTeam.slug]"
              class="flex flex-col items-center gap-3 group"
            >
              <app-team-badge
                [name]="m.homeTeam.name"
                [code]="m.homeTeam.code"
                [primaryColor]="m.homeTeam.primaryColor"
                [secondaryColor]="m.homeTeam.secondaryColor"
                [logoUrl]="m.homeTeam.logoUrl"
                size="xl"
              />
              <h1
                class="font-display text-xl sm:text-3xl font-black text-white group-hover:text-emerald-300 transition-colors"
              >
                {{ m.homeTeam.name }}
              </h1>
            </a>

            <!-- Center Score & Status Badge -->
            <div class="flex flex-col items-center justify-center">
              @if (m.status === 'LIVE') {
                <span
                  class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-red/20 border border-brand-red text-brand-red font-mono text-xs font-bold mb-3"
                >
                  <span class="w-2 h-2 rounded-full bg-brand-red animate-ping"></span>
                  EN DIRECTO · {{ m.liveMinute }}'
                </span>
              } @else if (m.status === 'FINISHED') {
                <span
                  class="px-3 py-1 rounded-full bg-white/10 text-slate-300 font-mono text-xs font-bold mb-3"
                >
                  FINAL DEL PARTIDO
                </span>
              } @else {
                <span
                  class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold mb-3"
                >
                  PRÓXIMO · {{ m.kickoffTime }} H
                </span>
              }

              <div
                class="flex items-center justify-center gap-4 sm:gap-6 px-6 py-3 rounded-2xl bg-pitch-950/80 border border-white/15"
              >
                <span class="font-mono text-4xl sm:text-6xl font-black text-white tabular-nums">
                  {{ m.homeTeam.score !== null ? m.homeTeam.score : '-' }}
                </span>
                <span class="font-mono text-2xl text-slate-500">:</span>
                <span class="font-mono text-4xl sm:text-6xl font-black text-white tabular-nums">
                  {{ m.awayTeam.score !== null ? m.awayTeam.score : '-' }}
                </span>
              </div>

              @if (m.broadcastChannel) {
                <span class="mt-3 text-xs font-mono text-slate-400">
                  📺 Emisión oficial: {{ m.broadcastChannel }}
                </span>
              }
              <div class="mt-3 flex flex-wrap items-center justify-center gap-2">
                @if (m.status === 'LIVE' && m.broadcastUrl) {
                  <a
                    [href]="m.broadcastUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3.5 py-1.5 rounded-xl bg-brand-red hover:bg-rose-600 text-white text-xs font-display font-bold transition-colors inline-flex items-center gap-1.5 shadow-lg shadow-brand-red/20"
                  >
                    <span>📺 Ver emisión oficial en directo</span>
                    <span>↗</span>
                  </a>
                } @else if (m.status === 'FINISHED' && m.highlightsUrl) {
                  <a
                    [href]="m.highlightsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>▶ Ver resumen oficial (YouTube / RTVE)</span>
                    <span>↗</span>
                  </a>
                } @else if (m.status === 'UPCOMING' && m.broadcastUrl) {
                  <a
                    [href]="m.broadcastUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>📺 Guía de emisión oficial</span>
                    <span>↗</span>
                  </a>
                }
              </div>
            </div>

            <!-- Away Team -->
            <a
              [routerLink]="['/equipos', m.awayTeam.slug]"
              class="flex flex-col items-center gap-3 group"
            >
              <app-team-badge
                [name]="m.awayTeam.name"
                [code]="m.awayTeam.code"
                [primaryColor]="m.awayTeam.primaryColor"
                [secondaryColor]="m.awayTeam.secondaryColor"
                [logoUrl]="m.awayTeam.logoUrl"
                size="xl"
              />
              <h2
                class="font-display text-xl sm:text-3xl font-black text-white group-hover:text-emerald-300 transition-colors"
              >
                {{ m.awayTeam.name }}
              </h2>
            </a>
          </div>

          <!-- AI Editorial Summary Banner (if available) -->
          @if (m.aiSummaryTitle) {
            <div
              class="mt-4 pt-5 border-t border-white/10 rounded-2xl bg-white/[0.03] p-4 sm:p-5"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <span
                  class="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                >
                  ⚡ RESUMEN DEL ENCUENTRO
                </span>
              </div>
              <h3 class="font-display text-base sm:text-lg font-bold text-white">
                {{ m.aiSummaryTitle }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {{ m.aiSummaryText }}
              </p>
            </div>
          }
        </section>

        <!-- EVENTS + STATISTICS GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Cronología de Eventos (Goles y Tarjetas) -->
          <section>
            <app-section-header
              eyebrow="MINUTO A MINUTO"
              title="Eventos del Encuentro"
              subtitle="Goles, asistencias y amonestaciones registradas oficialmente"
            />
            <div
              class="rounded-2xl bg-slate-900/80 border border-white/10 p-5 space-y-3"
            >
              @if (m.events.length === 0) {
                <p class="text-sm text-slate-400 py-6 text-center">
                  El encuentro aún no registra eventos de acta oficial.
                </p>
              } @else {
                @for (ev of m.events; track ev.id) {
                  <div
                    class="flex items-center justify-between gap-3 p-3 rounded-xl bg-pitch-950/60 border border-white/5"
                  >
                    <div class="flex items-center gap-3">
                      <span
                        class="w-10 h-8 rounded-lg bg-white/5 font-mono text-xs font-bold text-emerald-400 inline-flex items-center justify-center"
                      >
                        {{ ev.minute }}'
                      </span>
                      <span class="text-base">
                        {{ ev.type === 'GOAL' ? '⚽' : ev.type === 'YELLOW_CARD' ? '🟨' : '🟥' }}
                      </span>
                      <div>
                        <span class="font-display font-bold text-sm text-white block">
                          {{ ev.playerName }}
                          <span class="text-xs font-mono text-slate-400 ml-1">
                            ({{ ev.teamSide === 'HOME' ? m.homeTeam.shortName : m.awayTeam.shortName }})
                          </span>
                        </span>
                        @if (ev.assistOrReplacedBy) {
                          <span class="text-xs text-emerald-400 block">
                            Asistencia: {{ ev.assistOrReplacedBy }}
                          </span>
                        }
                        @if (ev.detail) {
                          <span class="text-xs text-slate-400 block">
                            {{ ev.detail }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </section>

          <!-- Estadísticas Comparativas -->
          <section>
            <app-section-header
              eyebrow="MÉTRICAS DE RENDIMIENTO"
              title="Estadísticas del Partido"
              subtitle="Posesión, goles esperados (xG), remates y disciplina"
            />
            @if (m.statistics; as stats) {
              <div
                class="rounded-2xl bg-slate-900/80 border border-white/10 p-5 space-y-4"
              >
                @for (metric of buildMetrics(stats); track metric.label) {
                  <div>
                    <div class="flex justify-between text-xs font-mono font-bold mb-1.5">
                      <span class="text-white">{{ metric.homeDisplay }}</span>
                      <span class="text-slate-400 uppercase">{{ metric.label }}</span>
                      <span class="text-white">{{ metric.awayDisplay }}</span>
                    </div>
                    <div class="h-2 rounded-full bg-pitch-950 overflow-hidden flex">
                      <div
                        class="bg-brand-red transition-all"
                        [style.width.%]="metric.homePercent"
                      ></div>
                      <div
                        class="bg-emerald-500 transition-all"
                        [style.width.%]="100 - metric.homePercent"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div
                class="rounded-2xl bg-slate-900/80 border border-white/10 p-6 text-center text-sm text-slate-400"
              >
                Las estadísticas detalladas se activarán al inicio del partido.
              </div>
            }
          </section>
        </div>

        <!-- LINEUPS (ALINEACIONES) -->
        @if (m.homeLineup && m.awayLineup) {
          <section>
            <app-section-header
              eyebrow="PIZARRA TÁCTICA"
              title="Alineaciones Confirmadas"
              subtitle="Onces iniciales, dorsales, demarcaciones y valoraciones"
            />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Home Lineup -->
              <div class="rounded-2xl bg-slate-900/80 border border-white/10 p-5">
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                  <div>
                    <h3 class="font-display font-bold text-lg text-white">
                      {{ m.homeTeam.name }}
                    </h3>
                    <span class="text-xs text-slate-400">
                      Entrenador: {{ m.homeLineup.coach }}
                    </span>
                  </div>
                  <span class="px-2.5 py-1 rounded-lg bg-white/10 font-mono text-xs font-bold text-emerald-400">
                    {{ m.homeLineup.formation }}
                  </span>
                </div>
                <div class="space-y-2">
                  @for (pl of m.homeLineup.startingXI; track pl.number) {
                    <div class="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/5 text-sm">
                      <div class="flex items-center gap-3">
                        <span class="w-6 font-mono text-xs font-bold text-slate-400">
                          {{ pl.number }}
                        </span>
                        <span class="font-medium text-white">{{ pl.name }}</span>
                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          {{ pl.position }}
                        </span>
                      </div>
                      @if (pl.rating) {
                        <span class="font-mono text-xs font-bold text-emerald-400">
                          ★ {{ pl.rating }}
                        </span>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Away Lineup -->
              <div class="rounded-2xl bg-slate-900/80 border border-white/10 p-5">
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                  <div>
                    <h3 class="font-display font-bold text-lg text-white">
                      {{ m.awayTeam.name }}
                    </h3>
                    <span class="text-xs text-slate-400">
                      Entrenador: {{ m.awayLineup.coach }}
                    </span>
                  </div>
                  <span class="px-2.5 py-1 rounded-lg bg-white/10 font-mono text-xs font-bold text-emerald-400">
                    {{ m.awayLineup.formation }}
                  </span>
                </div>
                <div class="space-y-2">
                  @for (pl of m.awayLineup.startingXI; track pl.number) {
                    <div class="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/5 text-sm">
                      <div class="flex items-center gap-3">
                        <span class="w-6 font-mono text-xs font-bold text-slate-400">
                          {{ pl.number }}
                        </span>
                        <span class="font-medium text-white">{{ pl.name }}</span>
                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          {{ pl.position }}
                        </span>
                      </div>
                      @if (pl.rating) {
                        <span class="font-mono text-xs font-bold text-emerald-400">
                          ★ {{ pl.rating }}
                        </span>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>
        }

        <!-- AI EDITORIAL ANALYSIS (MATCH SUMMARY / PREVIEW) -->
        <app-ai-editorial-card
          [content]="aiContent()"
          [loading]="aiLoading()"
          (refreshRequested)="refreshAiContent()"
        />

        <!-- STANDINGS CONTEXT -->
        @if (standings(); as table) {
          <section>
            <app-section-header
              eyebrow="CONTEXTO CLASIFICATORIO"
              [title]="'Clasificación ' + table.competitionName"
              subtitle="Situación actual de ambos equipos en la tabla"
            />
            <app-league-table
              [rows]="table.rows"
              [legend]="table.legend"
              [highlightTeamSlug]="m.homeTeam.slug"
            />
          </section>
        }

        <app-ad-placeholder slot="MATCH-DETAIL-FOOTER" />
        }
      }
    </main>
  `,
})
export class MatchDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly match = signal<Match | null>(null);
  readonly standings = signal<StandingTable | null>(null);
  readonly aiContent = signal<GeneratedContent | null>(null);
  readonly aiLoading = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  currentSlug = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.currentSlug = slug;
        this.loadMatch(slug);
      }
    });
  }

  loadMatch(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.facade
      .getMatchDetails(slug)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.match.set(res.match);
          this.standings.set(res.standings);
          const m = res.match;
          this.seo.updatePageSeo({
            title: `${m.homeTeam.name} vs ${m.awayTeam.name} — ${m.competitionName} (${m.roundLabel})`,
            description: `Resultado en directo, alineaciones, goleadores y estadísticas del ${m.homeTeam.name} vs ${m.awayTeam.name} en ${m.stadium}.`,
            canonicalPath: `/partidos/${m.slug}`,
            ogType: 'article',
            breadcrumbs: [
              { label: 'Inicio', path: '/' },
              { label: 'Partidos', path: '/partidos/hoy' },
              { label: m.competitionName, path: `/competiciones/${m.competitionSlug}` },
              { label: `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`, path: `/partidos/${m.slug}` },
            ],
            structuredData: this.seo.buildMatchSchema(m),
          });
          this.loadAiContent(slug, false);
        },
        error: () => {
          this.error.set('No se pudo encontrar la ficha del partido solicitado.');
        },
      });
  }

  loadAiContent(slug: string, refresh: boolean): void {
    this.aiLoading.set(true);
    this.facade
      .getMatchAiContent(slug, refresh)
      .pipe(finalize(() => this.aiLoading.set(false)))
      .subscribe({
        next: (content) => this.aiContent.set(content),
        error: () => undefined,
      });
  }

  refreshAiContent(): void {
    if (this.currentSlug) {
      this.loadAiContent(this.currentSlug, true);
    }
  }

  buildMetrics(stats: NonNullable<Match['statistics']>) {
    const calcPct = (a: number, b: number) =>
      a + b === 0 ? 50 : Math.round((a / (a + b)) * 100);

    return [
      {
        label: 'Posesión (%)',
        homeDisplay: `${stats.possession[0]}%`,
        awayDisplay: `${stats.possession[1]}%`,
        homePercent: stats.possession[0],
      },
      {
        label: 'Goles Esperados (xG)',
        homeDisplay: stats.expectedGoals[0].toFixed(2),
        awayDisplay: stats.expectedGoals[1].toFixed(2),
        homePercent: calcPct(stats.expectedGoals[0], stats.expectedGoals[1]),
      },
      {
        label: 'Remates Totales',
        homeDisplay: String(stats.shots[0]),
        awayDisplay: String(stats.shots[1]),
        homePercent: calcPct(stats.shots[0], stats.shots[1]),
      },
      {
        label: 'Tiros a Puerta',
        homeDisplay: String(stats.shotsOnTarget[0]),
        awayDisplay: String(stats.shotsOnTarget[1]),
        homePercent: calcPct(stats.shotsOnTarget[0], stats.shotsOnTarget[1]),
      },
      {
        label: 'Saques de Esquina',
        homeDisplay: String(stats.corners[0]),
        awayDisplay: String(stats.corners[1]),
        homePercent: calcPct(stats.corners[0], stats.corners[1]),
      },
      {
        label: 'Faltas Cometidas',
        homeDisplay: String(stats.fouls[0]),
        awayDisplay: String(stats.fouls[1]),
        homePercent: calcPct(stats.fouls[0], stats.fouls[1]),
      },
    ];
  }
}
