import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import { FootballRepositoryPort } from '../../domain/ports/football-api.port';
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
} from '../../domain/entities/football.models';

@Injectable({ providedIn: 'root' })
export class HttpFootballRepository implements FootballRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.config.baseUrl}/competitions`);
  }

  getCompetitionBySlug(slug: string): Observable<Competition> {
    return this.http.get<Competition>(
      `${this.config.baseUrl}/competitions/${slug}`,
    );
  }

  getMatchesByDay(
    day: string,
    competition?: string,
  ): Observable<{ dateIso: string; matches: Match[] }> {
    let params = new HttpParams();
    if (competition && competition !== 'todos') {
      params = params.set('competition', competition);
    }
    return this.http.get<{ dateIso: string; matches: Match[] }>(
      `${this.config.baseUrl}/matches/day/${day}`,
      { params },
    );
  }

  getCalendarMatches(competition?: string): Observable<Match[]> {
    let params = new HttpParams();
    if (competition && competition !== 'todos') {
      params = params.set('competition', competition);
    }
    return this.http.get<Match[]>(`${this.config.baseUrl}/matches/calendar`, {
      params,
    });
  }

  getLiveMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.config.baseUrl}/matches/live`);
  }

  getFeaturedMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.config.baseUrl}/matches/featured`);
  }

  getMatchDetails(slug: string): Observable<MatchDetailsResponse> {
    return this.http.get<MatchDetailsResponse>(
      `${this.config.baseUrl}/matches/${slug}`,
    );
  }

  getStandings(competitionSlug: string): Observable<StandingTable> {
    return this.http.get<StandingTable>(
      `${this.config.baseUrl}/standings/${competitionSlug}`,
    );
  }

  getTeams(competitionSlug?: string): Observable<Team[]> {
    let params = new HttpParams();
    if (competitionSlug && competitionSlug !== 'todos') {
      params = params.set('competition', competitionSlug);
    }
    return this.http.get<Team[]>(`${this.config.baseUrl}/teams`, { params });
  }

  getFeaturedTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.config.baseUrl}/teams/featured`);
  }

  getTeamProfile(slug: string): Observable<TeamFullProfile> {
    return this.http.get<TeamFullProfile>(
      `${this.config.baseUrl}/teams/${slug}`,
    );
  }

  getPlayers(filters?: PlayerFilterParams): Observable<Player[]> {
    let params = new HttpParams();
    if (filters?.team && filters.team !== 'todos') {
      params = params.set('team', filters.team);
    }
    if (filters?.competition && filters.competition !== 'todos') {
      params = params.set('competition', filters.competition);
    }
    if (filters?.position && filters.position !== 'TODOS') {
      params = params.set('position', filters.position);
    }
    if (filters?.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters?.q) {
      params = params.set('q', filters.q);
    }
    return this.http.get<Player[]>(`${this.config.baseUrl}/players`, {
      params,
    });
  }

  getTopScorers(competition?: string): Observable<Player[]> {
    let params = new HttpParams();
    if (competition && competition !== 'todos') {
      params = params.set('competition', competition);
    }
    return this.http.get<Player[]>(
      `${this.config.baseUrl}/players/top-scorers`,
      { params },
    );
  }

  getPlayerProfile(slug: string): Observable<PlayerFullProfile> {
    return this.http.get<PlayerFullProfile>(
      `${this.config.baseUrl}/players/${slug}`,
    );
  }

  getNews(filters?: NewsFilterParams): Observable<NewsItem[]> {
    let params = new HttpParams();
    if (filters?.team) params = params.set('team', filters.team);
    if (filters?.player) params = params.set('player', filters.player);
    if (filters?.competition && filters.competition !== 'todas') {
      params = params.set('competition', filters.competition);
    }
    if (filters?.sourceType && filters.sourceType !== 'all') {
      params = params.set('sourceType', filters.sourceType);
    }
    return this.http.get<NewsItem[]>(`${this.config.baseUrl}/news`, { params });
  }

  getTimeline(type?: TimelineEventType): Observable<TimelineEventItem[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<TimelineEventItem[]>(
      `${this.config.baseUrl}/news/timeline`,
      { params },
    );
  }

  searchGlobal(query: string): Observable<GlobalSearchResults> {
    const params = new HttpParams().set('q', query);
    return this.http.get<GlobalSearchResults>(`${this.config.baseUrl}/search`, {
      params,
    });
  }

  getMatchAiContent(slug: string, refresh = false): Observable<GeneratedContent> {
    let params = new HttpParams();
    if (refresh) params = params.set('refresh', 'true');
    return this.http.get<GeneratedContent>(
      `${this.config.baseUrl}/content/match/${slug}`,
      { params },
    );
  }

  getRoundAiContent(
    competitionSlug: string,
    refresh = false,
  ): Observable<GeneratedContent> {
    let params = new HttpParams();
    if (refresh) params = params.set('refresh', 'true');
    return this.http.get<GeneratedContent>(
      `${this.config.baseUrl}/content/round/${competitionSlug}`,
      { params },
    );
  }

  getTeamAiContent(slug: string, refresh = false): Observable<GeneratedContent> {
    let params = new HttpParams();
    if (refresh) params = params.set('refresh', 'true');
    return this.http.get<GeneratedContent>(
      `${this.config.baseUrl}/content/team/${slug}`,
      { params },
    );
  }

  getPlayerAiContent(
    slug: string,
    refresh = false,
  ): Observable<GeneratedContent> {
    let params = new HttpParams();
    if (refresh) params = params.set('refresh', 'true');
    return this.http.get<GeneratedContent>(
      `${this.config.baseUrl}/content/player/${slug}`,
      { params },
    );
  }

  getJobsStatus(): Observable<SystemObservabilitySnapshot> {
    return this.http.get<SystemObservabilitySnapshot>(
      `${this.config.baseUrl}/jobs/status`,
    );
  }
}
