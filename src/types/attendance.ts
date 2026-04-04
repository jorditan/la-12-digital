import type { MatchResult } from '@/services/apifootball';

/** Usuario autenticado de Supabase */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

/** Fila de la tabla match_attendance */
export interface MatchAttendance {
  id: string;
  userId: string;
  matchId: string;
  attended: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Partido con datos de asistencia del usuario */
export interface MatchWithAttendance extends MatchResult {
  attendance: MatchAttendance | null;
}

/** Datos del partido para cachear en la tabla matches */
export interface MatchCacheData {
  date: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo?: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo?: string;
  goalsHome?: number | null;
  goalsAway?: number | null;
  venue?: string;
  competition?: string;
}

/** Payload para crear/actualizar asistencia */
export interface UpsertAttendancePayload {
  matchId: string;
  attended: boolean;
  note?: string | null;
  matchData?: MatchCacheData;
}

/** Estado async estándar del proyecto */
export type AsyncState = 'loading' | 'error' | 'ok';
