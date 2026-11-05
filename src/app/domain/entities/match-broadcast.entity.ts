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
  /** Indicates if the official broadcast or highlight is free-to-air (e.g., RTVE Play, Gol Play, Official YouTube) */
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
    'goltelevision.com',
    'www.goltelevision.com',
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
      return this.ALLOWED_OFFICIAL_HOSTS.includes(parsed.hostname.toLowerCase());
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
    const query = encodeURIComponent(
      `resumen ${params.homeTeam} vs ${params.awayTeam} oficial`,
    );

    if (
      comp === 'copa-del-rey' ||
      comp === 'seleccion-espanola' ||
      channelLower.includes('la 1') ||
      channelLower.includes('rtve') ||
      channelLower.includes('teledeporte')
    ) {
      return {
        broadcastChannel: params.broadcastChannel || 'La 1 TVE / RTVE Play',
        broadcastPlatform: 'RTVE_PLAY',
        broadcastUrl: 'https://www.rtve.es/play/deportes/futbol/',
        highlightsUrl: 'https://www.rtve.es/play/deportes/futbol/',
        isFreeToAir: true,
      };
    }

    if (
      comp === 'primera-federacion' ||
      comp === 'segunda-federacion' ||
      channelLower.includes('feftv') ||
      channelLower.includes('rfef')
    ) {
      return {
        broadcastChannel: params.broadcastChannel || 'RFEF TV / FEF TV Oficial',
        broadcastPlatform: 'RFEF_OFFICIAL',
        broadcastUrl: 'https://www.youtube.com/@rfef/streams',
        highlightsUrl: `https://www.youtube.com/@rfef/search?query=${query}`,
        isFreeToAir: true,
      };
    }

    if (channelLower.includes('gol')) {
      return {
        broadcastChannel: params.broadcastChannel || 'GOL Play (En abierto)',
        broadcastPlatform: 'GOL_PLAY',
        broadcastUrl: 'https://www.goltelevision.com/en-directo',
        highlightsUrl: `https://www.youtube.com/@LaLiga/search?query=${query}`,
        isFreeToAir: true,
      };
    }

    if (channelLower.includes('dazn')) {
      return {
        broadcastChannel: params.broadcastChannel || 'DAZN LaLiga',
        broadcastPlatform: 'DAZN',
        broadcastUrl: 'https://www.dazn.com/es-ES/competition/Competition:2x2dh1g60013726l2336426p',
        highlightsUrl: `https://www.youtube.com/@LaLiga/search?query=${query}`,
        isFreeToAir: false,
      };
    }

    if (comp === 'laliga-hypermotion') {
      return {
        broadcastChannel:
          params.broadcastChannel || 'LaLiga TV Hypermotion (DAZN / Movistar+)',
        broadcastPlatform: 'DAZN',
        broadcastUrl: 'https://www.laliga.com/es-GB/donde-ver-laliga-hypermotion',
        highlightsUrl: `https://www.youtube.com/@LaLigaHypermotion/search?query=${query}`,
        isFreeToAir: false,
      };
    }

    return {
      broadcastChannel:
        params.broadcastChannel || 'Movistar LaLiga TV / DAZN Oficial',
      broadcastPlatform: 'MOVISTAR_PLUS',
      broadcastUrl: 'https://www.laliga.com/es-GB/donde-ver-laliga-ea-sports',
      highlightsUrl: `https://www.youtube.com/@LaLiga/search?query=${query}`,
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
