import { getCachedData, setCachedData, CACHE_DURATION } from '../utils/cache';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import type { ProcessedFixture, MatchResult, Squad, Player } from '../types/football';

// In production the Cloudflare Worker proxies requests to Render.
// In development Vite proxies requests to http://localhost:3001.
const BASE_URL = '/api/livescore';
const COMPETITION = '23'; // Liga Profesional Argentina
const LIBERTADORES_COMPETITION = '329'; // Copa Libertadores
const BOCA_ID = '934'; // Confirmed via API standings response
const BOCA_RE = /boca/i;

// ── Interfaces de respuesta ───────────────────────────────────────────────────

// Both /matches/history.json and /fixtures/list.json use nested team objects
interface LSTeam {
  id: string | number;
  name: string;
  logo?: string;
  stadium?: string;
}

// Shared base — used for both history and upcoming fixtures
interface LSFixture {
  id: string | number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM:SS" UTC for upcoming, "FT" for finished
  scheduled?: string; // "HH:MM" actual kick-off time
  home: LSTeam;
  away: LSTeam;
  location?: string;
  round?: string;
  status?: string;
  competition_name?: string; // present in H2H responses
  // Scores are nested in history responses: scores: { score, ft_score, ht_score, ... }
  scores?: {
    score?: string; // "X - X" final
    ft_score?: string; // "X - X" full-time
    ht_score?: string;
    et_score?: string;
  };
}

// Alias for history usage
type LSMatch = LSFixture;

// Flat match structure returned by the v4 head-to-head endpoint
interface LSFlatMatch {
  id: string | number;
  date: string; // "YYYY-MM-DD"
  home_name: string;
  away_name: string;
  home_id: string | number;
  away_id: string | number;
  score?: string; // "X - X"
  ft_score?: string;
  ht_score?: string;
  scheduled?: string; // "HH:MM"
  location?: string;
  competition?: { id: string | number; name: string };
}

// Standings row inside a group (from /competitions/table.json → stages[].groups[].standings)
interface LSGroupStanding {
  rank: number;
  points: number | string;
  matches?: number | string;
  played?: number | string;
  won: number | string;
  drawn: number | string;
  lost: number | string;
  goal_diff?: number | string;
  goals_scored?: number | string;
  goals_conceded?: number | string;
  form?: string[];
  team: { id: number | string; name: string; logo?: string };
}

interface LSGroup {
  id: number | string;
  name: string;
  standings?: LSGroupStanding[];
  table?: LSGroupStanding[];
}

interface LSAPIStage {
  stage: { id: number | string; name: string };
  groups?: LSGroup[];
  // Fallback for flat-stage responses
  table?: LSGroupStanding[];
  rows?: LSGroupStanding[];
}

// ── Exports públicos ──────────────────────────────────────────────────────────

export interface StandingData {
  rank: number;
  teamId: number | string;
  teamName: string;
  teamLogo: string;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  zone?: string;
  goalDiff?: number;
}

export interface AnnualStandingData extends StandingData {
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  breakdown: {
    stage: string;
    points: number;
    played: number;
    win: number;
    draw: number;
    lose: number;
  }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Retorna las credenciales de autenticación necesarias para las llamadas de la API.
 * Nota: Los proxies del servidor las inyectan automáticamente en producción.
 */
const auth = (): Record<string, string> => ({});

/**
 * Convierte un identificador de texto alfanumérico en un número único.
 * Útil para mapear IDs alfanuméricos de equipos a IDs numéricos de tipo indexado.
 */
const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Conversión a entero de 32 bits
  }
  return Math.abs(hash);
};

/**
 * Convierte un valor (número o cadena) a tipo numérico de manera segura.
 */
const n = (v: number | string | undefined): number => (v !== undefined ? Number(v) : 0);

/**
 * Parsea un marcador en formato "G - P" a una tupla de valores numéricos de goles [local, visitante].
 */
const parseScoreStr = (score: string | undefined): [number | null, number | null] => {
  if (!score) return [null, null];
  const m = score.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!m) return [null, null];
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
};

