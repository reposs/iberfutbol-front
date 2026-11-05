import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FootballFacade } from '../../application/use-cases/football.facade';
import { GlobalSearchResults } from '../../domain/entities/football.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header
      class="sticky top-0 z-50 backdrop-blur-xl bg-pitch-950/85 border-b border-white/10"
    >
      <!-- Top Live & Featured Ticker Strip -->
      <div
        class="bg-gradient-to-r from-brand-red/20 via-pitch-900 to-emerald-500/15 border-b border-white/5 px-4 py-1.5 text-xs"
      >
        <div
          class="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap"
        >
          <div class="flex items-center gap-2">
            @if (facade.liveMatches().length > 0) {
              <span
                class="inline-flex items-center gap-1.5 font-mono font-bold text-brand-red text-[11px]"
              >
                <span class="h-2 w-2 rounded-full bg-brand-red animate-ping"></span>
                EN JUEGO
              </span>
              @for (m of facade.liveMatches().slice(0, 3); track m.id; let last = $last) {
                <a
                  [routerLink]="['/partidos', m.slug]"
                  class="text-slate-200 hover:text-white font-medium transition-colors"
                >
                  {{ m.homeTeam.shortName }}
                  <strong class="font-mono text-white">{{ m.homeTeam.score }} - {{ m.awayTeam.score }}</strong>
                  {{ m.awayTeam.shortName }} ({{ m.liveMinute }}')
                </a>
                @if (!last) {
                  <span class="text-slate-600">·</span>
                }
              }
            } @else if (tickerMatches().length > 0) {
              <span
                class="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-400 text-[11px]"
              >
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                DESTACADOS
              </span>
              @for (m of tickerMatches(); track m.id; let last = $last) {
                <a
                  [routerLink]="['/partidos', m.slug]"
                  class="text-slate-200 hover:text-white font-medium transition-colors"
                >
                  {{ m.homeTeam.shortName }}
                  @if (m.status === 'FINISHED' && m.homeTeam.score !== null && m.awayTeam.score !== null) {
                    <strong class="font-mono text-white">{{ m.homeTeam.score }} - {{ m.awayTeam.score }}</strong>
                  } @else {
                    <strong class="font-mono text-emerald-300">vs</strong>
                  }
                  {{ m.awayTeam.shortName }}
                  <span class="text-slate-400 font-mono text-[10px]">
                    ({{ m.status === 'FINISHED' ? 'FINAL' : m.kickoffTime }})
                  </span>
                </a>
                @if (!last) {
                  <span class="text-slate-600">·</span>
                }
              }
            } @else {
              <span class="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-400 text-[11px]">
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                DATOS OFICIALES EN TIEMPO REAL
              </span>
            }
          </div>
          <div class="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <a routerLink="/clasificacion/laliga-ea-sports" class="hover:text-emerald-400">LaLiga EA Sports</a>
            <span>·</span>
            <a routerLink="/clasificacion/laliga-hypermotion" class="hover:text-emerald-400">LaLiga Hypermotion</a>
            <span>·</span>
            <a routerLink="/clasificacion/primera-federacion" class="hover:text-emerald-400">1ª Federación</a>
            <span>·</span>
            <a routerLink="/actualidad" class="text-emerald-400 font-semibold">⚡ Qué está pasando</a>
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        <!-- Brand Logo -->
        <a
          routerLink="/"
          class="flex items-center gap-2 sm:gap-2.5 group shrink-0"
          aria-label="IberFútbol Inicio"
        >
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red to-amber-500 flex items-center justify-center shadow-lg shadow-brand-red/20 border border-white/20"
          >
            <span class="font-display font-black text-white text-sm tracking-tighter">
              IF
            </span>
          </div>
          <div>
            <span
              class="font-display font-black text-lg tracking-tight text-white block leading-none"
            >
              IBER<span class="text-brand-red">FÚTBOL</span>
            </span>
            <span
              class="text-[9px] font-mono uppercase tracking-widest text-slate-400 block mt-0.5"
            >
              Fútbol Español 360º
            </span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/10 text-white border-white/15"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- Global Search Input with Instant Grouped Dropdown & Mobile Menu Button -->
        <div class="flex items-center gap-2 sm:gap-2.5 relative min-w-0 flex-1 lg:flex-none justify-end">
          <form (ngSubmit)="onSearchSubmit()" class="relative min-w-0 flex-1 sm:flex-none max-w-[16rem] sm:max-w-none">
            <label for="global-search-input" class="sr-only">
              Buscar equipos, jugadores, partidos o competiciones
            </label>
            <input
              id="global-search-input"
              type="search"
              name="q"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              (focus)="onSearchFocus()"
              placeholder="Buscar club, jugador, partido..."
              autocomplete="off"
              class="w-full min-w-0 sm:w-64 bg-slate-900/90 text-xs sm:text-sm text-white placeholder-slate-400 pl-3 sm:pl-3.5 pr-8 sm:pr-9 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-emerald-400 transition-all"
            />
            <button
              type="submit"
              aria-label="Ejecutar búsqueda"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              🔍
            </button>
          </form>

          <!-- Instant Grouped Search Dropdown (Section 35) -->
          @if (dropdownOpen() && instantResults(); as res) {
            <div
              class="fixed inset-0 z-40"
              (click)="closeDropdown()"
            ></div>
            <div
              class="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-pitch-900 border border-white/15 shadow-2xl p-4 space-y-3 max-h-[75vh] overflow-y-auto"
            >
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/10 pb-2">
                <span>RESULTADOS RÁPIDOS PARA "{{ res.query.toUpperCase() }}"</span>
                <button
                  type="button"
                  (click)="closeDropdown()"
                  class="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              @if (res.teams.length > 0) {
                <div>
                  <span class="block text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                    EQUIPOS
                  </span>
                  @for (t of res.teams.slice(0, 3); track t.slug) {
                    <a
                      [routerLink]="['/equipos', t.slug]"
                      (click)="closeDropdown()"
                      class="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/10 text-xs text-white"
                    >
                      <span class="font-semibold">{{ t.name }}</span>
                      <span class="text-slate-400 font-mono">{{ t.competitionName }}</span>
                    </a>
                  }
                </div>
              }

              @if (res.players.length > 0) {
                <div>
                  <span class="block text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold mb-1">
                    JUGADORES
                  </span>
                  @for (p of res.players.slice(0, 3); track p.slug) {
                    <a
                      [routerLink]="['/jugadores', p.slug]"
                      (click)="closeDropdown()"
                      class="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/10 text-xs text-white"
                    >
                      <span class="font-semibold">{{ p.name }}</span>
                      <span class="text-slate-400 font-mono">{{ p.teamShortName }} · {{ p.stats.goals }}G</span>
                    </a>
                  }
                </div>
              }

              @if (res.competitions.length > 0) {
                <div>
                  <span class="block text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold mb-1">
                    COMPETICIONES
                  </span>
                  @for (c of res.competitions.slice(0, 2); track c.slug) {
                    <a
                      [routerLink]="['/competiciones', c.slug]"
                      (click)="closeDropdown()"
                      class="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/10 text-xs text-white"
                    >
                      <span class="font-semibold">{{ c.name }}</span>
                      <span class="text-slate-400 font-mono">J{{ c.currentMatchday }}</span>
                    </a>
                  }
                </div>
              }

              @if (res.matches.length > 0) {
                <div>
                  <span class="block text-[10px] font-mono uppercase tracking-wider text-brand-red font-bold mb-1">
                    PARTIDOS
                  </span>
                  @for (m of res.matches.slice(0, 3); track m.slug) {
                    <a
                      [routerLink]="['/partidos', m.slug]"
                      (click)="closeDropdown()"
                      class="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/10 text-xs text-white"
                    >
                      <span class="font-semibold">{{ m.homeTeam.shortName }} - {{ m.awayTeam.shortName }}</span>
                      <span class="font-mono text-emerald-400">
                        {{ m.homeTeam.score !== null ? m.homeTeam.score + '-' + m.awayTeam.score : m.kickoffTime }}
                      </span>
                    </a>
                  }
                </div>
              }

              <div class="pt-2 border-t border-white/10 text-center">
                <button
                  type="button"
                  (click)="onSearchSubmit()"
                  class="text-xs font-semibold text-emerald-400 hover:underline"
                >
                  Ver todos los resultados en página completa →
                </button>
              </div>
            </div>
          }

          <!-- Mobile menu trigger -->
          <button
            type="button"
            (click)="toggleMobileMenu()"
            class="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white"
            aria-label="Abrir menú de navegación"
          >
            @if (mobileMenuOpen()) {
              ✕
            } @else {
              ☰
            }
          </button>
        </div>
      </div>

      <!-- Mobile Drawer -->
      @if (mobileMenuOpen()) {
        <nav
          class="lg:hidden border-t border-white/10 bg-pitch-900 px-4 py-3 space-y-1"
          aria-label="Navegación móvil"
        >
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              (click)="mobileMenuOpen.set(false)"
              routerLinkActive="bg-white/10 text-white"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      }
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  private readonly router = inject(Router);
  readonly facade = inject(FootballFacade);

  readonly tickerMatches = computed(() =>
    this.facade.featuredMatches().slice(0, 3),
  );

  readonly mobileMenuOpen = signal(false);
  readonly dropdownOpen = signal(false);
  readonly instantResults = signal<GlobalSearchResults | null>(null);
  searchQuery = '';

  ngOnInit(): void {
    this.facade.ensureHeaderTickerLoaded();
  }

  readonly navItems = [
    { label: 'Inicio', route: '/', exact: true },
    { label: 'Partidos', route: '/partidos/hoy', exact: false },
    { label: 'TV / Resúmenes', route: '/tv-en-directo', exact: false },
    { label: 'Clasificaciones', route: '/clasificacion/laliga-ea-sports', exact: false },
    { label: 'Competiciones', route: '/competiciones', exact: false },
    { label: 'Equipos', route: '/equipos', exact: false },
    { label: 'Jugadores', route: '/jugadores', exact: false },
    { label: 'Noticias', route: '/noticias', exact: false },
    { label: 'Actualidad', route: '/actualidad', exact: false },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  onSearchChange(value: string): void {
    const q = (value || '').trim();
    if (q.length < 2) {
      this.dropdownOpen.set(false);
      this.instantResults.set(null);
      return;
    }

    this.facade.searchGlobal(q).subscribe((res) => {
      this.instantResults.set(res);
      this.dropdownOpen.set(true);
    });
  }

  onSearchFocus(): void {
    if (this.searchQuery.trim().length >= 2 && this.instantResults()) {
      this.dropdownOpen.set(true);
    }
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  onSearchSubmit(): void {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.dropdownOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.router.navigate(['/buscar'], { queryParams: { q } });
  }
}
