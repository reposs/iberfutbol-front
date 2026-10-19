import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';
import { FOOTBALL_REPOSITORY_PORT } from '../../domain/ports/football-api.port';
import {
  Competition,
  Match,
  NewsFilterParams,
  NewsItem,
  Player,
  PlayerFilterParams,
  StandingTable,
  Team,
  TimelineEventItem,
  TimelineEventType,
} from '../../domain/entities/football.models';

@Injectable({ providedIn: 'root' })
export class FootballFacade {
  private readonly repository = inject(FOOTBALL_REPOSITORY_PORT);

  // Signals para el Dashboard de Inicio (Home)
  readonly homeLoading = signal<boolean>(false);
  readonly homeError = signal<string | null>(null);
  readonly competitions = signal<Competition[]>([]);
  readonly liveMatches = signal<Match[]>([]);
  readonly todayMatches = signal<Match[]>([]);
  readonly featuredMatches = signal<Match[]>([]);
  readonly laligaStandings = signal<StandingTable | null>(null);
  readonly featuredTeams = signal<Team[]>([]);
  readonly latestNews = signal<NewsItem[]>([]);
  readonly timelineEvents = signal<TimelineEventItem[]>([]);
  readonly topScorers = signal<Player[]>([]);

  readonly upcomingMatches = computed(() => {
    const combined = [
      ...this.todayMatches().filter((m) => m.status === 'UPCOMING'),
      ...this.featuredMatches().filter((m) => m.status === 'UPCOMING'),
    ];
    const seen = new Set<string>();
    return combined
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      })
      .slice(0, 4);
  });

  ensureHeaderTickerLoaded(): void {
    if (this.liveMatches().length > 0 || this.featuredMatches().length > 0) {
      return;
    }
    forkJoin({
      live: this.repository.getLiveMatches(),
      featured: this.repository.getFeaturedMatches(),
    }).subscribe({
      next: (data) => {
        if (this.liveMatches().length === 0) {
          this.liveMatches.set(data.live);
        }
        if (this.featuredMatches().length === 0) {
          this.featuredMatches.set(data.featured);
        }
      },
    });
  }

  loadHomeDashboard(): void {
    this.homeLoading.set(true);
    this.homeError.set(null);

    forkJoin({
      competitions: this.repository.getCompetitions(),
      live: this.repository.getLiveMatches(),
      today: this.repository.getMatchesByDay('hoy'),
      featured: this.repository.getFeaturedMatches(),
      standings: this.repository.getStandings('laliga-ea-sports'),
      teams: this.repository.getFeaturedTeams(),
      news: this.repository.getNews(),
      timeline: this.repository.getTimeline(),
      scorers: this.repository.getTopScorers(),
    })
      .pipe(finalize(() => this.homeLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.competitions.set(data.competitions);
          this.liveMatches.set(data.live);
          this.todayMatches.set(data.today.matches);
          this.featuredMatches.set(data.featured);
          this.laligaStandings.set(data.standings);
          this.featuredTeams.set(data.teams);
          this.latestNews.set(data.news);
          this.timelineEvents.set(data.timeline);
          this.topScorers.set(data.scorers);
        },
        error: () => {
          this.homeError.set(
            'No se pudo sincronizar la información deportiva en este momento. Por favor, inténtalo de nuevo.',
          );
        },
      });
  }

  getMatchesByDay(day: string, competition?: string) {
    return this.repository.getMatchesByDay(day, competition);
  }

  getCalendarMatches(competition?: string) {
    return this.repository.getCalendarMatches(competition);
  }

  getMatchDetails(slug: string) {
    return this.repository.getMatchDetails(slug);
  }

  getStandings(competitionSlug: string) {
    return this.repository.getStandings(competitionSlug);
  }

  getTeams(competitionSlug?: string) {
    return this.repository.getTeams(competitionSlug);
  }

  getTeamProfile(slug: string) {
    return this.repository.getTeamProfile(slug);
  }

  getCompetitions() {
    return this.repository.getCompetitions();
  }

  getCompetitionBySlug(slug: string) {
    return this.repository.getCompetitionBySlug(slug);
  }

  getPlayers(filters?: PlayerFilterParams) {
    return this.repository.getPlayers(filters);
  }

  getPlayerProfile(slug: string) {
    return this.repository.getPlayerProfile(slug);
  }

  getNews(filters?: NewsFilterParams) {
    return this.repository.getNews(filters);
  }

  getTimeline(type?: TimelineEventType) {
    return this.repository.getTimeline(type);
  }

  searchGlobal(query: string) {
    return this.repository.searchGlobal(query);
  }

  getMatchAiContent(slug: string, refresh = false) {
    return this.repository.getMatchAiContent(slug, refresh);
  }

  getRoundAiContent(competitionSlug: string, refresh = false) {
    return this.repository.getRoundAiContent(competitionSlug, refresh);
  }

  getTeamAiContent(slug: string, refresh = false) {
    return this.repository.getTeamAiContent(slug, refresh);
  }

  getPlayerAiContent(slug: string, refresh = false) {
    return this.repository.getPlayerAiContent(slug, refresh);
  }

  getJobsStatus() {
    return this.repository.getJobsStatus();
  }
}
