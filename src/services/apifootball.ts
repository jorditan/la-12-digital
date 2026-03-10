import { getSofaScoreLastFixtures, getSofaScoreNextFixtures, getSofaScoreStandingsData } from './sofascoreService';
import { fetchNewsdataNoticias } from './newsdataService';
import { fetchYoutubeVideos, type VideoItem } from './youtubeService';
import {
  fetchStandings as fetchSportsDbStandings,
  fetchLastMatches as fetchSportsDbLastMatches,
  fetchUpcomingMatches as fetchSportsDbUpcomingMatches,
} from './sportsdbService';

// BOCA_ID exportado = 451 (coincide con mock data y con lo que leen los componentes)
// SofaScore usa 3202; normalizamos en cada mapper.
const BOCA_ID_EXPORT = 451;

// Build a URL for a SofaScore team image via the proxy.
// Defaults to the built-in proxy path (/api/sofascore) so images are always
// served through the Cloudflare Worker — avoids direct sofascore.com requests
// that can be blocked by bot protection or cause CORS/403 errors in production.
function sofaTeamLogoUrl(teamId: number): string {
  const proxyBase: string = import.meta.env.VITE_SOFASCORE_PROXY_URL ?? '/api/sofascore';
  return `${proxyBase}/team/${teamId}/image`;
}

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
  url?: string;
}

export type VideoYoutube = VideoItem;

// ── Tabla de posiciones ──────────────────────────────────────────────────────

export async function fetchStandings(): Promise<StandingRow[]> {
  try {
    const data = await getSofaScoreStandingsData();
    if (data.length > 0) {
      return data.map(d => ({
        rank:   d.rank,
        team:   { id: d.teamId === 3202 ? BOCA_ID_EXPORT : d.teamId, name: d.teamName, logo: d.teamLogo },
        points: d.points,
        all:    { played: d.played, win: d.win, draw: d.draw, lose: d.lose },
        zone:   d.zone,
      }));
    }
  } catch {
    // SofaScore unreachable – fall through to TheSportsDB.
  }
  // SofaScore unavailable in production – fall back to TheSportsDB.
  return fetchSportsDbStandings();
}

// ── Últimos partidos ─────────────────────────────────────────────────────────


export async function fetchLastMatches(): Promise<MatchResult[]> {
  try {
    const fixtures = await getSofaScoreLastFixtures(8);
    if (fixtures.length > 0) {
      return fixtures.map(f => {
        const homeId = f.isBocaHome ? BOCA_ID_EXPORT : 0;
        const awayId = f.isBocaHome ? 0 : BOCA_ID_EXPORT;

        let homeWinner: boolean | null = null;
        let awayWinner: boolean | null = null;
        if (f.result === 'win')  { homeWinner = f.isBocaHome;  awayWinner = !f.isBocaHome; }
        if (f.result === 'loss') { homeWinner = !f.isBocaHome; awayWinner = f.isBocaHome;  }
        if (f.result === 'draw') { homeWinner = false;          awayWinner = false;          }

        return {
          fixtureId: f.id,
          date:      f.date.toISOString(),
          homeTeam:  { id: homeId, name: f.homeTeam, logo: sofaTeamLogoUrl(f.homeTeamId), winner: homeWinner },
          awayTeam:  { id: awayId, name: f.awayTeam, logo: sofaTeamLogoUrl(f.awayTeamId), winner: awayWinner },
          goalsHome: f.homeScore,
          goalsAway: f.awayScore,
          venueName: f.venue,
        };
      });
    }
  } catch {
    // SofaScore unreachable – fall through to TheSportsDB.
  }
  // SofaScore unavailable in production – fall back to TheSportsDB.
  return fetchSportsDbLastMatches();
}

// ── Próximos partidos ────────────────────────────────────────────────────────

export async function fetchUpcomingMatches(): Promise<ProximoPartido[]> {
  try {
    const fixtures = await getSofaScoreNextFixtures(10);
    if (fixtures.length > 0) {
      return fixtures.map(f => ({
        fixtureId:   f.id,
        date:        f.date.toISOString(),
        time:        f.date.toLocaleTimeString('es-AR', {
          hour: '2-digit', minute: '2-digit',
          timeZone: 'America/Argentina/Buenos_Aires',
        }),
        homeTeam: { id: f.isBocaHome ? BOCA_ID_EXPORT : 0, name: f.homeTeam, logo: sofaTeamLogoUrl(f.homeTeamId) },
        awayTeam: { id: f.isBocaHome ? 0 : BOCA_ID_EXPORT, name: f.awayTeam, logo: sofaTeamLogoUrl(f.awayTeamId) },
        venueName:   f.venue,
        competition: 'Liga Profesional',
      }));
    }
  } catch {
    // SofaScore unreachable – fall through to TheSportsDB.
  }
  // SofaScore unavailable in production – fall back to TheSportsDB.
  return fetchSportsDbUpcomingMatches();
}

// ── Noticias ─────────────────────────────────────────────────────────────────

export async function fetchNoticias(): Promise<Noticia[]> {
  const articles = await fetchNewsdataNoticias();
  return articles.map((a, i) => ({
    id:        i,
    titulo:    a.titulo,
    imagen:    a.imagen,
    categoria: 'partido' as const,
    fecha:     a.fecha,
    url:       a.url,
  }));
}

// ── Canal de YouTube ──────────────────────────────────────────────────────────

export async function fetchVideos(handle: string): Promise<VideoYoutube[]> {
  return fetchYoutubeVideos(handle);
}

export const BOCA_ID = BOCA_ID_EXPORT;