/**
 * Simplifica y estandariza los nombres de fases y zonas de torneos de fútbol argentino.
 */
const mapStageName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('zona a')) return 'Zona A';
  if (lower.includes('zona b')) return 'Zona B';
  if (lower.includes('promedios') || lower.includes('relegation')) return 'Promedios';
  if (lower.includes('tabla anual') || lower.includes('anual')) return 'Tabla Anual';
  if (lower.includes('1') || lower.includes('first') || lower.includes('apertura'))
    return 'Apertura';
  if (lower.includes('2') || lower.includes('second') || lower.includes('clausura'))
    return 'Clausura';
  return name;
};

/**
 * Mapea una fila de posiciones cruda de la API al objeto unificado StandingData del frontend.
 */
const mapStandingRow = (row: LSGroupStanding, zone?: string): StandingData => ({
  rank: n(row.rank),
  teamId: row.team.id,
  teamName: row.team.name,
  teamLogo: row.team.logo ?? '',
  points: n(row.points),
  played: n(row.matches ?? row.played),
  win: n(row.won),
  draw: n(row.drawn),
  lose: n(row.lost),
  zone,
  goalDiff: n(row.goal_diff),
});

/**
 * Obtiene todas las filas de posiciones agrupadas por zona de forma aplanada.
 */
const getStageRows = (apiStage: LSAPIStage): Array<{ row: LSGroupStanding; zone?: string }> => {
  const stageName = apiStage.stage?.name ?? '';
  const mappedStage = mapStageName(stageName);
  const groups = apiStage.groups ?? [];

  if (groups.length > 0) {
    return groups.flatMap((group) => {
      const rows = group.standings ?? group.table ?? [];
      const zoneName = `${mappedStage} - Zona ${group.name}`;
      return rows.map((row) => ({ row, zone: zoneName }));
    });
  }

  const rows = apiStage.table ?? apiStage.rows ?? [];
  return rows.map((row) => ({ row, zone: mappedStage || undefined }));
};

/**
 * Evalúa si una fase/etapa es apta para agregarse en la tabla anual acumulada de puntos.
 */
const isAnnualStageCandidate = (stageName: string): boolean => {
  const lower = stageName.trim().toLowerCase();
  if (!lower) return true;
  return (
    lower.includes('apertura') ||
    lower.includes('clausura') ||
    lower.includes('phase 1') ||
    lower.includes('phase 2') ||
    lower.includes('first') ||
    lower.includes('second') ||
    lower === '1' ||
    lower === '2'
  );
};

/**
 * Procesa y ordena las posiciones de las diferentes etapas y grupos de la liga local.
 */
const mapLeagueStandings = (data: {
  stages?: LSAPIStage[];
  table?: LSGroupStanding[];
}): StandingData[] => {
  const result: StandingData[] = [];
  const stages = [...(data.stages ?? [])];

  const stageOrder: Record<string, number> = {
    'Zona A': 1,
    'Zona B': 2,
    'Tabla Anual': 3,
    'Promedios': 4,
  };

  // Ordenar las etapas según el orden solicitado para mostrarlas en ese orden en el selector
  stages.sort((a, b) => {
    const nameA = mapStageName(a.stage?.name ?? '');
    const nameB = mapStageName(b.stage?.name ?? '');
    const orderA = stageOrder[nameA] ?? 99;
    const orderB = stageOrder[nameB] ?? 99;
    return orderA - orderB;
  });

  for (const apiStage of stages) {
    const stageName = apiStage.stage?.name ?? '';
    const mappedStage = mapStageName(stageName);
    const groups = apiStage.groups ?? [];

    if (groups.length > 0) {
      for (const group of groups) {
        const rows = group.standings ?? group.table ?? [];
        const zoneName = `${mappedStage} - Zona ${group.name}`;
        for (const row of rows) {
          result.push(mapStandingRow(row, zoneName));
        }
      }
    } else {
      const rows = apiStage.table ?? apiStage.rows ?? [];
      for (const row of rows) {
        result.push(mapStandingRow(row, mappedStage || undefined));
      }
    }
  }

  if (stages.length === 0 && data.table) {
    for (const row of data.table) {
      result.push(mapStandingRow(row));
    }
  }

  return result;
};

