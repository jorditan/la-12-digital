export type GameState = 'waiting' | 'playing' | 'correct' | 'timeout';

export interface Score {
  correct: number;
  total: number;
}

export const ROUND_SECS  = 30;
export const RESULT_SECS = 4;
