import { useState, useEffect } from 'react';
import type { MatchResult } from '@/services/apifootball';
import type { MatchAttendance } from '@/types/attendance';

const MAX_NOTE_LENGTH = 280;

interface AttendanceModalProps {
  match: MatchResult;
  attendance: MatchAttendance | null;
  onSave: (note: string | null) => void;
  onClose: () => void;
}

export function AttendanceModal({ match, attendance, onSave, onClose }: AttendanceModalProps) {
  const [note, setNote] = useState(attendance?.note ?? '');

  useEffect(() => {
    setNote(attendance?.note ?? '');
  }, [attendance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(note.trim() || null);
    onClose();
  };

  const dateStr = new Date(match.date).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-modal-backdrop)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-boca-blue-light border border-boca-border rounded-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">
          <p className="type-caption text-text-muted">{dateStr} · {match.competition}</p>
          <p className="type-card-title text-white mt-0.5">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="type-caption text-text-nav block mb-1">
              Tu nota sobre este partido
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
              rows={4}
              placeholder="Ej: Fue increíble, 3-0 en La Bombonera..."
              className="w-full bg-boca-blue border border-boca-border rounded-lg px-3 py-2 text-white type-body resize-none focus:outline-none focus:border-boca-gold"
            />
            <p className="type-caption text-text-muted text-right mt-1">
              {note.length}/{MAX_NOTE_LENGTH}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-boca-border text-text-nav type-button py-2 rounded-lg hover:border-boca-gold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-boca-gold text-text-on-gold type-button font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
