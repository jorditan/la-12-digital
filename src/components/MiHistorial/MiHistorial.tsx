import { useState } from 'react';
import type { AuthUser } from '@/types/attendance';
import type { MatchResult } from '@/services/apifootball';
import { useMiHistorial } from './useMiHistorial';
import { LockedState } from './LockedState';
import { AttendanceRow } from './AttendanceRow';
import { MatchCombobox } from './MatchCombobox';
import { MultiSelect } from './MultiSelect';
import { DateRangePicker } from './DateRangePicker';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Upload } from 'lucide-react';
import { ImportModal } from './ImportModal';
import { EditMatchModal } from './EditMatchModal';

// ── Logged-in content ─────────────────────────────────────────────────────────

type DeleteModalData = { matchId: string; rival: string; matchDate: string };
type EditModalData = { match: MatchResult; note: string | null };

const MiHistorialContent = ({ user }: { user: AuthUser }) => {
  const {
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
    remove,
    upsert,
  } = useMiHistorial(user);

  const [deleteModal, setDeleteModal] = useState<DeleteModalData | null>(null);
  const [editModal, setEditModal] = useState<EditModalData | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const existingMatchIds = attendedEntries.map((e) => e.matchId);

  const handleUpdateMatchData = async (
    matchId: string,
    updatedData: Partial<MatchResult>,
    note: string | null
  ) => {
    const match = matches.find((m) => ((m as any)._manualId || m.fixtureId.toString()) === matchId);
    if (!match) return;

    await upsert({
      matchId,
      attended: true,
      note: note,
      matchData: {
        date: updatedData.date || match.date,
        homeTeamId: updatedData.homeTeam?.id ?? match.homeTeam.id,
        homeTeamName: updatedData.homeTeam?.name ?? match.homeTeam.name,
        homeTeamLogo: updatedData.homeTeam?.logo ?? match.homeTeam.logo,
        awayTeamId: updatedData.awayTeam?.id ?? match.awayTeam.id,
        awayTeamName: updatedData.awayTeam?.name ?? match.awayTeam.name,
        awayTeamLogo: updatedData.awayTeam?.logo ?? match.awayTeam.logo,
        goalsHome: updatedData.goalsHome !== undefined ? updatedData.goalsHome : match.goalsHome,
        goalsAway: updatedData.goalsAway !== undefined ? updatedData.goalsAway : match.goalsAway,
        competition: updatedData.competition ?? match.competition,
      },
    });
  };

  return (
    <div className="flex-1 min-w-0 px-3 py-3 sm:px-6 sm:py-8 lg:px-10 flex flex-col gap-4 sm:gap-8">
      {/* Header */}
      <div>
        <h1 className="type-section-title text-white mb-0.5">Mi Historial</h1>
        <p className="type-body text-text-muted lowercase">{user.displayName ?? user.email}</p>
      </div>

      {/* Dashboard Section: Cards Prominentes del Design System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        {/* Card 1: Registro de Presencia */}
        <div className="p-5 sm:p-6 bg-boca-blue-light border border-boca-border rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-sm bg-boca-gold/10 text-boca-gold shrink-0 border border-boca-gold/20">
                <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
                  <rect
                    x="2"
                    y="3"
                    width="12"
                    height="11"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M5 1.5v3M11 1.5v3M2 7h12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5.5 10l1.5 1.5L10.5 9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-white leading-tight">
                  Agregá el partido al que fuiste
                </h2>
                <p className="type-caption text-text-muted">
                  Registrá tu presencia en La Bombonera o cualquier estadio
                </p>
              </div>
            </div>

            {matchEstado === 'loading' && (
              <p className="type-body text-text-muted py-4">Cargando partidos...</p>
            )}
            {matchEstado === 'error' && (
              <p className="type-body text-[#fca5a5] py-4">No se pudieron cargar los partidos.</p>
            )}

            {matchEstado === 'ok' && (
              <div className="mt-4 flex flex-col gap-3">
                <MatchCombobox
                  matches={availableMatches}
                  value={selectedMatchId}
                  onChange={setSelectedMatchId}
                />
              </div>
            )}
          </div>

          {matchEstado === 'ok' && (
            <div className="mt-6 flex flex-col sm:flex-row gap-2 pt-4 border-t border-boca-border-card/60">
              <Button
                onClick={() => setImportModalOpen(true)}
                variant="outline"
                className="justify-center items-center py-2.5"
              >
                <Upload className="w-4 h-4 mr-1.5" />
                Importar
              </Button>
              <Button
                onClick={handleMarkAttendance}
                disabled={!selectedMatchId || adding}
                variant="primary"
                className={[
                  'flex-1 type-button font-bold px-5 py-2.5 rounded-sm transition-all',
                  'flex items-center justify-center gap-2 whitespace-nowrap',
                  selectedMatchId && !adding
                    ? 'bg-boca-gold text-text-on-gold hover:opacity-90 cursor-pointer'
                    : 'opacity-20 text-text-on-gold cursor-not-allowed',
                ].join(' ')}
              >
                {adding ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="28"
                        strokeDashoffset="10"
                      />
                    </svg>
                    Guardando...
                  </>
                ) : successMatchId ? (
                  <span className="animate-check-bounce flex items-center gap-1.5">
                    <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4">
                      <path
                        d="M2 7l3.5 3.5L12 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    ¡Marcado!
                  </span>
                ) : (
                  'Marcar presencia'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Card 2: Panel de Métricas del Hincha */}
        <div className="p-5 sm:p-6 bg-boca-blue-light border border-boca-border rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <p className="type-caption text-text-muted uppercase tracking-wider font-semibold">
                  Métricas de asistencia
                </p>
                <h2 className="font-serif text-xl font-bold text-white">Partidos Asistidos</h2>
              </div>
              {totalAttended > 0 && (
                <Badge variant="gold" className="px-3 py-1 font-sans text-xs font-bold">
                  {efectividad}% Efectividad
                </Badge>
              )}
            </div>

            {/* Número Principal + Desde */}
            <div className="flex items-baseline gap-4 py-1">
              <span className="font-serif text-5xl sm:text-6xl font-bold text-boca-gold tabular-nums leading-none">
                {totalAttended}
              </span>
              {earliestYear && (
                <div className="border-l border-boca-border pl-3">
                  <p className="type-caption text-text-muted">Presencia desde</p>
                  <p className="font-sans text-sm font-semibold text-text-nav">{earliestYear}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sub-grid de Estadísticas con Tokens de Estado del Design System */}
          <div className="mt-6 pt-4 border-t border-boca-border-card/60 grid grid-cols-4 gap-2">
            <div className="bg-status-win-subtle border border-status-win/25 rounded-sm p-2 text-center">
              <span className="block type-caption text-status-win font-bold uppercase text-[10px] tracking-wider">
                Victorias
              </span>
              <span className="font-sans text-lg font-bold text-white tabular-nums">
                {stats.victorias}
              </span>
            </div>

            <div className="bg-status-draw-subtle border border-status-draw/25 rounded-sm p-2 text-center">
              <span className="block type-caption text-status-draw font-bold uppercase text-[10px] tracking-wider">
                Empates
              </span>
              <span className="font-sans text-lg font-bold text-white tabular-nums">
                {stats.empates}
              </span>
            </div>

            <div className="bg-status-loss-subtle border border-status-loss/25 rounded-sm p-2 text-center">
              <span className="block type-caption text-status-loss font-bold uppercase text-[10px] tracking-wider">
                Derrotas
              </span>
              <span className="font-sans text-lg font-bold text-white tabular-nums">
                {stats.derrotas}
              </span>
            </div>

            <div className="bg-boca-border-card/40 border border-boca-border rounded-sm p-2 text-center">
              <span className="block type-caption text-text-muted font-bold uppercase text-[10px] tracking-wider">
                Goles
              </span>
              <span className="font-sans text-sm font-semibold text-white tabular-nums leading-snug">
                {stats.golesFavor} - {stats.golesContra}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar — visible only when there are registered matches */}
      {totalAttended > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <MultiSelect
            options={availableCompetitions}
            selected={selectedCompetitions}
            onChange={setSelectedCompetitions}
            placeholder="Competencia"
          />
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(f, t) => {
              setDateFrom(f);
              setDateTo(t);
            }}
          />
          {hasActiveFilters && (
            <Button
              type="button"
              onClick={clearFilters}
              variant="text"
              size="xs"
              className="type-caption text-text-muted hover:text-boca-gold"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col">
        <div className="border-b border-boca-border-card px-4 py-3 sm:px-6 flex items-center justify-between">
          <h2 className="type-section-title text-white">Partidos registrados</h2>
          {totalAttended > 0 && (
            <p className="type-caption text-text-muted">
              {hasActiveFilters
                ? `${filteredEntries.length} de ${totalAttended}`
                : `${totalAttended} ${totalAttended === 1 ? 'partido' : 'partidos'}`}
            </p>
          )}
        </div>

        {totalAttended === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="type-body text-text-muted/70 italic mb-1">
              Todavía no registraste partidos.
            </p>
            <p className="type-caption text-text-muted/50">
              Usá el formulario de arriba para empezar.
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="type-body text-text-muted/70 italic mb-2">
              Ningún partido coincide con los filtros.
            </p>
            <Button
              type="button"
              onClick={clearFilters}
              variant="text"
              size="xs"
              className="type-caption text-boca-gold hover:opacity-80"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto pt-2 px-3 pb-3 sm:px-8 sm:pb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-boca-border-card">
                  <th className="px-2 sm:px-6 py-2 text-left font-sans font-medium text-sm text-text-muted">
                    Día
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left font-sans font-medium text-sm text-text-muted">
                    Rival
                  </th>
                  <th className="hidden sm:table-cell px-2 py-2 text-left font-sans font-medium text-sm text-text-muted max-w-[70px]">
                    Competencia
                  </th>
                  <th className="px-2 sm:px-4 py-2 text-center font-sans font-medium text-sm text-text-muted">
                    Resultado
                  </th>
                  <th className="px-2 py-2 text-left font-sans font-medium text-sm text-text-muted">
                    Nota
                  </th>
                  <th className="px-2 sm:px-6 py-2 w-20" aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const match = matches.find(
                    (m) => ((m as any)._manualId || m.fixtureId.toString()) === entry.matchId
                  );
                  return (
                    <AttendanceRow
                      key={entry.matchId}
                      matchId={entry.matchId}
                      match={match}
                      note={entry.note}
                      isNew={justAdded === entry.matchId}
                      onOpenEditModal={(m) => setEditModal({ match: m, note: entry.note })}
                      onOpenDeleteModal={(matchId, rival, matchDate) =>
                        setDeleteModal({ matchId, rival, matchDate })
                      }
                    />
                  );
                })}
              </tbody>
            </table>

            {/* Leyenda de colores (Mismo estilo que UltimosPartidos) */}
            <div className="flex items-center gap-4 mt-4 text-[10px] sm:text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400/70 inline-block shrink-0" />
                <span>Victoria</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400/60 inline-block shrink-0" />
                <span>Empate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400/70 inline-block shrink-0" />
                <span>Derrota</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {deleteModal && (
        <ConfirmDeleteModal
          rival={deleteModal.rival}
          matchDate={deleteModal.matchDate}
          onConfirm={() => {
            remove(deleteModal.matchId);
            setDeleteModal(null);
          }}
          onClose={() => setDeleteModal(null)}
        />
      )}
      {editModal && (
        <EditMatchModal
          match={editModal.match}
          initialNote={editModal.note}
          onSave={(data, note) =>
            handleUpdateMatchData(
              (editModal.match as any)._manualId || editModal.match.fixtureId.toString(),
              data,
              note
            )
          }
          onClose={() => setEditModal(null)}
        />
      )}
      {importModalOpen && (
        <ImportModal
          matches={matches}
          existingMatchIds={existingMatchIds}
          upsert={upsert}
          onClose={() => setImportModalOpen(false)}
        />
      )}
    </div>
  );
};

// ── Public component ──────────────────────────────────────────────────────────

interface MiHistorialProps {
  user: AuthUser | null;
}

export const MiHistorial = ({ user }: MiHistorialProps) => {
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <LockedState />
      </div>
    );
  }
  return <MiHistorialContent user={user} />;
};
