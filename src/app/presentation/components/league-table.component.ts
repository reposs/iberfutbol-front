import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  QualificationZone,
  StandingRow,
  StandingZoneLegend,
} from '../../domain/entities/football.models';
import { TeamBadgeComponent } from './team-badge.component';
import { FormIndicatorComponent } from './form-indicator.component';

@Component({
  selector: 'app-league-table',
  standalone: true,
  imports: [RouterLink, TeamBadgeComponent, FormIndicatorComponent],
  template: `
    <div
      class="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-xl"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b border-white/10 bg-pitch-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400"
            >
              <th class="py-3.5 pl-4 pr-2 w-12">#</th>
              <th class="py-3.5 px-3">Club</th>
              <th class="py-3.5 px-2.5 text-center" title="Partidos Jugados">PJ</th>
              <th class="py-3.5 px-2.5 text-center hidden sm:table-cell" title="Partidos Ganados">PG</th>
              <th class="py-3.5 px-2.5 text-center hidden sm:table-cell" title="Partidos Empatados">PE</th>
              <th class="py-3.5 px-2.5 text-center hidden sm:table-cell" title="Partidos Perdidos">PP</th>
              <th class="py-3.5 px-2.5 text-center hidden md:table-cell" title="Goles a Favor">GF</th>
              <th class="py-3.5 px-2.5 text-center hidden md:table-cell" title="Goles en Contra">GC</th>
              <th class="py-3.5 px-2.5 text-center" title="Diferencia de Goles">DG</th>
              <th class="py-3.5 px-3 text-center font-bold text-white">PTS</th>
              @if (!compact()) {
                <th class="py-3.5 pl-3 pr-5 text-right hidden lg:table-cell">
                  Forma
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.06] text-sm">
            @for (row of rows(); track row.teamSlug) {
              <tr
                [class]="
                  highlightTeamSlug() === row.teamSlug
                    ? 'bg-emerald-500/10 hover:bg-white/[0.06] transition-colors group'
                    : 'hover:bg-white/[0.04] transition-colors group'
                "
              >
                <td class="py-3 pl-4 pr-2 font-mono font-bold relative">
                  <span
                    class="absolute inset-y-1.5 left-0 w-1 rounded-r"
                    [style.background-color]="getZoneColor(row.zone)"
                  ></span>
                  <span
                    class="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs"
                    [class.text-white]="row.zone !== 'NONE'"
                    [class.text-slate-400]="row.zone === 'NONE'"
                  >
                    {{ row.position }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <a
                    [routerLink]="['/equipos', row.teamSlug]"
                    class="flex items-center gap-2.5 group-hover:text-emerald-300 transition-colors"
                  >
                    <app-team-badge
                      [name]="row.teamName"
                      [code]="row.teamCode"
                      [primaryColor]="row.primaryColor"
                      [secondaryColor]="row.secondaryColor"
                      [logoUrl]="row.logoUrl"
                      size="sm"
                    />
                    <span class="font-display font-bold text-white group-hover:text-emerald-300 truncate max-w-[140px] sm:max-w-none">
                      {{ compact() ? row.teamShortName : row.teamName }}
                    </span>
                  </a>
                </td>
                <td class="py-3 px-2.5 text-center font-mono text-slate-300">
                  {{ row.played }}
                </td>
                <td class="py-3 px-2.5 text-center font-mono text-slate-400 hidden sm:table-cell">
                  {{ row.won }}
                </td>
                <td class="py-3 px-2.5 text-center font-mono text-slate-400 hidden sm:table-cell">
                  {{ row.drawn }}
                </td>
                <td class="py-3 px-2.5 text-center font-mono text-slate-400 hidden sm:table-cell">
                  {{ row.lost }}
                </td>
                <td class="py-3 px-2.5 text-center font-mono text-slate-400 hidden md:table-cell">
                  {{ row.goalsFor }}
                </td>
                <td class="py-3 px-2.5 text-center font-mono text-slate-400 hidden md:table-cell">
                  {{ row.goalsAgainst }}
                </td>
                <td
                  class="py-3 px-2.5 text-center font-mono font-semibold"
                  [class.text-emerald-400]="row.goalDifference > 0"
                  [class.text-rose-400]="row.goalDifference < 0"
                  [class.text-slate-400]="row.goalDifference === 0"
                >
                  {{ row.goalDifference > 0 ? '+' + row.goalDifference : row.goalDifference }}
                </td>
                <td class="py-3 px-3 text-center">
                  <span
                    class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg bg-white/10 font-mono font-extrabold text-white"
                  >
                    {{ row.points }}
                  </span>
                </td>
                @if (!compact()) {
                  <td class="py-3 pl-3 pr-5 text-right hidden lg:table-cell">
                    <app-form-indicator [form]="row.recentForm" />
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Qualification Zones Legend -->
      @if (legend() && legend()!.length > 0) {
        <div
          class="px-4 py-3 bg-pitch-950/70 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-400"
        >
          @for (item of legend()!; track item.zone) {
            <div class="inline-flex items-center gap-2">
              <span
                class="w-2.5 h-2.5 rounded-full"
                [style.background-color]="item.colorHex"
              ></span>
              <span>{{ item.label }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class LeagueTableComponent {
  readonly rows = input.required<StandingRow[]>();
  readonly legend = input<StandingZoneLegend[]>();
  readonly compact = input<boolean>(false);
  readonly highlightTeamSlug = input<string>();

  getZoneColor(zone: QualificationZone): string {
    switch (zone) {
      case 'CHAMPIONS_LEAGUE':
        return '#3b82f6';
      case 'EUROPA_LEAGUE':
        return '#f97316';
      case 'CONFERENCE_LEAGUE':
        return '#10b981';
      case 'DIRECT_PROMOTION':
        return '#10b981';
      case 'PROMOTION_PLAYOFF':
        return '#06b6d4';
      case 'RELEGATION':
        return '#ef4444';
      default:
        return 'transparent';
    }
  }
}
