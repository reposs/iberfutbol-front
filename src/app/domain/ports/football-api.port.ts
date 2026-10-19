import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Competition,
  GeneratedContent,
  GlobalSearchResults,
  Match,
  MatchDetailsResponse,
  NewsFilterParams,
  NewsItem,
  Player,
  PlayerFilterParams,
  PlayerFullProfile,
  StandingTable,
  SystemObservabilitySnapshot,
  Team,
  TeamFullProfile,
  TimelineEventItem,
  TimelineEventType,
} from '../entities/football.models';

export interface FootballRepositoryPort {
  getCompetitions(): Observable<Competition[]>;
  getCompetitionBySlug(slug: string): Observable<Competition>;
  getMatchesByDay(
    day: string,
    competition?: string,
  ): Observable<{ dateIso: string; matches: Match[] }>;
  getCalendarMatches(competition?: string): Observable<Match[]>;
  getLiveMatches(): Observable<Match[]>;
  getFeaturedMatches(): Observable<Match[]>;
  getMatchDetails(slug: string): Observable<MatchDetailsResponse>;
  getStandings(competitionSlug: string): Observable<StandingTable>;
  getTeams(competitionSlug?: string): Observable<Team[]>;
  getFeaturedTeams(): Observable<Team[]>;
  getTeamProfile(slug: string): Observable<TeamFullProfile>;
  getPlayers(filters?: PlayerFilterParams): Observable<Player[]>;
  getTopScorers(competition?: string): Observable<Player[]>;
  getPlayerProfile(slug: string): Observable<PlayerFullProfile>;
  getNews(filters?: NewsFilterParams): Observable<NewsItem[]>;
  getTimeline(type?: TimelineEventType): Observable<TimelineEventItem[]>;
  searchGlobal(query: string): Observable<GlobalSearchResults>;
  getMatchAiContent(slug: string, refresh?: boolean): Observable<GeneratedContent>;
  getRoundAiContent(
    competitionSlug: string,
    refresh?: boolean,
  ): Observable<GeneratedContent>;
  getTeamAiContent(slug: string, refresh?: boolean): Observable<GeneratedContent>;
  getPlayerAiContent(slug: string, refresh?: boolean): Observable<GeneratedContent>;
  getJobsStatus(): Observable<SystemObservabilitySnapshot>;
}

export const FOOTBALL_REPOSITORY_PORT =
  new InjectionToken<FootballRepositoryPort>('FOOTBALL_REPOSITORY_PORT');

