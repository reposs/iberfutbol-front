import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import {
  BroadcastMatchStatus,
  LegalBroadcastPolicy,
  Match,
} from '../../domain/entities/match-broadcast.entity';
import { MatchRepository } from '../../domain/ports/match.repository.port';

export const MATCH_REPOSITORY = new InjectionToken<MatchRepository>(
  'MATCH_REPOSITORY',
);

@Injectable({ providedIn: 'root' })
export class GetMatchesStreamingUseCase {
  private readonly repository = inject(MATCH_REPOSITORY);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<'ALL' | BroadcastMatchStatus>('ALL');
  readonly competitionFilter = signal<string>('todos');
  readonly onlyFreeToAir = signal<boolean>(false);

  private readonly matchesStream$: Observable<Match[]> = this.execute().pipe(
    tap({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set('Error al sincronizar la guía de emisiones oficiales.');
      },
    }),
    catchError(() => {
      this.loading.set(false);
      return of([]);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Reactive Signal backed by toSignal() from the Domain Port Observable
   */
  readonly matches = toSignal(this.matchesStream$, { initialValue: [] });

  private readonly hydratedMatches = signal<Match[] | null>(null);

  readonly effectiveMatches = computed<Match[]>(() => {
    const hydrated = this.hydratedMatches();
    return hydrated && hydrated.length > 0 ? hydrated : this.matches();
  });

  readonly filteredMatches = computed<Match[]>(() => {
    const status = this.statusFilter();
    const comp = this.competitionFilter();
    const freeOnly = this.onlyFreeToAir();

    return this.effectiveMatches().filter((m) => {
      if (status !== 'ALL' && m.status !== status) {
        return false;
      }
      if (comp !== 'todos' && m.competitionSlug !== comp) {
        return false;
      }
      if (freeOnly && !m.isFreeToAir) {
        return false;
      }
      return true;
    });
  });

  readonly liveMatches = computed<Match[]>(() =>
    this.filteredMatches().filter((m) => m.status === 'LIVE'),
  );

  readonly upcomingMatches = computed<Match[]>(() =>
    this.filteredMatches().filter((m) => m.status === 'UPCOMING'),
  );

  readonly pastMatches = computed<Match[]>(() =>
    this.filteredMatches().filter((m) => m.status === 'FINISHED'),
  );

  /**
   * Orchestrates retrieving matches from the MatchRepository port and enforcing
   * legal broadcast domain verification on every item.
   */
  execute(): Observable<Match[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.repository.getMatches().pipe(
      map((items) =>
        items
          .map((item) => LegalBroadcastPolicy.sanitizeMatchBroadcast(item))
          .sort((a, b) => {
            const rank = (s: BroadcastMatchStatus) =>
              s === 'LIVE' ? 0 : s === 'UPCOMING' ? 1 : 2;
            if (rank(a.status) !== rank(b.status)) {
              return rank(a.status) - rank(b.status);
            }
            return b.date.getTime() - a.date.getTime();
          }),
      ),
    );
  }

  hydrateFromResolver(resolved: Match[]): void {
    if (resolved && resolved.length > 0) {
      this.hydratedMatches.set(resolved);
      this.loading.set(false);
    }
  }
}
