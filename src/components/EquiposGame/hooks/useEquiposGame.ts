import { useState, useEffect, useRef, useCallback } from "react";
import { BOCA_EQUIPOS, type BocaEquipo } from "../../../data/bocaEquipos";
import {
  type GameState,
  type PlayerState,
  type Score,
  ROUND_SECS,
} from "../types";
import { normalize } from "../../../utils/stringMatch";
import { INPUT_FOCUS_DELAY_MS } from "../../../utils/gameConfig";
import { useInputError } from "../../../hooks/useInputError";

// ── Helpers puros ─────────────────────────────────────────────────────────────

function isMatchPlayer(raw: string, fullName: string): boolean {
  const n = normalize(raw.trim());
  if (n.length < 2) return false;

  const normFull = normalize(fullName);
  if (normFull === n) return true;

  const words = normFull.split(/\s+/);
  if (words.some((w) => w === n)) return true;

  if (n.length >= 4) {
    // Prefijo sobre cualquier palabra de 4+ chars (cubre apellidos compuestos)
    if (words.some((w) => w.length >= 4 && w.startsWith(n))) return true;
  }
  return false;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface EquiposGameState {
  gameState: GameState;
  equipo: BocaEquipo | null;
  players: PlayerState[];
  input: string;
  inputError: boolean;
  timer: number;
  score: Score;
  inputRef: React.RefObject<HTMLInputElement>;
  startGame: () => void;
  closeModal: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function useEquiposGame(): EquiposGameState {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [equipo, setEquipo] = useState<BocaEquipo | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(ROUND_SECS);
  const [score, setScore] = useState<Score>({ guessed: 0, total: 0 });
  const [usedCampeonatos, setUsed] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(
    null,
  ) as React.RefObject<HTMLInputElement>;
  const { inputError, triggerError } = useInputError(inputRef);
  const roundIv = useRef<ReturnType<typeof setInterval>>();

  const pickEquipo = useCallback((): BocaEquipo => {
    const available = BOCA_EQUIPOS.filter(
      (e) => !usedCampeonatos.has(e.campeonato),
    );
    const pool = available.length === 0 ? BOCA_EQUIPOS : available;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [usedCampeonatos]);

  const startGame = useCallback(() => {
    clearInterval(roundIv.current);
    const selected = pickEquipo();
    setEquipo(selected);
    setPlayers(
      selected.equipo_completo.map((j) => ({
        name: j.nombre,
        posicion: j.posicion,
        rol: j.rol,
        guessed: false,
      })),
    );
    setInput("");
    setTimer(ROUND_SECS);
    setGameState("playing");
  }, [pickEquipo]);

  const finishGame = useCallback(
    (won: boolean, finalPlayers?: PlayerState[]) => {
      clearInterval(roundIv.current);
      const ps = finalPlayers ?? players;
      const guessedCount = ps.filter((p) => p.guessed).length;
      setScore({ guessed: guessedCount, total: ps.length });
      if (won) {
        setUsed((prev) => new Set([...prev, equipo!.campeonato]));
        setGameState("correct");
      } else {
        setGameState("timeout");
      }
    },
    [players, equipo],
  );

  const closeModal = useCallback(() => {
    clearInterval(roundIv.current);
    setGameState("waiting");
  }, []);

  // Countdown
  useEffect(() => {
    if (gameState !== "playing") return;
    roundIv.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          finishGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(roundIv.current);
  }, [gameState, finishGame]);

  // Focus input al abrir
  useEffect(() => {
    if (gameState !== "playing") return;
    const t = setTimeout(() => inputRef.current?.focus(), INPUT_FOCUS_DELAY_MS);
    return () => clearTimeout(t);
  }, [gameState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipo || gameState !== "playing") return;

    const matchIndex = players.findIndex(
      (p) => !p.guessed && isMatchPlayer(input, p.name),
    );

    if (matchIndex !== -1) {
      const updated = players.map((p, i) =>
        i === matchIndex ? { ...p, guessed: true } : p,
      );
      setPlayers(updated);
      setInput("");
      inputRef.current?.focus();

      if (updated.every((p) => p.guessed)) {
        finishGame(true, updated);
      }
    } else {
      triggerError(() => setInput(""));
    }
  };

  return {
    gameState,
    equipo,
    players,
    input,
    inputError,
    timer,
    score,
    inputRef,
    startGame,
    closeModal,
    handleChange,
    handleSubmit,
  };
}
