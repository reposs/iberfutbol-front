import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/home/home.page').then(
        (m) => m.HomePageComponent,
      ),
  },
  {
    path: 'partidos/hoy',
    data: { day: 'hoy' },
    loadComponent: () =>
      import('./presentation/pages/matches/matches-day.page').then(
        (m) => m.MatchesDayPageComponent,
      ),
  },
  {
    path: 'partidos/ayer',
    data: { day: 'ayer' },
    loadComponent: () =>
      import('./presentation/pages/matches/matches-day.page').then(
        (m) => m.MatchesDayPageComponent,
      ),
  },
  {
    path: 'partidos/manana',
    data: { day: 'manana' },
    loadComponent: () =>
      import('./presentation/pages/matches/matches-day.page').then(
        (m) => m.MatchesDayPageComponent,
      ),
  },
  {
    path: 'calendario',
    data: { mode: 'calendario' },
    loadComponent: () =>
      import('./presentation/pages/matches/matches-day.page').then(
        (m) => m.MatchesDayPageComponent,
      ),
  },
  {
    path: 'partidos/:slug',
    loadComponent: () =>
      import('./presentation/pages/matches/match-detail.page').then(
        (m) => m.MatchDetailPageComponent,
      ),
  },
  {
    path: 'clasificacion/:competition',
    loadComponent: () =>
      import('./presentation/pages/standings/standings.page').then(
        (m) => m.StandingsPageComponent,
      ),
  },
  {
    path: 'equipos',
    loadComponent: () =>
      import('./presentation/pages/teams/teams.page').then(
        (m) => m.TeamsListPageComponent,
      ),
  },
  {
    path: 'equipos/:slug',
    loadComponent: () =>
      import('./presentation/pages/teams/teams.page').then(
        (m) => m.TeamDetailPageComponent,
      ),
  },
  {
    path: 'competiciones',
    loadComponent: () =>
      import('./presentation/pages/competitions/competitions.page').then(
        (m) => m.CompetitionsPageComponent,
      ),
  },
  {
    path: 'competiciones/:slug',
    loadComponent: () =>
      import('./presentation/pages/competitions/competitions.page').then(
        (m) => m.CompetitionDetailPageComponent,
      ),
  },
  {
    path: 'jugadores',
    loadComponent: () =>
      import('./presentation/pages/players/players.page').then(
        (m) => m.PlayersListPageComponent,
      ),
  },
  {
    path: 'jugadores/:slug',
    loadComponent: () =>
      import('./presentation/pages/players/players.page').then(
        (m) => m.PlayerDetailPageComponent,
      ),
  },
  {
    path: 'noticias',
    loadComponent: () =>
      import('./presentation/pages/news/news.page').then(
        (m) => m.NewsPageComponent,
      ),
  },
  {
    path: 'actualidad',
    loadComponent: () =>
      import('./presentation/pages/news/news.page').then(
        (m) => m.ActualityPageComponent,
      ),
  },
  {
    path: 'buscar',
    loadComponent: () =>
      import('./presentation/pages/search/search.page').then(
        (m) => m.SearchPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
