/**
 * Pure Domain Layer (/domain/entities)
 * Zero Angular decorators or framework dependencies.
 */

export type BroadcastMatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

export type LegalStreamingPlatform =
  | 'RTVE_PLAY'
  | 'DAZN'
  | 'MOVISTAR_PLUS'
  | 'LALIGA_YOUTUBE'
  | 'RFEF_OFFICIAL'
  | 'GOL_PLAY';

export interface Match {
  id: string;
  slug: string;
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  homeColor: string;
  awayColor: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  homeScore: number | null;
  awayScore: number | null;
  date: Date;
  kickoffTime: string;
  status: BroadcastMatchStatus;
  liveMinute?: number;
  competition: string;
  competitionSlug: string;
  stadium: string;
  broadcastChannel: string;
  broadcastPlatform: LegalStreamingPlatform;
  /** Official legal streaming link or video source */
  broadcastUrl?: string;
  /** Official legal highlights / replay link for FINISHED matches */
  highlightsUrl?: string;
  /** Indicates if the official broadcast or highlight is free-to-air (e.g., RTVE Play, Official YouTube) */
  isFreeToAir: boolean;
}

/**
 * Value Object / Domain Policy enforcing strict compliance with legal streaming practices.
 * Only official rights-holders and league channels are permitted.
 */
export class LegalBroadcastPolicy {
  private static readonly ALLOWED_OFFICIAL_HOSTS: ReadonlyArray<string> = [
    'www.rtve.es',
    'rtve.es',
    'www.dazn.com',
    'dazn.com',
    'ver.movistarplus.es',
    'www.movistarplus.es',
    'www.youtube.com',
    'youtube.com',
    'www.laliga.com',
    'rfef.es',
    'www.rfef.es',
  ];

  static isOfficialLegalUrl(rawUrl?: string): boolean {
    if (!rawUrl) {
      return false;
    }
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'https:') {
        return false;
      }
      const host = parsed.hostname.toLowerCase();
      if (!this.ALLOWED_OFFICIAL_HOSTS.includes(host)) {
        return false;
      }
      // Block any accidental link to the unrelated @rfef handle (official RFEF is @RFEFutbol)
      if (parsed.pathname.toLowerCase().startsWith('/@rfef/')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  static resolveOfficialBroadcast(params: {
    competitionSlug: string;
    broadcastChannel?: string;
    status: BroadcastMatchStatus;
    homeTeam: string;
    awayTeam: string;
  }): {
    broadcastChannel: string;
    broadcastPlatform: LegalStreamingPlatform;
    broadcastUrl: string;
    highlightsUrl: string;
    isFreeToAir: boolean;
  } {
    const channelLower = (params.broadcastChannel || '').toLowerCase();
    const comp = params.competitionSlug;

    if (
      comp === 'copa-del-rey' ||
      comp === 'seleccion-espanola' ||
      channelLower.includes('la 1') ||
      channelLower.includes('rtve') ||
      channelLower.includes('teledeporte')
    ) {
      const search = encodeURIComponent(
        `Resumen ${params.homeTeam} vs ${params.awayTeam} Copa del Rey RFEFutbol RTVE`,
      );
      return {
        broadcastChannel: params.broadcastChannel || 'La 1 TVE / RTVE Play',
        broadcastPlatform: 'RTVE_PLAY',
        broadcastUrl: 'https://www.rtve.es/play/teledeporte/',
        highlightsUrl: `https://www.youtube.com/results?search_query=${search}`,
        isFreeToAir: true,
      };
    }

    if (
      comp === 'primera-federacion' ||
      comp === 'segunda-federacion' ||
      channelLower.includes('feftv') ||
      channelLower.includes('rfef')
    ) {
      const search = encodeURIComponent(
        `Resumen ${params.homeTeam} vs ${params.awayTeam} RFEFutbol Primera Federacion`,
      );
      return {
        broadcastChannel: params.broadcastChannel || 'RFEF TV (@RFEFutbol) / FEF TV',
        broadcastPlatform: 'RFEF_OFFICIAL',
        broadcastUrl: 'https://www.youtube.com/@RFEFutbol',
        highlightsUrl: `https://www.youtube.com/results?search_query=${search}`,
        isFreeToAir: true,
      };
    }

    if (comp === 'laliga-hypermotion') {
      const search = encodeURIComponent(
        `Resumen ${params.homeTeam} vs ${params.awayTeam} LALIGA HYPERMOTION`,
      );
      return {
        broadcastChannel:
          params.broadcastChannel || 'LaLiga TV Hypermotion (DAZN / Movistar+)',
        broadcastPlatform: 'DAZN',
        broadcastUrl: 'https://www.dazn.com/es-ES/home',
        highlightsUrl: `https://www.youtube.com/results?search_query=${search}`,
        isFreeToAir: false,
      };
    }

    const laligaSearch = encodeURIComponent(
      `Resumen ${params.homeTeam} vs ${params.awayTeam} LALIGA EA SPORTS`,
    );

    if (channelLower.includes('gol')) {
      return {
        broadcastChannel: params.broadcastChannel || 'GOL Play / LaLiga TV (En abierto)',
        broadcastPlatform: 'GOL_PLAY',
        broadcastUrl: 'https://www.youtube.com/@LaLiga',
        highlightsUrl: `https://www.youtube.com/results?search_query=${laligaSearch}`,
        isFreeToAir: true,
      };
    }

    if (channelLower.includes('dazn')) {
      return {
        broadcastChannel: params.broadcastChannel || 'DAZN LaLiga',
        broadcastPlatform: 'DAZN',
        broadcastUrl: 'https://www.dazn.com/es-ES/home',
        highlightsUrl: `https://www.youtube.com/results?search_query=${laligaSearch}`,
        isFreeToAir: false,
      };
    }

    return {
      broadcastChannel:
        params.broadcastChannel || 'Movistar Plus+ LaLiga / DAZN',
      broadcastPlatform: 'MOVISTAR_PLUS',
      broadcastUrl: 'https://www.movistarplus.es/deportes/futbol',
      highlightsUrl: `https://www.youtube.com/results?search_query=${laligaSearch}`,
      isFreeToAir: false,
    };
  }

  static sanitizeMatchBroadcast(match: Match): Match {
    return {
      ...match,
      broadcastUrl: this.isOfficialLegalUrl(match.broadcastUrl)
        ? match.broadcastUrl
        : undefined,
      highlightsUrl: this.isOfficialLegalUrl(match.highlightsUrl)
        ? match.highlightsUrl
        : undefined,
    };
  }
}
