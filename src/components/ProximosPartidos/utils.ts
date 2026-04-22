import { BOCA_ID, type ProximoPartido } from "../../services/apifootball";
import type { H2HMatch } from "../../services/footballApiService";
import {
  formatIsoDateEsArLong,
  formatIsoDateEsArNumeric,
  formatIsoDateEsArShort,
  formatIsoWeekdayEsArShort,
  getDaysUntilIsoDate,
} from "../../lib/date";

export const RESULT_CFG = {
  win: {
    bg: "bg-status-win-subtle",
    border: "border-status-win/25",
    text: "text-status-win",
    dot: "bg-status-win",
    label: "G",
  },
  draw: {
    bg: "bg-status-draw-subtle",
    border: "border-status-draw/25",
    text: "text-status-draw",
    dot: "bg-status-draw",
    label: "E",
  },
  loss: {
    bg: "bg-status-loss-subtle",
    border: "border-status-loss/25",
    text: "text-status-loss",
    dot: "bg-status-loss",
    label: "P",
  },
} as const;

export function formatFechaLarga(isoDate: string): string {
  return formatIsoDateEsArLong(isoDate);
}

export function formatFechaCorta(isoDate: string): string {
  return formatIsoDateEsArShort(isoDate);
}

export function formatDia(isoDate: string): string {
  return formatIsoWeekdayEsArShort(isoDate);
}

export function formatH2HDate(isoDate: string): string {
  return formatIsoDateEsArNumeric(isoDate);
}

export function formatH2HScore(match: H2HMatch): string {
  return match.homeScore !== null && match.awayScore !== null
    ? `${match.homeScore} – ${match.awayScore}`
    : "– – –";
}

export function getDaysUntil(isoDate: string): number {
  return getDaysUntilIsoDate(isoDate);
}

export function getCardBorderClass(isUrgent: boolean): string {
  return isUrgent
    ? "border-boca-gold/40 hover:border-boca-gold/60"
    : "border-boca-gold/10 hover:border-boca-gold/25";
}

export function getTableRowClass(index: number): string {
  return [
    "border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]",
    index % 2 !== 0 ? "bg-white/[0.02]" : "",
  ].join(" ");
}

export function isFinishedH2HResult(
  match: H2HMatch,
): match is H2HMatch & { result: "win" | "draw" | "loss" } {
  return (
    match.result === "win" || match.result === "draw" || match.result === "loss"
  );
}

export function getFixtureTeams(partido: ProximoPartido) {
  const bocaEsLocal = partido.homeTeam.id === BOCA_ID;
  return {
    bocaEsLocal,
    boca: bocaEsLocal ? partido.homeTeam : partido.awayTeam,
    rival: bocaEsLocal ? partido.awayTeam : partido.homeTeam,
  };
}
