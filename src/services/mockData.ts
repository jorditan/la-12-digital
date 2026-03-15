/**
 * MOCK DATA - LA 12 DIGITAL
 * Datos de fallback para cuando las APIs externas fallan.
 * Usados por sportsdbService.ts como respaldo.
 */

import type { StandingRow, MatchResult, ProximoPartido } from './apifootball';

export const mockStandings: StandingRow[] = [
  {
    rank: 1,
    team: { id: 451, name: 'Boca Juniors', logo: 'https://www.thesportsdb.com/images/media/team/badge/vwpvry1473504001.png' },
    points: 30,
    all: { played: 15, win: 9, draw: 3, lose: 3 },
  },
  {
    rank: 2,
    team: { id: 452, name: 'River Plate', logo: 'https://www.thesportsdb.com/images/media/team/badge/xvpvry1473504001.png' },
    points: 28,
    all: { played: 15, win: 8, draw: 4, lose: 3 },
  },
];

export const mockMatches: MatchResult[] = [
  {
    fixtureId: 1001,
    date: new Date().toISOString(),
    homeTeam: { id: 451, name: 'Boca Juniors', logo: 'https://www.thesportsdb.com/images/media/team/badge/vwpvry1473504001.png', winner: true },
    awayTeam: { id: 452, name: 'River Plate', logo: 'https://www.thesportsdb.com/images/media/team/badge/xvpvry1473504001.png', winner: false },
    goalsHome: 2,
    goalsAway: 1,
    venueName: 'La Bombonera',
  },
];

export const mockUpcomingMatches: ProximoPartido[] = [
  {
    fixtureId: 2001,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '21:00',
    homeTeam: { id: 451, name: 'Boca Juniors', logo: 'https://www.thesportsdb.com/images/media/team/badge/vwpvry1473504001.png' },
    awayTeam: { id: 453, name: 'San Lorenzo', logo: '' },
    venueName: 'La Bombonera',
    competition: 'Liga Profesional',
    rivalApiId: 453,
  },
];
