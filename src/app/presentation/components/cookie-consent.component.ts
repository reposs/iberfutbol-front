import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  template: `
    @if (visible()) {
      <div
        role="region"
        aria-label="Aviso y configuración de cookies y publicidad"
        class="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md border-t border-white/10 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom duration-300"
      >
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-left max-w-3xl">
            <div class="flex items-center gap-2">
              <span class="text-base">🍪</span>
              <h3 class="text-xs sm:text-sm font-display font-bold text-white tracking-wide">
                Privacidad, Cookies y Espacios Publicitarios en IberFútbol
              </h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Utilizamos cookies técnicas necesarias para el funcionamiento del portal deportivo y, con su consentimiento, cookies de análisis y de personalización de espacios publicitarios para mantener la plataforma abierta y gratuita conforme al RGPD y la normativa de la AEPD.
            </p>
          </div>

          <div class="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
            <button
              type="button"
              (click)="rejectAll()"
              class="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Solo necesarias
            </button>
            <button
              type="button"
              (click)="acceptAll()"
              class="flex-1 md:flex-initial px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-red hover:bg-rose-600 shadow-md shadow-brand-red/25 transition-all"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieConsentComponent implements OnInit {
  readonly visible = signal<boolean>(false);
  private readonly storageKey = 'iberfutbol_cookie_consent_v1';

  ngOnInit(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) {
        this.visible.set(true);
      }
    } catch {
      // In case localStorage is blocked in private browsing
      this.visible.set(false);
    }
  }

  acceptAll(): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          consent: 'granted',
          timestamp: new Date().toISOString(),
          advertising: true,
          analytics: true,
        }),
      );
    } catch {
      // ignore
    }
    this.visible.set(false);
  }

  rejectAll(): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          consent: 'rejected',
          timestamp: new Date().toISOString(),
          advertising: false,
          analytics: false,
        }),
      );
    } catch {
      // ignore
    }
    this.visible.set(false);
  }
}
