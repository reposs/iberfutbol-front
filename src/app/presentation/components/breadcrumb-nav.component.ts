import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbSeoItem } from '../../core/services/seo-meta.service';

@Component({
  selector: 'app-breadcrumb-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (items().length > 0) {
      <nav
        aria-label="Ruta de navegación"
        class="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400"
      >
        @for (item of items(); track item.path; let last = $last) {
          @if (!last) {
            <a
              [routerLink]="item.path"
              class="hover:text-emerald-400 transition-colors"
            >
              {{ item.label }}
            </a>
            <span class="text-slate-600" aria-hidden="true">/</span>
          } @else {
            <span class="text-slate-200 font-bold" aria-current="page">
              {{ item.label }}
            </span>
          }
        }
      </nav>
    }
  `,
})
export class BreadcrumbNavComponent {
  readonly items = input<BreadcrumbSeoItem[]>([]);
}
