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
import { NoteModal } from './NoteModal';
import { Button } from '../ui/Button';
import { Upload } from 'lucide-react';
import { ImportModal } from './ImportModal';
import { EditMatchModal } from './EditMatchModal';

// ── Logged-in content ─────────────────────────────────────────────────────────

type DeleteModalData = { matchId: string; rival: string; matchDate: string };
type NoteModalData = { matchId: string; note: string | null; label: string };
type EditModalData = { match: MatchResult };

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
  } = useMiHistorial(user);

  const [deleteModal, setDeleteModal] = useState<DeleteModalData | null>(null);
  const [noteModal, setNoteModal] = useState<NoteModalData | null>(null);
  const [editModal, setEditModal] = useState<EditModalData | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const existingMatchIds = attendedEntries.map((e) => e.matchId);

  const handleUpdateMatchData = async (matchId: string, updatedData: Partial<MatchResult>) => {
    const entry = attendedEntries.find((e) => e.matchId === matchId);
    const match = matches.find((m) => ((m as any)._manualId || m.fixtureId.toString()) === matchId);
    if (!match) return;

    await upsert({
      matchId,
      attended: true,
      note: entry?.note ?? null,
      matchData: {
        date: match.date,
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
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 pl-3 border-l-2 border-boca-gold/50">
        <h1 className="type-section-title text-white mb-0.5">Mi Historial</h1>
        <p className="type-body text-text-muted">{user.displayName ?? user.email}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-boca-blue-light border border-boca-border rounded-sm">
        <div className="flex-1">
          <p className="type-caption text-text-muted mb-0.5">Partidos presenciados</p>
          <p
            className="type-stat text-boca-gold font-bold tabular-nums"
            style={{ fontSize: '2rem', lineHeight: 1 }}
          >
            {totalAttended}
          </p>
        </div>
        {earliestYear && (
          <div className="border-l border-boca-border pl-4">
            <p className="type-caption text-text-muted mb-0.5">Desde</p>
            <p className="type-card-title text-text-nav">{earliestYear}</p>
          </div>
        )}
      </div>

      {/* Register form */}
      <div className="mb-6 p-4 bg-boca-blue-light border border-boca-border rounded-sm">
        <h2 className="sr-only">Agregar partido</h2>
        <div className="flex items-center gap-2 mb-3">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-boca-gold shrink-0">
            <rect
              x="2"
              y="3"
              width="12"
              height="11"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M5 1.5v3M11 1.5v3M2 7h12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M5.5 10l1.5 1.5L10.5 9"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="type-body text-text-nav">Agregá el partido al que fuiste</p>
        </div>

        {matchEstado === 'loading' && (
          <p className="type-body text-text-muted py-2">Cargando partidos...</p>
        )}
        {matchEstado === 'error' && (
          <p className="type-body text-[#fca5a5] py-2">No se pudieron cargar los partidos.</p>
        )}

        {matchEstado === 'ok' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <MatchCombobox
              matches={availableMatches}
              value={selectedMatchId}
              onChange={setSelectedMatchId}
            />
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="h-10 flex items-center gap-2 px-4 rounded-sm border border-boca-border text-text-muted hover:bg-boca-border/20 transition-colors type-caption whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              Importar
            </button>
            <Button
              onClick={handleMarkAttendance}
              disabled={!selectedMatchId || adding}
              variant="primary"
              className={[
                'sm:w-auto w-full type-button font-bold px-5 py-2.5 rounded-sm transition-all',
                'flex items-center justify-center gap-2 whitespace-nowrap',
                selectedMatchId && !adding
                  ? 'bg-boca-gold text-text-on-gold hover:opacity-90 cursor-pointer'
                  : 'bg-boca-gold/30 text-text-on-gold/50 cursor-not-allowed',
              ].join(' ')}
            >
              {adding ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
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
                  <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
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
                'Añadir partido'
              )}
            </Button>
          </div>
        )}
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

      {/* Table */}
      <div className="bg-boca-blue-light border border-boca-border rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-boca-border/60 flex items-center justify-between">
          <p className="type-body text-text-nav">Partidos registrados</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-boca-border/60">
                  <th className="px-3 py-2 type-caption text-text-muted/70 font-medium">Fecha</th>
                  <th className="px-3 py-2 type-caption text-text-muted/70 font-medium">Rival</th>
                  <th className="px-3 py-2 type-caption text-text-muted/70 font-medium">
                    Resultado
                  </th>
                  <th className="px-3 py-2 type-caption text-text-muted/70 font-medium hidden sm:table-cell">
                    Competencia
                  </th>
                  <th className="px-3 py-2 type-caption text-text-muted/70 font-medium">Nota</th>
                  <th className="px-2 py-2" aria-label="Acciones" />
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
                      onOpenNoteModal={(matchId, note, label) =>
                        setNoteModal({ matchId, note, label })
                      }
                      onOpenEditModal={(m) => setEditModal({ match: m })}
                      onOpenDeleteModal={(matchId, rival, matchDate) =>
                        setDeleteModal({ matchId, rival, matchDate })
                      }
                    />
                  );
                })}
              </tbody>
            </table>
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
      {noteModal && (
        <NoteModal
          matchLabel={noteModal.label}
          initialNote={noteModal.note}
          onSave={(note) => handleUpdateNote(noteModal.matchId, note)}
          onClose={() => setNoteModal(null)}
        />
      )}
      {editModal && (
        <EditMatchModal
          match={editModal.match}
          onSave={(data) =>
            handleUpdateMatchData(
              (editModal.match as any)._manualId || editModal.match.fixtureId.toString(),
              data
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
