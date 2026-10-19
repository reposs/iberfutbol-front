import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NewsItem,
  TimelineEventItem,
} from '../../domain/entities/football.models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="rounded-2xl bg-slate-900/80 border border-white/10 p-5 space-y-4"
    >
      @for (item of items(); track item.id) {
        <div
          class="relative pl-5 border-l-2 border-white/15 hover:border-emerald-400 transition-colors pb-3.5 last:pb-0"
        >
          <span
            class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
            [class.bg-brand-red]="item.type === 'LIVE_ALERT'"
            [class.bg-emerald-400]="item.type !== 'LIVE_ALERT'"
          ></span>
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="font-mono text-xs font-bold text-emerald-400">
              {{ item.timeLabel }}
            </span>
            <span
              [class]="
                item.type === 'LIVE_ALERT'
                  ? 'text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/40'
                  : 'text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10'
              "
            >
              {{ item.badgeText }}
            </span>
            @if (item.competitionName) {
              <span class="text-[11px] text-slate-400 font-mono">
                · {{ item.competitionName }}
              </span>
            }
          </div>
          @if (item.relatedRoute) {
            <a
              [routerLink]="item.relatedRoute"
              class="font-display font-bold text-sm text-white hover:text-emerald-300 transition-colors block"
            >
              {{ item.title }}
            </a>
          } @else {
            <h4 class="font-display font-bold text-sm text-white">
              {{ item.title }}
            </h4>
          }
          <p class="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {{ item.description }}
          </p>
        </div>
      }
    </div>
  `,
})
export class TimelineComponent {
  readonly items = input.required<TimelineEventItem[]>();
}

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article
      class="rounded-2xl bg-slate-900/75 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/35 p-5 flex flex-col justify-between transition-all shadow-md"
    >
      <div>
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span
              class="text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
            >
              {{ news().category }}
            </span>
            <span class="text-[11px] font-mono text-slate-400">
              {{ formatRelativeTime(news().publishedAt) }}
            </span>
          </div>
          @if (news().isAiGenerated) {
            <span
              class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
            >
              ⚡ Crónica de Datos
            </span>
          } @else {
            <span
              class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10"
            >
              📰 Actualidad Oficial
            </span>
          }
        </div>
        <h3
          class="font-display text-base sm:text-lg font-bold text-white mb-2 leading-snug"
        >
          {{ news().title }}
        </h3>
        <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
          {{ news().summary }}
        </p>
      </div>

      <div
        class="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400"
      >
        <span class="truncate max-w-[200px] sm:max-w-xs" [title]="news().source">
          {{ news().source }}
        </span>
        <div class="flex flex-wrap items-center gap-3">
          @if (news().relatedTeamSlug) {
            <a
              [routerLink]="['/equipos', news().relatedTeamSlug]"
              class="text-emerald-400 hover:underline font-medium"
            >
              🛡️ {{ news().relatedTeamName || 'Club' }}
            </a>
          }
          @if (news().relatedPlayerSlug) {
            <a
              [routerLink]="['/jugadores', news().relatedPlayerSlug]"
              class="text-cyan-300 hover:underline font-medium"
            >
              👟 {{ news().relatedPlayerName || 'Jugador' }}
            </a>
          }
          <a
            [href]="news().sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-slate-200 hover:text-white font-semibold"
          >
            Fuente original ↗
          </a>
        </div>
      </div>
    </article>
  `,
})
export class NewsCardComponent {
  readonly news = input.required<NewsItem>();

  formatRelativeTime(iso: string): string {
    const diffMinutes = Math.max(
      1,
      Math.round((Date.now() - new Date(iso).getTime()) / 60000),
    );
    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    }
    const hours = Math.floor(diffMinutes / 60);
    return `Hace ${hours} h`;
  }
}
