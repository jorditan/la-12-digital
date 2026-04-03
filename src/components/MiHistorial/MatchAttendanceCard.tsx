import { useState } from 'react';
import type { MatchResult } from '@/services/apifootball';
import type { MatchAttendance } from '@/types/attendance';
import { AttendanceModal } from './AttendanceModal';

const BOCA_ID = 451;

interface MatchAttendanceCardProps {
  match: MatchResult;
  attendance: MatchAttendance | null;
  onToggle: (matchId: string, attended: boolean) => void;
  onUpdateNote: (matchId: string, note: string | null) => void;
  onRemove: (matchId: string) => void;
}

export function MatchAttendanceCard({
  match, attendance, onToggle, onUpdateNote, onRemove,
}: MatchAttendanceCardProps) {
  const [showModal, setShowModal] = useState(false);

  const matchId = match.fixtureId.toString();
  const attended = attendance?.attended ?? false;

  const dateStr = new Date(match.date).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const bocaIsHome = match.homeTeam.id === BOCA_ID;
  const bocaGoals = bocaIsHome ? match.goalsHome : match.goalsAway;
  const rivalGoals = bocaIsHome ? match.goalsAway : match.goalsHome;

  const resultBadgeClass =
    bocaGoals !== null && rivalGoals !== null
      ? bocaGoals > rivalGoals ? 'bg-status-win'
      : bocaGoals < rivalGoals ? 'bg-status-loss'
      : 'bg-status-draw'
      : 'bg-boca-blue-mid';

  const handleToggle = () => {
    if (attended) {
      onRemove(matchId);
    } else {
      onToggle(matchId, true);
    }
  };

  return (
    <>
      <div className="bg-boca-blue-light border border-boca-border rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="type-caption text-text-muted">{dateStr}</p>
            <p className="type-caption text-text-muted">{match.competition}</p>
          </div>
          {bocaGoals !== null && rivalGoals !== null && (
            <span className={`${resultBadgeClass} type-caption text-white px-2 py-0.5 rounded-md font-bold tabular-nums`}>
              {bocaGoals} – {rivalGoals}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <img
            src={match.homeTeam.logo}
            alt={match.homeTeam.name}
            className="w-6 h-6 object-contain"
          />
          <span className="type-body text-white flex-1 truncate">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </span>
          <img
            src={match.awayTeam.logo}
            alt={match.awayTeam.name}
            className="w-6 h-6 object-contain"
          />
        </div>

        {attendance?.note && (
          <p className="type-caption text-text-muted italic border-l-2 border-boca-gold pl-2 line-clamp-2">
            "{attendance.note}"
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleToggle}
            className={[
              'flex-1 type-button py-2 rounded-lg border transition-colors',
              attended
                ? 'bg-boca-gold text-text-on-gold border-boca-gold font-bold'
                : 'bg-transparent text-text-muted border-boca-border hover:border-boca-gold hover:text-text-nav',
            ].join(' ')}
          >
            {attended ? '✓ Estuve ahí' : 'Estuve en este partido'}
          </button>

          {attended && (
            <button
              onClick={() => setShowModal(true)}
              className="type-caption text-text-muted border border-boca-border px-3 py-2 rounded-lg hover:border-boca-gold hover:text-text-nav transition-colors whitespace-nowrap"
            >
              {attendance?.note ? 'Editar nota' : 'Nota'}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <AttendanceModal
          match={match}
          attendance={attendance}
          onSave={note => onUpdateNote(matchId, note)}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