/**
 * Formatea y normaliza el nombre del grupo para la Copa Libertadores.
 */
const formatLibertadoresGroupName = (groupName: string): string => {
  const trimmed = groupName.trim();
  if (!trimmed) return 'Grupo';
  return /^grupo\b/i.test(trimmed) ? trimmed : `Grupo ${trimmed}`;
};

/**
 * Mapea y procesa las posiciones correspondientes a la fase de grupos de la Copa Libertadores.
 */
const mapLibertadoresStandings = (data: {
  stages?: LSAPIStage[];
  table?: LSGroupStanding[];
}): StandingData[] => {
  const result: StandingData[] = [];
  const stages = data.stages ?? [];

  for (const apiStage of stages) {
    const stageName = apiStage.stage?.name?.trim();
    const groups = apiStage.groups ?? [];

    if (groups.length > 0) {
      for (const group of groups) {
        const rows = group.standings ?? group.table ?? [];
        const zoneName = formatLibertadoresGroupName(group.name);
        for (const row of rows) {
          result.push(mapStandingRow(row, zoneName));
        }
      }
      continue;
    }

    const rows = apiStage.table ?? apiStage.rows ?? [];
    for (const row of rows) {
      result.push(mapStandingRow(row, stageName || undefined));
    }
  }

  if (stages.length === 0 && data.table) {
    for (const row of data.table) {
      result.push(mapStandingRow(row));
    }
  }

  return result;
};

/**
 * Genera la tabla acumulada anual a partir de las etapas jugadas (Apertura + Clausura).
 */
const mapAnnualStandings = (data: {
  stages?: LSAPIStage[];
  table?: LSGroupStanding[];
}): AnnualStandingData[] => {
  const stages = data.stages ?? [];
  const selectedStages = stages.filter((apiStage) =>
    isAnnualStageCandidate(apiStage.stage?.name ?? '')
  );
  const stagesToAggregate = selectedStages.length > 0 ? selectedStages : stages;
  const annualMap = new Map<number, AnnualStandingData>();

  for (const [stageIndex, apiStage] of stagesToAggregate.entries()) {
    const stageLabel =
      mapStageName(apiStage.stage?.name ?? '') || `Etapa ${stageIndex + 1}`;
    const stageRows = getStageRows(apiStage);

    for (const { row } of stageRows) {
      const teamId = Number(row.team.id);
      const existing = annualMap.get(teamId);
      const points = n(row.points);
      const played = n(row.matches ?? row.played);
      const win = n(row.won);
      const draw = n(row.drawn);
      const lose = n(row.lost);
      const goalsFor = n(row.goals_scored);
      const goalsAgainst = n(row.goals_conceded);
      const goalDiff = n(row.goal_diff);

      if (existing) {
        existing.points += points;
        existing.played += played;
        existing.win += win;
        existing.draw += draw;
        existing.lose += lose;
        existing.goalsFor += goalsFor;
        existing.goalsAgainst += goalsAgainst;
        existing.goalDiff += goalDiff;
        existing.breakdown.push({
          stage: stageLabel,
          points,
          played,
          win,
          draw,
          lose,
        });
        continue;
      }

      annualMap.set(teamId, {
        rank: 0,
        teamId,
        teamName: row.team.name,
        teamLogo: row.team.logo ?? '',
        points,
        played,
        win,
        draw,
        lose,
        zone: undefined,
        goalsFor,
        goalsAgainst,
        goalDiff,
        breakdown: [
          {
            stage: stageLabel,
            points,
            played,
            win,
            draw,
            lose,
          },
        ],
      });
    }
  }

  if (annualMap.size === 0 && data.table) {
    return data.table
      .map((row) => ({
        ...mapStandingRow(row),
        zone: undefined,
        goalsFor: n(row.goals_scored),
        goalsAgainst: n(row.goals_conceded),
        goalDiff: n(row.goal_diff),
        breakdown: [
          {
            stage: 'Tabla general',
            points: n(row.points),
            played: n(row.matches ?? row.played),
            win: n(row.won),
            draw: n(row.drawn),
            lose: n(row.lost),
          },
        ],
      }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDiff - a.goalDiff ||
          b.goalsFor - a.goalsFor ||
          a.teamName.localeCompare(b.teamName)
      )
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  return Array.from(annualMap.values())
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor ||
        a.teamName.localeCompare(b.teamName)
    )
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      breakdown: row.breakdown.sort((a, b) => a.stage.localeCompare(b.stage)),
    }));
};

