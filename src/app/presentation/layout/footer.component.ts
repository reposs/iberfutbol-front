import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-white/10 bg-pitch-950 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-1">
            <div class="flex items-center gap-2.5 mb-3">
              <div
                class="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-red to-amber-500 flex items-center justify-center font-display font-black text-white text-xs"
              >
                IF
              </div>
              <span class="font-display font-black text-lg text-white">
                IBER<span class="text-brand-red">FÚTBOL</span>
              </span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Plataforma moderna de información, estadísticas y actualidad del
              fútbol español. Datos estructurados verificados y cobertura
              multicategoría.
            </p>
          </div>

          <div>
            <h3
              class="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold mb-3"
            >
              Competiciones
            </h3>
            <ul class="space-y-2 text-xs text-slate-400">
              <li>
                <a routerLink="/clasificacion/laliga-ea-sports" class="hover:text-white">
                  LaLiga EA Sports
                </a>
              </li>
              <li>
                <a routerLink="/clasificacion/laliga-hypermotion" class="hover:text-white">
                  LaLiga Hypermotion
                </a>
              </li>
              <li>
                <a routerLink="/clasificacion/primera-federacion" class="hover:text-white">
                  Primera Federación
                </a>
              </li>
              <li>
                <a routerLink="/clasificacion/segunda-federacion" class="hover:text-white">
                  Segunda Federación
                </a>
              </li>
              <li>
                <a routerLink="/partidos/hoy" class="hover:text-white">
                  Copa del Rey y Selección
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3
              class="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold mb-3"
            >
              Clubes Destacados
            </h3>
            <ul class="space-y-2 text-xs text-slate-400">
              <li>
                <a routerLink="/equipos/fc-barcelona" class="hover:text-white">
                  FC Barcelona
                </a>
              </li>
              <li>
                <a routerLink="/equipos/real-madrid" class="hover:text-white">
                  Real Madrid CF
                </a>
              </li>
              <li>
                <a routerLink="/equipos/atletico-de-madrid" class="hover:text-white">
                  Atlético de Madrid
                </a>
              </li>
              <li>
                <a routerLink="/equipos/athletic-club" class="hover:text-white">
                  Athletic Club
                </a>
              </li>
              <li>
                <a routerLink="/equipos/racing-de-santander" class="hover:text-white">
                  Real Racing Club
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3
              class="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold mb-3"
            >
              Cobertura en Directo
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-3">
              Seguimiento permanente de todas las categorías del fútbol español:
              marcadores en vivo, alineaciones confirmadas, clasificaciones y
              estadísticas oficiales de cada jornada.
            </p>
            <span
              class="inline-block text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg"
            >
              Datos Oficiales en Tiempo Real
            </span>
          </div>
        </div>

        <div
          class="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2"
        >
          <span>© 2026 IberFútbol · Portal de Información del Fútbol Español.</span>
          <span>LaLiga · Segunda · Primera y Segunda RFEF · Copa del Rey · Selección</span>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
