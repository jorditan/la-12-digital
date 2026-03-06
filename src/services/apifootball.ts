import { getSofaScoreLastFixtures, getSofaScoreNextFixtures, getSofaScoreStandingsData } from './sofascoreService';

// BOCA_ID exportado = 451 (coincide con mock data y con lo que leen los componentes)
// SofaScore usa 3202; normalizamos en cada mapper.
const BOCA_ID_EXPORT = 451;

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

// ── Tabla de posiciones ──────────────────────────────────────────────────────

export async function fetchStandings(): Promise<StandingRow[]> {
  const data = await getSofaScoreStandingsData();
  return data.map(d => ({
    rank:   d.rank,
    team:   { id: d.teamId === 3202 ? BOCA_ID_EXPORT : d.teamId, name: d.teamName, logo: d.teamLogo },
    points: d.points,
    all:    { played: d.played, win: d.win, draw: d.draw, lose: d.lose },
    zone:   d.zone,
  }));
}

// ── Últimos partidos ─────────────────────────────────────────────────────────


export async function fetchLastMatches(): Promise<MatchResult[]> {
  const fixtures = await getSofaScoreLastFixtures(8);
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
      homeTeam:  { id: homeId, name: f.homeTeam, logo: `https://api.sofascore.com/api/v1/team/${f.homeTeamId}/image`, winner: homeWinner },
      awayTeam:  { id: awayId, name: f.awayTeam, logo: `https://api.sofascore.com/api/v1/team/${f.awayTeamId}/image`, winner: awayWinner },
      goalsHome: f.homeScore,
      goalsAway: f.awayScore,
      venueName: f.venue,
    };
  });
}

// ── Próximos partidos ────────────────────────────────────────────────────────

export async function fetchUpcomingMatches(): Promise<ProximoPartido[]> {
  const fixtures = await getSofaScoreNextFixtures(10);
  return fixtures.map(f => ({
    fixtureId:   f.id,
    date:        f.date.toISOString(),
    time:        f.date.toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    homeTeam: { id: f.isBocaHome ? BOCA_ID_EXPORT : 0, name: f.homeTeam, logo: `https://api.sofascore.com/api/v1/team/${f.homeTeamId}/image` },
    awayTeam: { id: f.isBocaHome ? 0 : BOCA_ID_EXPORT, name: f.awayTeam, logo: `https://api.sofascore.com/api/v1/team/${f.awayTeamId}/image` },
    venueName:   f.venue,
    competition: 'Liga Profesional',
  }));
}

// ── Noticias ─────────────────────────────────────────────────────────────────

export async function fetchNoticias(): Promise<Noticia[]> {
  return [];
}

// ── Canal de YouTube ──────────────────────────────────────────────────────────

export async function fetchVideos(channelId: string): Promise<VideoYoutube[]> {
  void channelId;
  return [];
}

export const BOCA_ID = BOCA_ID_EXPORT;
