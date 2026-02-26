import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { type Idolo, type Dificultad } from '../../data/idolos';
import { ESCUDO_VACIO } from '../../data/equipos';
import { type GameState, type Score, ROUND_SECS, RESULT_SECS } from './types';

const TOTAL_CLUES = 6;

// Tiempo (en segundos) en que aparece cada pista (de la 2ª en adelante)
// Pista 1 siempre visible; las demás cada 5s: 25, 20, 15, 10, 5
function nextClueIn(timer: number, visibleClues: number): number {
  const nextThreshold = (TOTAL_CLUES - visibleClues) * 5;
  return Math.max(0, timer - nextThreshold);
}

const DIFICULTAD_LABEL: Record<Dificultad, string> = {
  facil: 'Fácil',
  media: 'Media',
  dificil: 'Difícil',
  muy_dificil: 'Muy difícil',
};

const DIFICULTAD_CLASS: Record<Dificultad, string> = {
  facil:      'text-white/45 border-white/10',
  media:      'text-white/60 border-white/15',
  dificil:    'text-white/75 border-white/20',
  muy_dificil:'text-boca-gold/70 border-boca-gold/25 bg-boca-gold/5',
};

// ── Sub-componentes locales ───────────────────────────────────────────────────

function IdoloPlaceholder({ idolo, revealed }: { idolo: Idolo; revealed: boolean }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-boca-blue-light to-boca-blue select-none">
      {revealed ? (
        <>
          <span className="font-serif text-7xl font-bold text-boca-gold/40">
            {idolo.apellido[0]}
          </span>
          <span className="font-serif text-2xl font-bold text-white mt-2">
            {idolo.apodo}
          </span>
          <span className="text-sm text-text-secondary mt-1 font-sans text-center px-4">
            {idolo.posicion} · {idolo.periodos.join(', ')}
          </span>
        </>
      ) : (
        <>
          <span className="font-sans text-8xl text-boca-gold/10 font-bold leading-none">?</span>
          <span className="text-xs text-boca-gold/30 mt-3 font-sans uppercase tracking-widest">
            {idolo.posicion}
          </span>
        </>
      )}
    </div>
  );
}

