import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { IDOLOS, type Idolo } from '../../data/idolos';
import { ESCUDO_VACIO } from '../../data/equipos';

type GameState = 'waiting' | 'playing' | 'correct' | 'timeout';

const ROUND_SECS  = 30;
const WAIT_SECS   = 45;
const RESULT_SECS = 4;

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isMatch(raw: string, idolo: Idolo): boolean {
  const n = normalize(raw.trim());
  if (n.length < 2) return false;
  const checks = [
    idolo.nombre,
    idolo.apellido,
    idolo.apodo,
    `${idolo.nombre} ${idolo.apellido}`,
  ];
  if (checks.some(c => normalize(c) === n)) return true;
  if (n.length >= 4) {
    if (normalize(idolo.apellido).startsWith(n)) return true;
    if (normalize(idolo.apodo).startsWith(n)) return true;
  }
  return false;
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

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

// ── Modal del juego ──────────────────────────────────────────────────────────

interface ModalProps {
  state: Exclude<GameState, 'waiting'>;
  idolo: Idolo;
  timer: number;
  visibleClues: number;
  input: string;
  inputError: boolean;
  score: { correct: number; total: number };
  inputRef: React.RefObject<HTMLInputElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onPlayNext: () => void;
}

function GameModal({
  state, idolo, timer, visibleClues, input, inputError, score,
  inputRef, onInputChange, onSubmit, onClose, onPlayNext,
}: ModalProps) {
  const revealed = state === 'correct' || state === 'timeout';

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloquear scroll del body
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
      {/* Card — detiene la propagación para no cerrar al hacer click dentro */}
      <div
        className={[
          'relative w-full max-w-sm',
          'bg-boca-blue-light border border-boca-gold/20 rounded-sm',
          'overflow-hidden shadow-2xl',
          'animate-fade-in',
        ].join(' ')}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-boca-gold/10">
          <h3 className="font-serif font-bold text-lg text-boca-gold leading-none">
            ¿Qué ídolo es?
          </h3>
          <div className="flex items-center gap-3">
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
                  'w-full h-full object-contain',
                  'transition-all duration-700',
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

          {/* Badge de resultado sobre la foto */}
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
                {state === 'correct' ? '¡Correcto! 🎉' : 'Tiempo agotado'}
              </span>
            </div>
          )}
        </div>

        {/* Contenido del modal */}
        <div className="p-4 space-y-3">

          {/* PLAYING */}
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
                {visibleClues < 3 && (
                  <li className="text-xs text-text-secondary font-sans pl-6">
                    +{3 - visibleClues} pista{3 - visibleClues > 1 ? 's' : ''} en{' '}
                    {timer > 20 ? timer - 20 : timer > 10 ? timer - 10 : 0}s
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
                    'bg-boca-blue rounded-sm',
                    'text-white placeholder:text-text-secondary',
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

          {/* RESULT */}
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
              {idolo.titulos.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {idolo.titulos.slice(0, 4).map((t, i) => (
                    <span
                      key={i}
                      className="font-sans text-xs bg-boca-blue border border-boca-gold/15 text-boca-gold/70 px-2 py-0.5 rounded-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {state === 'correct' ? (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="primary" onClick={onPlayNext}>
                    Jugar otro
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onClose}>
                    Cerrar
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

// ── Componente principal ─────────────────────────────────────────────────────

export function IdolosGame() {
  const [state, setState]          = useState<GameState>('waiting');
  const [idolo, setIdolo]          = useState<Idolo | null>(null);
  const [visibleClues, setVisible] = useState(1);
  const [input, setInput]          = useState('');
  const [timer, setTimer]          = useState(ROUND_SECS);
  const [waitTimer, setWaitTimer]  = useState(WAIT_SECS);
  const [score, setScore]          = useState({ correct: 0, total: 0 });
  const [usedIds, setUsedIds]      = useState<Set<string>>(new Set());
  const [inputError, setInputError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const roundIv  = useRef<ReturnType<typeof setInterval>>();

  const pickIdolo = useCallback((): Idolo => {
    const available = IDOLOS.filter(i => !usedIds.has(i.id));
    const pool = available.length === 0 ? IDOLOS : available;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [usedIds]);

  const startRound = useCallback(() => {
    clearInterval(roundIv.current);
    const selected = pickIdolo();
    setIdolo(selected);
    setVisible(1);
    setInput('');
    setTimer(ROUND_SECS);
    setState('playing');
  }, [pickIdolo]);

  const finishRound = useCallback((won: boolean) => {
    clearInterval(roundIv.current);
    if (won) {
      setUsedIds(prev => new Set([...prev, idolo!.id]));
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      setState('correct');
    } else {
      setScore(s => ({ ...s, total: s.total + 1 }));
      setState('timeout');
    }
  }, [idolo]);

  const closeModal = useCallback(() => {
    clearInterval(roundIv.current);
    setState('waiting');
  }, []);

  // Countdown esporádico en waiting
  useEffect(() => {
    if (state !== 'waiting') return;
    setWaitTimer(WAIT_SECS);
    const iv = setInterval(() => {
      setWaitTimer(prev => {
        if (prev <= 1) { clearInterval(iv); startRound(); return WAIT_SECS; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [state, startRound]);

  // Countdown de ronda
  useEffect(() => {
    if (state !== 'playing') return;
    roundIv.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { finishRound(false); return 0; }
        const next = prev - 1;
        if (next === 20) setVisible(2);
        if (next === 10) setVisible(3);
        return next;
      });
    }, 1000);
    return () => clearInterval(roundIv.current);
  }, [state, finishRound]);

  // Auto-cerrar modal solo cuando se agota el tiempo
  useEffect(() => {
    if (state !== 'timeout') return;
    const t = setTimeout(() => setState('waiting'), RESULT_SECS * 1000);
    return () => clearTimeout(t);
  }, [state]);

  // Focus en input al abrir el modal
  useEffect(() => {
    if (state === 'playing') {
      // Pequeño delay para que el DOM del modal esté listo
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idolo) return;
    if (isMatch(input, idolo)) {
      finishRound(true);
    } else {
      setInputError(true);
      setTimeout(() => {
        setInputError(false);
        setInput('');
        inputRef.current?.focus();
      }, 600);
    }
  };

  // ── Widget en el aside (siempre visible) ────────────────────────────────────
  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-bold text-[22px] leading-tight text-boca-gold">
            ¿Qué ídolo es?
          </h2>
          {score.total > 0 && (
            <span className="font-sans text-xs text-text-secondary tabular-nums">
              {score.correct}/{score.total} ✓
            </span>
          )}
        </div>

        <div className="bg-boca-blue-light border border-boca-gold/10 rounded-sm p-4">
          <div className="flex flex-col items-center gap-4 py-3 text-center">
            {/* Icono decorativo */}
            <div className="w-12 h-12 rounded-full border border-boca-gold/20 flex items-center justify-center bg-boca-blue">
              <span className="text-2xl select-none">⚽</span>
            </div>

            <div>
              <p className="font-serif text-base text-white leading-snug">
                ¿Podés adivinar al ídolo?
              </p>
              {state === 'waiting' ? (
                <p className="text-xs text-text-secondary font-sans mt-1">
                  Próximo desafío en{' '}
                  <span className="text-boca-gold font-semibold tabular-nums">{waitTimer}s</span>
                </p>
              ) : (
                <p className="text-xs text-boca-gold font-sans mt-1 font-semibold animate-pulse">
                  ¡Desafío en curso!
                </p>
              )}
            </div>

            <Button
              size="md"
              variant={state === 'waiting' ? 'primary' : 'secondary'}
              onClick={state === 'waiting' ? startRound : closeModal}
            >
              {state === 'waiting' ? 'Jugar ahora' : 'Ver desafío'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal — solo visible cuando el juego está activo */}
      {state !== 'waiting' && idolo && (
        <GameModal
          state={state as Exclude<GameState, 'waiting'>}
          idolo={idolo}
          timer={timer}
          visibleClues={visibleClues}
          input={input}
          inputError={inputError}
          score={score}
          inputRef={inputRef}
          onInputChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
          onPlayNext={startRound}
        />
      )}
    </>
  );
}
