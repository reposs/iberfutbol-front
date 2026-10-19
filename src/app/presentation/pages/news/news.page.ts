import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, interval } from 'rxjs';
import { FootballFacade } from '../../../application/use-cases/football.facade';
import { SeoMetaService } from '../../../core/services/seo-meta.service';
import {
  NewsItem,
  TimelineEventItem,
  TimelineEventType,
} from '../../../domain/entities/football.models';
import {
  NewsCardComponent,
  TimelineComponent,
} from '../../components/timeline-and-news.component';
import {
  EmptyStateComponent,
  LoadingSkeletonComponent,
} from '../../components/ui-states.component';
import { AdPlaceholderComponent } from '../../components/ad-placeholder.component';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [
    NewsCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    AdPlaceholderComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Header & Filters -->
      <div class="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              ACTUALIDAD Y CRÓNICAS DEL FÚTBOL ESPAÑOL
            </span>
            <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
              Noticias del Fútbol Español
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Última hora de los clubes, competiciones nacionales, Copa del Rey y Selección Española.
            </p>
          </div>

          <!-- Source Type Filter -->
          <div class="inline-flex items-center gap-1.5 bg-pitch-950 p-1.5 rounded-2xl border border-white/10 self-start">
            @for (st of sourceTypes; track st.value) {
              <button
                type="button"
                (click)="selectSourceType(st.value)"
                [class]="
                  selectedSourceType() === st.value
                    ? 'px-3.5 py-2 rounded-xl text-xs font-display font-bold transition-all bg-brand-red text-white'
                    : 'px-3.5 py-2 rounded-xl text-xs font-display font-bold transition-all text-slate-400 hover:text-white'
                "
              >
                {{ st.label }}
              </button>
            }
          </div>
        </div>

        <!-- Competition Filter Pills -->
        <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
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
      </div>

      @if (loading()) {
        <app-loading-skeleton />
      } @else if (news().length === 0) {
        <app-empty-state
          title="No hay noticias registradas para este filtro"
          description="Selecciona 'Todas las Competiciones' o cambia el tipo de fuente para ver más noticias."
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (item of news(); track item.id) {
            <app-news-card [news]="item" />
          }
        </div>
      }

      <app-ad-placeholder slot="NEWS-PAGE-FOOTER" />
    </main>
  `,
})
export class NewsPageComponent implements OnInit {
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);

  readonly news = signal<NewsItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly selectedCompetition = signal<string>('todas');
  readonly selectedSourceType = signal<'all' | 'official' | 'ai'>('all');

  readonly sourceTypes: { value: 'all' | 'official' | 'ai'; label: string }[] =
    [
      { value: 'all', label: 'Todas las Noticias' },
      { value: 'official', label: '📰 Prensa y Oficiales' },
      { value: 'ai', label: '⚡ Análisis y Crónicas' },
    ];

  readonly competitionFilters = [
    { slug: 'todas', label: 'Todas las Competiciones' },
    { slug: 'laliga-ea-sports', label: 'LaLiga EA Sports' },
    { slug: 'laliga-hypermotion', label: 'LaLiga Hypermotion' },
    { slug: 'primera-federacion', label: 'Primera Federación' },
    { slug: 'copa-del-rey', label: 'Copa del Rey' },
    { slug: 'seleccion-espanola', label: 'Selección Española' },
  ];

  ngOnInit(): void {
    this.seo.updatePageSeo({
      title: 'Noticias del Fútbol Español — Actualidad Verificada y Crónicas',
      description:
        'Últimas noticias de LaLiga EA Sports, LaLiga Hypermotion, Primera Federación, Copa del Rey y Selección Española.',
    });
    this.loadNews();
  }

  selectCompetition(slug: string): void {
    this.selectedCompetition.set(slug);
    this.loadNews();
  }

  selectSourceType(type: 'all' | 'official' | 'ai'): void {
    this.selectedSourceType.set(type);
    this.loadNews();
  }

  loadNews(): void {
    this.loading.set(true);
    this.facade
      .getNews({
        competition: this.selectedCompetition(),
        sourceType: this.selectedSourceType(),
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.news.set(data));
  }
}

@Component({
  selector: 'app-actuality-page',
  standalone: true,
  imports: [
    TimelineComponent,
    NewsCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    AdPlaceholderComponent,
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Header + Periodic Auto-Update Controls (Section 18) -->
      <div class="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping"></span>
              <span class="text-xs font-mono uppercase tracking-widest text-brand-red font-bold">
                EN DIRECTO · SEGUIMIENTO MINUTO A MINUTO
              </span>
            </div>
            <h1 class="font-display text-2xl sm:text-4xl font-black text-white">
              Qué está pasando en el Fútbol Español
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Minuto a minuto de goles, finales de partido, convocatorias oficiales y cambios en la clasificación.
            </p>
          </div>

          <!-- Refresh Status & Button -->
          <div class="flex items-center gap-3 self-start">
            <span class="text-xs font-mono text-slate-400">
              Última sincr.: <strong class="text-emerald-400">{{ lastUpdatedLabel() }}</strong>
            </span>
            <button
              type="button"
              (click)="refreshAll()"
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all"
            >
              ↻ Actualizar ahora
            </button>
          </div>
        </div>

        <!-- Event Type Filters -->
        <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
          @for (filter of eventFilters; track filter.label) {
            <button
              type="button"
              (click)="selectEventType(filter.type)"
              [class]="
                selectedType() === filter.type
                  ? 'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-brand-red text-white border-brand-red'
                  : 'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-pitch-950 text-slate-300 border-white/10 hover:text-white'
              "
            >
              {{ filter.label }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading-skeleton />
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 class="font-display text-xl font-bold text-white mb-4">
              Cronología de Acontecimientos ({{ timeline().length }})
            </h2>
            @if (timeline().length === 0) {
              <app-empty-state
                title="Sin eventos para este filtro"
                description="Selecciona 'Todos los Eventos' para ver la cronología completa."
              />
            } @else {
              <app-timeline [items]="timeline()" />
            }
          </div>

          <div class="space-y-4">
            <h2 class="font-display text-xl font-bold text-white mb-4">
              Boletines y Comunicados Recientes
            </h2>
            @for (item of news(); track item.id) {
              <app-news-card [news]="item" />
            }
          </div>
        </div>
      }

      <app-ad-placeholder slot="ACTUALITY-TIMELINE-FOOTER" />
    </main>
  `,
})
export class ActualityPageComponent implements OnInit {
  private readonly facade = inject(FootballFacade);
  private readonly seo = inject(SeoMetaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly timeline = signal<TimelineEventItem[]>([]);
  readonly news = signal<NewsItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly selectedType = signal<TimelineEventType | undefined>(undefined);
  readonly lastUpdatedLabel = signal<string>('Ahora mismo');

  readonly eventFilters: {
    type: TimelineEventType | undefined;
    label: string;
  }[] = [
    { type: undefined, label: 'Todos los Eventos' },
    { type: 'LIVE_ALERT', label: '🔴 En Directo / Goles' },
    { type: 'MATCH_FINAL', label: '🏁 Finales de Partido' },
    { type: 'SQUAD_NEWS', label: '📋 Convocatorias y Onces' },
    { type: 'OFFICIAL_CLUB', label: '🏛️ Oficial Clubes' },
    { type: 'STANDINGS_UPDATE', label: '📊 Clasificación' },
  ];

  ngOnInit(): void {
    this.seo.updatePageSeo({
      title: 'Qué está pasando — Timeline en Directo del Fútbol Español',
      description:
        'Sigue en tiempo real los últimos acontecimientos del fútbol español: goles, convocatorias, finales de partido y actualizaciones de clasificación.',
    });
    this.refreshAll();

    // Actualización periódica automática cada 30 segundos (Sección 18)
    interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadTimelineSilently();
      });
  }

  selectEventType(type: TimelineEventType | undefined): void {
    this.selectedType.set(type);
    this.loadTimelineSilently();
  }

  refreshAll(): void {
    this.loading.set(true);
    forkJoin({
      timeline: this.facade.getTimeline(this.selectedType()),
      news: this.facade.getNews(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ timeline, news }) => {
        this.timeline.set(timeline);
        this.news.set(news);
        this.updateTimestampLabel();
      });
  }

  private loadTimelineSilently(): void {
    this.facade.getTimeline(this.selectedType()).subscribe((events) => {
      this.timeline.set(events);
      this.updateTimestampLabel();
    });
  }

  private updateTimestampLabel(): void {
    const now = new Date();
    this.lastUpdatedLabel.set(
      now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
  }
}
