import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IDOLOS, type Idolo } from '../../../data/idolos';
import { type GameState, type Score, ROUND_SECS, RESULT_SECS } from '../types';

// ── Helpers puros ─────────────────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isMatch(raw: string, idolo: Idolo): boolean {
  const n = normalize(raw.trim());
  if (n.length < 2) return false;

  // Apodo sin artículo inicial (ej. "El Apache" → "apache", "La Roca" → "roca")
  const apodoBase = normalize(idolo.apodo).replace(/^(el|la|los|las)\s+/, '');

  const checks = [
    idolo.nombre,
    idolo.apellido,
    idolo.apodo,
    apodoBase,
    `${idolo.nombre} ${idolo.apellido}`,
  ];
  if (checks.some(c => normalize(c) === n)) return true;

  // Para apellidos compuestos, acepta cualquier parte (ej. "Barros" o "Schelotto")
  const partesApellido = normalize(idolo.apellido).split(/\s+/);
  if (partesApellido.some(p => p === n)) return true;

  if (n.length >= 4) {
    if (normalize(idolo.apellido).startsWith(n)) return true;
    if (apodoBase.startsWith(n)) return true;
  }
  return false;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface IdolosGameState {
  state: GameState;
  idolo: Idolo | null;
  timer: number;
  visibleClues: number;
  input: string;
  inputError: boolean;
  score: Score;
  bgIdolo: Idolo;
  inputRef: React.RefObject<HTMLInputElement>;
  startRound: () => void;
  closeModal: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function useIdolosGame(): IdolosGameState {
  const [state, setState]           = useState<GameState>('waiting');
  const [idolo, setIdolo]           = useState<Idolo | null>(null);
  const [visibleClues, setVisible]  = useState(1);
  const [input, setInput]           = useState('');
  const [timer, setTimer]           = useState(ROUND_SECS);
  const [score, setScore]           = useState<Score>({ correct: 0, total: 0 });
  const [usedIds, setUsedIds]       = useState<Set<string>>(new Set());
  const [inputError, setInputError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const roundIv  = useRef<ReturnType<typeof setInterval>>();

  const bgIdolo = useMemo(() => {
    const withImage = IDOLOS.filter(i => i.imageUrl !== null);
    const pool = withImage.length > 0 ? withImage : IDOLOS;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

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

  // Countdown de ronda
  useEffect(() => {
    if (state !== 'playing') return;
    roundIv.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { finishRound(false); return 0; }
        const next = prev - 1;
        // Revelar una pista cada 5 segundos: en t=25, 20, 15, 10, 5
        if (next === 25) setVisible(2);
        if (next === 20) setVisible(3);
        if (next === 15) setVisible(4);
        if (next === 10) setVisible(5);
        if (next === 5)  setVisible(6);
        return next;
      });
    }, 1000);
    return () => clearInterval(roundIv.current);
  }, [state, finishRound]);

  // Auto-cerrar modal cuando se agota el tiempo
  useEffect(() => {
    if (state !== 'timeout') return;
    const t = setTimeout(() => setState('waiting'), RESULT_SECS * 1000);
    return () => clearTimeout(t);
  }, [state]);

  // Focus en input al abrir el modal
  useEffect(() => {
    if (state !== 'playing') return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
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

  return {
    state,
    idolo,
    timer,
    visibleClues,
    input,
    inputError,
    score,
    bgIdolo,
    inputRef,
    startRound,
    closeModal,
    handleChange,
    handleSubmit,
  };
}
