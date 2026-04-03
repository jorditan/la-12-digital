import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { MatchAttendance, UpsertAttendancePayload, AsyncState } from '@/types/attendance';

type DBRow = {
  id: string;
  user_id: string;
  match_id: string;
  attended: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
};

function rowToAttendance(row: DBRow): MatchAttendance {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    attended: row.attended,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface UseMatchAttendanceReturn {
  attendanceMap: Record<string, MatchAttendance>;
  estado: AsyncState;
  error: string | null;
  upsert: (payload: UpsertAttendancePayload) => Promise<void>;
  remove: (matchId: string) => Promise<void>;
  totalAttended: number;
}

export function useMatchAttendance(userId: string | null): UseMatchAttendanceReturn {
  const [attendanceMap, setAttendanceMap] = useState<Record<string, MatchAttendance>>({});
  const [estado, setEstado] = useState<AsyncState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAttendanceMap({});
      setEstado('ok');
      return;
    }

    setEstado('loading');
    supabase
      .from('match_attendance')
      .select('*')
      .eq('user_id', userId)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setEstado('error');
          return;
        }
        const map: Record<string, MatchAttendance> = {};
        for (const row of (data ?? []) as DBRow[]) {
          const attendance = rowToAttendance(row);
          map[attendance.matchId] = attendance;
        }
        setAttendanceMap(map);
        setEstado('ok');
      });
  }, [userId]);

  const upsert = useCallback(async ({ matchId, attended, note }: UpsertAttendancePayload) => {
    if (!userId) return;
    setError(null);

    const { data, error: upsertError } = await supabase
      .from('match_attendance')
      .upsert(
        { user_id: userId, match_id: matchId, attended, note: note ?? null },
        { onConflict: 'user_id,match_id' }
      )
      .select()
      .single();

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setAttendanceMap(prev => ({
      ...prev,
      [matchId]: rowToAttendance(data as DBRow),
    }));
  }, [userId]);

  const remove = useCallback(async (matchId: string) => {
    if (!userId) return;
    setError(null);

    const { error: deleteError } = await supabase
      .from('match_attendance')
      .delete()
      .eq('user_id', userId)
      .eq('match_id', matchId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setAttendanceMap(prev => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
  }, [userId]);

  const totalAttended = Object.values(attendanceMap).filter(a => a.attended).length;

  return { attendanceMap, estado, error, upsert, remove, totalAttended };
}
