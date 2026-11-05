import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import {
  BroadcastMatchStatus,
  LegalBroadcastPolicy,
  Match,
} from '../../domain/entities/match-broadcast.entity';
import { MatchRepository } from '../../domain/ports/match.repository.port';
import { LiveSpanishBrowserProvider } from '../autonomous/live-spanish-browser.provider';

@Injectable({ providedIn: 'root' })
export class LegalBroadcastMatchRepositoryAdapter implements MatchRepository {
  private readonly liveProvider = inject(LiveSpanishBrowserProvider);

  getMatches(): Observable<Match[]> {
    return from(
      (async () => {
        const rawMatches = await this.liveProvider.fetchAllMatches();

        return rawMatches.map((m) => {
          const status: BroadcastMatchStatus =
            m.status === 'LIVE'
              ? 'LIVE'
              : m.status === 'FINISHED'
                ? 'FINISHED'
                : 'UPCOMING';

          const resolved = LegalBroadcastPolicy.resolveOfficialBroadcast({
            competitionSlug: m.competitionSlug,
            broadcastChannel: m.broadcastChannel,
            status,
            homeTeam: m.homeTeam.name,
            awayTeam: m.awayTeam.name,
          });

          const parsedDate = new Date(`${m.dateIso}T${m.kickoffTime || '20:00'}:00`);

          return {
            id: m.id,
            slug: m.slug,
            homeTeam: m.homeTeam.name,
            awayTeam: m.awayTeam.name,
            homeCode: m.homeTeam.code,
            awayCode: m.awayTeam.code,
            homeColor: m.homeTeam.primaryColor,
            awayColor: m.awayTeam.primaryColor,
            homeLogoUrl: m.homeTeam.logoUrl,
            awayLogoUrl: m.awayTeam.logoUrl,
            homeScore: m.homeTeam.score,
            awayScore: m.awayTeam.score,
            date: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
            kickoffTime: m.kickoffTime,
            status,
            liveMinute: m.liveMinute,
            competition: m.competitionName,
            competitionSlug: m.competitionSlug,
            stadium: m.stadium,
            broadcastChannel: resolved.broadcastChannel,
            broadcastPlatform: resolved.broadcastPlatform,
            broadcastUrl: resolved.broadcastUrl,
            highlightsUrl: resolved.highlightsUrl,
            isFreeToAir: resolved.isFreeToAir,
          };
        });
      })(),
    );
  }
}
