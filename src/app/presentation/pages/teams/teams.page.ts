import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import {
  GeneratedContent,
  Team,
  TeamFullProfile,
} from '../../../domain/entities/football.models';
import { TeamCardComponent } from '../../components/team-card.component';
import { TeamBadgeComponent } from '../../components/team-badge.component';
import { FormIndicatorComponent } from '../../components/form-indicator.component';
import { MatchCardComponent } from '../../components/match-card.component';
import { LeagueTableComponent } from '../../components/league-table.component';
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
import { PlayerCardComponent } from '../../components/player-card.component';

@Component({
  selector: 'app-teams-list-page',
  standalone: true,
  imports: [
    TeamCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div class="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8">
        <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
          DIRECTORIO OFICIAL DE CLUBES
        </span>
        <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
          Equipos del Fútbol Español
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Explora las fichas completas de clubes de LaLiga EA Sports, LaLiga Hypermotion, Primera y Segunda Federación y Selección.
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-2">
          @for (f of filters; track f.slug) {
            <button
              type="button"
              (click)="selectFilter(f.slug)"
              [class]="
                selectedComp() === f.slug
                  ? 'px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all bg-emerald-500 text-pitch-950 border-emerald-400'
                  : 'px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all bg-pitch-950 text-slate-300 border-white/10 hover:text-white'
              "
            >
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading-skeleton />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="loadTeams()" />
      } @else if (teams().length === 0) {
        <app-empty-state />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (team of teams(); track team.slug) {
            <app-team-card [team]="team" />
          }
        </div>
      }
    </main>
  `,
})
export class TeamsListPageComponent implements OnInit {
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly selectedComp = signal<string>('todos');
  readonly teams = signal<Team[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly filters = [
    { slug: 'todos', label: 'Todos los Clubes' },
    { slug: 'laliga-ea-sports', label: 'LaLiga EA Sports' },
    { slug: 'laliga-hypermotion', label: 'LaLiga Hypermotion' },
    { slug: 'primera-federacion', label: 'Primera Federación' },
    { slug: 'segunda-federacion', label: 'Segunda Federación' },
    { slug: 'seleccion-espanola', label: 'Selección' },
  ];

  ngOnInit(): void {
    this.seo.updatePageSeo({
      title: 'Clubes y Equipos del Fútbol Español — Estadísticas y Plantillas',
      description:
        'Consulta todos los equipos de LaLiga, Segunda, Primera RFEF y Selección Española: estadios, plantillas, forma reciente y clasificación.',
    });
    this.loadTeams();
  }

  selectFilter(slug: string): void {
    this.selectedComp.set(slug);
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading.set(true);
    this.error.set(null);
    this.facade
      .getTeams(this.selectedComp())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.teams.set(data),
        error: () => this.error.set('Error al cargar el listado de clubes.'),
      });
  }
}

@Component({
  selector: 'app-team-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    TeamBadgeComponent,
    FormIndicatorComponent,
    MatchCardComponent,
    LeagueTableComponent,
    NewsCardComponent,
    SectionHeaderComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    AdPlaceholderComponent,
    AiEditorialCardComponent,
    BreadcrumbNavComponent,
    PlayerCardComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      @if (loading()) {
        <app-loading-skeleton />
      } @else if (error() || !profile()) {
        <app-error-state
          [message]="error() || 'Equipo no encontrado'"
          (retry)="loadProfile(currentSlug)"
        />
      } @else {
        @if (profile(); as p) {
        <app-breadcrumb-nav
          [items]="[
            { label: 'Inicio', path: '/' },
            { label: 'Equipos', path: '/equipos' },
            { label: p.team.competitionName, path: '/competiciones/' + p.team.competitionSlug },
            { label: p.team.name, path: '/equipos/' + p.team.slug }
          ]"
        />
        <!-- CLUB HERO HEADER (Section 12) -->
        <section
          class="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-slate-900 via-pitch-900 to-slate-950 p-6 sm:p-10 pitch-grid-pattern shadow-2xl"
        >
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-5">
              <app-team-badge
                [name]="p.team.name"
                [code]="p.team.code"
                [primaryColor]="p.team.primaryColor"
                [secondaryColor]="p.team.secondaryColor"
                [logoUrl]="p.team.logoUrl"
                size="xl"
              />
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-1.5">
                  <a
                    [routerLink]="['/clasificacion', p.team.competitionSlug]"
                    class="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  >
                    {{ p.team.competitionName }}
                  </a>
                  <span class="text-xs font-mono text-slate-400">
                    Fundado en {{ p.team.foundedYear }} · {{ p.team.city }} ({{ p.team.autonomousCommunity }})
                  </span>
                </div>
                <h1 class="font-display text-3xl sm:text-5xl font-black text-white">
                  {{ p.team.name }}
                </h1>
                <p class="text-xs sm:text-sm text-slate-300 mt-1.5">
                  🏟️ <strong>{{ p.team.stadium }}</strong> ({{ p.team.stadiumCapacity.toLocaleString('es-ES') }} espectadores) · 👔 Entrenador: <strong>{{ p.team.coach }}</strong>
                </p>
              </div>
            </div>

            <!-- Position & Form Box -->
            <div
              class="flex items-center gap-5 px-5 py-4 rounded-2xl bg-pitch-950/80 border border-white/10 self-start lg:self-center"
            >
              <div class="text-center pr-5 border-r border-white/10">
                <span class="block text-[10px] font-mono uppercase text-slate-400">
                  Posición
                </span>
                <span class="font-mono text-3xl font-black text-emerald-400">
                  {{ p.team.standing.position }}º
                </span>
              </div>
              <div class="text-center pr-5 border-r border-white/10">
                <span class="block text-[10px] font-mono uppercase text-slate-400">
                  Puntos
                </span>
                <span class="font-mono text-3xl font-black text-white">
                  {{ p.team.standing.points }}
                </span>
              </div>
              <div>
                <span class="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Forma Reciente
                </span>
                <app-form-indicator [form]="p.team.standing.recentForm" />
              </div>
            </div>
          </div>

          <!-- Complete Standing & Season Metrics Strip -->
          <div
            class="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center"
          >
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span class="block text-[10px] font-mono text-slate-400">PARTIDOS (PJ)</span>
              <span class="font-mono text-lg font-extrabold text-white">{{ p.team.standing.played }}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span class="block text-[10px] font-mono text-slate-400">VICTORIAS (PG)</span>
              <span class="font-mono text-lg font-extrabold text-emerald-400">{{ p.team.standing.won }}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span class="block text-[10px] font-mono text-slate-400">EMPATES (PE)</span>
              <span class="font-mono text-lg font-extrabold text-amber-300">{{ p.team.standing.drawn }}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span class="block text-[10px] font-mono text-slate-400">DERROTAS (PP)</span>
              <span class="font-mono text-lg font-extrabold text-rose-400">{{ p.team.standing.lost }}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span class="block text-[10px] font-mono text-slate-400">GOLES FAVOR (GF)</span>
              <span class="font-mono text-lg font-extrabold text-white">{{ p.team.standing.goalsFor }}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span class="block text-[10px] font-mono text-slate-400">GOLES CONTRA (GC)</span>
              <span class="font-mono text-lg font-extrabold text-white">{{ p.team.standing.goalsAgainst }}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span class="block text-[10px] font-mono text-slate-400">DIFERENCIA (DG)</span>
              <span class="font-mono text-lg font-extrabold text-emerald-400">
                {{ p.team.standing.goalDifference > 0 ? '+' + p.team.standing.goalDifference : p.team.standing.goalDifference }}
              </span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span class="block text-[10px] font-mono text-slate-400">POSESIÓN MEDIA</span>
              <span class="font-mono text-lg font-extrabold text-cyan-300">{{ p.team.stats.possessionAvg }}%</span>
            </div>
          </div>
        </section>

        <!-- INFORME EDITORIAL IA DEL CLUB -->
        <app-ai-editorial-card
          [content]="teamAiContent()"
          [loading]="aiLoading()"
          (refreshRequested)="loadTeamAi(currentSlug, true)"
        />

        <!-- PARTIDOS EN DIRECTO / RECIENTES / PRÓXIMOS -->
        <section>
          <app-section-header
            eyebrow="CALENDARIO Y RESULTADOS DEL CLUB"
            title="Partidos de la Temporada"
            subtitle="Encuentros en juego, últimos marcadores y próximos compromisos"
          />
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (m of p.liveMatches; track m.id) {
              <app-match-card [match]="m" />
            }
            @for (m of p.recentMatches; track m.id) {
              <app-match-card [match]="m" />
            }
            @for (m of p.upcomingMatches; track m.id) {
              <app-match-card [match]="m" />
            }
          </div>
        </section>

        <!-- PLANTILLA Y JUGADORES DESTACADOS -->
        @if (p.squad.length > 0) {
          <section>
            <app-section-header
              eyebrow="PLANTILLA PROFESIONAL"
              title="Jugadores Destacados"
              subtitle="Estadísticas individuales de goles, asistencias y minutos disputados"
            />
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (pl of p.squad; track pl.slug) {
                <app-player-card [player]="pl" />
              }
            </div>
          </section>
        }

        <!-- CLASIFICACIÓN DE SU COMPETICIÓN -->
        @if (p.standings; as table) {
          <section>
            <app-section-header
              eyebrow="SITUACIÓN EN LA LIGA"
              [title]="'Clasificación ' + table.competitionName"
            />
            <app-league-table
              [rows]="table.rows"
              [legend]="table.legend"
              [highlightTeamSlug]="p.team.slug"
            />
          </section>
        }

        <!-- NOTICIAS RELACIONADAS -->
        @if (p.news.length > 0) {
          <section>
            <app-section-header
              eyebrow="ACTUALIDAD DEL CLUB"
              [title]="'Noticias sobre ' + p.team.shortName"
            />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              @for (item of p.news; track item.id) {
                <app-news-card [news]="item" />
              }
            </div>
          </section>
        }

        <app-ad-placeholder slot="TEAM-PROFILE-FOOTER" />
        }
      }
    </main>
  `,
})
export class TeamDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly profile = signal<TeamFullProfile | null>(null);
  readonly teamAiContent = signal<GeneratedContent | null>(null);
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
      .getTeamProfile(slug)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.seo.updatePageSeo({
            title: `${data.team.name} — Partidos, Clasificación, Plantilla y Estadísticas`,
            description: `Toda la información del ${data.team.name} (${data.team.competitionName}): estadio ${data.team.stadium}, posición ${data.team.standing.position}º con ${data.team.standing.points} puntos, plantilla y resultados.`,
            canonicalPath: `/equipos/${data.team.slug}`,
            ogType: 'profile',
            breadcrumbs: [
              { label: 'Inicio', path: '/' },
              { label: 'Equipos', path: '/equipos' },
              { label: data.team.competitionName, path: `/competiciones/${data.team.competitionSlug}` },
              { label: data.team.name, path: `/equipos/${data.team.slug}` },
            ],
            structuredData: this.seo.buildTeamSchema(data.team),
          });
          this.loadTeamAi(slug, false);
        },
        error: () => {
          this.error.set('No se pudo encontrar la ficha del equipo solicitado.');
        },
      });
  }

  loadTeamAi(slug: string, refresh: boolean): void {
    this.aiLoading.set(true);
    this.facade
      .getTeamAiContent(slug, refresh)
      .pipe(finalize(() => this.aiLoading.set(false)))
      .subscribe({
        next: (content) => this.teamAiContent.set(content),
        error: () => undefined,
      });
  }
}
