import { Component, computed, input, output } from '@angular/core';
import { GeneratedContent } from '../../domain/entities/football.models';

@Component({
  selector: 'app-ai-editorial-card',
  standalone: true,
  template: `
    @if (content(); as item) {
      <section
        class="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/35 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <!-- Top Bar: AI Type Badge, Verification Hash & Regenerate Button -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10"
        >
          <div class="flex flex-wrap items-center gap-2.5">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {{ badgeLabel() }}
            </span>

            <span
              class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-slate-300"
            >
              Redacción IberFútbol
            </span>

            <span
              class="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/20 font-mono text-[11px] text-emerald-300"
            >
              ✓ Estadísticas Oficiales
            </span>
          </div>

          <button
            type="button"
            (click)="refreshRequested.emit()"
            [disabled]="loading()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 font-mono text-xs font-bold text-slate-200 hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            @if (loading()) {
              <span>Actualizando...</span>
            } @else {
              <span>↻ Actualizar análisis</span>
            }
          </button>
        </div>

        <!-- Title & Lead Summary -->
        <h2
          class="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight mb-3"
        >
          {{ item.title }}
        </h2>

        <p
          class="text-sm sm:text-base font-medium text-emerald-200/90 leading-relaxed mb-4"
        >
          {{ item.summary }}
        </p>

        <!-- Full Editorial Content -->
        <div
          class="text-sm text-slate-300 leading-relaxed space-y-3 bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-white/10 mb-5"
        >
          <p>{{ item.content }}</p>
        </div>

        <!-- Verified Highlights -->
        @if (item.highlights && item.highlights.length > 0) {
          <div class="space-y-2">
            <p
              class="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400"
            >
              Claves Estadísticas del Encuentro
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              @for (point of item.highlights; track point) {
                <div
                  class="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-slate-200"
                >
                  <span class="text-emerald-400 font-bold mt-0.5">▸</span>
                  <span>{{ point }}</span>
                </div>
              }
            </div>
          </div>
        }
      </section>
    }
  `,
})
export class AiEditorialCardComponent {
  readonly content = input<GeneratedContent | null>(null);
  readonly loading = input<boolean>(false);
  readonly refreshRequested = output<void>();

  readonly badgeLabel = computed(() => {
    const type = this.content()?.type;
    switch (type) {
      case 'MATCH_SUMMARY':
        return 'Crónica del Partido';
      case 'MATCH_PREVIEW':
        return 'Previa Táctica';
      case 'ROUND_SUMMARY':
        return 'Balance de la Jornada';
      case 'TEAM_SUMMARY':
        return 'Informe del Club';
      case 'PLAYER_SUMMARY':
        return 'Informe de Rendimiento';
      default:
        return 'Análisis Deportivo';
    }
  });
}
