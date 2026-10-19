import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Cargando datos deportivos">
      @for (item of [1, 2, 3]; track item) {
        <div
          class="rounded-2xl bg-slate-900/60 border border-white/5 p-5 animate-pulse space-y-4"
        >
          <div class="flex justify-between items-center">
            <div class="h-3 w-24 bg-slate-800 rounded"></div>
            <div class="h-4 w-14 bg-slate-800 rounded-full"></div>
          </div>
          <div class="flex items-center justify-between py-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-slate-800"></div>
              <div class="h-4 w-28 bg-slate-800 rounded"></div>
            </div>
            <div class="h-6 w-8 bg-slate-800 rounded"></div>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-slate-800"></div>
              <div class="h-4 w-24 bg-slate-800 rounded"></div>
            </div>
            <div class="h-6 w-8 bg-slate-800 rounded"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class LoadingSkeletonComponent {}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div
      class="rounded-2xl bg-slate-900/50 border border-white/10 p-8 text-center max-w-xl mx-auto my-4"
    >
      <div
        class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-emerald-400 font-mono font-bold mb-3"
      >
        ⚽
      </div>
      <h3 class="font-display text-lg font-bold text-white mb-1">
        {{ title() }}
      </h3>
      <p class="text-sm text-slate-400">
        {{ description() }}
      </p>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input<string>('Sin registros disponibles para este filtro');
  readonly description = input<string>(
    'Prueba a seleccionar otra competición o fecha en el calendario de la jornada.',
  );
}

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div
      class="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-6 text-center max-w-xl mx-auto my-4"
      role="alert"
    >
      <h3 class="font-display text-lg font-bold text-rose-300 mb-1">
        Error de sincronización deportiva
      </h3>
      <p class="text-sm text-rose-200/80 mb-4">
        {{ message() }}
      </p>
      <button
        type="button"
        (click)="retry.emit()"
        class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
      >
        Reintentar conexión
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input<string>(
    'No hemos podido recuperar la información solicitada en este momento.',
  );
  readonly retry = output<void>();
}
