import { useState, useEffect } from "react";
import { useMatchAttendance } from "@/hooks/useMatchAttendance";
import { fetchMatchesForHistorial, BOCA_ID } from "@/services/apifootball";
import type { MatchResult } from "@/services/apifootball";
import type { AuthUser, AsyncState } from "@/types/attendance";

// ── Pure helpers ──────────────────────────────────────────────────────────────

export const formatOptionLabel = (match: MatchResult): string => {
  const dateStr = new Date(match.date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const bocaIsHome = match.homeTeam.id === BOCA_ID;
  const rival = bocaIsHome ? match.awayTeam.name : match.homeTeam.name;
  const bocaGoals = bocaIsHome ? match.goalsHome : match.goalsAway;
  const rivalGoals = bocaIsHome ? match.goalsAway : match.goalsHome;
  const score =
    bocaGoals !== null && rivalGoals !== null
      ? ` ${bocaGoals}-${rivalGoals}`
      : "";
  const comp = match.competition ?? "";
  return `${dateStr} · Boca${score} vs ${rival} · ${comp}`;
};

export const getResultBadge = (
  match: MatchResult,
): { label: string; cls: string } => {
  const bocaIsHome = match.homeTeam.id === BOCA_ID;
  const bocaGoals = bocaIsHome ? match.goalsHome : match.goalsAway;
  const rivalGoals = bocaIsHome ? match.goalsAway : match.goalsHome;
  if (bocaGoals === null || rivalGoals === null) {
    return { label: "–", cls: "bg-boca-blue-mid text-text-muted" };
  }
  if (bocaGoals > rivalGoals) {
    return {
      label: `${bocaGoals}–${rivalGoals}`,
      cls: "bg-status-win text-[#4ade80]",
    };
  }
  if (bocaGoals < rivalGoals) {
    return {
      label: `${bocaGoals}–${rivalGoals}`,
      cls: "bg-status-loss text-[#fca5a5]",
    };
  }
  return {
    label: `${bocaGoals}–${rivalGoals}`,
    cls: "bg-status-draw text-[#94a3b8]",
  };
};

export const getRivalName = (match: MatchResult): string => {
  const bocaIsHome = match.homeTeam.id === BOCA_ID;
  return bocaIsHome ? match.awayTeam.name : match.homeTeam.name;
};

export const formatTableDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getEarliestYear = (
  map: Record<string, { createdAt: string }>,
): number | null => {
  const entries = Object.values(map);
  if (!entries.length) return null;
  return Math.min(...entries.map((e) => new Date(e.createdAt).getFullYear()));
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useMiHistorial = (user: AuthUser) => {
  const { attendanceMap, upsert, remove } = useMatchAttendance(user.id);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchEstado, setMatchEstado] = useState<AsyncState>("loading");
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [successMatchId, setSuccessMatchId] = useState<string | null>(null);

  // ── Filters ──
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>(
    [],
  );
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchesForHistorial()
      .then((data) => {
        setMatches(data);
        setMatchEstado("ok");
      })
      .catch(() => setMatchEstado("error"));
  }, []);

  const attendedEntries = Object.values(attendanceMap)
    .filter((a) => a.attended)
    .sort((a, b) => {
      const matchA = matches.find((m) => m.fixtureId.toString() === a.matchId);
      const matchB = matches.find((m) => m.fixtureId.toString() === b.matchId);
      const dateA = matchA
        ? new Date(matchA.date).getTime()
        : new Date(a.createdAt).getTime();
      const dateB = matchB
        ? new Date(matchB.date).getTime()
        : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  const totalAttended = attendedEntries.length;
  const earliestYear = getEarliestYear(attendanceMap);
  const availableMatches = matches.filter(
    (m) => !attendanceMap[m.fixtureId.toString()]?.attended,
  );

  // Unique competitions from attended entries (sorted)
  const availableCompetitions = [
    ...new Set(
      attendedEntries
        .map(
          (entry) =>
            matches.find((m) => m.fixtureId.toString() === entry.matchId)
              ?.competition,
        )
        .filter((c): c is string => !!c),
    ),
  ].sort();

  // Apply filters to attended entries
  const filteredEntries = attendedEntries.filter((entry) => {
    const match = matches.find((m) => m.fixtureId.toString() === entry.matchId);

    if (selectedCompetitions.length > 0) {
      if (
        !match?.competition ||
        !selectedCompetitions.includes(match.competition)
      )
        return false;
    }

    if (match?.date) {
      const matchDay = match.date.slice(0, 10); // YYYY-MM-DD
      if (dateFrom && matchDay < dateFrom) return false;
      if (dateTo && matchDay > dateTo) return false;
    }

    return true;
  });

  const hasActiveFilters =
    selectedCompetitions.length > 0 || !!dateFrom || !!dateTo;

  const clearFilters = () => {
    setSelectedCompetitions([]);
    setDateFrom(null);
    setDateTo(null);
  };

  const handleMarkAttendance = async () => {
    if (!selectedMatchId || adding) return;
    setAdding(true);
    setSuccessMatchId(null);
    try {
      const match = matches.find(
        (m) => m.fixtureId.toString() === selectedMatchId,
      );
      await upsert({
        matchId: selectedMatchId,
        attended: true,
        matchData: match
          ? {
              date: match.date,
              homeTeamId: match.homeTeam.id,
              homeTeamName: match.homeTeam.name,
              homeTeamLogo: match.homeTeam.logo,
              awayTeamId: match.awayTeam.id,
              awayTeamName: match.awayTeam.name,
              awayTeamLogo: match.awayTeam.logo,
              goalsHome: match.goalsHome,
              goalsAway: match.goalsAway,
              venue: match.venueName,
              competition: match.competition,
            }
          : undefined,
      });
      setJustAdded(selectedMatchId);
      setSuccessMatchId(selectedMatchId);
      setSelectedMatchId("");
      setTimeout(() => setSuccessMatchId(null), 2000);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateNote = async (matchId: string, note: string | null) => {
    const existing = attendanceMap[matchId];
    if (existing) await upsert({ matchId, attended: existing.attended, note });
  };

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
  };
};
