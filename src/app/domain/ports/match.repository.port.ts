/**
 * Pure Domain Port (/domain/ports)
 * Defines the contract for retrieving matches and their legal broadcast links.
 * No Angular decorators or UI dependencies.
 */
import type { Observable } from 'rxjs';
import type { Match } from '../entities/match-broadcast.entity';

export interface MatchRepository {
  getMatches(): Observable<Match[]>;
}
