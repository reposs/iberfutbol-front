import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { GetMatchesStreamingUseCase } from '../../application/use-cases/get-matches-streaming.use-case';
import { Match } from '../../domain/entities/match-broadcast.entity';

/**
 * Functional Route Resolver (Infrastructure Adapter)
 * Pre-fetches matches and their verified legal broadcast/replay links on initial route activation.
 */
export const matchesBroadcastResolver: ResolveFn<Match[]> = () => {
  const useCase = inject(GetMatchesStreamingUseCase);
  return useCase.execute().pipe(
    tap((matches) => useCase.hydrateFromResolver(matches)),
    catchError(() => of([])),
  );
};
