import type { MatchResult } from '@/services/apifootball';

/** Usuario autenticado de Supabase */
export interface AuthUser {
  id: string;
  email: string;
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

/** Payload para crear/actualizar asistencia */
export interface UpsertAttendancePayload {
  matchId: string;
  attended: boolean;
  note?: string | null;
}

/** Estado async estándar del proyecto */
export type AsyncState = 'loading' | 'error' | 'ok';
