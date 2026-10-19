import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Player } from '../../domain/entities/football.models';
import { TeamBadgeComponent } from './team-badge.component';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [RouterLink, TeamBadgeComponent],
  template: `
    <a
      [routerLink]="['/jugadores', player().slug]"
      class="group block rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/40 p-5 transition-all duration-200 shadow-md"
    >
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="relative shrink-0">
            @if (player().photoUrl && !photoFailed()) {
              <div
                class="w-14 h-14 rounded-2xl bg-slate-950 border border-white/15 overflow-hidden shadow-lg"
              >
                <img
                  [src]="player().photoUrl"
                  [alt]="player().name"
                  loading="lazy"
                  (error)="photoFailed.set(true)"
                  class="w-full h-full object-cover object-top"
                />
              </div>
              @if (player().teamLogoUrl) {
                <img
                  [src]="player().teamLogoUrl"
                  [alt]="player().teamName"
                  loading="lazy"
                  class="w-5 h-5 rounded-md bg-slate-950/90 p-0.5 border border-white/20 object-contain absolute -bottom-1 -right-1 shadow"
                />
              }
            } @else {
              <app-team-badge
                [name]="player().teamName"
                [code]="'#' + player().shirtNumber"
                [primaryColor]="player().teamPrimaryColor"
                [logoUrl]="player().teamLogoUrl"
                size="lg"
              />
            }
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span
                class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-emerald-400 border border-white/10"
              >
                {{ player().positionCode }}
              </span>
              <span class="text-xs text-slate-400 truncate">
                {{ player().nationality }} · {{ player().age }} años
              </span>
            </div>
            <h3
              class="font-display text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors truncate"
            >
              {{ player().name }}
            </h3>
            <p class="text-xs text-slate-400 truncate">
              {{ player().teamName }}
            </p>
          </div>
        </div>
        <span
          class="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold shrink-0"
          title="Valoración media oficial"
        >
          ★ {{ player().stats.rating }}
        </span>
      </div>

      <div
        class="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-pitch-950/60 border border-white/5"
      >
        <div>
          <span class="block text-[10px] font-mono text-slate-400">PJ</span>
          <span class="font-mono text-sm font-bold text-white">
            {{ player().stats.appearances }}
          </span>
        </div>
        <div>
          <span class="block text-[10px] font-mono text-slate-400">MIN</span>
          <span class="font-mono text-sm font-bold text-white">
            {{ player().stats.minutesPlayed }}'
          </span>
        </div>
        <div>
          <span class="block text-[10px] font-mono text-slate-400">GOLES</span>
          <span class="font-mono text-sm font-extrabold text-emerald-400">
            {{ player().stats.goals }}
          </span>
        </div>
        <div>
          <span class="block text-[10px] font-mono text-slate-400">ASIST</span>
          <span class="font-mono text-sm font-bold text-cyan-300">
            {{ player().stats.assists }}
          </span>
        </div>
      </div>

      <div
        class="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400"
      >
        <span>
          Contribución directa:
          <strong class="font-mono text-white">
            {{ player().stats.goals + player().stats.assists }} G+A
          </strong>
        </span>
        <span class="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          Ver ficha →
        </span>
      </div>
    </a>
  `,
})
export class PlayerCardComponent {
  readonly player = input.required<Player>();
  readonly photoFailed = signal(false);
}
