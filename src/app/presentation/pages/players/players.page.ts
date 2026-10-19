import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import {
  GeneratedContent,
  Player,
  PlayerFullProfile,
} from '../../../domain/entities/football.models';
import { TeamBadgeComponent } from '../../components/team-badge.component';
import { PlayerCardComponent } from '../../components/player-card.component';
import { MatchCardComponent } from '../../components/match-card.component';
import { NewsCardComponent } from '../../components/timeline-and-news.component';
import { SectionHeaderComponent } from '../../components/section-header.component';
import {
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingSkeletonComponent,
} from '../../components/ui-states.component';
import { AdPlaceholderComponent } from '../../components/ad-placeholder.component';
import { AiEditorialCardComponent } from '../../components/ai-editorial-card.component';
import { BreadcrumbNavComponent } from '../../components/breadcrumb-nav.component';

@Component({
  selector: 'app-players-list-page',
  standalone: true,
  imports: [
    FormsModule,
    PlayerCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    AdPlaceholderComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Header & Filters -->
      <div class="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              ESTADÍSTICAS OFICIALES Y RENDIMIENTO
            </span>
            <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
              Jugadores del Fútbol Español
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Goles, asistencias, minutos disputados, tarjetas y rendimiento oficial verificado por competición y demarcación.
            </p>
          </div>

          <!-- Quick Search + Sort By -->
          <div class="flex flex-wrap items-center gap-3">
            <input
              type="search"
              [(ngModel)]="searchText"
              (ngModelChange)="loadPlayers()"
              placeholder="Filtrar por nombre o club..."
              class="w-full sm:w-auto bg-pitch-950 text-xs sm:text-sm text-white placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-emerald-400"
            />
            <select
              [(ngModel)]="sortBy"
              (ngModelChange)="loadPlayers()"
              aria-label="Ordenar jugadores por métrica"
              class="w-full sm:w-auto bg-pitch-950 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-emerald-400 font-semibold"
            >
              <option value="goals">Ordenar por: Goles</option>
              <option value="assists">Ordenar por: Asistencias</option>
              <option value="rating">Ordenar por: Valoración</option>
              <option value="minutes">Ordenar por: Minutos</option>
            </select>
          </div>
        </div>

        <!-- Competition & Position Pills -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div class="flex flex-wrap items-center gap-2">
            @for (comp of competitionFilters; track comp.slug) {
              <button
                type="button"
                (click)="selectCompetition(comp.slug)"
                [class]="
                  selectedCompetition() === comp.slug
                    ? 'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-emerald-500 text-pitch-950 border-emerald-400'
                    : 'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-pitch-950 text-slate-300 border-white/10 hover:text-white'
                "
              >
                {{ comp.label }}
              </button>
            }
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            @for (pos of positionFilters; track pos.code) {
              <button
                type="button"
                (click)="selectPosition(pos.code)"
                [class]="
                  selectedPosition() === pos.code
                    ? 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all bg-brand-red text-white border-brand-red'
                    : 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all bg-pitch-950 text-slate-400 border-white/10 hover:text-white'
                "
              >
                {{ pos.label }}
              </button>
            }
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-loading-skeleton />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="loadPlayers()" />
      } @else if (players().length === 0) {
        <app-empty-state
          title="No se encontraron jugadores con estos filtros"
          description="Prueba a seleccionar 'Todas las Ligas' o cambiar la demarcación."
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (pl of players(); track pl.slug) {
            <app-player-card [player]="pl" />
          }
        </div>
      }

      <app-ad-placeholder slot="PLAYERS-DIRECTORY-FOOTER" />
    </main>
  `,
})
export class PlayersListPageComponent implements OnInit {
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly players = signal<Player[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly selectedCompetition = signal<string>('todos');
  readonly selectedPosition = signal<string>('TODOS');
  sortBy: 'goals' | 'assists' | 'rating' | 'minutes' = 'goals';
  searchText = '';

  readonly competitionFilters = [
    { slug: 'todos', label: 'Todas las Ligas' },
    { slug: 'laliga-ea-sports', label: 'LaLiga EA Sports' },
    { slug: 'laliga-hypermotion', label: 'LaLiga Hypermotion' },
    { slug: 'primera-federacion', label: 'Primera Federación' },
    { slug: 'segunda-federacion', label: 'Segunda Federación' },
  ];

  readonly positionFilters = [
    { code: 'TODOS', label: 'Todas Posiciones' },
    { code: 'DEL', label: 'DEL' },
    { code: 'MED', label: 'MED' },
    { code: 'DEF', label: 'DEF' },
    { code: 'POR', label: 'POR' },
  ];

  ngOnInit(): void {
    this.seo.updatePageSeo({
      title: 'Jugadores del Fútbol Español — Goleadores, Asistencias y Estadísticas',
      description:
        'Consulta las fichas y estadísticas oficiales de los futbolistas de LaLiga EA Sports, LaLiga Hypermotion, Primera y Segunda Federación.',
    });
    this.loadPlayers();
  }

  selectCompetition(slug: string): void {
    this.selectedCompetition.set(slug);
    this.loadPlayers();
  }

  selectPosition(code: string): void {
    this.selectedPosition.set(code);
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.facade
      .getPlayers({
        competition: this.selectedCompetition(),
        position: this.selectedPosition(),
        sortBy: this.sortBy,
        q: this.searchText,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.players.set(data),
        error: () =>
          this.error.set('No se pudieron cargar los datos de jugadores.'),
      });
  }
}

@Component({
  selector: 'app-player-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    TeamBadgeComponent,
    PlayerCardComponent,
    MatchCardComponent,
    NewsCardComponent,
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
      } @else if (error() || !profile()) {
        <app-error-state
          [message]="error() || 'Jugador no encontrado'"
          (retry)="loadProfile(currentSlug)"
        />
      } @else {
        @if (profile(); as p) {
          <app-breadcrumb-nav
            [items]="[
              { label: 'Inicio', path: '/' },
              { label: 'Jugadores', path: '/jugadores' },
              { label: p.player.teamName, path: '/equipos/' + p.player.teamSlug },
              { label: p.player.name, path: '/jugadores/' + p.player.slug }
            ]"
          />
          <!-- PLAYER HERO CARD (Section 13) -->
          <section
            class="rounded-3xl bg-gradient-to-br from-slate-900 via-pitch-900 to-slate-950 border border-white/15 p-6 sm:p-10 pitch-grid-pattern shadow-2xl"
          >
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="flex flex-col sm:flex-row sm:items-center gap-5">
                <div class="relative shrink-0 self-start sm:self-center">
                  @if (p.player.photoUrl) {
                    <div
                      class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border-2 border-white/20 overflow-hidden shadow-2xl"
                    >
                      <img
                        [src]="p.player.photoUrl"
                        [alt]="p.player.name"
                        class="w-full h-full object-cover object-top"
                      />
                    </div>
                    @if (p.player.teamLogoUrl) {
                      <img
                        [src]="p.player.teamLogoUrl"
                        [alt]="p.player.teamName"
                        class="w-7 h-7 rounded-lg bg-slate-950/90 p-1 border border-white/25 object-contain absolute -bottom-1.5 -right-1.5 shadow-lg"
                      />
                    }
                  } @else {
                    <app-team-badge
                      [name]="p.player.teamName"
                      [code]="'#' + p.player.shirtNumber"
                      [primaryColor]="p.player.teamPrimaryColor"
                      [logoUrl]="p.player.teamLogoUrl"
                      size="xl"
                    />
                  }
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <a
                      [routerLink]="['/equipos', p.player.teamSlug]"
                      class="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                    >
                      🛡️ {{ p.player.teamName }}
                    </a>
                    <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {{ p.player.position }} ({{ p.player.positionCode }})
                    </span>
                    <span class="text-xs font-mono text-slate-400">
                      🌍 {{ p.player.nationality }} · {{ p.player.age }} años
                    </span>
                  </div>
                  <h1 class="font-display text-3xl sm:text-5xl font-black text-white">
                    {{ p.player.name }}
                  </h1>
                  <p class="text-xs sm:text-sm text-slate-400 mt-1">
                    Dorsal oficial #{{ p.player.shirtNumber }} · Estadísticas verificadas de competición oficial
                  </p>
                </div>
              </div>

              <!-- Rating & Goal Contributions Highlight -->
              <div
                class="flex items-center gap-5 px-5 py-4 rounded-2xl bg-pitch-950/80 border border-white/10 self-start lg:self-center"
              >
                <div class="text-center pr-5 border-r border-white/10">
                  <span class="block text-[10px] font-mono uppercase text-slate-400">
                    Goles + Asist.
                  </span>
                  <span class="font-mono text-3xl font-black text-white">
                    {{ p.derivedMetrics.goalContributions }}
                  </span>
                </div>
                <div class="text-center">
                  <span class="block text-[10px] font-mono uppercase text-slate-400">
                    Valoración Media
                  </span>
                  <span class="font-mono text-3xl font-black text-emerald-400">
                    ★ {{ p.player.stats.rating }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Primary Official Statistics Grid (Section 13: partidos, minutos, goles, asistencias, tarjetas) -->
            <div class="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span class="block text-xs font-mono text-slate-400">PARTIDOS</span>
                <span class="font-mono text-2xl font-black text-white">{{ p.player.stats.appearances }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span class="block text-xs font-mono text-slate-400">MINUTOS</span>
                <span class="font-mono text-2xl font-black text-white">{{ p.player.stats.minutesPlayed }}'</span>
              </div>
              <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span class="block text-xs font-mono text-slate-400">GOLES</span>
                <span class="font-mono text-2xl font-black text-emerald-400">{{ p.player.stats.goals }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span class="block text-xs font-mono text-slate-400">ASISTENCIAS</span>
                <span class="font-mono text-2xl font-black text-cyan-300">{{ p.player.stats.assists }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span class="block text-xs font-mono text-slate-400">T. AMARILLAS</span>
                <span class="font-mono text-2xl font-black text-amber-300">{{ p.player.stats.yellowCards }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span class="block text-xs font-mono text-slate-400">T. ROJAS</span>
                <span class="font-mono text-2xl font-black text-rose-400">{{ p.player.stats.redCards }}</span>
              </div>
            </div>

            <!-- Derived Per-90 Ratios (Calculated strictly from real provider stats) -->
            <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div class="p-3 rounded-xl bg-pitch-950/60 border border-white/5">
                <span class="block text-[10px] font-mono text-slate-400 uppercase">Goles / 90 min</span>
                <span class="font-mono text-base font-bold text-emerald-400">{{ p.derivedMetrics.goalsPer90 }}</span>
              </div>
              <div class="p-3 rounded-xl bg-pitch-950/60 border border-white/5">
                <span class="block text-[10px] font-mono text-slate-400 uppercase">Asistencias / 90 min</span>
                <span class="font-mono text-base font-bold text-cyan-300">{{ p.derivedMetrics.assistsPer90 }}</span>
              </div>
              <div class="p-3 rounded-xl bg-pitch-950/60 border border-white/5">
                <span class="block text-[10px] font-mono text-slate-400 uppercase">G+A / 90 min</span>
                <span class="font-mono text-base font-bold text-white">{{ p.derivedMetrics.contributionsPer90 }}</span>
              </div>
              <div class="p-3 rounded-xl bg-pitch-950/60 border border-white/5">
                <span class="block text-[10px] font-mono text-slate-400 uppercase">Frecuencia de Gol</span>
                <span class="font-mono text-base font-bold text-amber-300">
                  {{ p.derivedMetrics.minutesPerGoal ? 'Cada ' + p.derivedMetrics.minutesPerGoal + " min" : 'N/A' }}
                </span>
              </div>
            </div>
          </section>

          <!-- INFORME EDITORIAL IA DEL JUGADOR -->
          <app-ai-editorial-card
            [content]="playerAiContent()"
            [loading]="aiLoading()"
            (refreshRequested)="loadPlayerAi(currentSlug, true)"
          />

          <!-- PRÓXIMOS Y RECIENTES PARTIDOS DEL JUGADOR (Section 13) -->
          @if (
            p.liveMatches.length > 0 ||
            p.upcomingMatches.length > 0 ||
            p.recentMatches.length > 0
          ) {
            <section>
              <app-section-header
                eyebrow="CALENDARIO DEL FUTBOLISTA"
                [title]="'Partidos de ' + p.player.name + ' con ' + p.player.teamShortName"
                subtitle="Compromisos en directo, próximos partidos y resultados recientes"
              />
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @for (m of p.liveMatches; track m.id) {
                  <app-match-card [match]="m" />
                }
                @for (m of p.upcomingMatches; track m.id) {
                  <app-match-card [match]="m" />
                }
                @for (m of p.recentMatches; track m.id) {
                  <app-match-card [match]="m" />
                }
              </div>
            </section>
          }

          <!-- NOTICIAS RELACIONADAS (Section 13) -->
          @if (p.relatedNews.length > 0) {
            <section>
              <app-section-header
                eyebrow="ACTUALIDAD VERIFICADA"
                [title]="'Noticias relacionadas con ' + p.player.name"
                subtitle="Informaciones oficiales y crónicas de datos donde interviene el jugador"
              />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                @for (item of p.relatedNews; track item.id) {
                  <app-news-card [news]="item" />
                }
              </div>
            </section>
          }

          <!-- COMPAÑEROS DE EQUIPO -->
          @if (p.teammates.length > 0) {
            <section>
              <app-section-header
                eyebrow="PLANTILLA DEL CLUB"
                [title]="'Compañeros en el ' + p.player.teamName"
              />
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @for (mate of p.teammates; track mate.slug) {
                  <app-player-card [player]="mate" />
                }
              </div>
            </section>
          }

          <app-ad-placeholder slot="PLAYER-PROFILE-FOOTER" />
        }
      }
    </main>
  `,
})
export class PlayerDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly profile = signal<PlayerFullProfile | null>(null);
  readonly playerAiContent = signal<GeneratedContent | null>(null);
  readonly aiLoading = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  currentSlug = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.currentSlug = slug;
        this.loadProfile(slug);
      }
    });
  }

  loadProfile(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.facade
      .getPlayerProfile(slug)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.seo.updatePageSeo({
            title: `${data.player.name} (${data.player.teamName}) — Estadísticas, Goles, Partidos y Noticias`,
            description: `Ficha oficial de ${data.player.name}, ${data.player.position} del ${data.player.teamName}: ${data.player.stats.goals} goles, ${data.player.stats.assists} asistencias en ${data.player.stats.appearances} partidos, próximos encuentros y noticias.`,
            canonicalPath: `/jugadores/${data.player.slug}`,
            ogType: 'profile',
            breadcrumbs: [
              { label: 'Inicio', path: '/' },
              { label: 'Jugadores', path: '/jugadores' },
              { label: data.player.teamName, path: `/equipos/${data.player.teamSlug}` },
              { label: data.player.name, path: `/jugadores/${data.player.slug}` },
            ],
            structuredData: this.seo.buildPlayerSchema(data.player),
          });
          this.loadPlayerAi(slug, false);
        },
        error: () => this.error.set('No se encontró la ficha del jugador.'),
      });
  }

  loadPlayerAi(slug: string, refresh: boolean): void {
    this.aiLoading.set(true);
    this.facade
      .getPlayerAiContent(slug, refresh)
      .pipe(finalize(() => this.aiLoading.set(false)))
      .subscribe({
        next: (content) => this.playerAiContent.set(content),
        error: () => undefined,
      });
  }
}