/**
 * Evalúa y retorna el resultado de un partido (victoria, empate, derrota) desde la perspectiva de Boca.
 */
const matchResult = (
  homeScore: number | null,
  awayScore: number | null,
  isBocaHome: boolean
): MatchResult => {
  if (homeScore === null || awayScore === null) return 'scheduled';
  if (homeScore === awayScore) return 'draw';
  const homeWon = homeScore > awayScore;
  if (isBocaHome) return homeWon ? 'win' : 'loss';
  return homeWon ? 'loss' : 'win';
};

/**
 * Convierte los datos crudos de un partido finalizado de la API a la interfaz ProcessedFixture del frontend.
 */
const mapMatch = (m: LSMatch): ProcessedFixture => {
  const homeName = m.home?.name ?? '';
  const awayName = m.away?.name ?? '';
  const isBocaHome = String(m.home?.id ?? '') === BOCA_ID || BOCA_RE.test(homeName);

  const s = m.scores;
  const rawScore = s?.ft_score && /\d/.test(s.ft_score) ? s.ft_score : s?.score;
  const [homeScore, awayScore] = parseScoreStr(rawScore);

  const timeStr =
    m.scheduled && m.scheduled.length >= 5
      ? m.scheduled.substring(0, 5)
      : m.time && m.time.length >= 5
        ? m.time.substring(0, 5)
        : '00:00';
  const dateStr = `${m.date}T${timeStr}:00Z`;

  return {
    id: isNaN(Number(m.id)) ? hashStringToNumber(String(m.id)) : Number(m.id),
    date: new Date(dateStr),
    homeTeam: homeName,
    awayTeam: awayName,
    homeTeamId: m.home?.id ?? 0,
    awayTeamId: m.away?.id ?? 0,
    homeLogo: m.home?.logo ?? '',
    awayLogo: m.away?.logo ?? '',
    homeScore,
    awayScore,
    isBocaHome,
    result: matchResult(homeScore, awayScore, isBocaHome),
    status: m.status === 'FINISHED' ? 'finished' : 'scheduled',
    venue: m.location ?? '',
  };
};

/**
 * Convierte los datos crudos de un partido programado de la API a la interfaz ProcessedFixture del frontend.
 */
const mapFixture = (f: LSFixture): ProcessedFixture => {
  const homeName = f.home?.name ?? '';
  const awayName = f.away?.name ?? '';
  const isBocaHome = String(f.home?.id ?? '') === BOCA_ID || BOCA_RE.test(homeName);

  const timeStr = f.time && f.time.length >= 5 ? f.time.substring(0, 5) : '00:00';
  const dateStr = `${f.date}T${timeStr}:00Z`;

  return {
    id: isNaN(Number(f.id)) ? hashStringToNumber(String(f.id)) : Number(f.id),
    date: new Date(dateStr),
    homeTeam: homeName,
    awayTeam: awayName,
    homeTeamId: f.home?.id ?? 0,
    awayTeamId: f.away?.id ?? 0,
    homeLogo: f.home?.logo ?? '',
    awayLogo: f.away?.logo ?? '',
    homeScore: null,
    awayScore: null,
    isBocaHome,
    result: 'scheduled',
    status: 'scheduled',
    venue: f.location ?? '',
  };
};

// ── Fetch genérico ────────────────────────────────────────────────────────────

const pending = new Map<string, Promise<unknown>>();

/**
 * Wrapper HTTP genérico para el cliente del scraper.
 * Implementa un mecanismo de deduplicación de promesas concurrentes y caching en localStorage.
 */
