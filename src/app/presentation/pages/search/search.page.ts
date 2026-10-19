import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import { GlobalSearchResults } from '../../../domain/entities/football.models';
import { TeamCardComponent } from '../../components/team-card.component';
import { PlayerCardComponent } from '../../components/player-card.component';
import { MatchCardComponent } from '../../components/match-card.component';
import { NewsCardComponent } from '../../components/timeline-and-news.component';
import { SectionHeaderComponent } from '../../components/section-header.component';
import {
  EmptyStateComponent,
  LoadingSkeletonComponent,
} from '../../components/ui-states.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    TeamCardComponent,
    PlayerCardComponent,
    MatchCardComponent,
    NewsCardComponent,
    SectionHeaderComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div class="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8">
        <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
          BUSCADOR DEL FÚTBOL ESPAÑOL
        </span>
        <h1 class="font-display text-2xl sm:text-4xl font-black text-white mb-4">
          Explorar Equipos, Jugadores, Partidos y Competiciones
        </h1>
        <form (ngSubmit)="executeSearch()" class="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            name="query"
            [(ngModel)]="queryInput"
            placeholder="Ej. Barcelona, Lamine Yamal, Racing, LaLiga, Derbi..."
            class="flex-1 bg-pitch-950 text-white px-4 py-3 rounded-xl border border-white/15 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            class="px-6 py-3 rounded-xl bg-brand-red hover:bg-rose-600 text-white font-display font-bold text-sm transition-colors"
          >
            Buscar ahora
          </button>
        </form>
      </div>

      @if (loading()) {
        <app-loading-skeleton />
      } @else {
        @if (results(); as res) {
        @if (
          res.teams.length === 0 &&
          res.players.length === 0 &&
          res.competitions.length === 0 &&
          res.matches.length === 0 &&
          res.news.length === 0
        ) {
          <app-empty-state
            title="Sin coincidencias para tu búsqueda"
            description="Prueba con términos como 'Barcelona', 'Real Madrid', 'Lamine Yamal', 'Racing', 'Murcia' o 'LaLiga'."
          />
        } @else {
          @if (res.teams.length > 0) {
            <section>
              <app-section-header eyebrow="RESULTADOS" title="Equipos" />
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @for (team of res.teams; track team.slug) {
                  <app-team-card [team]="team" />
                }
              </div>
            </section>
          }

          @if (res.players.length > 0) {
            <section>
              <app-section-header eyebrow="RESULTADOS" title="Jugadores" />
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @for (pl of res.players; track pl.slug) {
                  <app-player-card [player]="pl" />
                }
              </div>
            </section>
          }

          @if (res.competitions.length > 0) {
            <section>
              <app-section-header eyebrow="RESULTADOS" title="Competiciones" />
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (comp of res.competitions; track comp.slug) {
                  <a
                    [routerLink]="['/competiciones', comp.slug]"
                    class="rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 p-4 block"
                  >
                    <h3 class="font-display font-bold text-white">{{ comp.name }}</h3>
                    <p class="text-xs text-slate-400 mt-1">{{ comp.description }}</p>
                  </a>
                }
              </div>
            </section>
          }

          @if (res.matches.length > 0) {
            <section>
              <app-section-header eyebrow="RESULTADOS" title="Partidos" />
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @for (m of res.matches; track m.id) {
                  <app-match-card [match]="m" />
                }
              </div>
            </section>
          }

          @if (res.news.length > 0) {
            <section>
              <app-section-header eyebrow="RESULTADOS" title="Noticias" />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                @for (n of res.news; track n.id) {
                  <app-news-card [news]="n" />
                }
              </div>
            </section>
          }
        }
        }
      }
    </main>
  `,
})
export class SearchPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  queryInput = '';
  readonly results = signal<GlobalSearchResults | null>(null);
  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') || 'Barcelona';
      this.queryInput = q;
      this.executeSearch();
    });
  }

  executeSearch(): void {
    const q = this.queryInput.trim();
    if (!q) return;

    this.seo.updatePageSeo({
      title: `Resultados de búsqueda para "${q}"`,
      description: `Equipos, jugadores, competiciones y partidos relacionados con ${q} en IberFútbol.`,
    });

    this.loading.set(true);
    this.facade
      .searchGlobal(q)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((res) => this.results.set(res));
  }
}
