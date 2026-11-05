import { Injectable } from '@angular/core';
import {
  Competition,
  FormResult,
  GeneratedContent,
  GeneratedContentStatus,
  Match,
  Player,
  PlayerDerivedMetrics,
  StandingTable,
  Team,
} from '../../domain/entities/football.models';
import { computeBrowserHash } from './slug.util';

export interface AiRawDraftOutput {
  title: string;
  summary: string;
  content: string;
  highlights: string[];
  provider: string;
  model: string;
}

export function calculatePlayerDerivedMetrics(
  player: Player,
): PlayerDerivedMetrics {
  const { appearances, minutesPlayed, goals, assists } = player.stats;
  const goalContributions = goals + assists;
  const nineties = minutesPlayed > 0 ? minutesPlayed / 90 : 0;

  return {
    goalContributions,
    goalsPer90: nineties > 0 ? Number((goals / nineties).toFixed(2)) : 0,
    assistsPer90: nineties > 0 ? Number((assists / nineties).toFixed(2)) : 0,
    contributionsPer90:
      nineties > 0 ? Number((goalContributions / nineties).toFixed(2)) : 0,
    minutesPerGoal: goals > 0 ? Math.round(minutesPlayed / goals) : null,
    minutesPerAppearance:
      appearances > 0 ? Math.round(minutesPlayed / appearances) : 0,
  };
}

@Injectable({ providedIn: 'root' })
export class BrowserAiEditorialEngine {
  private readonly contentStore = new Map<string, GeneratedContent>();

  private readonly prohibitedPatterns: { regex: RegExp; reason: string }[] = [
    {
      regex: /seg[uú]n rumores|rumores apuntan|fuentes cercanas aseguran/i,
      reason: 'Contiene lenguaje especulativo o rumores no verificados',
    },
    {
      regex: /declar[oó] en rueda de prensa|asegur[oó] ante los micr[oó]fonos/i,
      reason:
        'Contiene citas o declaraciones no presentes en los datos estructurados',
    },
    {
      regex: /sufre una lesi[oó]n muscular|estar[aá] de baja varios meses/i,
      reason: 'Contiene partes médicos o lesiones no verificadas',
    },
  ];

  private validateDraft(
    draft: AiRawDraftOutput,
    expectedTerms: string[] = [],
  ): {
    status: GeneratedContentStatus;
    notes: string[];
    sanitized: AiRawDraftOutput;
  } {
    const notes: string[] = [];
    const title = (draft.title || '').trim();
    const summary = (draft.summary || '').trim();
    const content = (draft.content || '').trim();
    const highlights = Array.isArray(draft.highlights)
      ? draft.highlights.filter((h) => Boolean(h && h.trim()))
      : [];

    if (title.length < 10) {
      notes.push('El titular es demasiado corto (< 10 caracteres).');
    }
    if (summary.length < 25) {
      notes.push('El resumen editorial es demasiado corto (< 25 caracteres).');
    }
    if (content.length < 40) {
      notes.push('El cuerpo del contenido es insuficiente (< 40 caracteres).');
    }

    const combinedText = `${title} ${summary} ${content}`;
    for (const rule of this.prohibitedPatterns) {
      if (rule.regex.test(combinedText)) {
        notes.push(rule.reason);
      }
    }

    for (const term of expectedTerms) {
      if (term && !combinedText.toLowerCase().includes(term.toLowerCase())) {
        notes.push(
          `El contenido omitió la referencia verificada obligatoria: "${term}"`,
        );
      }
    }

    const isValid = notes.length === 0;
    return {
      status: isValid ? 'PUBLISHED' : 'REVIEW_REQUIRED',
      notes: isValid
        ? ['Verificación superada: 100% alineado con datos estructurados.']
        : notes,
      sanitized: {
        ...draft,
        title,
        summary,
        content,
        highlights: highlights.slice(0, 5),
      },
    };
  }

