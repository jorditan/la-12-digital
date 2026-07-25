import type { ProcessedFixture, Squad, Player } from '../types/football';
import type { StandingData, AnnualStandingData, H2HMatch } from '../types/footballApi';
export type { StandingData, AnnualStandingData, H2HMatch };
import { supabase } from '../lib/supabase';
import {
  BOCA_ID,
  BOCA_RE,
  getTeamLogoUrl,
  reconstructStages,
  hashStringToNumber,
  mapLeagueStandings,
  mapLibertadoresStandings,
  mapAnnualStandings,
  matchResult
} from './footballApiHelpers';

const COMPETITION = '23'; // Liga Profesional Argentina
const LIBERTADORES_COMPETITION = '329'; // Copa Libertadores
const SUDAMERICANA_COMPETITION = '11'; // Copa Sudamericana

/**
 * Obtiene los últimos partidos finalizados de Boca Juniors en la liga local.
 */
export const getLastFixtures = async (count = 8): Promise<ProcessedFixture[]> => {
  const { data: dbMatches, error } = await supabase
    .from('ls_fixtures')
    .select('*')
    .in('competition_id', [23, 14])
    .eq('status', 'finished')
    .or(`home_team_id.eq.${BOCA_ID},away_team_id.eq.${BOCA_ID}`)
    .order('date', { ascending: false })
    .limit(count);

  if (error) throw error;

  return dbMatches.map((m: any) => {
    const isBocaHome = String(m.home_team_id) === BOCA_ID || BOCA_RE.test(m.home_team);
    const scoreHome = m.home_score;
    const scoreAway = m.away_score;
    return {
      id: isNaN(Number(m.id)) ? hashStringToNumber(String(m.id)) : Number(m.id),
      date: new Date(m.date),
      homeTeam: m.home_team,
      awayTeam: m.away_team,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      homeLogo: getTeamLogoUrl(m.home_team_id),
      awayLogo: getTeamLogoUrl(m.away_team_id),
      homeScore: scoreHome,
      awayScore: scoreAway,
      isBocaHome,
      result: matchResult(scoreHome, scoreAway, isBocaHome),
      status: 'finished',
      venue: m.venue || '',
      competitionId: m.competition_id
    };
  });
};

/**
 * Obtiene los próximos partidos programados (schedules) de Boca Juniors en la liga local.
 */
export const getNextFixtures = async (count = 8): Promise<ProcessedFixture[]> => {
  const { data: dbFixtures, error } = await supabase
    .from('ls_fixtures')
    .select('*')
    .in('competition_id', [23, 14])
    .eq('status', 'scheduled')
    .or(`home_team_id.eq.${BOCA_ID},away_team_id.eq.${BOCA_ID}`)
    .order('date', { ascending: true })
    .limit(count);

  if (error) throw error;

  return dbFixtures.map((f: any) => {
    const isBocaHome = String(f.home_team_id) === BOCA_ID || BOCA_RE.test(f.home_team);
    return {
      id: isNaN(Number(f.id)) ? hashStringToNumber(String(f.id)) : Number(f.id),
      date: new Date(f.date),
      homeTeam: f.home_team,
      awayTeam: f.away_team,
      homeTeamId: f.home_team_id,
      awayTeamId: f.away_team_id,
      homeLogo: getTeamLogoUrl(f.home_team_id),
      awayLogo: getTeamLogoUrl(f.away_team_id),
      homeScore: null,
      awayScore: null,
      isBocaHome,
      result: 'scheduled',
      status: 'scheduled',
      venue: f.venue || '',
      competitionId: f.competition_id
    };
  });
};

/**
 * Obtiene el historial de enfrentamientos cara a cara (H2H) de Boca Juniors contra el rival seleccionado.
 */
export const fetchHeadToHead = async (rivalApiId: number | string): Promise<H2HMatch[]> => {
  const { data: dbH2H, error } = await supabase
    .from('ls_h2h')
    .select('*')
    .eq('rival_id', String(rivalApiId))
    .maybeSingle();

  if (error) throw error;
  if (!dbH2H) return [];

  const rawMatches = dbH2H.last_matches || [];
  const mapped = rawMatches.map((m: any) => {
    const isBocaHome = m.home_team.toLowerCase().includes('boca');
    const scoreHome = m.home_score;
    const scoreAway = m.away_score;
    return {
      date: new Date(m.date).toISOString(),
      homeTeam: m.home_team,
      awayTeam: m.away_team,
      homeScore: scoreHome,
      awayScore: scoreAway,
      result: matchResult(scoreHome, scoreAway, isBocaHome),
      competition: m.competition || 'Liga Profesional',
    };
  });

  return mapped.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
};

/**
 * Obtiene las tablas de posiciones del torneo de liga local.
 */
export const getStandingsData = async (): Promise<StandingData[]> => {
  const { data: dbRows, error } = await supabase
    .from('ls_standings')
    .select('*')
    .eq('competition_id', Number(COMPETITION))
    .order('rank', { ascending: true });

  if (error) throw error;

  const data = reconstructStages(dbRows, Number(COMPETITION));
  return mapLeagueStandings(data);
};

/**
 * Obtiene los últimos partidos jugados por Boca Juniors en la Copa Libertadores.
 */
