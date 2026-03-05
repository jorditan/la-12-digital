/**
 * THESPORTSDB SERVICE - LA 12 DIGITAL
 * https://www.thesportsdb.com/api.php
 *
 * Free tier: API key = "3" (sin registro, limitado)
 * Premium:   API key propia (más requests, más endpoints)
 *
 * Expone el mismo interface que apifootball.ts para poder
 * hacer el swap en los componentes cambiando solo el import.
 */

import { mockStandings, mockMatches, mockUpcomingMatches } from './mockData';
import type { StandingRow, MatchResult, ProximoPartido } from './apifootball';

// ── Configuración ────────────────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_SPORTSDB_KEY ?? '3'; // '3' = free public key
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// IDs de Boca Juniors y la Liga Profesional en TheSportsDB
export const BOCA_ID = 135156;
const LEAGUE_ID = 4406;
const CURRENT_SEASON = '2026'; // TheSportsDB usa el año de finalización

// ── Cache ────────────────────────────────────────────────────────────────────

const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

interface CacheEntry<T> { data: T; ts: number }

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return entry.data;
  } catch { return null; }
}

function setCache<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch { /* noop */ }
}

// ── Fetch ────────────────────────────────────────────────────────────────────

async function sdbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`TheSportsDB error ${res.status}`);
  return res.json();
}

// ── Tabla de posiciones ──────────────────────────────────────────────────────

const STANDINGS_KEY = 'sdb:standings';

export async function fetchStandings(): Promise<StandingRow[]> {
  const cached = getCached<StandingRow[]>(STANDINGS_KEY);
  if (cached) return cached;

  try {
    const json = await sdbFetch<{ table: SDBStandingRow[] | null }>(
      `/lookuptable.php?l=${LEAGUE_ID}&s=${CURRENT_SEASON}`
    );

    if (!json.table?.length) return mockStandings;

    // TheSportsDB puede devolver duplicados por zonas/descripciones;
    // nos quedamos con la primera aparición de cada equipo (orden por intRank)
    const seen = new Set<number>();
    const standings: StandingRow[] = [];

    for (const row of json.table) {
      const teamId = Number(row.idTeam);
      if (seen.has(teamId)) continue;
      seen.add(teamId);
      standings.push({
        rank: Number(row.intRank),
        team: {
          id: teamId,
          name: row.strTeam,
          // strBadge a veces viene con "/tiny" al final — lo quitamos
          logo: row.strBadge.replace('/tiny', ''),
        },
        points: Number(row.intPoints),
        all: {
          played: Number(row.intPlayed),
          win:    Number(row.intWin),
          draw:   Number(row.intDraw),
          lose:   Number(row.intLoss),
        },
      });
    }

    // Ordenar por puntos desc (la API puede devolver el orden desordenado)
    standings.sort((a, b) => b.points - a.points || b.all.played - a.all.played);
    standings.forEach((row, i) => { row.rank = i + 1; });

    setCache(STANDINGS_KEY, standings);
    return standings;
  } catch (err) {
    console.warn('[sportsdb] fetchStandings falló, usando mock →', err);
    return mockStandings;
  }
}

// ── Últimos partidos ─────────────────────────────────────────────────────────

const LAST_MATCHES_KEY = 'sdb:lastMatches';

export async function fetchLastMatches(): Promise<MatchResult[]> {
  const cached = getCached<MatchResult[]>(LAST_MATCHES_KEY);
  if (cached) return cached;

  try {
    const json = await sdbFetch<{ results: SDBEvent[] | null }>(
      `/eventslast.php?id=${BOCA_ID}`
    );

    if (!json.results?.length) return mockMatches;

    // La API devuelve los más recientes al final — invertimos para tener el último primero
    const events = [...json.results].reverse().slice(0, 5);

    const matches: MatchResult[] = events.map(ev => {
      const homeId  = Number(ev.idHomeTeam);
      const awayId  = Number(ev.idAwayTeam);
      const goalsH  = ev.intHomeScore !== null ? Number(ev.intHomeScore) : null;
      const goalsA  = ev.intAwayScore !== null ? Number(ev.intAwayScore) : null;
      const finished = ev.strStatus === 'Match Finished';

      let homeWinner: boolean | null = null;
      let awayWinner: boolean | null = null;
      if (finished && goalsH !== null && goalsA !== null) {
        if (goalsH > goalsA)       { homeWinner = true;  awayWinner = false; }
        else if (goalsH < goalsA)  { homeWinner = false; awayWinner = true;  }
        else                       { homeWinner = false; awayWinner = false; } // empate
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

    setCache(LAST_MATCHES_KEY, matches);
    return matches;
  } catch (err) {
    console.warn('[sportsdb] fetchLastMatches falló, usando mock →', err);
    return mockMatches;
  }
}

// ── Próximos partidos ────────────────────────────────────────────────────────

const UPCOMING_KEY = 'sdb:upcoming';

export async function fetchUpcomingMatches(): Promise<ProximoPartido[]> {
  const cached = getCached<ProximoPartido[]>(UPCOMING_KEY);
  if (cached) return cached;

  try {
    const json = await sdbFetch<{ events: SDBEvent[] | null }>(
      `/eventsnext.php?id=${BOCA_ID}`
    );

    // Filtramos solo los partidos de Boca (la free key a veces devuelve otros equipos)
    const events = (json.events ?? [])
      .filter(ev => Number(ev.idHomeTeam) === BOCA_ID || Number(ev.idAwayTeam) === BOCA_ID)
      .slice(0, 8);

    if (!events.length) return mockUpcomingMatches;

    const matches: ProximoPartido[] = events.map(ev => {
      const d = new Date(ev.strTimestamp ?? `${ev.dateEvent}T${ev.strTime}`);
      return {
        fixtureId:   Number(ev.idEvent),
        date:        ev.strTimestamp ?? `${ev.dateEvent}T${ev.strTime}`,
        time:        d.toLocaleTimeString('es-AR', {
          hour: '2-digit', minute: '2-digit',
          timeZone: 'America/Argentina/Buenos_Aires',
        }),
        homeTeam:    { id: Number(ev.idHomeTeam), name: ev.strHomeTeam, logo: ev.strHomeTeamBadge },
        awayTeam:    { id: Number(ev.idAwayTeam), name: ev.strAwayTeam, logo: ev.strAwayTeamBadge },
        venueName:   ev.strVenue ?? '',
        competition: ev.strLeague ?? 'Liga Profesional',
      };
    });

    setCache(UPCOMING_KEY, matches);
    return matches;
  } catch (err) {
    console.warn('[sportsdb] fetchUpcomingMatches falló, usando mock →', err);
    return mockUpcomingMatches;
  }
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
  idTeam:           string;
  strTeam:          string;
  strBadge:         string;
  intRank:          string;
  intPlayed:        string;
  intWin:           string;
  intDraw:          string;
  intLoss:          string;
  intPoints:        string;
}
