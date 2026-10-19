import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './presentation/layout/header.component';
import { FooterComponent } from './presentation/layout/footer.component';
import { CookieConsentComponent } from './presentation/components/cookie-consent.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CookieConsentComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-pitch-950 text-slate-100">
      <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-emerald-500 focus:text-slate-950 focus:font-display focus:font-bold focus:shadow-2xl"
      >
        Saltar al contenido principal
      </a>
      <app-header />
      <div id="main-content" tabindex="-1" class="flex-1 outline-none">
        <router-outlet />
      </div>
      <app-footer />
      <app-cookie-consent />
    </div>
  `,
})
export class AppComponent {}
