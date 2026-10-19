import { Component, computed, inject, input } from '@angular/core';
import { MONETIZATION_CONFIG } from '../../core/config/monetization.config';

@Component({
  selector: 'app-ad-placeholder',
  standalone: true,
  template: `
    <aside
      class="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-slate-900/75 via-pitch-900/90 to-slate-900/75 px-5 py-4 min-h-[76px] flex flex-col sm:flex-row items-center justify-between gap-3"
      aria-label="Espacio reservado para patrocinadores y servicios IberFútbol"
      [attr.data-ad-slot]="slot()"
      [attr.data-ad-mode]="config.activeCommercialAds ? 'commercial' : 'editorial-placeholder'"
    >
      <div class="flex flex-wrap items-center gap-3">
        <span
          class="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-bold"
        >
          {{ badgeText() }}
        </span>
        <p class="text-xs sm:text-sm text-slate-300 font-medium">
          {{ label() }}
        </p>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <span
          class="hidden md:inline-block text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5"
        >
          Marcadores en directo · Estadísticas Oficiales
        </span>
        <span class="text-[11px] font-mono text-slate-500">
          IberFútbol Media
        </span>
      </div>
    </aside>
  `,
})
export class AdPlaceholderComponent {
  readonly config = inject(MONETIZATION_CONFIG);
  readonly slot = input<string>('LEADERBOARD-970x90');
  readonly label = input<string>(
    'Cobertura estadística oficial, alertas personalizadas y retransmisiones en directo del fútbol español',
  );

  readonly badgeText = computed(() =>
    this.config.activeCommercialAds ? 'PATROCINIO OFICIAL' : 'IBERFÚTBOL EN VIVO',
  );
}
