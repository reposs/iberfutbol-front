import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import { SectionHeaderComponent } from '../../components/section-header.component';
import { MatchCardComponent } from '../../components/match-card.component';
import { LeagueTableComponent } from '../../components/league-table.component';
import { TeamCardComponent } from '../../components/team-card.component';
import {
  NewsCardComponent,
  TimelineComponent,
} from '../../components/timeline-and-news.component';
import { AdPlaceholderComponent } from '../../components/ad-placeholder.component';
import {
  ErrorStateComponent,
  LoadingSkeletonComponent,
} from '../../components/ui-states.component';
import { TeamBadgeComponent } from '../../components/team-badge.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    SectionHeaderComponent,
    MatchCardComponent,
    LeagueTableComponent,
    TeamCardComponent,
    TimelineComponent,
    NewsCardComponent,
    AdPlaceholderComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    TeamBadgeComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      <!-- HERO SECTION -->
      <section
        class="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-slate-900 via-pitch-900 to-rose-950/60 p-6 sm:p-10 lg:p-12 pitch-grid-pattern shadow-2xl"
      >
        <div class="relative z-10 max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-emerald-300 mb-5">
            <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TEMPORADA 2026/27 · COBERTURA OFICIAL MULTICATEGORÍA</span>
          </div>

          <h1
            class="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]"
          >
            EL FÚTBOL ESPAÑOL,
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-amber-400 to-emerald-400"
            >
              EN UN SOLO LUGAR
            </span>
          </h1>

          <p
            class="mt-4 text-sm sm:text-lg font-medium text-slate-300 tracking-wide"
          >
            Partidos · Resultados · Clasificaciones · Noticias · Estadísticas
          </p>

          <p class="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Desde LaLiga EA Sports y LaLiga Hypermotion hasta Primera y Segunda
            Federación, Copa del Rey y la Selección Española. Datos verificados
            al segundo y análisis táctico estructurado.
          </p>

          <div class="mt-7 flex flex-wrap items-center gap-3.5">
            <a
              routerLink="/partidos/hoy"
              class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-brand-red hover:bg-rose-600 text-white font-display font-bold text-sm sm:text-base shadow-lg shadow-brand-red/30 transition-all hover:-translate-y-0.5"
            >
              <span>⚽ Ver partidos de hoy</span>
              <span aria-hidden="true">→</span>
            </a>

            <a
              routerLink="/clasificacion/laliga-ea-sports"
              class="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-display font-semibold text-sm sm:text-base transition-all"
            >
              <span>📊 Clasificaciones</span>
            </a>
          </div>
        </div>

        <!-- Competition Quick Pills -->
        <div
          class="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2"
        >
          @for (comp of facade.competitions(); track comp.slug) {
            <a
              [routerLink]="['/competiciones', comp.slug]"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-pitch-950/70 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span
                class="w-2 h-2 rounded-full"
                [style.background-color]="comp.accentColor"
              ></span>
              <span>{{ comp.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- AD PLACEHOLDER 1 -->
      <app-ad-placeholder
        slot="HOME-HERO-BANNER"
        label="Retransmisiones oficiales, estadísticas xG y seguimiento en vivo de las 6 grandes competiciones españolas"
      />

      @if (facade.homeLoading()) {
        <app-loading-skeleton />
      } @else if (facade.homeError()) {
        <app-error-state
          [message]="facade.homeError()!"
          (retry)="facade.loadHomeDashboard()"
        />
      } @else {
        <!-- 🔴 EN DIRECTO -->
        @if (facade.liveMatches().length > 0) {
          <section aria-label="Partidos en directo">
            <app-section-header
              eyebrow="🔴 EN DIRECTO AHORA MISMO"
              [isLive]="true"
              title="Marcadores en Juego"
              subtitle="Seguimiento minuto a minuto con estadísticas y eventos verificados"
              actionLabel="Ver toda la jornada de hoy"
              actionRoute="/partidos/hoy"
            />
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
              @for (match of facade.liveMatches(); track match.id) {
                <app-match-card [match]="match" />
              }
            </div>
          </section>
        }

        <!-- PARTIDOS DESTACADOS -->
        <section aria-label="Partidos destacados">
          <app-section-header
            eyebrow="CARTELERA DE LA JORNADA"
            title="Partidos Destacados"
            subtitle="Encuentros clave de LaLiga, Segunda, Primera RFEF y Selección"
            actionLabel="Calendario completo"
            actionRoute="/calendario"
          />
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (match of facade.featuredMatches().slice(0, 6); track match.id) {
              <app-match-card [match]="match" />
            }
          </div>
        </section>

        <!-- GRID PRINCIPAL: CLASIFICACIÓN LALIGA (2 COLS) + QUÉ ESTÁ PASANDO TIMELINE (1 COL) -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div class="lg:col-span-2">
            <app-section-header
              [eyebrow]="'TEMPORADA ' + (facade.laligaStandings()?.season || '2025/26') + ' · JORNADA ' + (facade.laligaStandings()?.matchday || 9)"
              title="Clasificación LaLiga EA Sports"
              subtitle="Puestos de Champions League, Europa, Conference y zona de permanencia"
              actionLabel="Tabla completa y otras ligas"
              actionRoute="/clasificacion/laliga-ea-sports"
            />
            @if (facade.laligaStandings(); as table) {
              <app-league-table
                [rows]="table.rows.slice(0, 8)"
                [legend]="table.legend"
                [compact]="true"
              />
            }
          </div>

          <div class="lg:col-span-1">
            <app-section-header
              eyebrow="TIMELINE EN TIEMPO REAL"
              [isLive]="true"
              title="Qué está pasando"
              subtitle="Últimas novedades del fútbol español"
              actionLabel="Ver todo"
              actionRoute="/actualidad"
            />
            <app-timeline [items]="facade.timelineEvents()" />
          </div>
        </section>

        <!-- AD PLACEHOLDER 2 -->
        <app-ad-placeholder
          slot="HOME-MID-CONTENT"
          label="Toda la jornada del fútbol español en directo: marcadores, goleadores y clasificaciones al instante"
        />

        <!-- EQUIPOS DESTACADOS -->
        <section aria-label="Clubes destacados">
          <app-section-header
            eyebrow="CLUBES Y ESTADÍSTICAS"
            title="Equipos Destacados"
            subtitle="Fichas completas con estadio, racha reciente, plantilla y métricas por partido"
            actionLabel="Explorar todos los equipos"
            actionRoute="/equipos"
          />
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (team of facade.featuredTeams().slice(0, 6); track team.slug) {
              <app-team-card [team]="team" />
            }
          </div>
        </section>

        <!-- ESTADÍSTICAS (GOLEADORES) + PRÓXIMOS PARTIDOS -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Máximos Goleadores -->
          <div>
            <app-section-header
              eyebrow="RENDIMIENTO INDIVIDUAL"
              title="Máximos Artilleros y Estrellas"
              subtitle="Jugadores con mayor impacto goleador y valoración media"
              actionLabel="Ver todos los jugadores"
              actionRoute="/jugadores"
            />
            <div
              class="rounded-2xl bg-slate-900/80 border border-white/10 divide-y divide-white/5 overflow-hidden"
            >
              @for (player of facade.topScorers(); track player.slug; let idx = $index) {
                <a
                  [routerLink]="['/jugadores', player.slug]"
                  class="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.04] transition-colors group"
                >
                  <div class="flex items-center gap-3.5 min-w-0">
                    <span
                      class="w-6 text-center font-mono font-bold text-sm"
                      [class.text-amber-400]="idx === 0"
                      [class.text-slate-400]="idx > 0"
                    >
                      {{ idx + 1 }}º
                    </span>
                    <div class="relative shrink-0">
                      @if (player.photoUrl) {
                        <div
                          class="w-10 h-10 rounded-xl bg-slate-950 border border-white/15 overflow-hidden shadow"
                        >
                          <img
                            [src]="player.photoUrl"
                            [alt]="player.name"
                            loading="lazy"
                            class="w-full h-full object-cover object-top"
                          />
                        </div>
                        @if (player.teamLogoUrl) {
                          <img
                            [src]="player.teamLogoUrl"
                            [alt]="player.teamName"
                            loading="lazy"
                            class="w-4 h-4 rounded bg-slate-950/90 p-0.5 border border-white/20 object-contain absolute -bottom-1 -right-1"
                          />
                        }
                      } @else {
                        <app-team-badge
                          [name]="player.teamName"
                          [code]="player.positionCode"
                          [primaryColor]="player.teamPrimaryColor"
                          [logoUrl]="player.teamLogoUrl"
                          size="sm"
                        />
                      }
                    </div>
                    <div class="min-w-0">
                      <h3
                        class="font-display font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors truncate"
                      >
                        {{ player.name }}
                      </h3>
                      <p class="text-xs text-slate-400 truncate">
                        {{ player.teamName }} · {{ player.position }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 shrink-0">
                    <div class="text-right">
                      <span class="block font-mono font-extrabold text-lg text-emerald-400 leading-none">
                        {{ player.stats.goals }}
                      </span>
                      <span class="text-[10px] font-mono text-slate-400 uppercase">
                        Goles
                      </span>
                    </div>
                    <div class="text-right pl-3 border-l border-white/10">
                      <span class="block font-mono font-bold text-sm text-white leading-none">
                        {{ player.stats.assists }}
                      </span>
                      <span class="text-[10px] font-mono text-slate-400 uppercase">
                        Asist.
                      </span>
                    </div>
                  </div>
                </a>
              }
            </div>
          </div>

          <!-- Próximos Partidos -->
          <div>
            <app-section-header
              eyebrow="AGENDA INMEDIATA"
              title="Próximos Encuentros"
              subtitle="Horarios oficiales y canales de emisión confirmados"
              actionLabel="Partidos de mañana"
              actionRoute="/partidos/manana"
            />
            <div class="space-y-4">
              @for (match of facade.upcomingMatches(); track match.id) {
                <app-match-card [match]="match" />
              }
            </div>
          </div>
        </section>

        <!-- ÚLTIMAS NOTICIAS -->
        <section aria-label="Últimas noticias">
          <app-section-header
            eyebrow="ACTUALIDAD Y CRÓNICAS DE LA JORNADA"
            title="Últimas Noticias"
            subtitle="Toda la actualidad de los clubes, competiciones y selección española"
            actionLabel="Hemeroteca de noticias"
            actionRoute="/noticias"
          />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            @for (item of facade.latestNews(); track item.id) {
              <app-news-card [news]="item" />
            }
          </div>
        </section>

        <!-- FAQ SECTION FOR SEO & GEO -->
        <section aria-labelledby="faq-heading" class="pt-6 border-t border-white/10 space-y-6">
          <div class="max-w-3xl">
            <span class="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              INFORMACIÓN Y PREGUNTAS FRECUENTES
            </span>
            <h2 id="faq-heading" class="font-display text-2xl sm:text-3xl font-black text-white mt-2">
              Preguntas Frecuentes sobre el Fútbol Español
            </h2>
            <p class="text-sm text-slate-400 mt-1">
              Respuestas directas y datos contrastados sobre competiciones, marcadores y clasificaciones oficiales.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (faq of faqs; track faq.question) {
              <article class="p-5 rounded-2xl border border-white/10 bg-pitch-900/50 hover:border-white/20 transition-colors space-y-2">
                <h3 class="text-sm sm:text-base font-display font-bold text-slate-100 flex items-start gap-2">
                  <span class="text-brand-red font-mono font-bold">Q.</span>
                  <span>{{ faq.question }}</span>
                </h3>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed pl-5">
                  {{ faq.answer }}
                </p>
              </article>
            }
          </div>
        </section>

        <!-- AD PLACEHOLDER 3 -->
        <app-ad-placeholder
          slot="HOME-FOOTER-BANNER"
          label="Cobertura integral del fútbol español: LaLiga EA Sports, LaLiga Hypermotion, Primera y Segunda Federación, Copa del Rey y Selección"
        />
      }
    </main>
  `,
})
export class HomePageComponent implements OnInit {
  readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly faqs = [
    {
      question: '¿Dónde consultar los resultados y partidos en directo del fútbol español?',
      answer:
        'En IberFútbol (iberfutbol.es) puedes seguir marcadores en directo al segundo, resultados de partidos finalizados y horarios de las próximas jornadas de LaLiga EA Sports, LaLiga Hypermotion, Primera y Segunda Federación, Copa del Rey y la Selección Española.',
    },
    {
      question: '¿Con qué frecuencia se actualizan las clasificaciones oficiales?',
      answer:
        'Las tablas clasificatorias se recalculan automáticamente en tiempo real al finalizar cada partido disputado, computando puntos, partidos jugados, victorias, empates, derrotas, golaveraje particular y general para definir puestos europeos y de descenso.',
    },
    {
      question: '¿Qué información individual se ofrece sobre futbolistas y plantillas?',
      answer:
        'Cada club cuenta con su plantilla actualizada y perfiles individuales con dorsales, nacionalidad, demarcación táctica, edad, valor de mercado estimado, partidos jugados, goles anotados, asistencias y tarjetas acumuladas.',
    },
    {
      question: '¿Es posible buscar clubes y jugadores de todas las categorías?',
      answer:
        'Sí, el buscador global indexa simultáneamente clubes, estadios, entrenadores y futbolistas de Primera División, Segunda División, Primera RFEF y competiciones coperas nacionales.',
    },
  ];

  ngOnInit(): void {
    this.seo.updatePageSeo({
      title: 'El Fútbol Español, en un solo lugar',
      description:
        'Portal deportivo profesional del fútbol español: partidos en directo, resultados, clasificaciones de LaLiga, Segunda, Primera RFEF, equipos, jugadores y noticias.',
      structuredData: [
        this.seo.buildWebsiteSchema(),
        this.seo.buildFaqSchema(this.faqs),
      ],
    });
    this.facade.loadHomeDashboard();
  }
}
