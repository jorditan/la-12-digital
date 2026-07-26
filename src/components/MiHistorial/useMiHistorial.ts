import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useMatchAttendance } from '@/hooks/useMatchAttendance';
import { fetchMatchesForHistorial, BOCA_ID } from '@/services/apifootball';
import type { MatchResult } from '@/services/apifootball';
import type { AuthUser, AsyncState } from '@/types/attendance';

// ── Pure helpers ──────────────────────────────────────────────────────────────

export type ResultadoTipo = 'victoria' | 'derrota' | 'empate';

export const getResultado = (match: MatchResult): ResultadoTipo => {
  const bocaIsHome = match.homeTeam.id === BOCA_ID;
  const bocaGoals = bocaIsHome ? match.goalsHome : match.goalsAway;
  const rivalGoals = bocaIsHome ? match.goalsAway : match.goalsHome;
  
  if (bocaGoals === null || rivalGoals === null) return 'empate';
  if (bocaGoals > rivalGoals) return 'victoria';
  if (bocaGoals < rivalGoals) return 'derrota';
  return 'empate';
};

export const ROW_STYLE: Record<ResultadoTipo, string> = {
  victoria: 'border-l-2 border-l-green-400 bg-green-500/[0.08]',
  derrota: 'border-l-2 border-l-red-400 bg-red-500/[0.08]',
  empate: 'border-l-2 border-l-slate-400 bg-slate-500/[0.08]',
};

