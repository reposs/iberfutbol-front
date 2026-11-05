import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Match } from '../../domain/entities/football.models';
import { TeamBadgeComponent } from './team-badge.component';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [RouterLink, TeamBadgeComponent],
  template: `
    <a
      [routerLink]="['/partidos', match().slug]"
      class="group block relative rounded-2xl p-4 sm:p-5 transition-all duration-200 overflow-hidden"
      [class]="cardContainerClass()"
    >
      <!-- Top Bar: Competition + Status -->
      <div class="flex items-center justify-between gap-2 mb-4">
        <div class="flex items-center gap-2 min-w-0">
          <span
            class="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 truncate"
          >
            {{ match().competitionShortName }}
          </span>
          <span class="text-xs text-slate-400 truncate">
            J{{ match().matchday }} · {{ match().stadium }}
          </span>
        </div>

        @if (match().status === 'LIVE') {
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-red/20 border border-brand-red/50 text-brand-red text-xs font-mono font-bold shrink-0"
          >
            <span class="h-2 w-2 rounded-full bg-brand-red animate-ping"></span>
            <span>EN DIRECTO · {{ match().liveMinute }}'</span>
          </span>
        } @else if (match().status === 'FINISHED') {
          <span
            class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono font-semibold shrink-0"
          >
            FINALIZADO
          </span>
        } @else {
          <span
            class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold shrink-0"
          >
            {{ match().kickoffTime }} h
          </span>
        }
      </div>

      <!-- Teams & Scoreboard -->
      <div class="space-y-3">
        <!-- Home Team -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <app-team-badge
              [name]="match().homeTeam.name"
              [code]="match().homeTeam.code"
              [primaryColor]="match().homeTeam.primaryColor"
              [secondaryColor]="match().homeTeam.secondaryColor"
              [logoUrl]="match().homeTeam.logoUrl"
              size="md"
            />
            <span
              class="font-display font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors truncate"
            >
              {{ match().homeTeam.name }}
            </span>
          </div>
          <span
            class="font-mono text-2xl font-extrabold tabular-nums"
            [class.text-white]="match().status !== 'UPCOMING'"
            [class.text-slate-600]="match().status === 'UPCOMING'"
          >
            {{ match().homeTeam.score !== null ? match().homeTeam.score : '—' }}
          </span>
        </div>

        <!-- Away Team -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <app-team-badge
              [name]="match().awayTeam.name"
              [code]="match().awayTeam.code"
              [primaryColor]="match().awayTeam.primaryColor"
              [secondaryColor]="match().awayTeam.secondaryColor"
              [logoUrl]="match().awayTeam.logoUrl"
              size="md"
            />
            <span
              class="font-display font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors truncate"
            >
              {{ match().awayTeam.name }}
            </span>
          </div>
          <span
            class="font-mono text-2xl font-extrabold tabular-nums"
            [class.text-white]="match().status !== 'UPCOMING'"
            [class.text-slate-600]="match().status === 'UPCOMING'"
          >
            {{ match().awayTeam.score !== null ? match().awayTeam.score : '—' }}
          </span>
        </div>
      </div>

      <!-- Goal Scorers / Footer Preview -->
      @if (goalEvents().length > 0) {
        <div
          class="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300"
        >
          <span class="text-slate-400 font-mono text-[11px]">⚽ Goles:</span>
          @for (ev of goalEvents(); track ev.id) {
            <span class="inline-flex items-center gap-1">
              <strong class="text-white font-medium">{{ ev.playerName }}</strong>
              <span class="text-emerald-400 font-mono">{{ ev.minute }}'</span>
            </span>
          }
        </div>
      }

      @if (match().broadcastChannel) {
        <div
          class="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs text-slate-400"
        >
          <span class="truncate">
            📺 {{ match().broadcastChannel }}
            @if (match().isFreeToAir) {
              <strong class="text-emerald-400 font-mono text-[10px] ml-1">(EN ABIERTO)</strong>
            }
          </span>
          @if (match().status === 'LIVE') {
            <span class="text-brand-red font-mono font-bold shrink-0">
              Emisión activa →
            </span>
          } @else if (match().status === 'FINISHED') {
            <span class="text-cyan-300 font-mono font-semibold shrink-0">
              ▶ Resumen y acta →
            </span>
          } @else {
            <span class="text-emerald-400 group-hover:translate-x-0.5 transition-transform font-semibold shrink-0">
              Ver previa →
            </span>
          }
        </div>
      }
    </a>
  `,
})
export class MatchCardComponent {
  readonly match = input.required<Match>();

  readonly goalEvents = computed(() =>
    this.match().events.filter((e) => e.type === 'GOAL'),
  );

  readonly cardContainerClass = computed(() => {
    if (this.match().status === 'LIVE') {
      return 'bg-gradient-to-br from-rose-950/45 via-slate-900/90 to-pitch-900 border border-brand-red/45 hover:border-brand-red shadow-lg shadow-brand-red/5';
    }
    return 'bg-slate-900/75 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/40 shadow-md';
  });
}
