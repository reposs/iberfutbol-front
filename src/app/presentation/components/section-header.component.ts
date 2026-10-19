import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        @if (eyebrow()) {
          <div class="flex items-center gap-2 mb-1">
            @if (isLive()) {
              <span class="relative flex h-2.5 w-2.5">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red"
                ></span>
              </span>
            } @else {
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            }
            <span
              class="text-[11px] font-mono uppercase tracking-widest font-semibold"
              [class.text-brand-red]="isLive()"
              [class.text-emerald-400]="!isLive()"
            >
              {{ eyebrow() }}
            </span>
          </div>
        }
        <h2
          class="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white"
        >
          {{ title() }}
        </h2>
        @if (subtitle()) {
          <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
            {{ subtitle() }}
          </p>
        }
      </div>

      @if (actionLabel() && actionRoute()) {
        <a
          [routerLink]="actionRoute()"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl transition-all"
        >
          <span>{{ actionLabel() }}</span>
          <span aria-hidden="true">→</span>
        </a>
      }
    </div>
  `,
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly eyebrow = input<string>();
  readonly isLive = input<boolean>(false);
  readonly actionLabel = input<string>();
  readonly actionRoute = input<string>();
}