const fetchLS = async <T>(
  endpoint: string,
  params: Record<string, string>,
  cacheKey: string,
  cacheDuration: number
): Promise<T> => {
  const cached = getCachedData<T>(cacheKey, cacheDuration);
  if (cached) return cached;

  if (pending.has(cacheKey)) return pending.get(cacheKey) as Promise<T>;

  const promise = (async () => {
    const qs = new URLSearchParams({ ...auth(), ...params }).toString();
    const url = `${BASE_URL}${endpoint}?${qs}`;
    const res = await fetchWithTimeout(url, {}, 60_000);
    if (!res.ok) throw new Error(`Scraper API error ${res.status}: ${endpoint}`);
    const json = (await res.json()) as {
      success: boolean;
      data: T;
      error?: string;
    };
    if (!json.success) throw new Error(`Scraper API error: ${json.error ?? 'unknown'}`);
    setCachedData(cacheKey, json.data);
    return json.data;
  })();

  pending.set(cacheKey, promise);
  promise.finally(() => pending.delete(cacheKey));
  return promise;
};

// ── Tipos públicos adicionales ────────────────────────────────────────────────

export interface H2HMatch {
  date: string; // ISO
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  result: MatchResult;
  competition?: string; // e.g. "Liga Profesional 2024"
}

// ── Funciones públicas ────────────────────────────────────────────────────────

/**
 * Obtiene los últimos partidos finalizados de Boca Juniors en la liga local.
 */
export const getLastFixtures = async (count: number = 8): Promise<ProcessedFixture[]> => {
  const data = await fetchLS<{ match?: LSMatch[]; data?: LSMatch[] }>(
    '/matches/history.json',
    { competition_id: COMPETITION, team_id: BOCA_ID },
    `ls_history_boca_${BOCA_ID}`,
    CACHE_DURATION.FIXTURES
  );

  const matches = data.match ?? data.data ?? [];
  return matches.slice(0, count).map(mapMatch);
};

/**
 * Obtiene los próximos partidos programados (schedules) de Boca Juniors en la liga local.
 */
export const getNextFixtures = async (count: number = 8): Promise<ProcessedFixture[]> => {
  const data = await fetchLS<{ fixtures?: LSFixture[]; fixture?: LSFixture[] }>(
    '/fixtures/list.json',
    { competition_id: COMPETITION, team: BOCA_ID },
    `ls_fixtures_boca_v2_${BOCA_ID}`,
    CACHE_DURATION.FIXTURES
  );

  const fixtures = data.fixtures ?? data.fixture ?? [];
  return fixtures
    .map(mapFixture)
    .filter((f) => f.isBocaHome || f.awayTeamId === Number(BOCA_ID) || BOCA_RE.test(f.awayTeam))
    .slice(0, count);
};

/**
 * Procesa un partido plano para el historial de enfrentamientos H2H directos.
 */
const mapFlatMatch = (m: LSFlatMatch): H2HMatch => {
  const isBocaHome = String(m.home_id) === BOCA_ID || BOCA_RE.test(m.home_name);
  const [homeScore, awayScore] = parseScoreStr(m.ft_score ?? m.score);
  const timeStr = m.scheduled && m.scheduled.length >= 5 ? m.scheduled.substring(0, 5) : '00:00';
  const date = new Date(`${m.date}T${timeStr}:00Z`);
  return {
    date: date.toISOString(),
    homeTeam: m.home_name,
    awayTeam: m.away_name,
    homeScore,
    awayScore,
    result: matchResult(homeScore, awayScore, isBocaHome),
    competition: m.competition?.name,
  };
};

/**
 * Obtiene el historial de enfrentamientos cara a cara (H2H) de Boca Juniors contra el rival seleccionado.
 */
