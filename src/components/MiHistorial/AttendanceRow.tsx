import { useEffect, useRef } from "react";
import { Trash2, PenLine, Edit3, Plus } from "lucide-react";
import { BOCA_ID } from "@/services/apifootball";
import type { MatchResult } from "@/services/apifootball";
import { Button } from "../ui/Button";
import { TeamLogo } from "../ui/TeamLogo";
import { Tooltip } from "../ui/Tooltip";
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
  onOpenEditModal: (match: MatchResult) => void;
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
  onOpenEditModal,
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
  const rivalLogo = match.homeTeam.id === BOCA_ID ? match.awayTeam.logo : match.homeTeam.logo;

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
          <TeamLogo 
            src={rivalLogo} 
            alt={rival} 
            size={18} 
            className="shrink-0" 
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
        <Tooltip content="Editar nota" position="top">
          <Button
            type="button"
            onClick={() => onOpenNoteModal(matchId, note, label)}
            variant="ghost"
            className="w-full justify-start text-left group/note"
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
        </Tooltip>
      </td>

      {/* Acciones */}
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Tooltip content="Editar partido" position="top">
            <Button
              type="button"
              onClick={() => onOpenEditModal(match)}
              variant="ghost"
              size="icon"
              className="text-text-muted/50 hover:text-boca-gold transition-colors"
              aria-label="Editar partido"
            >
              <Edit3 size={14} />
            </Button>
          </Tooltip>
          
          <Tooltip content="Eliminar partido" position="top">
            <Button
              type="button"
              onClick={() => onOpenDeleteModal(matchId, rival, matchDate)}
              variant="ghost"
              size="icon"
              className="text-text-muted/50 hover:text-[#fca5a5] transition-colors"
              aria-label="Eliminar partido"
            >
              <Trash2 size={14} />
            </Button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};
