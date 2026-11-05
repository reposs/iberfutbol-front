import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GetMatchesStreamingUseCase } from '../../../application/use-cases/get-matches-streaming.use-case';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import {
  BroadcastMatchStatus,
  Match,
} from '../../../domain/entities/match-broadcast.entity';
import { TeamBadgeComponent } from '../../components/team-badge.component';
import { AdPlaceholderComponent } from '../../components/ad-placeholder.component';

@Component({
  selector: 'app-matches-streaming-page',
  standalone: true,
  imports: [RouterLink, DatePipe, TeamBadgeComponent, AdPlaceholderComponent],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- HERO HEADER: LEGAL BROADCAST & STREAMING GUIDE -->
      <section
        class="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-pitch-950 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-2 max-w-3xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <span>📺 GUÍA OFICIAL DE EMISIONES Y RESÚMENES VERIFICADOS</span>
            </div>
            <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
              Fútbol en Directo, TV Oficial y Resúmenes
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consulta dónde ver legalmente cada partido del fútbol español en directo (RTVE Play, DAZN, Movistar Plus+, RFEF TV y GOL Play) y accede a los resúmenes oficiales en vídeo tras el pitido final.
            </p>
          </div>

          <!-- Status Filter Tabs -->
          <div
            class="inline-flex flex-wrap items-center gap-1.5 bg-pitch-950 p-1.5 rounded-2xl border border-white/10 self-start"
          >
            @for (tab of statusTabs; track tab.value) {
              <button
                type="button"
                (click)="setStatusFilter(tab.value)"
                class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-display font-bold transition-all"
                [class.bg-brand-red]="useCase.statusFilter() === tab.value"
                [class.text-white]="useCase.statusFilter() === tab.value"
                [class.text-slate-400]="useCase.statusFilter() !== tab.value"
                [class.hover:text-white]="useCase.statusFilter() !== tab.value"
              >
                {{ tab.label }}
              </button>
            }
          </div>
        </div>

        <!-- Competition & Free-to-Air Filters -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            @for (comp of competitionFilters; track comp.slug) {
              <button
                type="button"
                (click)="useCase.competitionFilter.set(comp.slug)"
                [class]="
                  useCase.competitionFilter() === comp.slug
                    ? 'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border bg-emerald-500 text-pitch-950 border-emerald-400'
                    : 'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border bg-slate-900/90 text-slate-300 border-white/10 hover:text-white'
                "
              >
                {{ comp.label }}
              </button>
            }
          </div>

          <button
            type="button"
            (click)="toggleFreeToAir()"
            [class]="
              useCase.onlyFreeToAir()
                ? 'px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                : 'px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold border bg-white/5 text-slate-300 border-white/10 hover:text-white'
            "
          >
            {{ useCase.onlyFreeToAir() ? '✓ Solo emisiones en abierto (RTVE / RFEF / GOL)' : 'Filtrar emisiones en abierto (Gratis)' }}
          </button>
        </div>
      </section>

      <!-- 1. LIVE MATCHES SECTION (EN DIRECTO · STREAMING DISPONIBLE) -->
      @if (useCase.liveMatches().length > 0) {
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="h-3 w-3 rounded-full bg-brand-red animate-ping"></span>
              <h2 class="font-display text-xl sm:text-2xl font-black text-white">
                En Directo Ahora ({{ useCase.liveMatches().length }})
              </h2>
            </div>
            <span class="text-xs font-mono text-brand-red font-bold uppercase">
              Señal oficial activa
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            @for (match of useCase.liveMatches(); track match.id) {
              <article
                class="rounded-2xl bg-gradient-to-br from-rose-950/55 via-slate-900/95 to-pitch-950 border border-brand-red/50 p-5 shadow-xl flex flex-col justify-between gap-4"
              >
                <div class="flex items-center justify-between gap-2 text-xs">
                  <span class="px-2.5 py-0.5 rounded-md bg-white/10 font-mono font-bold text-white">
                    {{ match.competition }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/20 border border-brand-red text-brand-red font-mono font-bold">
                    <span class="h-2 w-2 rounded-full bg-brand-red animate-ping"></span>
                    EN DIRECTO · {{ match.liveMinute || 45 }}'
                  </span>
                </div>

                <div class="space-y-3 py-1">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <app-team-badge
                        [name]="match.homeTeam"
                        [code]="match.homeCode"
                        [primaryColor]="match.homeColor"
                        secondaryColor="#ffffff"
                        [logoUrl]="match.homeLogoUrl"
                        size="md"
                      />
                      <span class="font-display font-bold text-lg text-white">
                        {{ match.homeTeam }}
                      </span>
                    </div>
                    <span class="font-mono text-2xl font-black text-white">
                      {{ match.homeScore ?? 0 }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <app-team-badge
                        [name]="match.awayTeam"
                        [code]="match.awayCode"
                        [primaryColor]="match.awayColor"
                        secondaryColor="#ffffff"
                        [logoUrl]="match.awayLogoUrl"
                        size="md"
                      />
                      <span class="font-display font-bold text-lg text-white">
                        {{ match.awayTeam }}
                      </span>
                    </div>
                    <span class="font-mono text-2xl font-black text-white">
                      {{ match.awayScore ?? 0 }}
                    </span>
                  </div>
                </div>

                <div class="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div class="text-xs">
                    <span class="text-slate-400 block">Operador oficial:</span>
                    <strong class="text-emerald-300 font-mono">
                      📺 {{ match.broadcastChannel }}
                    </strong>
                    @if (match.isFreeToAir) {
                      <span class="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        EN ABIERTO
                      </span>
                    }
                  </div>

                  <div class="flex items-center gap-2">
                    <a
                      [routerLink]="['/partidos', match.slug]"
                      class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
                    >
                      Minuto a minuto
                    </a>
                    @if (match.broadcastUrl) {
                      <a
                        [href]="match.broadcastUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="px-3.5 py-2 rounded-xl bg-brand-red hover:bg-rose-600 text-xs font-display font-bold text-white transition-colors inline-flex items-center gap-1.5 shadow-lg shadow-brand-red/25"
                      >
                        <span>Ver emisión oficial</span>
                        <span>↗</span>
                      </a>
                    }
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      }

      <!-- 2. UPCOMING MATCHES SECTION (PRÓXIMAS RETRANSMISIONES PROGRAMADAS) -->
      @if (useCase.upcomingMatches().length > 0) {
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                AGENDA TELEVISIVA OFICIAL
              </span>
              <h2 class="font-display text-xl sm:text-2xl font-black text-white">
                Próximas Retransmisiones ({{ useCase.upcomingMatches().length }})
              </h2>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (match of useCase.upcomingMatches(); track match.id) {
              <article
                class="rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 p-5 flex flex-col justify-between gap-4 transition-all"
              >
                <div class="flex items-center justify-between gap-2 text-xs">
                  <span class="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-slate-300">
                    {{ match.competition }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
                    {{ match.date | date: 'dd/MM' }} · {{ match.kickoffTime }}h
                  </span>
                </div>

                <div class="space-y-2.5">
                  <div class="flex items-center gap-3">
                    <app-team-badge
                      [name]="match.homeTeam"
                      [code]="match.homeCode"
                      [primaryColor]="match.homeColor"
                      secondaryColor="#ffffff"
                      [logoUrl]="match.homeLogoUrl"
                      size="sm"
                    />
                    <span class="font-display font-bold text-base text-white truncate">
                      {{ match.homeTeam }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <app-team-badge
                      [name]="match.awayTeam"
                      [code]="match.awayCode"
                      [primaryColor]="match.awayColor"
                      secondaryColor="#ffffff"
                      [logoUrl]="match.awayLogoUrl"
                      size="sm"
                    />
                    <span class="font-display font-bold text-base text-white truncate">
                      {{ match.awayTeam }}
                    </span>
                  </div>
                </div>

                <div class="pt-3 border-t border-white/10 space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-300 font-mono truncate">
                      📺 {{ match.broadcastChannel }}
                    </span>
                    @if (match.isFreeToAir) {
                      <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                        EN ABIERTO
                      </span>
                    }
                  </div>

                  <div class="flex items-center justify-between gap-2">
                    <a
                      [routerLink]="['/partidos', match.slug]"
                      class="text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      Previa y alineaciones →
                    </a>
                    @if (match.broadcastUrl) {
                      <a
                        [href]="match.broadcastUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-colors"
                      >
                        Dónde ver ↗
                      </a>
                    }
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      }

      <!-- 3. PAST MATCHES SECTION (FINALIZADOS · RESÚMENES Y REPETICIONES OFICIALES) -->
      @if (useCase.pastMatches().length > 0) {
        <section class="space-y-4">
          <div>
            <span class="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              VIDEOTECA OFICIAL · YOUTUBE LALIGA / RTVE PLAY / RFEF
            </span>
            <h2 class="font-display text-xl sm:text-2xl font-black text-white">
              Partidos Finalizados y Resúmenes Oficiales ({{ useCase.pastMatches().length }})
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (match of useCase.pastMatches(); track match.id) {
              <article
                class="rounded-2xl bg-slate-900/75 border border-white/10 hover:border-cyan-500/40 p-5 flex flex-col justify-between gap-4 transition-all"
              >
                <div class="flex items-center justify-between gap-2 text-xs">
                  <span class="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-slate-300">
                    {{ match.competition }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] font-semibold">
                    FINALIZADO
                  </span>
                </div>

                <div class="space-y-2.5">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <app-team-badge
                        [name]="match.homeTeam"
                        [code]="match.homeCode"
                        [primaryColor]="match.homeColor"
                        secondaryColor="#ffffff"
                        [logoUrl]="match.homeLogoUrl"
                        size="sm"
                      />
                      <span class="font-display font-bold text-base text-white truncate">
                        {{ match.homeTeam }}
                      </span>
                    </div>
                    <span class="font-mono text-xl font-black text-white">
                      {{ match.homeScore ?? 0 }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <app-team-badge
                        [name]="match.awayTeam"
                        [code]="match.awayCode"
                        [primaryColor]="match.awayColor"
                        secondaryColor="#ffffff"
                        [logoUrl]="match.awayLogoUrl"
                        size="sm"
                      />
                      <span class="font-display font-bold text-base text-white truncate">
                        {{ match.awayTeam }}
                      </span>
                    </div>
                    <span class="font-mono text-xl font-black text-white">
                      {{ match.awayScore ?? 0 }}
                    </span>
                  </div>
                </div>

                <div class="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <a
                    [routerLink]="['/partidos', match.slug]"
                    class="text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Crónica y estadísticas →
                  </a>
                  @if (match.highlightsUrl) {
                    <a
                      [href]="match.highlightsUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>▶ Resumen oficial</span>
                      <span>↗</span>
                    </a>
                  }
                </div>
              </article>
            }
          </div>
        </section>
      }

      <!-- LEGAL STREAMING COMPLIANCE NOTICE -->
      <section
        class="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-5 text-xs text-slate-300 space-y-2"
      >
        <div class="flex items-center gap-2 font-mono font-bold text-emerald-400">
          <span>🛡️ CUMPLIMIENTO ESTRICTO DE RETRANSMISIONES LEGALES</span>
        </div>
        <p class="leading-relaxed">
          IberFútbol verifica todas las fuentes de vídeo mediante su política de dominio (<code>LegalBroadcastPolicy</code>) y enlaza exclusivamente a plataformas oficiales con derechos audiovisuales en España:
          <strong>RTVE Play</strong> (Copa del Rey y Selección Española en abierto),
          <strong>DAZN</strong>, <strong>Movistar Plus+</strong>, <strong>GOL Play</strong> y los canales oficiales de resúmenes de <strong>LaLiga</strong> y la <strong>RFEF</strong> en YouTube.
        </p>
      </section>

      <app-ad-placeholder
        slot="STREAMING-GUIDE-FOOTER"
        label="Espacio publicitario · Guía Oficial de Emisiones Deportivas"
      />
    </main>
  `,
})
export class MatchesStreamingPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoMetaService);
  readonly useCase = inject(GetMatchesStreamingUseCase);

  readonly statusTabs: ReadonlyArray<{
    label: string;
    value: 'ALL' | BroadcastMatchStatus;
  }> = [
    { label: 'Todos', value: 'ALL' },
    { label: 'En Directo', value: 'LIVE' },
    { label: 'Próximos', value: 'UPCOMING' },
    { label: 'Resúmenes (Finalizados)', value: 'FINISHED' },
  ];

  readonly competitionFilters = [
    { slug: 'todos', label: 'Todas las competiciones' },
    { slug: 'laliga-ea-sports', label: 'LaLiga EA Sports' },
    { slug: 'laliga-hypermotion', label: 'LaLiga Hypermotion' },
    { slug: 'primera-federacion', label: '1ª Federación' },
    { slug: 'copa-del-rey', label: 'Copa del Rey' },
    { slug: 'seleccion-espanola', label: 'Selección Española' },
  ];

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['initialMatches'] as
      | Match[]
      | undefined;
    if (resolved && resolved.length > 0) {
      this.useCase.hydrateFromResolver(resolved);
    }

    this.seo.updatePageSeo({
      title: 'Dónde Ver Fútbol en Directo y Resúmenes Oficiales — TV Legal',
      description:
        'Guía oficial de retransmisiones en directo (RTVE Play, DAZN, Movistar Plus+, RFEF TV) y resúmenes legales en vídeo de LaLiga, Segunda, Copa del Rey y Selección.',
      canonicalPath: '/tv-en-directo',
    });
  }

  setStatusFilter(status: 'ALL' | BroadcastMatchStatus): void {
    this.useCase.statusFilter.set(status);
  }

  toggleFreeToAir(): void {
    this.useCase.onlyFreeToAir.update((v) => !v);
  }
}
