import { mockStandings, mockMatches, mockUpcomingMatches, mockNoticias, mockVideos } from './mockData';

// ── Configuración TheSportsDB ────────────────────────────────────────────────
// https://www.thesportsdb.com/api.php
// Key gratuita: "123" (sin registro) | Premium: tu key en VITE_SPORTSDB_KEY

const API_KEY: string = import.meta.env.VITE_SPORTSDB_KEY ?? '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

// IDs de Boca y liga en TheSportsDB
const BOCA_SDB_ID = 135156;   // ID interno TheSportsDB — solo para llamadas a la API
const LEAGUE_ID   = 4406;
const SEASON      = '2026';

// BOCA_ID exportado = 451 (coincide con mock data y con lo que leen los componentes)
const BOCA_ID_EXPORT = 451;

// Normaliza: si el equipo es Boca por su ID de TheSportsDB, devuelve el ID canónico 451
function normalizeBocaId(sdbId: number): number {
  return sdbId === BOCA_SDB_ID ? BOCA_ID_EXPORT : sdbId;
}

let sessionFailed = false;

// ── Tipos públicos ───────────────────────────────────────────────────────────

export interface StandingRow {
  rank:  number;
  team:  { id: number; name: string; logo: string };
  points: number;
  all:   { played: number; win: number; draw: number; lose: number };
  zone?: string; // "Zona A" / "Zona B" — undefined = tabla única
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
  fecha: string;
}

export interface VideoYoutube {
  id: string;
  titulo: string;
  thumbnail: string;
  duracion: string;
  fecha: string;
  vistas: string;
}

// ── Caché ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> { data: T; timestamp: number }

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return entry.data;
  } catch { return null; }
}

function setCache<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })); } catch { /* noop */ }
}

// ── Fetch ────────────────────────────────────────────────────────────────────

async function sdbFetch(path: string): Promise<unknown> {
  if (sessionFailed) throw new Error('TheSportsDB deshabilitado por error previo');
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    sessionFailed = true;
    console.warn(`[thesportsdb] request falló (${res.status})`);
    throw new Error(`TheSportsDB error ${res.status}`);
  }
  return res.json();
}

// ── Tipos internos TheSportsDB ────────────────────────────────────────────────

interface SDBEvent {
  idEvent:          string;
  strTimestamp:     string | null;
  dateEvent:        string;
  strTime:          string;
  strHomeTeam:      string;
  strAwayTeam:      string;
  idHomeTeam:       string;
  idAwayTeam:       string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  intHomeScore:     string | null;
  intAwayScore:     string | null;
  strVenue:         string | null;
  strLeague:        string;
  strStatus:        string;
}

interface SDBStandingRow {
  idTeam:         string;
  strTeam:        string;
  strBadge:       string;
  intRank:        string;
  intPlayed:      string;
  intWin:         string;
  intDraw:        string;
  intLoss:        string;
  intPoints:      string;
  strDescription: string;
}

// ── Tabla de posiciones ──────────────────────────────────────────────────────

const STANDINGS_CACHE_KEY = 'sdb:standings2';

export async function fetchStandings(): Promise<StandingRow[]> {
  const cached = getCached<StandingRow[]>(STANDINGS_CACHE_KEY);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await sdbFetch(`/lookuptable.php?l=${LEAGUE_ID}&s=${SEASON}`) as any;
    const table: SDBStandingRow[] = json.table ?? [];
    if (!table.length) return mockStandings;

    // Agrupar por equipo para elegir la entrada más razonable
    // (descarta acumulados históricos que tienen intPlayed > SEASON_MAX_GAMES)
    const SEASON_MAX_GAMES = 38;
    const byTeam = new Map<number, SDBStandingRow[]>();
    for (const row of table) {
      const id = Number(row.idTeam);
      if (!byTeam.has(id)) byTeam.set(id, []);
      byTeam.get(id)!.push(row);
    }

    const standings: StandingRow[] = [];
    for (const [sdbId, entries] of byTeam) {
      const valid = entries.filter(e => Number(e.intPlayed) < SEASON_MAX_GAMES);
      const best  = (valid.length ? valid : entries)
        .sort((a, b) => Number(a.intPlayed) - Number(b.intPlayed))[0];

      standings.push({
        rank:   Number(best.intRank),
        team:   { id: normalizeBocaId(sdbId), name: best.strTeam, logo: best.strBadge.replace('/tiny', '') },
        points: Number(best.intPoints),
        all:    { played: Number(best.intPlayed), win: Number(best.intWin), draw: Number(best.intDraw), lose: Number(best.intLoss) },
        zone:   best.strDescription || undefined,
      });
    }

    // Ordenar por zona y luego por puntos dentro de cada zona
    standings.sort((a, b) => {
      if (a.zone !== b.zone) return (a.zone ?? '').localeCompare(b.zone ?? '');
      return b.points - a.points;
    });

    // Re-rankear relativo a la zona
    const zoneRanks = new Map<string, number>();
    standings.forEach(row => {
      const z = row.zone ?? '';
      const r = (zoneRanks.get(z) ?? 0) + 1;
      zoneRanks.set(z, r);
      row.rank = r;
    });

    // Con el free key solo vuelven ~4 equipos — datos insuficientes, usar mock
    if (standings.length < 10) {
      console.warn('[thesportsdb] tabla incompleta (<10 equipos), usando mock');
      return mockStandings;
    }

    setCache(STANDINGS_CACHE_KEY, standings);
    return standings;
  } catch (err) {
    console.warn('[thesportsdb] fetchStandings falló, usando mock →', err);
    return mockStandings;
  }
}

