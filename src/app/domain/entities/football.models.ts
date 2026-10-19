export type FormResult = 'W' | 'D' | 'L';

export type MatchStatus =
  | 'UPCOMING'
  | 'LIVE'
  | 'FINISHED'
  | 'POSTPONED'
  | 'SUSPENDED';

export type QualificationZone =
  | 'CHAMPIONS_LEAGUE'
  | 'EUROPA_LEAGUE'
  | 'CONFERENCE_LEAGUE'
  | 'DIRECT_PROMOTION'
  | 'PROMOTION_PLAYOFF'
  | 'RELEGATION'
  | 'NONE';

export interface Competition {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  code: string;
  country: string;
  type: 'LEAGUE' | 'CUP' | 'NATIONAL_TEAM';
  tier: number;
  currentSeason: string;
  currentMatchday: number;
  totalMatchdays: number;
  logoText: string;
  accentColor: string;
  description: string;
  isFeatured: boolean;
}

export interface TeamStandingSnapshot {
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  recentForm: FormResult[];
}

export interface TeamSeasonStats {
  possessionAvg: number;
  shotsPerGame: number;
  cleanSheets: number;
  topScorerName: string;
  topScorerGoals: number;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  code: string;
  city: string;
  autonomousCommunity: string;
  stadium: string;
  stadiumCapacity: number;
  foundedYear: number;
  coach: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  competitionSlug: string;
  competitionName: string;
  standing: TeamStandingSnapshot;
  stats: TeamSeasonStats;
  isFeatured: boolean;
}

export interface MatchEvent {
  id: string;
  minute: number;
  extraMinute?: number;
  teamSide: 'HOME' | 'AWAY';
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
  playerName: string;
  playerSlug?: string;
  assistOrReplacedBy?: string;
  detail?: string;
}

export interface LineupPlayer {
  number: number;
  name: string;
  slug: string;
  position: 'POR' | 'DEF' | 'MED' | 'DEL';
  rating?: number;
}

export interface MatchTeamLineup {
  formation: string;
  coach: string;
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface MatchStatistics {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  expectedGoals: [number, number];
}

export interface MatchTeamSummary {
  slug: string;
  name: string;
  shortName: string;
  code: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  score: number | null;
}

export interface Match {
  id: string;
  slug: string;
  competitionSlug: string;
  competitionName: string;
  competitionShortName: string;
  matchday: number;
  roundLabel: string;
  dateIso: string;
  kickoffTime: string;
  status: MatchStatus;
  liveMinute?: number;
  stadium: string;
  city: string;
  referee: string;
  attendance?: number;
  broadcastChannel?: string;
  homeTeam: MatchTeamSummary;
  awayTeam: MatchTeamSummary;
  events: MatchEvent[];
  homeLineup?: MatchTeamLineup;
  awayLineup?: MatchTeamLineup;
  statistics?: MatchStatistics;
  aiSummaryTitle?: string;
  aiSummaryText?: string;
  isFeatured: boolean;
}

export interface StandingRow {
  position: number;
  teamSlug: string;
  teamName: string;
  teamShortName: string;
  teamCode: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  recentForm: FormResult[];
  zone: QualificationZone;
  zoneLabel?: string;
}

export interface StandingZoneLegend {
  zone: QualificationZone;
  label: string;
  colorHex: string;
}

export interface StandingTable {
  competitionSlug: string;
  competitionName: string;
  season: string;
  matchday: number;
  updatedAt: string;
  rows: StandingRow[];
  legend: StandingZoneLegend[];
}

export interface Player {
  id: string;
  slug: string;
  name: string;
  shirtNumber: number;
  position: 'Portero' | 'Defensa' | 'Centrocampista' | 'Delantero';
  positionCode: 'POR' | 'DEF' | 'MED' | 'DEL';
  age: number;
  nationality: string;
  teamSlug: string;
  teamName: string;
  teamShortName: string;
  teamPrimaryColor: string;
  teamLogoUrl?: string;
  photoUrl?: string;
  competitionSlug: string;
  stats: {
    appearances: number;
    minutesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    rating: number;
  };
  isFeatured: boolean;
}

export interface PlayerDerivedMetrics {
  goalContributions: number;
  goalsPer90: number;
  assistsPer90: number;
  contributionsPer90: number;
  minutesPerGoal: number | null;
  minutesPerAppearance: number;
}

export interface PlayerFullProfile {
  player: Player;
  derivedMetrics: PlayerDerivedMetrics;
  liveMatches: Match[];
  upcomingMatches: Match[];
  recentMatches: Match[];
  relatedNews: NewsItem[];
  teammates: Player[];
}

export interface PlayerFilterParams {
  team?: string;
  competition?: string;
  position?: string;
  sortBy?: 'goals' | 'assists' | 'rating' | 'minutes';
  q?: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  image?: string;
  category: string;
  isAiGenerated: boolean;
  relatedTeamSlug?: string;
  relatedTeamName?: string;
  relatedPlayerSlug?: string;
  relatedPlayerName?: string;
  relatedCompetitionSlug?: string;
  relatedCompetitionName?: string;
}

export type TimelineEventType =
  | 'MATCH_FINAL'
  | 'OFFICIAL_CLUB'
  | 'STANDINGS_UPDATE'
  | 'LIVE_ALERT'
  | 'SQUAD_NEWS';

export interface TimelineEventItem {
  id: string;
  timeLabel: string;
  timestampIso: string;
  title: string;
  description: string;
  type: TimelineEventType;
  relatedRoute?: string;
  badgeText: string;
  competitionName?: string;
}

export interface NewsFilterParams {
  team?: string;
  player?: string;
  competition?: string;
  sourceType?: 'all' | 'official' | 'ai';
}

export interface TeamFullProfile {
  team: Team;
  liveMatches: Match[];
  recentMatches: Match[];
  upcomingMatches: Match[];
  squad: Player[];
  standings: StandingTable | null;
  news: NewsItem[];
}

export interface MatchDetailsResponse {
  match: Match;
  standings: StandingTable | null;
}

export interface GlobalSearchResults {
  query: string;
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  matches: Match[];
  news: NewsItem[];
}

export type GeneratedContentType =
  | 'MATCH_SUMMARY'
  | 'MATCH_PREVIEW'
  | 'ROUND_SUMMARY'
  | 'TEAM_SUMMARY'
  | 'PLAYER_SUMMARY';

export type GeneratedContentStatus =
  | 'PENDING'
  | 'GENERATING'
  | 'GENERATED'
  | 'REVIEW_REQUIRED'
  | 'PUBLISHED'
  | 'FAILED';

export interface GeneratedContent {
  id: string;
  type: GeneratedContentType;
  title: string;
  summary: string;
  content: string;
  highlights: string[];
  entityId: string;
  entityType: 'MATCH' | 'TEAM' | 'PLAYER' | 'COMPETITION';
  language: 'es-ES';
  provider: string;
  model: string;
  status: GeneratedContentStatus;
  verifiedDataHash: string;
  validationNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobExecutionLog {
  jobName: string;
  description: string;
  cronExpression: string;
  lastRunAt: string | null;
  lastDurationMs: number;
  runsCount: number;
  lastStatus: 'IDLE' | 'SUCCESS' | 'ERROR';
  lastDetail: string;
}

export interface SystemObservabilitySnapshot {
  timestamp: string;
  cacheMetrics: {
    mode: 'redis' | 'memory';
    hits: number;
    misses: number;
    hitRatePercent: number;
    activeKeysCount: number;
    lastEvictionAt: string | null;
  };
  ttlPolicySeconds: Record<string, number>;
  jobs: JobExecutionLog[];
}

