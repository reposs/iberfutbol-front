import { Component, input } from '@angular/core';
import { FormResult } from '../../domain/entities/football.models';

@Component({
  selector: 'app-form-indicator',
  standalone: true,
  template: `
    <div class="inline-flex items-center gap-1" aria-label="Forma reciente">
      @for (result of form(); track $index) {
        @if (result === 'W') {
          <span
            class="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold inline-flex items-center justify-center"
            title="Victoria"
          >
            V
          </span>
        } @else if (result === 'D') {
          <span
            class="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold inline-flex items-center justify-center"
            title="Empate"
          >
            E
          </span>
        } @else {
          <span
            class="w-5 h-5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-mono font-bold inline-flex items-center justify-center"
            title="Derrota"
          >
            D
          </span>
        }
      }
    </div>
  `,
})
export class FormIndicatorComponent {
  readonly form = input.required<FormResult[]>();
}
