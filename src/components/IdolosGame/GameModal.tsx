import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { type Idolo } from '../../data/idolos';
import { ESCUDO_VACIO } from '../../data/equipos';
import { type GameState, type Score, RESULT_SECS, ROUND_SECS } from './types';
import { TimerBar } from './TimerBar';
import { IdoloPlaceholder } from './IdoloPlaceholder';
import { DificultadBadge } from './DificultadBadge';
import { useModalEffects } from '../../hooks/useModalEffects';
import { fetchIdolImage } from '../../services/wikipediaService';

const TOTAL_CLUES = 6;

function nextClueIn(timer: number, visibleClues: number): number {
  return Math.max(0, timer - (TOTAL_CLUES - visibleClues) * 5);
}

// ── Props ─────────────────────────────────────────────────────────────────────

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

// ── Result badge ──────────────────────────────────────────────────────────────

const RESULT_BADGE: Record<'correct' | 'timeout', { bg: string; border: string; text: string; label: string }> = {
  correct: {
    bg:     'bg-status-win-subtle',
    border: 'border border-status-win',
    text:   'text-status-win',
    label:  '¡Correcto!',
  },
  timeout: {
    bg:     'bg-status-loss-subtle',
    border: 'border border-status-loss',
    text:   'text-status-negative',
    label:  'Tiempo agotado',
  },
};

function ResultBadge({ state }: { state: 'correct' | 'timeout' }) {
  const { bg, border, text, label } = RESULT_BADGE[state];
  return (
    <span className={['font-sans text-xs font-bold px-2.5 py-1 rounded-sm', bg, border, text].join(' ')}>
      {label}
    </span>
  );
}

// ── Secciones internas ────────────────────────────────────────────────────────

function ModalHeader({
  idolo, score, onClose,
}: Pick<GameModalProps, 'idolo' | 'score' | 'onClose'>) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-boca-gold/10">
      <div className="flex items-center gap-2 min-w-0">
        <h3 className="font-serif font-bold text-lg text-boca-gold leading-none shrink-0">
          ¿Qué ídolo es?
        </h3>
        <DificultadBadge dificultad={idolo.dificultad} />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {score.total > 0 && (
          <span className="font-sans text-xs text-text-secondary tabular-nums">
            {score.correct}/{score.total} ✓
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Cerrar"
          className="text-text-secondary hover:text-white"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}

function IdoloImage({
  idolo, revealed, state,
}: { idolo: Idolo; revealed: boolean; state: Exclude<GameState, 'waiting'> }) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(idolo.imageUrl);

  useEffect(() => {
    setResolvedUrl(idolo.imageUrl);
    if (!idolo.imageUrl) {
      fetchIdolImage(idolo.id).then(url => { if (url) setResolvedUrl(url); });
    }
  }, [idolo.id, idolo.imageUrl]);

  return (
    <div className="relative h-56 overflow-hidden bg-boca-blue">
      {resolvedUrl ? (
        <>
          <img
            src={resolvedUrl}
            alt={revealed ? `${idolo.nombre} ${idolo.apellido}` : 'Ídolo misterioso'}
            className={[
              'w-full h-full object-contain object-center transition-all duration-700',
              !revealed ? 'blur-2xl scale-110 opacity-50' : 'blur-0 scale-100 opacity-100',
            ].join(' ')}
            onError={e => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
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
          <ResultBadge state={state as 'correct' | 'timeout'} />
        </div>
      )}
    </div>
  );
}

function PlayingContent({
  idolo, timer, visibleClues, input, inputError, inputRef, onInputChange, onSubmit, onPlayNext,
}: Pick<GameModalProps, 'idolo' | 'timer' | 'visibleClues' | 'input' | 'inputError' | 'inputRef' | 'onInputChange' | 'onSubmit' | 'onPlayNext'>) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <TimerBar timer={timer} total={ROUND_SECS} />
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
      <Button
        type="button"
        onClick={onPlayNext}
        variant="text"
        size="xs"
        className="w-full text-center text-text-secondary hover:text-white py-1"
      >
        Otro ídolo →
      </Button>
    </>
  );
}

function RevealedContent({
  idolo, state, onClose, onPlayNext,
}: Pick<GameModalProps, 'idolo' | 'state' | 'onClose' | 'onPlayNext'>) {
  return (
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
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────

export function GameModal(props: GameModalProps) {
  const { state, idolo, onClose } = props;
  const revealed = state === 'correct' || state === 'timeout';

  useModalEffects(onClose);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: 'var(--color-modal-backdrop)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-none bg-boca-blue-light border border-boca-gold/20 rounded-t-2xl sm:rounded-sm overflow-hidden shadow-2xl animate-fade-in max-h-[88dvh] sm:max-w-sm sm:max-h-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <ModalHeader idolo={idolo} score={props.score} onClose={onClose} />

        <IdoloImage idolo={idolo} revealed={revealed} state={state} />

        <div className="p-4 space-y-3">
          {state === 'playing' && <PlayingContent {...props} onPlayNext={props.onPlayNext} />}
          {revealed && <RevealedContent {...props} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}
