import { useState, useEffect } from 'react';
import { useMatchAttendance } from '@/hooks/useMatchAttendance';
import { fetchLastMatches } from '@/services/apifootball';
import { AuthGate } from '@/components/Auth';
import { MatchAttendanceCard } from './MatchAttendanceCard';
import type { MatchResult } from '@/services/apifootball';
import type { AuthUser, AsyncState } from '@/types/attendance';

interface MiHistorialProps {
  onNavigateHome: () => void;
}

interface ContentProps {
  user: AuthUser;
  logout: () => Promise<void>;
  onNavigateHome: () => void;
}

function MiHistorialContent({ user, logout, onNavigateHome }: ContentProps) {
  const { attendanceMap, upsert, remove } = useMatchAttendance(user.id);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchEstado, setMatchEstado] = useState<AsyncState>('loading');

  useEffect(() => {
    fetchLastMatches()
      .then(data => { setMatches(data); setMatchEstado('ok'); })
      .catch(() => setMatchEstado('error'));
  }, []);

  const handleToggle = async (matchId: string, attended: boolean) => {
    await upsert({ matchId, attended });
  };

  const handleUpdateNote = async (matchId: string, note: string | null) => {
    const existing = attendanceMap[matchId];
    if (existing) {
      await upsert({ matchId, attended: existing.attended, note });
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-white">
      <div className="sticky top-0 z-10 bg-boca-blue-light border-b border-boca-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="type-caption text-text-muted hover:text-text-nav transition-colors"
          >
            ← Inicio
          </button>
          <span className="text-boca-border">|</span>
          <h1 className="type-section-title text-white">Mi Historial</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="type-caption text-text-muted hidden sm:block">{user.email}</span>
          <button
            onClick={logout}
            className="type-caption text-text-muted hover:text-status-negative transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {matchEstado === 'loading' && (
          <p className="type-body text-text-muted text-center py-12">Cargando partidos...</p>
        )}

        {matchEstado === 'error' && (
          <p className="type-body text-status-negative text-center py-12">
            Error al cargar los partidos. Intentá de nuevo más tarde.
          </p>
        )}

        {matchEstado === 'ok' && matches.length === 0 && (
          <p className="type-body text-text-muted text-center py-12">
            No hay partidos recientes disponibles.
          </p>
        )}

        {matchEstado === 'ok' && matches.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="type-caption text-text-muted mb-2">
              Últimos {matches.length} partidos de Boca. Marcá los que presenciaste.
            </p>
            {matches.map(match => (
              <MatchAttendanceCard
                key={match.fixtureId}
                match={match}
                attendance={attendanceMap[match.fixtureId.toString()] ?? null}
                onToggle={handleToggle}
                onUpdateNote={handleUpdateNote}
                onRemove={remove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MiHistorial({ onNavigateHome }: MiHistorialProps) {
  return (
    <AuthGate>
      {({ user, logout }) => (
        <MiHistorialContent user={user} logout={logout} onNavigateHome={onNavigateHome} />
      )}
    </AuthGate>
  );
}