  buildMatchContent(
    match: Match,
    homeTeam?: Team | null,
    awayTeam?: Team | null,
    standings?: StandingTable | null,
    forceRegenerate = false,
  ): GeneratedContent {
    const isPreview = match.status === 'UPCOMING';
    const cacheKey = `match:${match.slug}:${isPreview ? 'preview' : 'summary'}`;
    const existing = this.contentStore.get(cacheKey);

    const homeRow = standings?.rows.find(
      (r) => r.teamSlug === match.homeTeam.slug,
    );
    const awayRow = standings?.rows.find(
      (r) => r.teamSlug === match.awayTeam.slug,
    );

    if (isPreview) {
      const homePosNum = homeRow?.position ?? homeTeam?.standing.position;
      const homePtsNum = homeRow?.points ?? homeTeam?.standing.points;
      const awayPosNum = awayRow?.position ?? awayTeam?.standing.position;
      const awayPtsNum = awayRow?.points ?? awayTeam?.standing.points;
      const homeFormArr: FormResult[] =
        homeRow?.recentForm ?? homeTeam?.standing.recentForm ?? [];
      const awayFormArr: FormResult[] =
        awayRow?.recentForm ?? awayTeam?.standing.recentForm ?? [];

      const hash = computeBrowserHash({
        slug: match.slug,
        status: match.status,
        dateIso: match.dateIso,
        kickoffTime: match.kickoffTime,
        homePosNum,
        homePtsNum,
        awayPosNum,
        awayPtsNum,
      });

      if (!forceRegenerate && existing && existing.verifiedDataHash === hash) {
        return existing;
      }

      const homePos = homePosNum
        ? `${homePosNum}º con ${homePtsNum} puntos`
        : 'en competición oficial';
      const awayPos = awayPosNum
        ? `${awayPosNum}º con ${awayPtsNum} puntos`
        : 'en competición oficial';
      const homeForm = homeFormArr.join('-') || 'N/D';
      const awayForm = awayFormArr.join('-') || 'N/D';

      const draft: AiRawDraftOutput = {
        title: `Previa ${match.competitionName}: ${match.homeTeam.name} vs ${match.awayTeam.name} en ${match.stadium}`,
        summary: `Análisis previo de la ${match.roundLabel} (${match.dateIso}, ${match.kickoffTime}h). El ${match.homeTeam.name} llega ${homePos} y recibe al ${match.awayTeam.name} (${awayPos}).`,
        content: `El ${match.stadium} de ${match.city} acoge el enfrentamiento correspondiente a la ${match.roundLabel} de ${match.competitionName} entre ${match.homeTeam.name} y ${match.awayTeam.name} a partir de las ${match.kickoffTime}h. El cuadro local afronta la cita situado ${homePos} (racha reciente: ${homeForm}), mientras que el conjunto visitante comparece ${awayPos} (racha reciente: ${awayForm}). El colegiado designado es ${match.referee}.`,
        highlights: [
          `Cita oficial: ${match.dateIso} a las ${match.kickoffTime}h en ${match.stadium}`,
          `Situación ${match.homeTeam.name}: ${homePos} (Forma: ${homeForm})`,
          `Situación ${match.awayTeam.name}: ${awayPos} (Forma: ${awayForm})`,
        ],
        provider: 'StructuredDataAiAdapter',
        model: 'editorial-es-v2',
      };

      const validation = this.validateDraft(draft, [
        match.homeTeam.name,
        match.awayTeam.name,
      ]);
      const now = new Date().toISOString();
      const saved: GeneratedContent = {
        id: `cnt-match-preview-${match.slug}`,
        type: 'MATCH_PREVIEW',
        title: validation.sanitized.title,
        summary: validation.sanitized.summary,
        content: validation.sanitized.content,
        highlights: validation.sanitized.highlights,
        entityId: match.slug,
        entityType: 'MATCH',
        language: 'es-ES',
        provider: draft.provider,
        model: draft.model,
        status: validation.status,
        verifiedDataHash: hash,
        validationNotes: validation.notes,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      this.contentStore.set(cacheKey, saved);
      return saved;
    }

    const homeScore = match.homeTeam.score ?? 0;
    const awayScore = match.awayTeam.score ?? 0;
    const scorers = match.events
      .filter((e) => e.type === 'GOAL')
      .map((e) => ({
        minute: e.minute,
        playerName: e.playerName,
        assistBy: e.assistOrReplacedBy,
      }));

    const hash = computeBrowserHash({
      slug: match.slug,
      status: match.status,
      homeScore,
      awayScore,
      scorers,
      liveMinute: match.liveMinute,
    });

    if (!forceRegenerate && existing && existing.verifiedDataHash === hash) {
      return existing;
    }

    const scoreStr = `${homeScore}-${awayScore}`;
    const scorersList =
      scorers.length > 0
        ? scorers
            .map(
              (s) =>
                `${s.playerName} (${s.minute}'${s.assistBy ? `, asist. de ${s.assistBy}` : ''})`,
            )
            .join(', ')
        : 'sin tantos registrados en el acta';

    const statsParagraph = match.statistics
      ? `En el apartado estadístico, el ${match.homeTeam.name} registró un ${match.statistics.possession[0]}% de posesión (${match.statistics.expectedGoals[0].toFixed(2)} xG y ${match.statistics.shots[0]} remates totales, ${match.statistics.shotsOnTarget[0]} a puerta), frente al ${match.statistics.possession[1]}% de posesión (${match.statistics.expectedGoals[1].toFixed(2)} xG y ${match.statistics.shots[1]} disparos) del ${match.awayTeam.name}.`
      : `Encuentro disputado en ${match.stadium} (${match.city}) bajo el arbitraje de ${match.referee}.`;

    const statusLabel =
      match.status === 'LIVE'
        ? `En juego (minuto ${match.liveMinute ?? 45}')`
        : 'Crónica final';

    let headlineVerb = 'firma tablas ante';
    if (homeScore > awayScore) {
      headlineVerb = 'se impone a';
    } else if (homeScore < awayScore) {
      headlineVerb = 'cede ante';
    }

    const draft: AiRawDraftOutput = {
      title: `${statusLabel}: ${match.homeTeam.name} ${headlineVerb} ${match.awayTeam.name} (${scoreStr}) en ${match.competitionName}`,
      summary: `Marcador de ${scoreStr} en ${match.stadium} (${match.roundLabel}). Goles del encuentro: ${scorersList}.`,
      content: `${match.homeTeam.name} y ${match.awayTeam.name} protagonizaron el duelo de la ${match.roundLabel} de ${match.competitionName} en ${match.stadium} con resultado de ${scoreStr}. Los tantos del encuentro llevaron la firma de ${scorersList}. ${statsParagraph}`,
      highlights: [
        `Marcador oficial: ${match.homeTeam.name} ${scoreStr} ${match.awayTeam.name} (${match.roundLabel})`,
        `Goleadores verificados: ${scorersList}`,
        match.statistics
          ? `Goles esperados (xG): ${match.homeTeam.name} ${match.statistics.expectedGoals[0].toFixed(2)} vs ${match.statistics.expectedGoals[1].toFixed(2)} ${match.awayTeam.name}`
          : `Sede oficial: ${match.stadium} (${match.city}) · Árbitro: ${match.referee}`,
      ],
      provider: 'StructuredDataAiAdapter',
      model: 'editorial-es-v2',
    };

    const validation = this.validateDraft(draft, [
      match.homeTeam.name,
      match.awayTeam.name,
      scoreStr,
    ]);
    const now = new Date().toISOString();
    const saved: GeneratedContent = {
      id: `cnt-match-summary-${match.slug}`,
      type: 'MATCH_SUMMARY',
      title: validation.sanitized.title,
      summary: validation.sanitized.summary,
      content: validation.sanitized.content,
      highlights: validation.sanitized.highlights,
      entityId: match.slug,
      entityType: 'MATCH',
      language: 'es-ES',
      provider: draft.provider,
      model: draft.model,
      status: validation.status,
      verifiedDataHash: hash,
      validationNotes: validation.notes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.contentStore.set(cacheKey, saved);
    return saved;
  }

  buildRoundContent(
    competition: Competition,
    standings: StandingTable | null,
    matches: Match[],
    topScorer: Player | null,
    forceRegenerate = false,
  ): GeneratedContent {
    const cacheKey = `round:${competition.slug}`;
    const existing = this.contentStore.get(cacheKey);

    const effectiveStandings = standings ?? {
      competitionSlug: competition.slug,
      competitionName: competition.name,
      season: competition.currentSeason,
      matchday: competition.currentMatchday,
      updatedAt: new Date().toISOString(),
      legend: [],
      rows: [],
    };

    const leader = effectiveStandings.rows[0];
    const runnerUp = effectiveStandings.rows[1] ?? effectiveStandings.rows[0];
    const completedMatches = matches
      .filter((m) => m.status === 'FINISHED')
      .map((m) => ({
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        homeScore: m.homeTeam.score ?? 0,
        awayScore: m.awayTeam.score ?? 0,
      }));

    const hash = computeBrowserHash({
      competitionSlug: competition.slug,
      matchday: effectiveStandings.matchday,
      leader: leader?.teamSlug,
      leaderPts: leader?.points,
      completedCount: completedMatches.length,
    });

    if (!forceRegenerate && existing && existing.verifiedDataHash === hash) {
      return existing;
    }

    const leaderName = leader?.teamName || 'Líder de la categoría';
    const leaderPoints = leader?.points || 0;
    const runnerUpName = runnerUp?.teamName || 'Segundo clasificado';
    const runnerUpPoints = runnerUp?.points || 0;

    const completedText =
      completedMatches.length > 0
        ? completedMatches
            .slice(0, 6)
            .map(
              (m) => `${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}`,
            )
            .join('; ')
        : 'encuentros en fase de disputa';

    const scorerText = topScorer
      ? `${topScorer.name} (${topScorer.teamName}) encabeza el trofeo de máximo realizador con ${topScorer.stats.goals} dianas.`
      : '';

    const draft: AiRawDraftOutput = {
      title: `Resumen Jornada ${effectiveStandings.matchday} de ${competition.name}: ${leaderName} lidera con ${leaderPoints} puntos`,
      summary: `Balance oficial de la Jornada ${effectiveStandings.matchday} (${effectiveStandings.season}): ${leaderName} (${leaderPoints} pts) mantiene la primera plaza seguido de ${runnerUpName} (${runnerUpPoints} pts).`,
      content: `La Jornada ${effectiveStandings.matchday} de ${competition.name} (${effectiveStandings.season}) sitúa a ${leaderName} en lo más alto de la clasificación con ${leaderPoints} puntos, por delante de ${runnerUpName} (${runnerUpPoints} puntos). Entre los marcadores cerrados de la jornada destacan: ${completedText}. ${scorerText}`,
      highlights: [
        `Líder de ${competition.name}: ${leaderName} (${leaderPoints} puntos)`,
        `Perseguidor inmediato: ${runnerUpName} (${runnerUpPoints} puntos)`,
        topScorer
          ? `Pichichi de la categoría: ${topScorer.name} con ${topScorer.stats.goals} goles`
          : `Jornada ${effectiveStandings.matchday} de la temporada ${effectiveStandings.season}`,
      ],
      provider: 'StructuredDataAiAdapter',
      model: 'editorial-es-v2',
    };

    const validation = this.validateDraft(draft, [competition.name]);
    const now = new Date().toISOString();
    const saved: GeneratedContent = {
      id: `cnt-round-${competition.slug}`,
      type: 'ROUND_SUMMARY',
      title: validation.sanitized.title,
      summary: validation.sanitized.summary,
      content: validation.sanitized.content,
      highlights: validation.sanitized.highlights,
      entityId: competition.slug,
      entityType: 'COMPETITION',
      language: 'es-ES',
      provider: draft.provider,
      model: draft.model,
      status: validation.status,
      verifiedDataHash: hash,
      validationNotes: validation.notes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.contentStore.set(cacheKey, saved);
    return saved;
  }

  buildTeamContent(team: Team, forceRegenerate = false): GeneratedContent {
    const cacheKey = `team:${team.slug}`;
    const existing = this.contentStore.get(cacheKey);
    const hash = computeBrowserHash({
      slug: team.slug,
      pos: team.standing.position,
      pts: team.standing.points,
      played: team.standing.played,
    });

    if (!forceRegenerate && existing && existing.verifiedDataHash === hash) {
      return existing;
    }

    const formStr = team.standing.recentForm.join('-');
    const dgStr =
      team.standing.goalDifference > 0
        ? `+${team.standing.goalDifference}`
        : `${team.standing.goalDifference}`;

    const draft: AiRawDraftOutput = {
      title: `Informe de evolución del ${team.name}: ${team.standing.position}º en ${team.competitionName} con ${team.standing.points} puntos`,
      summary: `El conjunto dirigido por ${team.coach} suma ${team.standing.won} victorias, ${team.standing.drawn} empates y ${team.standing.lost} derrotas en ${team.standing.played} jornadas (${team.standing.goalsFor} GF / ${team.standing.goalsAgainst} GC).`,
      content: `El ${team.name} ocupa actualmente la ${team.standing.position}ª posición de ${team.competitionName} con ${team.standing.points} puntos tras disputar ${team.standing.played} encuentros oficiales (${team.standing.won}V, ${team.standing.drawn}E, ${team.standing.lost}D). En el plano ofensivo y defensivo acumula ${team.standing.goalsFor} goles a favor y ${team.standing.goalsAgainst} en contra (diferencia de ${dgStr}) y mantiene ${team.stats.cleanSheets} porterías a cero en ${team.stadium}. Su posesión media es del ${team.stats.possessionAvg}% con ${team.stats.shotsPerGame} remates por partido, siendo ${team.stats.topScorerName} (${team.stats.topScorerGoals} goles) su principal referencia realizadora.`,
      highlights: [
        `Clasificación: ${team.standing.position}º en ${team.competitionName} (${team.standing.points} pts en ${team.standing.played} PJ)`,
        `Rendimiento táctico: ${team.stats.possessionAvg}% posesión · ${team.stats.shotsPerGame} tiros/partido · ${team.stats.cleanSheets} porterías a cero`,
        `Referencia ofensiva: ${team.stats.topScorerName} (${team.stats.topScorerGoals} goles) · Racha: ${formStr}`,
      ],
      provider: 'StructuredDataAiAdapter',
      model: 'editorial-es-v2',
    };

    const validation = this.validateDraft(draft, [team.name]);
    const now = new Date().toISOString();
    const saved: GeneratedContent = {
      id: `cnt-team-${team.slug}`,
      type: 'TEAM_SUMMARY',
      title: validation.sanitized.title,
      summary: validation.sanitized.summary,
      content: validation.sanitized.content,
      highlights: validation.sanitized.highlights,
      entityId: team.slug,
      entityType: 'TEAM',
      language: 'es-ES',
      provider: draft.provider,
      model: draft.model,
      status: validation.status,
      verifiedDataHash: hash,
      validationNotes: validation.notes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.contentStore.set(cacheKey, saved);
    return saved;
  }

  buildPlayerContent(
    player: Player,
    competitionName: string,
    forceRegenerate = false,
  ): GeneratedContent {
    const cacheKey = `player:${player.slug}`;
    const existing = this.contentStore.get(cacheKey);
    const metrics = calculatePlayerDerivedMetrics(player);

    const hash = computeBrowserHash({
      slug: player.slug,
      goals: player.stats.goals,
      assists: player.stats.assists,
      appearances: player.stats.appearances,
    });

    if (!forceRegenerate && existing && existing.verifiedDataHash === hash) {
      return existing;
    }

    const draft: AiRawDraftOutput = {
      title: `Análisis de rendimiento de ${player.name} (${player.teamName}): ${metrics.goalContributions} contribuciones de gol en ${player.stats.appearances} partidos`,
      summary: `El ${player.position.toLowerCase()} de ${player.age} años registra ${player.stats.goals} goles y ${player.stats.assists} asistencias en ${player.stats.minutesPlayed} minutos (${metrics.contributionsPer90} G+A por 90').`,
      content: `${player.name} (#${player.shirtNumber}, ${player.nationality}) es una de las piezas destacadas del ${player.teamName} en ${competitionName}. En la presente campaña acumula ${player.stats.appearances} apariciones oficiales (${player.stats.minutesPlayed} minutos sobre el césped), firmando ${player.stats.goals} goles y ${player.stats.assists} asistencias para un total de ${metrics.goalContributions} participaciones directas de gol. Sus métricas por cada 90 minutos reflejan ${metrics.goalsPer90} goles/90' y ${metrics.contributionsPer90} contribuciones/90', con una valoración media de ${player.stats.rating}.`,
      highlights: [
        `Producción ofensiva: ${player.stats.goals} goles y ${player.stats.assists} asistencias (${metrics.goalContributions} G+A)`,
        `Impacto por 90 minutos: ${metrics.contributionsPer90} G+A/90' en ${player.stats.minutesPlayed} minutos jugados`,
        `Valoración oficial en ${player.teamName}: ★ ${player.stats.rating} (${player.stats.appearances} partidos)`,
      ],
      provider: 'StructuredDataAiAdapter',
      model: 'editorial-es-v2',
    };

    const validation = this.validateDraft(draft, [player.name]);
    const now = new Date().toISOString();
    const saved: GeneratedContent = {
      id: `cnt-player-${player.slug}`,
      type: 'PLAYER_SUMMARY',
      title: validation.sanitized.title,
      summary: validation.sanitized.summary,
      content: validation.sanitized.content,
      highlights: validation.sanitized.highlights,
      entityId: player.slug,
      entityType: 'PLAYER',
      language: 'es-ES',
      provider: draft.provider,
      model: draft.model,
      status: validation.status,
      verifiedDataHash: hash,
      validationNotes: validation.notes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.contentStore.set(cacheKey, saved);
    return saved;
  }
}
