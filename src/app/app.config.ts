import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { FOOTBALL_REPOSITORY_PORT } from './domain/ports/football-api.port';
import { AutonomousFootballRepository } from './infrastructure/repositories/autonomous-football.repository';
import { MATCH_REPOSITORY } from './application/use-cases/get-matches-streaming.use-case';
import { LegalBroadcastMatchRepositoryAdapter } from './infrastructure/repositories/legal-broadcast-match.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
    ),
    provideHttpClient(withFetch()),
    {
      provide: FOOTBALL_REPOSITORY_PORT,
      useExisting: AutonomousFootballRepository,
    },
    {
      provide: MATCH_REPOSITORY,
      useExisting: LegalBroadcastMatchRepositoryAdapter,
    },
  ],
};