// ── Partidos de temporada (fuente compartida) ─────────────────────────────────
// eventslast / eventsnext devuelven solo 1 resultado con el free key.
// eventsseason.php trae TODOS los partidos del equipo en la temporada:
// filtramos pasados/futuros del lado del cliente.

const SEASON_EVENTS_CACHE_KEY = 'sdb:seasonEvents';

async function fetchSeasonEvents(): Promise<SDBEvent[]> {
  const cached = getCached<SDBEvent[]>(SEASON_EVENTS_CACHE_KEY);
  if (cached) return cached;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await sdbFetch(`/eventsseason.php?id=${BOCA_SDB_ID}&s=${SEASON}`) as any;
  const events: SDBEvent[] = json.events ?? [];
  if (events.length) setCache(SEASON_EVENTS_CACHE_KEY, events);
  return events;
}

function eventTimestamp(ev: SDBEvent): number {
  return new Date(ev.strTimestamp ?? `${ev.dateEvent}T${ev.strTime}`).getTime();
}

// ── Últimos partidos ─────────────────────────────────────────────────────────

const LAST_MATCHES_CACHE_KEY = 'sdb:lastMatches';

export async function fetchLastMatches(): Promise<MatchResult[]> {
  const cached = getCached<MatchResult[]>(LAST_MATCHES_CACHE_KEY);
  if (cached) return cached;

  try {
    const all = await fetchSeasonEvents();
    if (!all.length) return mockMatches;

    const now = Date.now();
    // Partidos ya terminados, ordenados del más reciente al más antiguo
    const past = all
      .filter(ev => ev.strStatus === 'Match Finished' || eventTimestamp(ev) < now)
      .sort((a, b) => eventTimestamp(b) - eventTimestamp(a))
      .slice(0, 5);

    if (!past.length) return mockMatches;

    const matches: MatchResult[] = past.map(ev => {
      const homeId = normalizeBocaId(Number(ev.idHomeTeam));
      const awayId = normalizeBocaId(Number(ev.idAwayTeam));
      const goalsH = ev.intHomeScore !== null ? Number(ev.intHomeScore) : null;
      const goalsA = ev.intAwayScore !== null ? Number(ev.intAwayScore) : null;

      let homeWinner: boolean | null = null;
      let awayWinner: boolean | null = null;
      if (goalsH !== null && goalsA !== null) {
        if (goalsH > goalsA)      { homeWinner = true;  awayWinner = false; }
        else if (goalsH < goalsA) { homeWinner = false; awayWinner = true;  }
        else                      { homeWinner = false; awayWinner = false; }
      }

      return {
        fixtureId: Number(ev.idEvent),
        date:      ev.strTimestamp ?? `${ev.dateEvent}T${ev.strTime}`,
        homeTeam:  { id: homeId, name: ev.strHomeTeam, logo: ev.strHomeTeamBadge, winner: homeWinner },
        awayTeam:  { id: awayId, name: ev.strAwayTeam, logo: ev.strAwayTeamBadge, winner: awayWinner },
        goalsHome: goalsH,
        goalsAway: goalsA,
        venueName: ev.strVenue ?? '',
      };
    });

    setCache(LAST_MATCHES_CACHE_KEY, matches);
    return matches;
  } catch (err) {
    console.warn('[thesportsdb] fetchLastMatches falló, usando mock →', err);
    return mockMatches;
  }
}

// ── Próximos partidos ────────────────────────────────────────────────────────

const UPCOMING_CACHE_KEY = 'sdb:upcomingMatches';

export async function fetchUpcomingMatches(): Promise<ProximoPartido[]> {
  const cached = getCached<ProximoPartido[]>(UPCOMING_CACHE_KEY);
  if (cached) return cached;

  try {
    const all = await fetchSeasonEvents();
    if (!all.length) return mockUpcomingMatches;

    const now = Date.now();
    // Partidos futuros (no terminados), ordenados del más próximo al más lejano
    const upcoming = all
      .filter(ev => ev.strStatus !== 'Match Finished' && eventTimestamp(ev) >= now)
      .sort((a, b) => eventTimestamp(a) - eventTimestamp(b))
      .slice(0, 5);

    if (!upcoming.length) return mockUpcomingMatches;

    const matches: ProximoPartido[] = upcoming.map(ev => {
      const timestamp = ev.strTimestamp ?? `${ev.dateEvent}T${ev.strTime}`;
      const d = new Date(timestamp);
      return {
        fixtureId:   Number(ev.idEvent),
        date:        timestamp,
        time:        d.toLocaleTimeString('es-AR', {
          hour: '2-digit', minute: '2-digit',
          timeZone: 'America/Argentina/Buenos_Aires',
        }),
        homeTeam: {
          id:   normalizeBocaId(Number(ev.idHomeTeam)),
          name: ev.strHomeTeam,
          logo: ev.strHomeTeamBadge,
        },
        awayTeam: {
          id:   normalizeBocaId(Number(ev.idAwayTeam)),
          name: ev.strAwayTeam,
          logo: ev.strAwayTeamBadge,
        },
        venueName:   ev.strVenue ?? '',
        competition: ev.strLeague ?? 'Liga Profesional',
      };
    });

    setCache(UPCOMING_CACHE_KEY, matches);
    return matches;
  } catch (err) {
    console.warn('[thesportsdb] fetchUpcomingMatches falló, usando mock →', err);
    return mockUpcomingMatches;
  }
}

// ── Noticias ─────────────────────────────────────────────────────────────────

export async function fetchNoticias(): Promise<Noticia[]> {
  return mockNoticias;
}

// ── Canal de YouTube ──────────────────────────────────────────────────────────

export async function fetchVideos(channelId: string): Promise<VideoYoutube[]> {
  void channelId;
  return mockVideos;
}

export const BOCA_ID = BOCA_ID_EXPORT;
