export type GameState = "waiting" | "playing" | "won" | "timeout";

export interface PlayerState {
  name: string;
  posicion: string;
  rol: string;
  guessed: boolean;
}

export interface Score {
  guessed: number;
  total: number;
}

export const ROUND_SECS = 180;
