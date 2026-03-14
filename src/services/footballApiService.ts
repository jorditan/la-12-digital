import { getCachedData, setCachedData, CACHE_DURATION } from '../utils/cache';
import type { ProcessedFixture, MatchResult } from '../types/football';

// Live Score API — https://livescore-api.com/
// In production the Worker injects the credentials server-side (Cloudflare secrets).
// In dev we call LiveScore directly using the VITE_ keys from .env.
const isDev     = import.meta.env.DEV;
const BASE_URL  = isDev ? 'https://livescore-api.com/api-client' : '/api/livescore';
const COMPETITION = '23';   // Liga Profesional Argentina
const BOCA_ID     = '934';  // Confirmed via API standings response
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

// ── Helpers ───────────────────────────────────────────────────────────────────


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
    const qs  = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}?${qs}`;
    console.log(`🌐 LiveScore: ${endpoint}`, params);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`LiveScore error ${res.status}: ${endpoint}`);
    const json = await res.json() as { success: boolean; data: T; error?: string };
    console.log(`📦 LiveScore [${endpoint}]:`, json.data);
    if (!json.success) throw new Error(`LiveScore API error: ${json.error ?? 'unknown'}`);
    setCachedData(cacheKey, json.data);
    return json.data;
  })();

  pending.set(cacheKey, promise);
  promise.finally(() => pending.delete(cacheKey));
  return promise;
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
  if (matches.length > 0) console.log('🔍 match[0]:', matches[0]);
  console.log(`✅ Boca history matches: ${matches.length}`);
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
  if (fixtures.length > 0) console.log('🔍 fixture[0]:', fixtures[0]);
  console.log(`✅ Boca upcoming fixtures: ${fixtures.length}`);
  return fixtures.slice(0, count).map(mapFixture);
}

export async function getStandingsData(): Promise<StandingData[]> {
  const data = await fetchLS<{ stages?: LSAPIStage[]; table?: LSGroupStanding[] }>(
    '/competitions/table.json',
    { competition_id: COMPETITION },
    `ls_table_${COMPETITION}`,
    CACHE_DURATION.STANDINGS,
  );

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
          result.push({
            rank:     n(row.rank),
            teamId:   Number(row.team.id),
            teamName: row.team.name,
            teamLogo: row.team.logo ?? '',
            points:   n(row.points),
            played:   n(row.matches ?? row.played),
            win:      n(row.won),
            draw:     n(row.drawn),
            lose:     n(row.lost),
            zone:     zoneName,
          });
        }
      }
    } else {
      // Fallback: stage con standings directos sin groups
      const rows = apiStage.table ?? apiStage.rows ?? [];
      for (const row of rows) {
        result.push({
          rank:     n(row.rank),
          teamId:   Number(row.team.id),
          teamName: row.team.name,
          teamLogo: row.team.logo ?? '',
          points:   n(row.points),
          played:   n(row.matches ?? row.played),
          win:      n(row.won),
          draw:     n(row.drawn),
          lose:     n(row.lost),
          zone:     mappedStage || undefined,
        });
      }
    }
  }

  // Fallback global: respuesta con table directo (sin stages)
  if (stages.length === 0 && data.table) {
    for (const row of data.table) {
      result.push({
        rank:     n(row.rank),
        teamId:   Number(row.team.id),
        teamName: row.team.name,
        teamLogo: row.team.logo ?? '',
        points:   n(row.points),
        played:   n(row.matches ?? row.played),
        win:      n(row.won),
        draw:     n(row.drawn),
        lose:     n(row.lost),
        zone:     undefined,
      });
    }
  }

  return result;
}
