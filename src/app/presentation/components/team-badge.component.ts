import { Component, input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-team-badge',
  standalone: true,
  template: `
    @if (logoUrl() && !imgFailed()) {
      <div
        [class]="sizeClasses()"
        class="relative inline-flex items-center justify-center rounded-xl bg-slate-950/75 p-1 select-none shadow-md border border-white/15 overflow-hidden shrink-0"
        [attr.aria-label]="'Escudo oficial de ' + name()"
      >
        <img
          [src]="logoUrl()"
          [alt]="'Escudo de ' + name()"
          loading="lazy"
          (error)="onImgError()"
          class="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        />
      </div>
    } @else {
      <div
        [class]="sizeClasses()"
        class="relative inline-flex items-center justify-center rounded-xl font-display font-black tracking-tighter select-none shadow-md border border-white/15 overflow-hidden shrink-0"
        [style.background]="badgeGradient()"
        [attr.aria-label]="'Escudo de ' + name()"
      >
        <span
          class="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] text-white"
        >
          {{ code() }}
        </span>
        <span
          class="absolute inset-x-0 bottom-0 h-1"
          [style.background-color]="secondaryColor()"
        ></span>
      </div>
    }
  `,
})
export class TeamBadgeComponent {
  readonly name = input.required<string>();
  readonly code = input.required<string>();
  readonly primaryColor = input<string>('#dc2626');
  readonly secondaryColor = input<string>('#ffffff');
  readonly logoUrl = input<string | undefined>(undefined);
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  readonly imgFailed = signal<boolean>(false);

  onImgError(): void {
    this.imgFailed.set(true);
  }

  readonly sizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'w-7 h-7 text-[10px] rounded-lg';
      case 'lg':
        return 'w-12 h-12 text-sm rounded-xl';
      case 'xl':
        return 'w-16 h-16 text-lg rounded-2xl';
      case 'md':
      default:
        return 'w-9 h-9 text-xs rounded-xl';
    }
  });

  readonly badgeGradient = computed(() => {
    const primary =
      this.primaryColor() === '#ffffff' ? '#1e3a8a' : this.primaryColor();
    const secondary = this.secondaryColor();
    return `linear-gradient(135deg, ${primary} 0%, ${primary} 65%, ${secondary} 100%)`;
  });
}
