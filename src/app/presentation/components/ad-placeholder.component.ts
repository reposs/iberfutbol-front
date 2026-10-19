import { Component, computed, inject, input } from '@angular/core';
import { MONETIZATION_CONFIG } from '../../core/config/monetization.config';

@Component({
  selector: 'app-ad-placeholder',
  standalone: true,
  template: `
    <aside
      class="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-slate-900/75 via-pitch-900/90 to-slate-900/75 px-5 py-4 min-h-[80px] sm:min-h-[90px] flex flex-col justify-center"
      role="complementary"
      aria-label="Espacio publicitario y patrocinadores"
      [attr.data-ad-slot]="slot()"
      [attr.data-ad-mode]="config.activeCommercialAds ? 'commercial' : 'editorial-placeholder'"
    >
      @if (config.activeCommercialAds && config.adsenseClientId) {
        <div class="w-full flex flex-col items-center justify-center">
          <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Publicidad</span>
          <ins
            class="adsbygoogle"
            style="display:block; width:100%"
            [attr.data-ad-client]="config.adsenseClientId"
            [attr.data-ad-slot]="adSlotNumber()"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      } @else {
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
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
        </div>
      }
    </aside>
  `,
})
export class AdPlaceholderComponent {
  readonly config = inject(MONETIZATION_CONFIG);
  readonly slot = input<string>('LEADERBOARD-970x90');
  readonly adSlotNumber = input<string>('1234567890');
  readonly label = input<string>(
    'Cobertura estadística oficial, alertas personalizadas y retransmisiones en directo del fútbol español',
  );

  readonly badgeText = computed(() =>
    this.config.activeCommercialAds ? 'PATROCINIO OFICIAL' : 'IBERFÚTBOL EN VIVO',
  );
}
