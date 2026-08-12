import {
  getLastFixtures,
  getNextFixtures,
  getStandingsData,
  getAnnualStandingsData,
  getLibertadoresLastFixtures,
  getLibertadoresNextFixtures,
  getLibertadoresStandingsData,
  getSudamericanaStandingsData,
} from './footballApiService';
import { fetchBocaNews } from './newsdataService';
import { fetchYoutubeVideos, type VideoItem } from './youtubeService';

// BOCA_ID exportado = 451 (coincide con lo que leen los componentes)
// Live Score API usa un ID interno desconocido hasta el primer fetch;
// la detección se hace por nombre en lugar de por ID numérico.
const BOCA_ID_EXPORT = 451;
const BOCA_NAME_RE = /boca/i;

// Logo URLs: use direct CDN URL from API when available, fallback to constructed URL.
function teamLogoUrl(_teamId: number | string, directUrl?: string): string {
  if (directUrl) return directUrl;
  return '';
}

// ── Tipos públicos ───────────────────────────────────────────────────────────

export interface StandingRow {
  rank: number;
  team: { id: number | string; name: string; logo: string };
  points: number;
  all: { played: number; win: number; draw: number; lose: number };
  zone?: string; // "Zona A" / "Zona B" — undefined = tabla única
  goalDiff?: number;
}

export interface MatchResult {
  fixtureId: number;
  date: string;
  homeTeam: { id: number | string; name: string; logo: string; winner: boolean | null };
  awayTeam: { id: number | string; name: string; logo: string; winner: boolean | null };
  goalsHome: number | null;
  goalsAway: number | null;
  venueName: string;
  competition?: string; // 'Liga Profesional' | 'Copa Libertadores'
}

export interface ProximoPartido {
  fixtureId: number;
  date: string; // ISO
  time: string; // "HH:MM" hora local
  homeTeam: { id: number | string; name: string; logo: string };
  timeStatus: 'pending' | 'confirmed';
  awayTeam: { id: number | string; name: string; logo: string };
  venueName: string;
  competition: string;
  /** ID interno de LiveScore del equipo rival — necesario para fetchHeadToHead() */
  rivalApiId: number | string;
}

export interface Noticia {
  id: string | number;
  titulo: string;
  imagen: string;
  categoria: 'mercado' | 'informe' | 'partido' | 'seleccion';
  fecha: string;
  url?: string;
  fuente?: string;
}

export type VideoYoutube = VideoItem;

// ── Tabla de posiciones ──────────────────────────────────────────────────────

function mapStandingData(d: import('./footballApiService').StandingData): StandingRow {
  return {
    rank: d.rank,
    team: {
      id: BOCA_NAME_RE.test(d.teamName) ? BOCA_ID_EXPORT : d.teamId,
      name: d.teamName,
      logo: teamLogoUrl(d.teamId, d.teamLogo),
    },
    points: d.points,
    all: { played: d.played, win: d.win, draw: d.draw, lose: d.lose },
    zone: d.zone,
    goalDiff: d.goalDiff,
  };
}

export async function fetchStandings(): Promise<StandingRow[]> {
  const data = await getStandingsData();
  return data.map(mapStandingData);
}

export async function fetchAnnualStandings(): Promise<StandingRow[]> {
  const data = await getAnnualStandingsData();
  return data.map(mapStandingData);
}

export async function fetchLibertadoresStandings(): Promise<StandingRow[]> {
  const data = await getLibertadoresStandingsData();
  return data.map(mapStandingData);
}

export async function fetchSudamericanaStandings(): Promise<StandingRow[]> {
  const data = await getSudamericanaStandingsData();
  return data.map(mapStandingData);
}

const COMPETITION_NAMES: Record<number, string> = {
  23: 'Liga Profesional',
  329: 'Copa Libertadores',
  14: 'Copa Argentina',
  11: 'Copa Sudamericana',
};

import { resolveVenueName } from '../constants/stadiums';

function mapFixtureToMatchResult(
  f: import('../types/football').ProcessedFixture,
  defaultCompetition: string
): MatchResult {
  const competition = f.competitionId
    ? COMPETITION_NAMES[f.competitionId] || defaultCompetition
    : defaultCompetition;
  const homeId = f.isBocaHome ? BOCA_ID_EXPORT : f.homeTeamId;
  const awayId = f.isBocaHome ? f.awayTeamId : BOCA_ID_EXPORT;

  let homeWinner: boolean | null = null;
  let awayWinner: boolean | null = null;
  if (f.result === 'win') {
    homeWinner = f.isBocaHome;
    awayWinner = !f.isBocaHome;
  }
  if (f.result === 'loss') {
    homeWinner = !f.isBocaHome;
    awayWinner = f.isBocaHome;
  }
  if (f.result === 'draw') {
    homeWinner = false;
    awayWinner = false;
  }

  return {
    fixtureId: f.id,
    date: f.date.toISOString(),
    homeTeam: {
      id: homeId,
      name: f.homeTeam,
      logo: teamLogoUrl(f.homeTeamId, f.homeLogo),
      winner: homeWinner,
    },
    awayTeam: {
      id: awayId,
      name: f.awayTeam,
      logo: teamLogoUrl(f.awayTeamId, f.awayLogo),
      winner: awayWinner,
    },
    goalsHome: f.homeScore,
    goalsAway: f.awayScore,
    venueName: resolveVenueName(f.isBocaHome, f.venue, f.isBocaHome ? f.awayTeam : f.homeTeam),
    competition,
  };
}

