import { getCachedData, setCachedData, CACHE_DURATION } from '../utils/cache';
import type { ProcessedFixture, MatchResult } from '../types/football';

const BASE_URL = '/api/sofascore';
const BOCA_TEAM_ID = 3202;

// ── Tipos internos SofaScore ──────────────────────────────────────────────────

interface SofaTeam {
  id: number;
  name: string;
}

interface SofaScore {
  current: number;
}

interface SofaEvent {
  id: number;
  startTimestamp: number;
  homeTeam: SofaTeam;
  awayTeam: SofaTeam;
  homeScore?: SofaScore;
  awayScore?: SofaScore;
  status: { type: string };
  tournament?: { id: number; name: string };
  season?: { id: number; year: string };
  venue?: {
    stadium?: { name: string };
    city?: { name: string };
  };
}

interface SofaStandingRow {
  team: { id: number; name: string };
  position: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

interface SofaStandingsGroup {
  name: string;
  rows: SofaStandingRow[];
}

export interface SofaStandingData {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMatchResult(ev: SofaEvent, isBocaHome: boolean): MatchResult {
  if (ev.status.type !== 'finished') return 'scheduled';
  const h = ev.homeScore?.current;
  const a = ev.awayScore?.current;
  if (h === undefined || a === undefined) return 'scheduled';
  if (h === a) return 'draw';
  const bocaWon = isBocaHome ? h > a : a > h;
  return bocaWon ? 'win' : 'loss';
}

function mapEvent(ev: SofaEvent): ProcessedFixture {
  const isBocaHome = ev.homeTeam.id === BOCA_TEAM_ID;
  return {
    id:          ev.id,
    date:        new Date(ev.startTimestamp * 1000),
    homeTeam:    ev.homeTeam.name,
    awayTeam:    ev.awayTeam.name,
    homeTeamId:  ev.homeTeam.id,
    awayTeamId:  ev.awayTeam.id,
    homeScore:   ev.homeScore?.current ?? null,
    awayScore:   ev.awayScore?.current ?? null,
    isBocaHome,
    result:      getMatchResult(ev, isBocaHome),
    status:      ev.status.type,
    venue:       ev.venue?.stadium?.name ?? ev.venue?.city?.name ?? '',
  };
}

async function fetchSofaScore<T>(endpoint: string, cacheKey: string, cacheDuration: number): Promise<T> {
  const cached = getCachedData<T>(cacheKey, cacheDuration);
  if (cached) return cached;

  console.log(`🌐 SofaScore Request: ${endpoint}`);
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`SofaScore error ${res.status}: ${endpoint}`);
  const data = await res.json() as T;
  setCachedData(cacheKey, data);
  return data;
}

// ── Funciones públicas ────────────────────────────────────────────────────────

export async function getSofaScoreLastFixtures(count: number = 5): Promise<ProcessedFixture[]> {
  const data = await fetchSofaScore<{ events: SofaEvent[] }>(
    `/team/${BOCA_TEAM_ID}/events/last/0`,
    `sofascore_last_${count}`,
    CACHE_DURATION.FIXTURES,
  );
  return data.events
    .slice(-count)
    .reverse()
    .map(mapEvent);
}

export async function getSofaScoreNextFixtures(count: number = 4): Promise<ProcessedFixture[]> {
  const data = await fetchSofaScore<{ events: SofaEvent[] }>(
    `/team/${BOCA_TEAM_ID}/events/next/0`,
    `sofascore_next_${count}`,
    CACHE_DURATION.FIXTURES,
  );
  return data.events.slice(0, count).map(mapEvent);
}

export async function getSofaScoreStandings(): Promise<[]> {
  console.warn('⚠️ SofaScore Standings: usar getSofaScoreStandingsData() en su lugar');
  return [];
}

export async function getSofaScoreStandingsData(): Promise<SofaStandingData[]> {
  // Paso 1: obtener tournament/season ID desde próximos eventos (2026).
  // Fallback a últimos jugados si no hay próximos programados.
  const nextData = await fetchSofaScore<{ events: SofaEvent[] }>(
    `/team/${BOCA_TEAM_ID}/events/next/0`,
    `sofascore_next_10`,
    CACHE_DURATION.FIXTURES,
  );
  const lastData = await fetchSofaScore<{ events: SofaEvent[] }>(
    `/team/${BOCA_TEAM_ID}/events/last/0`,
    `sofascore_last_5`,
    CACHE_DURATION.FIXTURES,
  );

  const source = nextData.events?.length ? nextData.events : lastData.events;
  const firstEvent = source?.[0];
  if (!firstEvent?.tournament?.id || !firstEvent?.season?.id) {
    throw new Error('SofaScore: no se encontró tournament/season ID en los eventos');
  }

  const { id: tournamentId } = firstEvent.tournament;
  const { id: seasonId } = firstEvent.season;

  // Paso 2: cache key incluye seasonId → distintas temporadas nunca colisionan
  const PROCESSED_KEY = `sofascore_standings_${seasonId}`;
  const cached = getCachedData<SofaStandingData[]>(PROCESSED_KEY, CACHE_DURATION.STANDINGS);
  if (cached) return cached;

  console.log(`🌐 SofaScore Standings: tournament=${tournamentId}, season=${seasonId}`);

  // Paso 3: fetch raw standings
  const standingsData = await fetchSofaScore<{ standings: SofaStandingsGroup[] }>(
    `/tournament/${tournamentId}/season/${seasonId}/standings/total`,
    `sofascore_standings_raw_${seasonId}`,
    CACHE_DURATION.STANDINGS,
  );

  const groups = standingsData.standings ?? [];
  const multiGroup = groups.length > 1;
  const result: SofaStandingData[] = [];

  for (const group of groups) {
    const zone = multiGroup ? group.name : undefined;
    for (const row of group.rows ?? []) {
      result.push({
        rank:     row.position,
        teamId:   row.team.id,
        teamName: row.team.name,
        teamLogo: `/sofascore-api/team/${row.team.id}/image`,
        points:   row.points,
        played:   row.matches,
        win:      row.wins,
        draw:     row.draws,
        lose:     row.losses,
        zone,
      });
    }
  }

  if (result.length) setCachedData(PROCESSED_KEY, result);
  return result;
}

export async function getSofaScoreNextHomeMatch(): Promise<ProcessedFixture | null> {
  const next = await getSofaScoreNextFixtures(10);
  return next.find(p => p.isBocaHome) ?? null;
}

export async function getSofaScoreDaysUntilNextHomeMatch(): Promise<number | null> {
  const match = await getSofaScoreNextHomeMatch();
  if (!match) return null;
  const diffMs = match.date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default {
  getLastFixtures:             getSofaScoreLastFixtures,
  getNextFixtures:             getSofaScoreNextFixtures,
  getStandings:                getSofaScoreStandings,
  getNextHomeMatch:            getSofaScoreNextHomeMatch,
  getDaysUntilNextHomeMatch:   getSofaScoreDaysUntilNextHomeMatch,
};
