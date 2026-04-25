import { useEffect, useRef } from "react";
import { Trash2, PenLine, Edit3, Plus } from "lucide-react";
import { BOCA_ID } from "@/services/apifootball";
import type { MatchResult } from "@/services/apifootball";
import { Button } from "../ui/Button";
import { TeamLogo } from "../ui/TeamLogo";
import { Tooltip } from "../ui/Tooltip";
import { Badge } from "../ui/Badge";
import {
  getRivalName,
  formatTableDate,
  getResultado,
  ROW_STYLE,
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
  const matchDate = formatTableDate(match.date);
  const rivalLogo = match.homeTeam.id === BOCA_ID ? match.awayTeam.logo : match.homeTeam.logo;
  const resultado = getResultado(match);
  
  const bocaIsHome = match.homeTeam.id === BOCA_ID;
  const golesBoca = bocaIsHome ? match.goalsHome : match.goalsAway;
  const golesRival = bocaIsHome ? match.goalsAway : match.goalsHome;

  return (
    <tr
      ref={rowRef}
      className={[
        "transition-colors border-b border-white/[0.04]",
        ROW_STYLE[resultado],
        isNew ? "animate-slide-in-row" : "",
      ].join(" ")}
    >
      {/* Fecha */}
      <td className="px-2 sm:px-6 py-2 sm:py-3 font-sans font-medium text-sm text-white whitespace-nowrap">
        {matchDate}
      </td>

      {/* Rival */}
      <td className="px-2 sm:px-3 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <TeamLogo 
            src={rivalLogo} 
            alt={rival} 
            size={18} 
            className="shrink-0" 
          />
          <span className="font-sans font-normal text-sm text-white truncate max-w-[110px] sm:max-w-[140px]">
            {rival}
          </span>
        </div>
      </td>

      {/* Competencia */}
      <td className="hidden sm:table-cell px-2 py-2 sm:py-3 max-w-[70px]">
        {match.competition && (
          <Badge variant={match.competition === 'Copa Libertadores' ? 'gold' : 'blue'} className="text-[10px] px-1.5 whitespace-nowrap">
            {match.competition === 'Copa Libertadores' ? 'Libertadores' : 'Liga profesional'}
          </Badge>
        )}
      </td>

      {/* Resultado */}
      <td className="px-2 sm:px-4 py-2 sm:py-3 font-sans font-normal text-sm text-white text-center whitespace-nowrap tabular-nums">
        {golesBoca ?? '-'} - {golesRival ?? '-'}
      </td>

      {/* Nota */}
      <td className="px-2 py-2 sm:py-3 max-w-[120px] sm:max-w-[160px]">
        <Tooltip content="Editar nota" position="top">
          <Button
            type="button"
            onClick={() => onOpenEditModal(match)}
            variant="ghost"
            className="w-full justify-start text-left group/note p-0 h-auto hover:bg-transparent"
          >
            {note ? (
              <>
                <span className="text-[11px] italic text-text-muted truncate flex-1">
                  "{note}"
                </span>
                <PenLine
                  size={10}
                  className="shrink-0 text-text-muted/30 group-hover/note:text-boca-gold transition-colors ml-1"
                />
              </>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-text-muted/40 group-hover/note:text-boca-gold transition-colors">
                <Plus size={10} />
                Nota
              </span>
            )}
          </Button>
        </Tooltip>
      </td>

      {/* Acciones */}
      <td className="px-2 sm:px-6 py-2 sm:py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Tooltip content="Editar partido" position="top">
            <Button
              type="button"
              onClick={() => onOpenEditModal(match)}
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-text-muted/40 hover:text-boca-gold transition-colors"
              aria-label="Editar partido"
            >
              <Edit3 size={13} />
            </Button>
          </Tooltip>
          
          <Tooltip content="Eliminar partido" position="top">
            <Button
              type="button"
              onClick={() => onOpenDeleteModal(matchId, rival, match.date)}
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-text-muted/40 hover:text-[#fca5a5] transition-colors"
              aria-label="Eliminar partido"
            >
              <Trash2 size={13} />
            </Button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};
