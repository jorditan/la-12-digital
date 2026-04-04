import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { type BocaEquipo } from '../../data/bocaEquipos';
import { type GameState, type PlayerState, type Score, ROUND_SECS } from './types';
import { TimerBar } from './TimerBar';
import { useModalEffects } from '../IdolosGame/hooks/useModalEffects';
import { FormacionPitch } from './FormacionPitch';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface GameModalProps {
  gameState: GameState;
  equipo: BocaEquipo;
  players: PlayerState[];
  timer: number;
  input: string;
  inputError: boolean;
  score: Score;
  inputRef: React.RefObject<HTMLInputElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onPlayNext: () => void;
}

// ── Secciones ─────────────────────────────────────────────────────────────────

function ModalHeader({
  equipo, score, gameState, onClose,
}: Pick<GameModalProps, 'equipo' | 'score' | 'gameState' | 'onClose'>) {
  const isFinished = gameState === 'won' || gameState === 'timeout';
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-boca-gold/10">
      <div className="min-w-0">
        <h3 className="font-serif font-bold text-base text-boca-gold leading-tight">
          {equipo.campeonato}
        </h3>
        <p className="font-sans text-xs text-text-secondary mt-0.5 leading-snug">
          {equipo.descripcion}
        </p>
        {equipo.formacion_tactica && !equipo.formacion_tactica.toLowerCase().includes('no especificada') && (
          <p className="font-sans text-[10px] text-boca-gold/60 mt-1 italic leading-snug">
            {equipo.formacion_tactica}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 pt-0.5">
        {isFinished && (
          <span className="font-sans text-xs text-text-secondary tabular-nums">
            {score.guessed}/{score.total} ✓
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

function TimerSection({ timer, gameState }: { timer: number; gameState: GameState }) {
  if (gameState === 'won' || gameState === 'timeout') return null;
  return (
    <div className="px-4 pt-3 flex items-center gap-3">
      <TimerBar timer={timer} total={ROUND_SECS} />
      <span className="font-sans text-xs text-text-secondary tabular-nums shrink-0 w-8 text-right">
        {formatTime(timer)}
      </span>
    </div>
  );
}

function PlayingInput({
  input, inputError, inputRef, onInputChange, onSubmit, onPlayNext,
}: Pick<GameModalProps, 'input' | 'inputError' | 'inputRef' | 'onInputChange' | 'onSubmit' | 'onPlayNext'>) {
  return (
    <div className="space-y-2">
      <form onSubmit={onSubmit} className="flex gap-2">
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
        Otro equipo →
      </Button>
    </div>
  );
}

function ResultFooter({
  gameState, score, onClose, onPlayNext,
}: Pick<GameModalProps, 'gameState' | 'score' | 'onClose' | 'onPlayNext'>) {
  const won = gameState === 'won';
  return (
    <div className="space-y-3 pt-1">
      <div className={[
        'flex items-center gap-2 px-3 py-2 rounded-sm font-sans text-sm font-semibold',
        won
          ? 'bg-status-win-subtle border border-status-win text-status-win'
          : 'bg-status-loss-subtle border border-status-loss text-status-negative',
      ].join(' ')}>
        <span>{won ? '¡Campeón! ' : 'Tiempo agotado · '}</span>
        <span className="tabular-nums">{score.guessed}/{score.total} jugadores</span>
      </div>
      <div className="flex justify-between gap-2">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button size="sm" variant="primary" onClick={onPlayNext}>
          Jugar otro plantel
        </Button>
      </div>
    </div>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────

export function GameModal(props: GameModalProps) {
  const { gameState, equipo, players, onClose } = props;
  const isFinished = gameState === 'won' || gameState === 'timeout';

  useModalEffects(onClose);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: 'var(--color-modal-backdrop-dark)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-none bg-boca-blue-light border border-boca-gold/20 rounded-t-2xl sm:rounded-sm overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[88dvh] sm:max-w-md sm:max-h-[90dvh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <ModalHeader
          equipo={equipo}
          score={props.score}
          gameState={gameState}
          onClose={onClose}
        />

        <TimerSection timer={props.timer} gameState={gameState} />

        <div className="flex-1 overflow-y-auto p-4">
          <FormacionPitch players={players} gameState={gameState} />
        </div>

        <div className="p-4 border-t border-boca-gold/10 space-y-3">
          {gameState === 'playing' && (
            <PlayingInput
              input={props.input}
              inputError={props.inputError}
              inputRef={props.inputRef}
              onInputChange={props.onInputChange}
              onSubmit={props.onSubmit}
              onPlayNext={props.onPlayNext}
            />
          )}
          {isFinished && (
            <ResultFooter
              gameState={gameState}
              score={props.score}
              onClose={onClose}
              onPlayNext={props.onPlayNext}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
