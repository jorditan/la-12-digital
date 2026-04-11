import { getCachedData, setCachedData, CACHE_DURATION } from '../utils/cache';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import type { ProcessedFixture, MatchResult } from '../types/football';

// Live Score API — https://livescore-api.com/
// In production the Worker injects the credentials server-side (Cloudflare secrets).
// In dev we call LiveScore directly using the VITE_ keys from .env.
const isDev     = import.meta.env.DEV;
const BASE_URL  = isDev ? 'https://livescore-api.com/api-client' : '/api/livescore';
const KEY       = isDev ? (import.meta.env.VITE_LIVESCORE_KEY as string) : '';
const SECRET    = isDev ? (import.meta.env.VITE_LIVESCORE_SECRET as string) : '';
const COMPETITION               = '23';   // Liga Profesional Argentina
const LIBERTADORES_COMPETITION  = '329';  // Copa Libertadores
const BOCA_ID                   = '934';  // Confirmed via API standings response
const BOCA_RE     = /boca/i;

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
  date: string;        // "YYYY-MM-DD"
  time: string;        // "HH:MM:SS" UTC for upcoming, "FT" for finished
  scheduled?: string;  // "HH:MM" actual kick-off time
  home: LSTeam;
  away: LSTeam;
  location?: string;
  round?: string;
  status?: string;
  competition_name?: string; // present in H2H responses
  // Scores are nested in history responses: scores: { score, ft_score, ht_score, ... }
  scores?: {
    score?: string;    // "X - X" final
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
  date: string;           // "YYYY-MM-DD"
  home_name: string;
  away_name: string;
  home_id: string | number;
  away_id: string | number;
  score?: string;         // "X - X"
  ft_score?: string;
  ht_score?: string;
  scheduled?: string;     // "HH:MM"
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
  teamId: number;
  teamName: string;
  teamLogo: string;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  zone?: string;
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

function auth(): Record<string, string> {
  // In production the Worker proxy injects key+secret; nothing sent from the browser.
  if (!isDev) return {};
  return { key: KEY, secret: SECRET };
}

function n(v: number | string | undefined): number {
  return v !== undefined ? Number(v) : 0;
}

// Parses "X - X" score string into [home, away]
function parseScoreStr(score: string | undefined): [number | null, number | null] {
  if (!score) return [null, null];
  const m = score.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!m) return [null, null];
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

// Maps API stage names ("Phase 1", "Phase 2") to Argentine tournament names
function mapStageName(name: string, index: number): string {
  const lower = name.toLowerCase();
  if (lower.includes('1') || lower.includes('first') || lower.includes('apertura')) return 'Apertura';
  if (lower.includes('2') || lower.includes('second') || lower.includes('clausura')) return 'Clausura';
  return index === 0 ? 'Apertura' : index === 1 ? 'Clausura' : name;
}

function mapStandingRow(row: LSGroupStanding, zone?: string): StandingData {
  return {
    rank:     n(row.rank),
    teamId:   Number(row.team.id),
    teamName: row.team.name,
    teamLogo: row.team.logo ?? '',
    points:   n(row.points),
    played:   n(row.matches ?? row.played),
    win:      n(row.won),
    draw:     n(row.drawn),
    lose:     n(row.lost),
    zone,
  };
}

function getStageRows(apiStage: LSAPIStage): Array<{ row: LSGroupStanding; zone?: string }> {
  const stageName = apiStage.stage?.name ?? '';
  const mappedStage = mapStageName(stageName, 0);
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
}

function isAnnualStageCandidate(stageName: string): boolean {
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
}

function mapLeagueStandings(data: { stages?: LSAPIStage[]; table?: LSGroupStanding[] }): StandingData[] {
  const result: StandingData[] = [];
  const stages = data.stages ?? [];

  for (const [stageIndex, apiStage] of stages.entries()) {
    const stageName   = apiStage.stage?.name ?? '';
    const mappedStage = mapStageName(stageName, stageIndex);
    const groups      = apiStage.groups ?? [];

    if (groups.length > 0) {
      for (const group of groups) {
        const rows     = group.standings ?? group.table ?? [];
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
}

function formatLibertadoresGroupName(groupName: string): string {
  const trimmed = groupName.trim();
  if (!trimmed) return 'Grupo';
  return /^grupo\b/i.test(trimmed) ? trimmed : `Grupo ${trimmed}`;
}

function mapLibertadoresStandings(data: { stages?: LSAPIStage[]; table?: LSGroupStanding[] }): StandingData[] {
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
}

function mapAnnualStandings(data: { stages?: LSAPIStage[]; table?: LSGroupStanding[] }): AnnualStandingData[] {
  const stages = data.stages ?? [];
  const selectedStages = stages.filter((apiStage) => isAnnualStageCandidate(apiStage.stage?.name ?? ''));
  const stagesToAggregate = selectedStages.length > 0 ? selectedStages : stages;
  const annualMap = new Map<number, AnnualStandingData>();

  for (const [stageIndex, apiStage] of stagesToAggregate.entries()) {
    const stageLabel = mapStageName(apiStage.stage?.name ?? '', stageIndex) || `Etapa ${stageIndex + 1}`;
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
      .sort((a, b) => (
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor ||
        a.teamName.localeCompare(b.teamName)
      ))
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  return Array.from(annualMap.values())
    .sort((a, b) => (
      b.points - a.points ||
      b.goalDiff - a.goalDiff ||
      b.goalsFor - a.goalsFor ||
      a.teamName.localeCompare(b.teamName)
    ))
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      breakdown: row.breakdown.sort((a, b) => a.stage.localeCompare(b.stage)),
    }));
}

function matchResult(
  homeScore: number | null,
  awayScore: number | null,
  isBocaHome: boolean,
): MatchResult {
  if (homeScore === null || awayScore === null) return 'scheduled';
  if (homeScore === awayScore) return 'draw';
  const homeWon = homeScore > awayScore;
  if (isBocaHome) return homeWon ? 'win' : 'loss';
  return homeWon ? 'loss' : 'win';
}

// Maps history match — /matches/history.json uses same nested home/away as fixtures
function mapMatch(m: LSMatch): ProcessedFixture {
  const homeName   = m.home?.name ?? '';
  const awayName   = m.away?.name ?? '';
  const isBocaHome = String(m.home?.id ?? '') === BOCA_ID || BOCA_RE.test(homeName);

  // Scores are in nested scores object: { score, ft_score, ht_score }
  const s = m.scores;
  const rawScore = (s?.ft_score && /\d/.test(s.ft_score)) ? s.ft_score : s?.score;
  const [homeScore, awayScore] = parseScoreStr(rawScore);

  // time is "FT" for finished matches; use scheduled for actual kick-off time
  const timeStr = (m.scheduled && m.scheduled.length >= 5)
    ? m.scheduled.substring(0, 5)
    : (m.time && m.time.length >= 5 ? m.time.substring(0, 5) : '00:00');
  const dateStr = `${m.date}T${timeStr}:00Z`;

  return {
    id:         Number(m.id),
    date:       new Date(dateStr),
    homeTeam:   homeName,
    awayTeam:   awayName,
    homeTeamId: Number(m.home?.id ?? 0),
    awayTeamId: Number(m.away?.id ?? 0),
    homeLogo:   m.home?.logo ?? '',
    awayLogo:   m.away?.logo ?? '',
    homeScore,
    awayScore,
    isBocaHome,
    result:     matchResult(homeScore, awayScore, isBocaHome),
    status:     m.status === 'FINISHED' ? 'finished' : 'scheduled',
    venue:      m.location ?? '',
  };
}

// Maps nested fixture format (/fixtures/list.json)
function mapFixture(f: LSFixture): ProcessedFixture {
  const homeName   = f.home?.name ?? '';
  const awayName   = f.away?.name ?? '';
  const isBocaHome = String(f.home?.id ?? '') === BOCA_ID || BOCA_RE.test(homeName);

  const timeStr = (f.time && f.time.length >= 5) ? f.time.substring(0, 5) : '00:00';
  const dateStr = `${f.date}T${timeStr}:00Z`;

  return {
    id:         Number(f.id),
    date:       new Date(dateStr),
    homeTeam:   homeName,
    awayTeam:   awayName,
    homeTeamId: Number(f.home?.id ?? 0),
    awayTeamId: Number(f.away?.id ?? 0),
    homeLogo:   f.home?.logo ?? '',
    awayLogo:   f.away?.logo ?? '',
    homeScore:  null,
    awayScore:  null,
    isBocaHome,
    result:     'scheduled',
    status:     'scheduled',
    venue:      f.location ?? '',
  };
}

// ── Fetch genérico ────────────────────────────────────────────────────────────

const pending = new Map<string, Promise<unknown>>();

async function fetchLS<T>(
  endpoint: string,
  params: Record<string, string>,
  cacheKey: string,
  cacheDuration: number,
): Promise<T> {
  const cached = getCachedData<T>(cacheKey, cacheDuration);
  if (cached) return cached;

  if (pending.has(cacheKey)) return pending.get(cacheKey) as Promise<T>;

  const promise = (async () => {
    const qs  = new URLSearchParams({ ...auth(), ...params }).toString();
    const url = `${BASE_URL}${endpoint}?${qs}`;
    // FIX: fetchWithTimeout prevents hanging on slow/dead APIs
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`LiveScore error ${res.status}: ${endpoint}`);
    const json = await res.json() as { success: boolean; data: T; error?: string };
    if (!json.success) throw new Error(`LiveScore API error: ${json.error ?? 'unknown'}`);
    setCachedData(cacheKey, json.data);
    return json.data;
  })();

  pending.set(cacheKey, promise);
  promise.finally(() => pending.delete(cacheKey));
  return promise;
}

// ── Tipos públicos adicionales ────────────────────────────────────────────────

export interface H2HMatch {
  date: string;          // ISO
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  result: MatchResult;
  competition?: string;  // e.g. "Liga Profesional 2024"
}

// ── Funciones públicas ────────────────────────────────────────────────────────

export async function getLastFixtures(count: number = 8): Promise<ProcessedFixture[]> {
  // /matches/history.json supports team_id filter server-side
  const data = await fetchLS<{ match?: LSMatch[]; data?: LSMatch[] }>(
    '/matches/history.json',
    { competition_id: COMPETITION, team_id: BOCA_ID },
    `ls_history_boca_${BOCA_ID}`,
    CACHE_DURATION.FIXTURES,
  );

  const matches = data.match ?? data.data ?? [];
  // API returns newest first
  return matches.slice(0, count).map(mapMatch);
}

export async function getNextFixtures(count: number = 8): Promise<ProcessedFixture[]> {
  // /fixtures/list.json uses `team` param (not team_id) to filter by team
  const data = await fetchLS<{ fixtures?: LSFixture[]; fixture?: LSFixture[] }>(
    '/fixtures/list.json',
    { competition_id: COMPETITION, team: BOCA_ID },
    `ls_fixtures_boca_${BOCA_ID}`,
    CACHE_DURATION.FIXTURES,
  );

  const fixtures = data.fixtures ?? data.fixture ?? [];
  return fixtures.slice(0, count).map(mapFixture);
}

function mapFlatMatch(m: LSFlatMatch): H2HMatch {
  const isBocaHome = String(m.home_id) === BOCA_ID || BOCA_RE.test(m.home_name);
  const [homeScore, awayScore] = parseScoreStr(m.ft_score ?? m.score);
  const timeStr = m.scheduled && m.scheduled.length >= 5 ? m.scheduled.substring(0, 5) : '00:00';
  const date = new Date(`${m.date}T${timeStr}:00Z`);
  return {
    date:        date.toISOString(),
    homeTeam:    m.home_name,
    awayTeam:    m.away_name,
    homeScore,
    awayScore,
    result:      matchResult(homeScore, awayScore, isBocaHome),
    competition: m.competition?.name,
  };
}

/**
 * Historial de enfrentamientos directos Boca vs rival.
 * Usa el endpoint api-client/teams/head2head.json.
 * En dev pasa por el proxy /api/livescore y en producción por el Worker.
 */
export async function fetchHeadToHead(rivalApiId: number): Promise<H2HMatch[]> {
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
    CACHE_DURATION.FIXTURES,
  );

  const matches = data.h2h ?? [];
  matches.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return matches.slice(0, 5).map(mapFlatMatch);
}