export const fetchHeadToHead = async (rivalApiId: number | string): Promise<H2HMatch[]> => {
  const cacheKey = `ls_h2h_v5_${BOCA_ID}_${rivalApiId}`;
  const data = await fetchLS<{
    h2h?: LSFlatMatch[];
    team1?: unknown;
    team2?: unknown;
    team1_last_6?: LSFlatMatch[];
    team2_last_6?: LSFlatMatch[];
    fixture?: unknown;
  }>(
    '/teams/head2head.json',
    { team1_id: BOCA_ID, team2_id: String(rivalApiId) },
    cacheKey,
    CACHE_DURATION.FIXTURES
  );

  const matches = data.h2h ?? [];
  matches.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return matches.slice(0, 5).map(mapFlatMatch);
};

/**
 * Obtiene las tablas de posiciones del torneo de liga local.
 */
export const getStandingsData = async (): Promise<StandingData[]> => {
  const data = await fetchLS<{
    stages?: LSAPIStage[];
    table?: LSGroupStanding[];
  }>(
    '/competitions/table.json',
    { competition_id: COMPETITION },
    `ls_table_${COMPETITION}`,
    CACHE_DURATION.STANDINGS
  );
  return mapLeagueStandings(data);
};

/**
 * Obtiene los últimos partidos jugados por Boca Juniors en la Copa Libertadores.
 */
export const getLibertadoresLastFixtures = async (count: number = 8): Promise<ProcessedFixture[]> => {
  const data = await fetchLS<{ match?: LSMatch[]; data?: LSMatch[] }>(
    '/matches/history.json',
    { competition_id: LIBERTADORES_COMPETITION, team_id: BOCA_ID },
    `ls_history_boca_lib_${BOCA_ID}`,
    CACHE_DURATION.FIXTURES
  );

  const matches = data.match ?? data.data ?? [];
  return matches.slice(0, count).map(mapMatch);
};

/**
 * Obtiene los próximos partidos programados de Boca Juniors en la Copa Libertadores.
 */
export const getLibertadoresNextFixtures = async (count: number = 8): Promise<ProcessedFixture[]> => {
  const data = await fetchLS<{ fixtures?: LSFixture[]; fixture?: LSFixture[] }>(
    '/fixtures/list.json',
    { competition_id: LIBERTADORES_COMPETITION, team: BOCA_ID },
    `ls_fixtures_boca_lib_v2_${BOCA_ID}`,
    CACHE_DURATION.FIXTURES
  );

  const fixtures = data.fixtures ?? data.fixture ?? [];
  return fixtures
    .map(mapFixture)
    .filter((f) => f.isBocaHome || f.awayTeamId === Number(BOCA_ID) || BOCA_RE.test(f.awayTeam))
    .slice(0, count);
};

/**
 * Obtiene las tablas de posiciones de la fase de grupos de la Copa Libertadores.
 */
export const getLibertadoresStandingsData = async (): Promise<StandingData[]> => {
  const data = await fetchLS<{
    stages?: LSAPIStage[];
    table?: LSGroupStanding[];
  }>(
    '/competitions/table.json',
    { competition_id: LIBERTADORES_COMPETITION },
    `ls_table_${LIBERTADORES_COMPETITION}`,
    CACHE_DURATION.STANDINGS
  );
  return mapLibertadoresStandings(data);
};

/**
 * Obtiene la tabla anual acumulativa de puntos.
 */
export const getAnnualStandingsData = async (): Promise<AnnualStandingData[]> => {
  const data = await fetchLS<{
    stages?: LSAPIStage[];
    table?: LSGroupStanding[];
  }>(
    '/competitions/table.json',
    { competition_id: COMPETITION },
    `ls_annual_table_${COMPETITION}`,
    CACHE_DURATION.STANDINGS
  );
  return mapAnnualStandings(data);
};

/**
 * Obtiene el plantel y staff técnico del equipo especificado (Boca Juniors por defecto).
 */
export const getTeamSquad = async (teamId: string = BOCA_ID): Promise<Squad> => {
  const data = await fetchLS<{ team: any; players: Player[] }>(
    '/teams/squad.json',
    { team_id: teamId },
    `ls_squad_${teamId}`,
    CACHE_DURATION.SQUAD
  );
  return {
    team: data.team,
    players: data.players,
  };
};
