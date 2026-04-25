import {
  getLastFixtures,
  getNextFixtures,
  getStandingsData,
  getAnnualStandingsData,
  getLibertadoresLastFixtures,
  getLibertadoresNextFixtures,
  getLibertadoresStandingsData,
} from "./footballApiService";
import { fetchNewsdataNoticias } from "./newsdataService";
import { fetchYoutubeVideos, type VideoItem } from "./youtubeService";

// BOCA_ID exportado = 451 (coincide con lo que leen los componentes)
// Live Score API usa un ID interno desconocido hasta el primer fetch;
// la detección se hace por nombre en lugar de por ID numérico.
const BOCA_ID_EXPORT = 451;
const BOCA_NAME_RE = /boca/i;

// Logo URLs: use direct CDN URL from API when available, fallback to constructed URL.
function teamLogoUrl(teamId: number, directUrl?: string): string {
  if (directUrl) return directUrl;
  return `https://livescore-api.com/api-client/images/team/${teamId}.png`;
}

// ── Tipos públicos ───────────────────────────────────────────────────────────

export interface StandingRow {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  all: { played: number; win: number; draw: number; lose: number };
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
  competition?: string; // 'Liga Profesional' | 'Copa Libertadores'
}

export interface ProximoPartido {
  fixtureId: number;
  date: string; // ISO
  time: string; // "HH:MM" hora local
  homeTeam: { id: number; name: string; logo: string };
  awayTeam: { id: number; name: string; logo: string };
  venueName: string;
  competition: string;
  /** ID interno de LiveScore del equipo rival — necesario para fetchHeadToHead() */
  rivalApiId: number;
}

export interface Noticia {
  id: number;
  titulo: string;
  imagen: string;
  categoria: "mercado" | "informe" | "partido" | "seleccion";
  fecha: string;
  url?: string;
}

export type VideoYoutube = VideoItem;

// ── Tabla de posiciones ──────────────────────────────────────────────────────

function mapStandingData(
  d: import("./footballApiService").StandingData,
): StandingRow {
  return {
    rank: d.rank,
    team: {
      id: BOCA_NAME_RE.test(d.teamName) ? BOCA_ID_EXPORT : d.teamId,
      name: d.teamName,
      logo: d.teamLogo,
    },
    points: d.points,
    all: { played: d.played, win: d.win, draw: d.draw, lose: d.lose },
    zone: d.zone,
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

// ── Últimos partidos ─────────────────────────────────────────────────────────

function mapFixtureToMatchResult(
  f: import("../types/football").ProcessedFixture,
  competition: string,
): MatchResult {
  const homeId = f.isBocaHome ? BOCA_ID_EXPORT : f.homeTeamId;
  const awayId = f.isBocaHome ? f.awayTeamId : BOCA_ID_EXPORT;

  let homeWinner: boolean | null = null;
  let awayWinner: boolean | null = null;
  if (f.result === "win") {
    homeWinner = f.isBocaHome;
    awayWinner = !f.isBocaHome;
  }
  if (f.result === "loss") {
    homeWinner = !f.isBocaHome;
    awayWinner = f.isBocaHome;
  }
  if (f.result === "draw") {
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
    venueName: f.venue,
    competition,
  };
}

export async function fetchLastMatches(): Promise<MatchResult[]> {
  const currentYear = new Date().getFullYear();
  const [ligaFixtures, libFixtures] = await Promise.all([
    getLastFixtures(10),
    getLibertadoresLastFixtures(10),
  ]);

  const liga = ligaFixtures.map((f) =>
    mapFixtureToMatchResult(f, "Liga Profesional"),
  );
  const lib = libFixtures.map((f) =>
    mapFixtureToMatchResult(f, "Copa Libertadores"),
  );

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

  const liga = ligaFixtures.map((f) =>
    mapFixtureToMatchResult(f, "Liga Profesional"),
  );
  const lib = libFixtures.map((f) =>
    mapFixtureToMatchResult(f, "Copa Libertadores"),
  );

  return [...liga, ...lib].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// ── Próximos partidos ────────────────────────────────────────────────────────

function mapFixtureToProximoPartido(
  f: import("../types/football").ProcessedFixture,
  competition: string,
): ProximoPartido {
  const isBocaAway = !f.isBocaHome;
  return {
    fixtureId: f.id,
    date: f.date.toISOString(),
    time: f.date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    }),
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
    venueName: f.venue,
    competition,
    rivalApiId: f.isBocaHome ? f.awayTeamId : f.homeTeamId,
  };
}

export async function fetchUpcomingMatches(): Promise<ProximoPartido[]> {
  const [ligaFixtures, libFixtures] = await Promise.all([
    getNextFixtures(8),
    getLibertadoresNextFixtures(8),
  ]);

  const liga = ligaFixtures.map((f) =>
    mapFixtureToProximoPartido(f, "Liga Profesional"),
  );
  const lib = libFixtures.map((f) =>
    mapFixtureToProximoPartido(f, "Copa Libertadores"),
  );

  return [...liga, ...lib]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 12);
}

// ── Noticias ─────────────────────────────────────────────────────────────────

export async function fetchNoticias(): Promise<Noticia[]> {
  const articles = await fetchNewsdataNoticias();
  return articles.map((a, i) => ({
    id: i,
    titulo: a.titulo,
    imagen: a.imagen,
    categoria: "partido" as const,
    fecha: a.fecha,
    url: a.url,
  }));
}

// ── Canal de YouTube ──────────────────────────────────────────────────────────

export async function fetchVideos(handle: string): Promise<VideoYoutube[]> {
  return fetchYoutubeVideos(handle);
}

export const BOCA_ID = BOCA_ID_EXPORT;