export async function fetchLastMatches(): Promise<MatchResult[]> {
  const currentYear = new Date().getFullYear();
  const [ligaFixtures, libFixtures] = await Promise.all([
    getLastFixtures(10),
    getLibertadoresLastFixtures(10),
  ]);

  const liga = ligaFixtures.map((f) => mapFixtureToMatchResult(f, 'Liga Profesional'));
  const lib = libFixtures.map((f) => mapFixtureToMatchResult(f, 'Copa Libertadores'));

  return [...liga, ...lib]
    .filter((m) => new Date(m.date).getFullYear() === currentYear)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}

export async function fetchMatchesForHistorial(): Promise<MatchResult[]> {
  const [ligaFixtures, libFixtures] = await Promise.all([
    getLastFixtures(25),
    getLibertadoresLastFixtures(25),
  ]);

  const liga = ligaFixtures.map((f) => mapFixtureToMatchResult(f, 'Liga Profesional'));
  const lib = libFixtures.map((f) => mapFixtureToMatchResult(f, 'Copa Libertadores'));

  return [...liga, ...lib].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ── Próximos partidos ────────────────────────────────────────────────────────

import { formatMatchTime } from '../lib/date';

function mapFixtureToProximoPartido(
  f: import('../types/football').ProcessedFixture,
  defaultCompetition: string
): ProximoPartido {
  const isBocaAway = !f.isBocaHome;
  const competition = f.competitionId
    ? COMPETITION_NAMES[f.competitionId] || defaultCompetition
    : defaultCompetition;
  return {
    fixtureId: f.id,
    date: f.date.toISOString(),
    time: f.timeStatus === 'pending' ? '12:00' : formatMatchTime(f.date),
    timeStatus: f.timeStatus,
    homeTeam: {
      id: f.isBocaHome ? BOCA_ID_EXPORT : f.homeTeamId,
      name: f.homeTeam,
      logo: teamLogoUrl(f.homeTeamId, f.homeLogo),
    },
    awayTeam: {
      id: isBocaAway ? BOCA_ID_EXPORT : f.awayTeamId,
      name: f.awayTeam,
      logo: teamLogoUrl(f.awayTeamId, f.awayLogo),
    },
    venueName: resolveVenueName(f.isBocaHome, f.venue, f.isBocaHome ? f.awayTeam : f.homeTeam),
    competition,
    rivalApiId: f.isBocaHome ? f.awayTeamId : f.homeTeamId,
  };
}

export async function fetchUpcomingMatches(): Promise<ProximoPartido[]> {
  const [ligaFixtures, libFixtures] = await Promise.all([
    getNextFixtures(20),
    getLibertadoresNextFixtures(20),
  ]);

  const liga = ligaFixtures.map((f) => mapFixtureToProximoPartido(f, 'Liga Profesional'));
  const lib = libFixtures.map((f) => mapFixtureToProximoPartido(f, 'Copa Libertadores'));

  return [...liga, ...lib]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 24);
}

// ── Noticias ─────────────────────────────────────────────────────────────────

export interface NoticiasResponse {
  results: Noticia[];
  total: number;
}

function inferNewsCategory(titulo: string): 'mercado' | 'informe' | 'partido' | 'seleccion' {
  const lower = titulo.toLowerCase();
  if (
    lower.includes('pase') ||
    lower.includes('refuerzo') ||
    lower.includes('mercado') ||
    lower.includes('fichaje') ||
    lower.includes('refuerzos') ||
    lower.includes('firmó') ||
    lower.includes('oferta') ||
    lower.includes('contrato')
  ) {
    return 'mercado';
  }
  if (
    lower.includes('selección') ||
    lower.includes('scaloni') ||
    lower.includes('argentina') ||
    lower.includes('sub-20') ||
    lower.includes('convocado')
  ) {
    return 'seleccion';
  }
  if (
    lower.includes('lesión') ||
    lower.includes('estadio') ||
    lower.includes('bombonera') ||
    lower.includes('informe') ||
    lower.includes('riquelme') ||
    lower.includes('socio') ||
    lower.includes('entradas')
  ) {
    return 'informe';
  }
  return 'partido';
}

export async function fetchNoticias(): Promise<NoticiasResponse> {
  const data = await fetchBocaNews();

  return {
    results: data.results.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      imagen: a.imagen,
      categoria: inferNewsCategory(a.titulo),
      fecha: a.fecha,
      url: a.url,
      fuente: a.fuente,
    })),
    total: data.total,
  };
}

// ── Canal de YouTube ──────────────────────────────────────────────────────────

export async function fetchVideos(handle: string): Promise<VideoYoutube[]> {
  return fetchYoutubeVideos(handle);
}

export const BOCA_ID = BOCA_ID_EXPORT;
