import { useEffect, useRef } from "react";
import { Trash2, PenLine, Plus } from "lucide-react";
import { BOCA_ID } from "@/services/apifootball";
import type { MatchResult } from "@/services/apifootball";
import { Button } from "../ui/Button";
import {
  getRivalName,
  getResultBadge,
  formatTableDate,
} from "./useMiHistorial";

interface AttendanceRowProps {
  matchId: string;
  match: MatchResult | undefined;
  note: string | null;
  isNew: boolean;
  onOpenNoteModal: (
    matchId: string,
    note: string | null,
    label: string,
  ) => void;
  onOpenDeleteModal: (
    matchId: string,
    rival: string,
    matchDate: string,
  ) => void;
}

export const AttendanceRow = ({
  matchId,
  match,
  note,
  isNew,
  onOpenNoteModal,
  onOpenDeleteModal,
}: AttendanceRowProps) => {
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (isNew && rowRef.current) {
      const el = rowRef.current;
      el.classList.add("animate-gold-pulse");
      const t = setTimeout(
        () => el.classList.remove("animate-gold-pulse"),
        900,
      );
      return () => clearTimeout(t);
    }
  }, [isNew]);

  if (!match) {
    return (
      <tr className="border-b border-boca-border/40">
        <td
          colSpan={6}
          className="px-3 py-2 type-caption text-text-muted/50 italic"
        >
          Partido #{matchId}
        </td>
      </tr>
    );
  }

  const rival = getRivalName(match);
  const badge = getResultBadge(match);
  const matchDate = formatTableDate(match.date);
  const label = `Boca vs ${rival} · ${matchDate}`;

  return (
    <tr
      ref={rowRef}
      className={[
        "border-b border-boca-border/40 group transition-colors hover:bg-boca-blue-mid/40",
        isNew ? "animate-slide-in-row" : "",
      ].join(" ")}
    >
      {/* Fecha */}
      <td className="px-3 py-3 type-caption text-text-muted whitespace-nowrap">
        {matchDate}
      </td>

      {/* Rival */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <img
            src={
              match.homeTeam.id === BOCA_ID
                ? match.awayTeam.logo
                : match.homeTeam.logo
            }
            alt={rival}
            className="w-4 h-4 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="type-caption text-text-nav truncate max-w-[120px]">
            {rival}
          </span>
        </div>
      </td>

      {/* Resultado */}
      <td className="px-3 py-3">
        <span
          className={`inline-block type-caption font-bold tabular-nums px-2 py-0.5 rounded-sm ${badge.cls}`}
        >
          {badge.label}
        </span>
      </td>

      {/* Competencia */}
      <td className="px-3 py-3 type-caption text-text-muted hidden sm:table-cell truncate max-w-[100px]">
        {match.competition ?? "–"}
      </td>

      {/* Nota */}
      <td className="px-3 py-3 max-w-[160px]">
        <Button
          type="button"
          onClick={() => onOpenNoteModal(matchId, note, label)}
          variant="ghost"
          className="w-full justify-start text-left group/note"
          title={note ? "Editar nota" : "Añadir nota"}
        >
          {note ? (
            <>
              <span className="type-caption italic text-text-muted truncate flex-1">
                "{note}"
              </span>
              <PenLine
                size={12}
                className="shrink-0 text-text-muted/30 group-hover/note:text-boca-gold transition-colors"
              />
            </>
          ) : (
            <span className="flex items-center gap-1 type-caption text-text-muted/40 group-hover/note:text-boca-gold transition-colors">
              <Plus size={12} />
              Añadir nota
            </span>
          )}
        </Button>
      </td>

      {/* Eliminar */}
      <td className="px-3 py-3 text-right">
        <Button
          type="button"
          onClick={() => onOpenDeleteModal(matchId, rival, matchDate)}
          variant="ghost"
          size="icon"
          className="opacity-30 sm:opacity-0 group-hover:opacity-60 hover:!opacity-100 text-text-muted hover:text-[#fca5a5]"
          title="Eliminar partido"
          aria-label="Eliminar partido"
        >
          <Trash2 size={14} />
        </Button>
      </td>
    </tr>
  );
};
