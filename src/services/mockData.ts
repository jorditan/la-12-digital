import type { StandingRow, MatchResult, ProximoPartido, Noticia } from './apifootball';

// Logos generados via ui-avatars garantizan que las siglas coincidan con el nombre real.
// Reemplazar con URLs reales al conectar la API.
function logo(initials: string, bg = '1e3a5f', fg = '94a3b8'): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=64&background=${bg}&color=${fg}&bold=true&format=svg`;
}

const BJ  = logo('BJ',  '001529', 'FFD700'); // Boca Juniors
const RP  = logo('RP',  '991b1b', 'ffffff'); // River Plate
const RC  = logo('RC',  '1d4ed8', 'ffffff'); // Racing Club
const SL  = logo('SL',  '1e3a5f', 'e5e7eb'); // San Lorenzo
const IND = logo('IND', 'ef4444', 'ffffff'); // Independiente
const TAL = logo('TAL', '1e3a5f', 'e5e7eb'); // Talleres
const EST = logo('EST', '1d4ed8', 'ffffff'); // Estudiantes
const RCE = logo('RCE', '16a34a', 'ffffff'); // Rosario Central
const VEL = logo('VEL', '1e3a5f', 'ffffff'); // Vélez Sársfield
const HUR = logo('HUR', 'ffffff', '991b1b'); // Huracán
const LAN = logo('LAN', '16a34a', 'ffffff'); // Lanús
const BAN = logo('BAN', '1e3a5f', 'e5e7eb'); // Banfield
const ARG = logo('ARG', 'dc2626', 'ffffff'); // Argentinos Juniors
const NOB = logo('NOB', 'dc2626', '000000'); // Newell's Old Boys
const TIG = logo('TIG', '1e3a5f', 'e5e7eb'); // Tigre
const BEL = logo('BEL', '1e40af', 'ffffff'); // Belgrano

export const BOCA_ID_MOCK = 451;

export const mockStandings: StandingRow[] = [
  { rank: 1,  team: { id: 451, name: 'Boca Juniors',       logo: BJ  }, points: 45, all: { played: 22, win: 14, draw: 3, lose: 5  } },
  { rank: 2,  team: { id: 452, name: 'River Plate',        logo: RP  }, points: 43, all: { played: 22, win: 13, draw: 4, lose: 5  } },
  { rank: 3,  team: { id: 435, name: 'Racing Club',        logo: RC  }, points: 40, all: { played: 22, win: 12, draw: 4, lose: 6  } },
  { rank: 4,  team: { id: 442, name: 'San Lorenzo',        logo: SL  }, points: 37, all: { played: 22, win: 11, draw: 4, lose: 7  } },
  { rank: 5,  team: { id: 455, name: 'Independiente',      logo: IND }, points: 35, all: { played: 22, win: 10, draw: 5, lose: 7  } },
  { rank: 6,  team: { id: 449, name: 'Talleres',           logo: TAL }, points: 33, all: { played: 22, win: 9,  draw: 6, lose: 7  } },
  { rank: 7,  team: { id: 436, name: 'Estudiantes',        logo: EST }, points: 32, all: { played: 22, win: 9,  draw: 5, lose: 8  } },
  { rank: 8,  team: { id: 437, name: 'Rosario Central',    logo: RCE }, points: 30, all: { played: 22, win: 8,  draw: 6, lose: 8  } },
  { rank: 9,  team: { id: 440, name: 'Vélez Sársfield',    logo: VEL }, points: 28, all: { played: 22, win: 7,  draw: 7, lose: 8  } },
  { rank: 10, team: { id: 441, name: 'Huracán',            logo: HUR }, points: 27, all: { played: 22, win: 7,  draw: 6, lose: 9  } },
  { rank: 11, team: { id: 453, name: 'Lanús',              logo: LAN }, points: 25, all: { played: 22, win: 6,  draw: 7, lose: 9  } },
  { rank: 12, team: { id: 444, name: 'Banfield',           logo: BAN }, points: 24, all: { played: 22, win: 6,  draw: 6, lose: 10 } },
  { rank: 13, team: { id: 447, name: 'Argentinos Juniors', logo: ARG }, points: 22, all: { played: 22, win: 5,  draw: 7, lose: 10 } },
  { rank: 14, team: { id: 454, name: "Newell's Old Boys",  logo: NOB }, points: 21, all: { played: 22, win: 5,  draw: 6, lose: 11 } },
  { rank: 15, team: { id: 486, name: 'Tigre',              logo: TIG }, points: 19, all: { played: 22, win: 4,  draw: 7, lose: 11 } },
  { rank: 16, team: { id: 481, name: 'Belgrano',           logo: BEL }, points: 18, all: { played: 22, win: 4,  draw: 6, lose: 12 } },
];

export const mockMatches: MatchResult[] = [
  {
    fixtureId: 1001,
    date: '2025-02-15T21:00:00+00:00',
    homeTeam: { id: 452, name: 'River Plate',  logo: RP,  winner: true  },
    awayTeam: { id: 451, name: 'Boca Juniors', logo: BJ,  winner: false },
    goalsHome: 2, goalsAway: 1,
    venueName: 'Estadio Monumental',
  },
  {
    fixtureId: 1002,
    date: '2025-02-08T20:00:00+00:00',
    homeTeam: { id: 451, name: 'Boca Juniors', logo: BJ,  winner: true  },
    awayTeam: { id: 449, name: 'Talleres',     logo: TAL, winner: false },
    goalsHome: 3, goalsAway: 0,
    venueName: 'La Bombonera',
  },
  {
    fixtureId: 1003,
    date: '2025-02-01T19:00:00+00:00',
    homeTeam: { id: 435, name: 'Racing Club',  logo: RC,  winner: null  },
    awayTeam: { id: 451, name: 'Boca Juniors', logo: BJ,  winner: null  },
    goalsHome: 1, goalsAway: 1,
    venueName: 'Estadio Presidente Perón',
  },
  {
    fixtureId: 1004,
    date: '2025-01-25T21:00:00+00:00',
    homeTeam: { id: 451, name: 'Boca Juniors',  logo: BJ,  winner: true  },
    awayTeam: { id: 455, name: 'Independiente', logo: IND, winner: false },
    goalsHome: 2, goalsAway: 0,
    venueName: 'La Bombonera',
  },
  {
    fixtureId: 1005,
    date: '2025-01-18T18:00:00+00:00',
    homeTeam: { id: 442, name: 'San Lorenzo',  logo: SL, winner: false },
    awayTeam: { id: 451, name: 'Boca Juniors', logo: BJ, winner: true  },
    goalsHome: 0, goalsAway: 1,
    venueName: 'Estadio Pedro Bidegain',
  },
  {
    fixtureId: 1006,
    date: '2025-01-11T17:00:00+00:00',
    homeTeam: { id: 451, name: 'Boca Juniors', logo: BJ,  winner: true  },
    awayTeam: { id: 441, name: 'Huracán',      logo: HUR, winner: false },
    goalsHome: 2, goalsAway: 0,
    venueName: 'La Bombonera',
  },
  {
    fixtureId: 1007,
    date: '2025-01-04T20:00:00+00:00',
    homeTeam: { id: 453, name: 'Lanús',        logo: LAN, winner: false },
    awayTeam: { id: 451, name: 'Boca Juniors', logo: BJ,  winner: true  },
    goalsHome: 0, goalsAway: 1,
    venueName: 'Estadio Ciudad de Lanús',
  },
  {
    fixtureId: 1008,
    date: '2024-12-22T21:00:00+00:00',
    homeTeam: { id: 451, name: 'Boca Juniors',   logo: BJ,  winner: null },
    awayTeam: { id: 440, name: 'Vélez Sársfield', logo: VEL, winner: null },
    goalsHome: 1, goalsAway: 1,
    venueName: 'La Bombonera',
  },
  {
    fixtureId: 1009,
    date: '2024-12-15T19:00:00+00:00',
    homeTeam: { id: 435, name: 'Racing Club',  logo: RC, winner: false },
    awayTeam: { id: 451, name: 'Boca Juniors', logo: BJ, winner: true  },
    goalsHome: 0, goalsAway: 2,
    venueName: 'Estadio Presidente Perón',
  },
];

const PLT = logo('PLT', '1e3a5f', 'ffffff'); // Platense
const DEF = logo('DEF', '1e3a5f', 'e5e7eb'); // Defensa y Justicia
const RIA = logo('RIA', 'dc2626', 'ffffff'); // Riestra
const GIM = logo('GIM', '1d4ed8', 'ffffff'); // Gimnasia

const boca = { id: 451, name: 'Boca Juniors', logo: BJ };

export const mockUpcomingMatches: ProximoPartido[] = [
  {
    fixtureId: 2001,
    date: '2026-02-22T21:00:00-03:00',
    time: '18:00',
    homeTeam: boca,
    awayTeam: { id: 440, name: 'Vélez Sársfield', logo: VEL },
    venueName: 'La Bombonera',
    competition: 'Liga Profesional',
  },
  {
    fixtureId: 2002,
    date: '2026-03-01T19:30:00-03:00',
    time: '16:30',
    homeTeam: { id: 437, name: 'Platense', logo: PLT },
    awayTeam: boca,
    venueName: 'Estadio Ciudad de Vicente López',
    competition: 'Liga Profesional',
  },
  {
    fixtureId: 2003,
    date: '2026-03-08T21:00:00-03:00',
    time: '18:00',
    homeTeam: boca,
    awayTeam: { id: 435, name: 'Racing Club', logo: RC },
    venueName: 'La Bombonera',
    competition: 'Copa Argentina',
  },
  {
    fixtureId: 2004,
    date: '2026-03-15T21:00:00-03:00',
    time: '18:00',
    homeTeam: { id: 452, name: 'River Plate', logo: RP },
    awayTeam: boca,
    venueName: 'Estadio Monumental',
    competition: 'Liga Profesional',
  },
  {
    fixtureId: 2005,
    date: '2026-03-22T19:00:00-03:00',
    time: '16:00',
    homeTeam: boca,
    awayTeam: { id: 455, name: 'Independiente', logo: IND },
    venueName: 'La Bombonera',
    competition: 'Liga Profesional',
  },
  {
    fixtureId: 2006,
    date: '2026-03-29T21:00:00-03:00',
    time: '18:00',
    homeTeam: { id: 481, name: 'Belgrano', logo: BEL },
    awayTeam: boca,
    venueName: 'Estadio Mario Kempes',
    competition: 'Liga Profesional',
  },
  {
    fixtureId: 2007,
    date: '2026-04-05T17:00:00-03:00',
    time: '14:00',
    homeTeam: boca,
    awayTeam: { id: 999, name: 'Defensa y Justicia', logo: DEF },
    venueName: 'La Bombonera',
    competition: 'Liga Profesional',
  },
  {
    fixtureId: 2008,
    date: '2026-04-12T21:00:00-03:00',
    time: '18:00',
    homeTeam: { id: 998, name: 'Riestra', logo: RIA },
    awayTeam: boca,
    venueName: 'Estadio Guillermo Laza',
    competition: 'Liga Profesional',
  },
  {
    fixtureId: 2009,
    date: '2026-04-19T21:00:00-03:00',
    time: '18:00',
    homeTeam: boca,
    awayTeam: { id: 442, name: 'San Lorenzo', logo: SL },
    venueName: 'La Bombonera',
    competition: 'Copa Argentina',
  },
  {
    fixtureId: 2010,
    date: '2026-04-26T19:00:00-03:00',
    time: '16:00',
    homeTeam: { id: 997, name: 'Gimnasia LP', logo: GIM },
    awayTeam: boca,
    venueName: 'Estadio Juan Carmelo Zerillo',
    competition: 'Liga Profesional',
  },
];

export const mockNoticias: Noticia[] = [
  {
    id: 1,
    titulo: 'Boca confirmó a sus lesionados para el próximo partido',
    imagen: 'https://picsum.photos/seed/boca1/600/340',
    categoria: 'informe',
    fecha: '2026-02-22',
  },
  {
    id: 2,
    titulo: 'Continúa la novela de Dybala: ¿llega a La Bombonera?',
    imagen: 'https://picsum.photos/seed/boca2/600/340',
    categoria: 'mercado',
    fecha: '2026-02-21',
  },
  {
    id: 3,
    titulo: 'Se cayó el pase de Cetré al fútbol europeo',
    imagen: 'https://picsum.photos/seed/boca3/600/340',
    categoria: 'mercado',
    fecha: '2026-02-20',
  },
  {
    id: 4,
    titulo: 'Merentiel, el goleador que Boca necesita en este semestre',
    imagen: 'https://picsum.photos/seed/boca4/600/340',
    categoria: 'informe',
    fecha: '2026-02-19',
  },
  {
    id: 5,
    titulo: 'Análisis táctico: la defensa de Boca bajo la lupa',
    imagen: 'https://picsum.photos/seed/boca5/600/340',
    categoria: 'informe',
    fecha: '2026-02-18',
  },
  {
    id: 6,
    titulo: 'Cavani negocia extender su contrato con el club',
    imagen: 'https://picsum.photos/seed/boca6/600/340',
    categoria: 'mercado',
    fecha: '2026-02-17',
  },
];
