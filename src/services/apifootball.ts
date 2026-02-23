import { mockStandings, mockMatches, mockUpcomingMatches, mockNoticias, mockVideos } from './mockData';

const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

const BOCA_ID = Number(import.meta.env.VITE_BOCA_TEAM_ID ?? 451);
const LEAGUE_ID = Number(import.meta.env.VITE_LEAGUE_ID ?? 128);
const API_KEY: string = import.meta.env.VITE_API_FOOTBALL_KEY ?? '';

const USE_MOCK = !API_KEY;

// ── Tipos públicos ───────────────────────────────────────────────────────────

export interface StandingRow {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  all: { played: number; win: number; draw: number; lose: number };
}

export interface MatchResult {
  fixtureId: number;
  date: string;
  homeTeam: { id: number; name: string; logo: string; winner: boolean | null };
  awayTeam: { id: number; name: string; logo: string; winner: boolean | null };
  goalsHome: number | null;
  goalsAway: number | null;
  venueName: string;
}

export interface ProximoPartido {
  fixtureId: number;
  date: string;        // ISO
  time: string;        // "HH:MM" hora local
  homeTeam: { id: number; name: string; logo: string };
  awayTeam: { id: number; name: string; logo: string };
  venueName: string;
  competition: string;
}

export interface Noticia {
  id: number;
  titulo: string;
  imagen: string;
  categoria: 'mercado' | 'informe' | 'partido' | 'seleccion';
  fecha: string; // "YYYY-MM-DD"
}

export interface VideoYoutube {
  id: string;
  titulo: string;
  thumbnail: string;
  duracion: string; // "mm:ss"
  fecha: string;   // "DD mmm"
  vistas: string;  // "1.2M", "450K"
}

// ── Caché ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage lleno u otro error — ignorar silenciosamente
  }
}

// ── Fetch con headers ────────────────────────────────────────────────────────

async function apiFetch(path: string): Promise<unknown> {
  if (!API_KEY) throw new Error('API key no configurada (VITE_API_FOOTBALL_KEY)');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
    },
  });
  if (!res.ok) throw new Error(`API-Football error ${res.status}`);
  return res.json();
}

// ── Tabla de posiciones ──────────────────────────────────────────────────────

const STANDINGS_CACHE_KEY = 'cache:standings';

export async function fetchStandings(): Promise<StandingRow[]> {
  if (USE_MOCK) return mockStandings;

  const cached = getCached<StandingRow[]>(STANDINGS_CACHE_KEY);
  if (cached) return cached;

  const json = await apiFetch(`/standings?league=${LEAGUE_ID}&season=2025`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = json as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const standings: StandingRow[] = raw.response[0].league.standings[0].map((s: any) => ({
    rank: s.rank,
    team: { id: s.team.id, name: s.team.name, logo: s.team.logo },
    points: s.points,
    all: { played: s.all.played, win: s.all.win, draw: s.all.draw, lose: s.all.lose },
  }));

  setCache(STANDINGS_CACHE_KEY, standings);
  return standings;
}

// ── Últimos partidos ─────────────────────────────────────────────────────────

const LAST_MATCHES_CACHE_KEY = 'cache:lastMatches';

export async function fetchLastMatches(): Promise<MatchResult[]> {
  if (USE_MOCK) return mockMatches;

  const cached = getCached<MatchResult[]>(LAST_MATCHES_CACHE_KEY);
  if (cached) return cached;

  const json = await apiFetch(`/fixtures?team=${BOCA_ID}&last=5`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = json as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matches: MatchResult[] = raw.response.map((f: any) => ({
    fixtureId: f.fixture.id,
    date: f.fixture.date,
    homeTeam: {
      id: f.teams.home.id,
      name: f.teams.home.name,
      logo: f.teams.home.logo,
      winner: f.teams.home.winner,
    },
    awayTeam: {
      id: f.teams.away.id,
      name: f.teams.away.name,
      logo: f.teams.away.logo,
      winner: f.teams.away.winner,
    },
    goalsHome: f.goals.home,
    goalsAway: f.goals.away,
    venueName: f.fixture.venue?.name ?? '',
  }));

  setCache(LAST_MATCHES_CACHE_KEY, matches);
  return matches;
}

// ── Próximos partidos ────────────────────────────────────────────────────────

export async function fetchUpcomingMatches(): Promise<ProximoPartido[]> {
  if (USE_MOCK) return mockUpcomingMatches;
  // TODO: conectar con /fixtures?team={BOCA_ID}&next=8
  return [];
}

// ── Noticias ─────────────────────────────────────────────────────────────────

export async function fetchNoticias(): Promise<Noticia[]> {
  if (USE_MOCK) return mockNoticias;
  // TODO: conectar con API de noticias real
  return [];
}

// ── Canal de YouTube ──────────────────────────────────────────────────────────

export async function fetchVideos(): Promise<VideoYoutube[]> {
  if (USE_MOCK) return mockVideos;
  // TODO: conectar con YouTube Data API v3
  return [];
}

export { BOCA_ID };