function TimerBar({ timer }: { timer: number }) {
  const pct = (timer / ROUND_SECS) * 100;
  const color = pct > 50 ? 'bg-boca-gold' : pct > 25 ? 'bg-orange-400' : 'bg-red-500';
  return (
    <div className="h-1 w-full bg-boca-blue rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-1000 ease-linear`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export interface GameModalProps {
  state: Exclude<GameState, 'waiting'>;
  idolo: Idolo;
  timer: number;
  visibleClues: number;
  input: string;
  inputError: boolean;
  score: Score;
  inputRef: React.RefObject<HTMLInputElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onPlayNext: () => void;
}

export function GameModal({
  state, idolo, timer, visibleClues, input, inputError, score,
  inputRef, onInputChange, onSubmit, onClose, onPlayNext,
}: GameModalProps) {
  const revealed = state === 'correct' || state === 'timeout';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 10, 29, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={[
          'relative w-full max-w-sm',
          'bg-boca-blue-light border border-boca-gold/20 rounded-sm',
          'overflow-hidden shadow-2xl animate-fade-in',
        ].join(' ')}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-boca-gold/10">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-serif font-bold text-lg text-boca-gold leading-none shrink-0">
              ¿Qué ídolo es?
            </h3>
            <span
              className={[
                'font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border shrink-0',
                DIFICULTAD_CLASS[idolo.dificultad],
              ].join(' ')}
            >
              {DIFICULTAD_LABEL[idolo.dificultad]}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {score.total > 0 && (
              <span className="font-sans text-xs text-text-secondary tabular-nums">
                {score.correct}/{score.total} ✓
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="text-text-secondary hover:text-white transition-colors p-0.5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Foto */}
        <div className="relative h-56 overflow-hidden bg-boca-blue">
          {idolo.imageUrl ? (
            <>
              <img
                src={idolo.imageUrl}
                alt={revealed ? `${idolo.nombre} ${idolo.apellido}` : 'Ídolo misterioso'}
                className={[
                  'w-full h-full object-contain transition-all duration-700',
                  !revealed ? 'blur-2xl scale-110 opacity-50' : 'blur-0 scale-100 opacity-100',
                ].join(' ')}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
              />
              {!revealed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl text-boca-gold/15 font-bold select-none leading-none">?</span>
                </div>
              )}
            </>
          ) : (
            <IdoloPlaceholder idolo={idolo} revealed={revealed} />
          )}

          {revealed && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-boca-blue/90 to-transparent px-4 py-3">
              <span
                className={[
                  'font-sans text-xs font-bold px-2.5 py-1 rounded-sm',
                  state === 'correct'
                    ? 'bg-green-900/90 text-green-400'
                    : 'bg-red-900/90 text-red-400',
                ].join(' ')}
              >
                {state === 'correct' ? '¡Correcto!' : 'Tiempo agotado'}
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">

          {/* Estado: jugando */}
          {state === 'playing' && (
            <>
              <div className="flex items-center justify-between gap-3">
                <TimerBar timer={timer} />
                <span className="font-sans text-xs text-text-secondary tabular-nums shrink-0 w-6 text-right">
                  {timer}s
                </span>
              </div>

              <ul className="space-y-2">
                {idolo.pistas.slice(0, visibleClues).map((pista, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-boca-gold/40 font-sans text-xs shrink-0 mt-0.5 w-4">
                      {i + 1}.
                    </span>
                    <p className="font-sans text-sm text-text-primary leading-snug">{pista}</p>
                  </li>
                ))}
                {visibleClues < TOTAL_CLUES && (
                  <li className="text-xs text-text-secondary font-sans pl-6">
                    próxima pista en{' '}
                    <span className="tabular-nums font-medium text-white/60">
                      {nextClueIn(timer, visibleClues)}s
                    </span>
                    {' '}· {TOTAL_CLUES - visibleClues} restante{TOTAL_CLUES - visibleClues > 1 ? 's' : ''}
                  </li>
                )}
              </ul>

              <form onSubmit={onSubmit} className="flex gap-2 pt-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={onInputChange}
                  placeholder="Nombre o apellido..."
                  autoComplete="off"
                  className={[
                    'flex-1 min-w-0 px-3 py-2 text-sm font-sans',
                    'bg-boca-blue rounded-sm text-white placeholder:text-text-secondary',
                    'focus:outline-none transition-colors',
                    inputError
                      ? 'border border-red-500 focus:border-red-400'
                      : 'border border-boca-gold/20 focus:border-boca-gold/50',
                  ].join(' ')}
                />
                <Button type="submit" size="sm" variant="primary">
                  ¡Dale Bo!
                </Button>
              </form>
            </>
          )}

          {/* Estado: resultado */}
          {revealed && (
            <div className="space-y-2">
              <p className="font-serif text-2xl font-bold leading-tight">
                {idolo.nombre}{' '}
                <span className="text-boca-gold">{idolo.apellido}</span>
              </p>
              <p className="font-sans text-sm text-text-secondary italic">
                "{idolo.apodo}" · {idolo.posicion}
              </p>
              <p className="font-sans text-sm text-text-primary leading-relaxed">
                {idolo.descripcion}
              </p>
              {state === 'correct' ? (
                <div className="flex justify-between gap-2 pt-3 border-t border-boca-gold/10 mt-1">
                  <Button size="sm" variant="outline" onClick={onClose}>
                    Cerrar
                  </Button>
                  <Button size="sm" variant="primary" onClick={onPlayNext}>
                    Jugar otro
                  </Button>
                </div>
              ) : (
                <p className="font-sans text-xs text-text-secondary pt-1">
                  Cerrando en {RESULT_SECS}s...
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body,
  );
}
