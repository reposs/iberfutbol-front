import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Team } from '../../domain/entities/football.models';
import { TeamBadgeComponent } from './team-badge.component';
import { FormIndicatorComponent } from './form-indicator.component';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [RouterLink, TeamBadgeComponent, FormIndicatorComponent],
  template: `
    <a
      [routerLink]="['/equipos', team().slug]"
      class="group block rounded-2xl bg-slate-900/75 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/40 p-5 transition-all duration-200 shadow-md"
    >
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <app-team-badge
            [name]="team().name"
            [code]="team().code"
            [primaryColor]="team().primaryColor"
            [secondaryColor]="team().secondaryColor"
            [logoUrl]="team().logoUrl"
            size="lg"
          />
          <div class="min-w-0">
            <span
              class="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block"
            >
              {{ team().competitionName }}
            </span>
            <h3
              class="font-display text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors truncate"
            >
              {{ team().name }}
            </h3>
            <p class="text-xs text-slate-400 truncate">
              🏟️ {{ team().stadium }} · {{ team().city }}
            </p>
          </div>
        </div>
        <span
          class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs font-bold text-white shrink-0"
        >
          {{ team().standing.position }}º · {{ team().standing.points }} pts
        </span>
      </div>

      <div
        class="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-pitch-950/60 border border-white/5 text-center mb-3"
      >
        <div>
          <span class="block text-[10px] font-mono text-slate-400 uppercase">
            Balance
          </span>
          <span class="font-mono text-xs font-bold text-white">
            {{ team().standing.won }}V-{{ team().standing.drawn }}E-{{ team().standing.lost }}D
          </span>
        </div>
        <div>
          <span class="block text-[10px] font-mono text-slate-400 uppercase">
            Goles
          </span>
          <span class="font-mono text-xs font-bold text-emerald-400">
            {{ team().standing.goalsFor }} : {{ team().standing.goalsAgainst }}
          </span>
        </div>
        <div>
          <span class="block text-[10px] font-mono text-slate-400 uppercase">
            Posesión
          </span>
          <span class="font-mono text-xs font-bold text-white">
            {{ team().stats.possessionAvg }}%
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] text-slate-400">Forma reciente:</span>
        <app-form-indicator [form]="team().standing.recentForm" />
      </div>
    </a>
  `,
})
export class TeamCardComponent {
  readonly team = input.required<Team>();
}