export const getLibertadoresLastFixtures = async (count = 8): Promise<ProcessedFixture[]> => {
  const { data: dbMatches, error } = await supabase
    .from('ls_fixtures')
    .select('*')
    .in('competition_id', [329, 11])
    .eq('status', 'finished')
    .or(`home_team_id.eq.${BOCA_ID},away_team_id.eq.${BOCA_ID}`)
    .order('date', { ascending: false })
    .limit(count);

  if (error) throw error;

  return dbMatches.map((m: any) => {
    const isBocaHome = String(m.home_team_id) === BOCA_ID || BOCA_RE.test(m.home_team);
    const scoreHome = m.home_score;
    const scoreAway = m.away_score;
    return {
      id: isNaN(Number(m.id)) ? hashStringToNumber(String(m.id)) : Number(m.id),
      date: new Date(m.date),
      homeTeam: m.home_team,
      awayTeam: m.away_team,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      homeLogo: getTeamLogoUrl(m.home_team_id),
      awayLogo: getTeamLogoUrl(m.away_team_id),
      homeScore: scoreHome,
      awayScore: scoreAway,
      isBocaHome,
      result: matchResult(scoreHome, scoreAway, isBocaHome),
      status: 'finished',
      venue: m.venue || '',
      competitionId: m.competition_id
    };
  });
};

/**
 * Obtiene los próximos partidos programados de Boca Juniors en la Copa Libertadores.
 */
export const getLibertadoresNextFixtures = async (count = 8): Promise<ProcessedFixture[]> => {
  const { data: dbFixtures, error } = await supabase
    .from('ls_fixtures')
    .select('*')
    .in('competition_id', [329, 11])
    .eq('status', 'scheduled')
    .or(`home_team_id.eq.${BOCA_ID},away_team_id.eq.${BOCA_ID}`)
    .order('date', { ascending: true })
    .limit(count);

  if (error) throw error;

  return dbFixtures.map((f: any) => {
    const isBocaHome = String(f.home_team_id) === BOCA_ID || BOCA_RE.test(f.home_team);
    return {
      id: isNaN(Number(f.id)) ? hashStringToNumber(String(f.id)) : Number(f.id),
      date: new Date(f.date),
      homeTeam: f.home_team,
      awayTeam: f.away_team,
      homeTeamId: f.home_team_id,
      awayTeamId: f.away_team_id,
      homeLogo: getTeamLogoUrl(f.home_team_id),
      awayLogo: getTeamLogoUrl(f.away_team_id),
      homeScore: null,
      awayScore: null,
      isBocaHome,
      result: 'scheduled',
      status: 'scheduled',
      venue: f.venue || '',
      competitionId: f.competition_id
    };
  });
};

/**
 * Obtiene las tablas de posiciones de la fase de grupos de la Copa Libertadores.
 */
export const getLibertadoresStandingsData = async (): Promise<StandingData[]> => {
  const { data: dbRows, error } = await supabase
    .from('ls_standings')
    .select('*')
    .eq('competition_id', Number(LIBERTADORES_COMPETITION))
    .order('rank', { ascending: true });

  if (error) throw error;

  const data = reconstructStages(dbRows, Number(LIBERTADORES_COMPETITION));
  return mapLibertadoresStandings(data);
};

/**
 * Obtiene las tablas de posiciones de la fase de grupos de la Copa Sudamericana.
 */
export const getSudamericanaStandingsData = async (): Promise<StandingData[]> => {
  const { data: dbRows, error } = await supabase
    .from('ls_standings')
    .select('*')
    .eq('competition_id', Number(SUDAMERICANA_COMPETITION))
    .order('rank', { ascending: true });

  if (error) throw error;

  const data = reconstructStages(dbRows, Number(SUDAMERICANA_COMPETITION));
  return mapLibertadoresStandings(data);
};

/**
 * Obtiene la tabla anual acumulativa de puntos.
 */
export const getAnnualStandingsData = async (): Promise<AnnualStandingData[]> => {
  const { data: dbRows, error } = await supabase
    .from('ls_standings')
    .select('*')
    .eq('competition_id', Number(COMPETITION))
    .order('rank', { ascending: true });

  if (error) throw error;

  const data = reconstructStages(dbRows, Number(COMPETITION));
  return mapAnnualStandings(data);
};

/**
 * Obtiene el plantel y staff técnico del equipo especificado (Boca Juniors por defecto).
 */
export const getTeamSquad = async (teamId = BOCA_ID): Promise<Squad> => {
  const { data: dbSquad, error } = await supabase
    .from('ls_squad')
    .select('*')
    .eq('team_id', teamId)
    .order('is_staff', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;

  const players: Player[] = dbSquad.map((p: any) => {
    const nameParts = p.name.trim().split(/\s+/);
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';
    const nationality = 'Argentina';

    return {
      id: Number(p.id),
      name: p.name,
      firstname,
      lastname,
      age: Number(p.age) || 0,
      birth: {
        date: p.birthdate ? p.birthdate.split('/').reverse().join('-') : '',
        place: '',
        country: nationality
      },
      nationality,
      height: String(p.height || ''),
      weight: String(p.weight || ''),
      injured: false,
      photo: ''
    };
  });

  return {
    team: {
      id: Number(teamId) || 0,
      name: teamId === BOCA_ID ? 'Boca Juniors' : 'Rival Team',
      logo: getTeamLogoUrl(teamId)
    },
    players
  };
};