export const formatOptionLabel = (match: MatchResult): string => {
  const dateStr = new Date(match.date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const bocaIsHome = match.homeTeam.id === BOCA_ID;
  const rival = bocaIsHome ? match.awayTeam.name : match.homeTeam.name;
  const bocaGoals = bocaIsHome ? match.goalsHome : match.goalsAway;
  const rivalGoals = bocaIsHome ? match.goalsAway : match.goalsHome;
  const score = bocaGoals !== null && rivalGoals !== null ? ` ${bocaGoals}-${rivalGoals}` : '';
  const comp = match.competition ?? '';
  return `${dateStr} · Boca${score} vs ${rival} · ${comp}`;
};

export const getRivalName = (match: MatchResult): string => {
  const bocaIsHome = match.homeTeam.id === BOCA_ID;
  return bocaIsHome ? match.awayTeam.name : match.homeTeam.name;
};

export const formatTableDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

export const formatFullDate = (dateStr: string): string => {
  if (!dateStr) return '–';
  
  // Si ya tiene formato DD/MM/AAAA, lo devolvemos tal cual
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

  // Extraemos solo la parte de la fecha (YYYY-MM-DD) por si viene con hora/ISO
  const isoDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  
  const d = new Date(isoDate + "T12:00:00");
  
  if (isNaN(d.getTime())) {
    // Si falla, intentamos parsear la fecha cruda
    const fallback = new Date(dateStr);
    if (isNaN(fallback.getTime())) return dateStr; // Si todo falla, devolvemos el string original
    return fallback.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getEarliestYear = (map: Record<string, { createdAt: string }>): number | null => {
  const entries = Object.values(map);
  if (!entries.length) return null;
  return Math.min(...entries.map((e) => new Date(e.createdAt).getFullYear()));
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useMiHistorial = (user: AuthUser) => {
  const { attendanceMap, upsert, remove } = useMatchAttendance(user.id);
  const [apiMatches, setApiMatches] = useState<MatchResult[]>([]);
  const [dbMatches, setDbMatches] = useState<MatchResult[]>([]);
  const [matchEstado, setMatchEstado] = useState<AsyncState>('loading');
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [successMatchId, setSuccessMatchId] = useState<string | null>(null);

  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchesForHistorial()
      .then((data) => {
        setApiMatches(data);
        if (matchEstado === 'loading') setMatchEstado('ok');
      })
      .catch(() => setMatchEstado('error'));
  }, []);

  useEffect(() => {
    const attendedIds = Object.keys(attendanceMap);
    if (attendedIds.length === 0) return;

    supabase
      .from('matches')
      .select('*')
      .in('id', attendedIds)
      .then(({ data, error }) => {
        if (error) return;
        const mapped: MatchResult[] = (data || []).map((m) => {
          const cleanTeamId = (id: string | number) => isNaN(Number(id)) ? id : Number(id);
          return {
            fixtureId: isNaN(parseInt(m.id)) ? 0 : parseInt(m.id),
            date: m.date,
            homeTeam: { id: cleanTeamId(m.home_team_id), name: m.home_team_name, logo: m.home_team_logo, winner: null },
            awayTeam: { id: cleanTeamId(m.away_team_id), name: m.away_team_name, logo: m.away_team_logo, winner: null },
            goalsHome: m.goals_home,
            goalsAway: m.goals_away,
            venueName: m.venue || '',
            competition: m.competition || undefined,
            _manualId: m.id,
          } as MatchResult & { _manualId?: string };
        });
        setDbMatches(mapped);
      });
  }, [attendanceMap]);

  const allMatchesMap = new Map<string, MatchResult>();
  dbMatches.forEach(m => allMatchesMap.set((m as any)._manualId || m.fixtureId.toString(), m));
  apiMatches.forEach(m => allMatchesMap.set(m.fixtureId.toString(), m));
  const matches = Array.from(allMatchesMap.values());

  const attendedEntries = Object.values(attendanceMap)
    .filter((a) => a.attended)
    .sort((a, b) => {
      const matchA = allMatchesMap.get(a.matchId);
      const matchB = allMatchesMap.get(b.matchId);
      const dateA = matchA ? new Date(matchA.date).getTime() : new Date(a.createdAt).getTime();
      const dateB = matchB ? new Date(matchB.date).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  const totalAttended = attendedEntries.length;
  const earliestYear = getEarliestYear(attendanceMap);
  const availableMatches = matches.filter((m) => !attendanceMap[(m as any)._manualId || m.fixtureId.toString()]?.attended);

  const availableCompetitions = [
    ...new Set(
      attendedEntries
        .map((entry) => allMatchesMap.get(entry.matchId)?.competition)
        .filter((c): c is string => !!c)
    ),
  ].sort();

  const filteredEntries = attendedEntries.filter((entry) => {
    const match = allMatchesMap.get(entry.matchId);
    if (selectedCompetitions.length > 0) {
      if (!match?.competition || !selectedCompetitions.includes(match.competition)) return false;
    }
    if (match?.date) {
      const matchDay = match.date.slice(0, 10);
      if (dateFrom && matchDay < dateFrom) return false;
      if (dateTo && matchDay > dateTo) return false;
    }
    return true;
  });

  const hasActiveFilters = selectedCompetitions.length > 0 || !!dateFrom || !!dateTo;
  const clearFilters = () => {
    setSelectedCompetitions([]);
    setDateFrom(null);
    setDateTo(null);
  };

  const handleMarkAttendance = async () => {
    if (!selectedMatchId) return;
    const match = matches.find((m) => ((m as any)._manualId || m.fixtureId.toString()) === selectedMatchId);
    if (!match) return;

    setAdding(true);
    try {
      await upsert({
        matchId: selectedMatchId,
        attended: true,
        matchData: {
          date: match.date,
          homeTeamId: match.homeTeam.id,
          homeTeamName: match.homeTeam.name,
          homeTeamLogo: match.homeTeam.logo,
          awayTeamId: match.awayTeam.id,
          awayTeamName: match.awayTeam.name,
          awayTeamLogo: match.awayTeam.logo,
          goalsHome: match.goalsHome,
          goalsAway: match.goalsAway,
          competition: match.competition,
        },
      });
      setSuccessMatchId(selectedMatchId);
      setJustAdded(selectedMatchId);
      setSelectedMatchId('');
      setTimeout(() => setSuccessMatchId(null), 2000);
      setTimeout(() => setJustAdded(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateNote = async (matchId: string, note: string | null) => {
    const match = matches.find((m) => ((m as any)._manualId || m.fixtureId.toString()) === matchId);
    if (!match) return;

    await upsert({
      matchId,
      attended: true,
      note,
      matchData: {
        date: match.date,
        homeTeamId: match.homeTeam.id,
        homeTeamName: match.homeTeam.name,
        homeTeamLogo: match.homeTeam.logo,
        awayTeamId: match.awayTeam.id,
        awayTeamName: match.awayTeam.name,
        awayTeamLogo: match.awayTeam.logo,
        goalsHome: match.goalsHome,
        goalsAway: match.goalsAway,
        competition: match.competition,
      },
    });
  };

  const stats = attendedEntries.reduce(
    (acc, entry) => {
      const match = allMatchesMap.get(entry.matchId);
      if (!match) return acc;

      const resultado = getResultado(match);
      if (resultado === 'victoria') acc.victorias++;
      else if (resultado === 'empate') acc.empates++;
      else if (resultado === 'derrota') acc.derrotas++;

      const bocaIsHome = match.homeTeam.id === BOCA_ID;
      const bocaGoals = bocaIsHome ? match.goalsHome : match.goalsAway;
      const rivalGoals = bocaIsHome ? match.goalsAway : match.goalsHome;

      if (bocaGoals !== null) acc.golesFavor += bocaGoals;
      if (rivalGoals !== null) acc.golesContra += rivalGoals;

      return acc;
    },
    { victorias: 0, empates: 0, derrotas: 0, golesFavor: 0, golesContra: 0 }
  );

  const puntosObtenidos = stats.victorias * 3 + stats.empates * 1;
  const puntosPosibles = totalAttended * 3;
  const efectividad = puntosPosibles > 0 ? Math.round((puntosObtenidos / puntosPosibles) * 100) : 0;

  return {
    matches,
    matchEstado,
    selectedMatchId,
    setSelectedMatchId,
    adding,
    justAdded,
    successMatchId,
    attendedEntries,
    filteredEntries,
    totalAttended,
    earliestYear,
    stats,
    efectividad,
    availableMatches,
    availableCompetitions,
    selectedCompetitions,
    setSelectedCompetitions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    hasActiveFilters,
    clearFilters,
    handleMarkAttendance,
    handleUpdateNote,
    remove,
    upsert,
  };
};