export async function getStandingsData(): Promise<StandingData[]> {
  const data = await fetchLS<{ stages?: LSAPIStage[]; table?: LSGroupStanding[] }>(
    '/competitions/table.json',
    { competition_id: COMPETITION },
    `ls_table_${COMPETITION}`,
    CACHE_DURATION.STANDINGS,
  );
  return mapLeagueStandings(data);
}

export async function getLibertadoresLastFixtures(count: number = 8): Promise<ProcessedFixture[]> {
  const data = await fetchLS<{ match?: LSMatch[]; data?: LSMatch[] }>(
    '/matches/history.json',
    { competition_id: LIBERTADORES_COMPETITION, team_id: BOCA_ID },
    `ls_history_boca_lib_${BOCA_ID}`,
    CACHE_DURATION.FIXTURES,
  );

  const matches = data.match ?? data.data ?? [];
  return matches.slice(0, count).map(mapMatch);
}

export async function getLibertadoresNextFixtures(count: number = 8): Promise<ProcessedFixture[]> {
  const data = await fetchLS<{ fixtures?: LSFixture[]; fixture?: LSFixture[] }>(
    '/fixtures/list.json',
    { competition_id: LIBERTADORES_COMPETITION, team: BOCA_ID },
    `ls_fixtures_boca_lib_${BOCA_ID}`,
    CACHE_DURATION.FIXTURES,
  );

  const fixtures = data.fixtures ?? data.fixture ?? [];
  return fixtures.slice(0, count).map(mapFixture);
}

export async function getLibertadoresStandingsData(): Promise<StandingData[]> {
  const data = await fetchLS<{ stages?: LSAPIStage[]; table?: LSGroupStanding[] }>(
    '/competitions/table.json',
    { competition_id: LIBERTADORES_COMPETITION },
    `ls_table_${LIBERTADORES_COMPETITION}`,
    CACHE_DURATION.STANDINGS,
  );
  return mapLibertadoresStandings(data);
}

export async function getAnnualStandingsData(): Promise<AnnualStandingData[]> {
  const data = await fetchLS<{ stages?: LSAPIStage[]; table?: LSGroupStanding[] }>(
    '/competitions/table.json',
    { competition_id: COMPETITION },
    `ls_annual_table_${COMPETITION}`,
    CACHE_DURATION.STANDINGS,
  );
  return mapAnnualStandings(data);
}
