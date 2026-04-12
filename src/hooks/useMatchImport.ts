// src/hooks/useMatchImport.ts
import type { UpsertAttendancePayload } from '@/types/attendance';
import type { EnrichedRow } from './useMatchEnricher';

export interface ImportResult {
  success: boolean;
  count: number;
  error?: string;
}

/**
 * Persiste en Supabase los partidos con status 'found'.
 * Recibe upsert de useMatchAttendance para reutilizar la lógica existente
 * (que también cachea en la tabla matches).
 */
export function useMatchImport(
  upsert: (payload: UpsertAttendancePayload) => Promise<void>,
) {
  const importMatches = async (rows: EnrichedRow[]): Promise<ImportResult> => {
    const toImport = rows.filter(r => r.status === 'found');

    try {
      for (const row of toImport) {
        await upsert({
          matchId: row.fixtureId!.toString(),
          attended: true,
          note: row.notas ?? null,
          matchData: {
            date: row.fechaISO,
            homeTeamId: row.homeTeamId!,
            homeTeamName: row.homeTeam!,
            homeTeamLogo: row.homeTeamLogo,
            awayTeamId: row.awayTeamId!,
            awayTeamName: row.awayTeam!,
            awayTeamLogo: row.awayTeamLogo,
            goalsHome: row.homeGoals ?? null,
            goalsAway: row.awayGoals ?? null,
            competition: row.league ?? row.competencia,
          },
        });
      }
      return { success: true, count: toImport.length };
    } catch (err) {
      return {
        success: false,
        count: 0,
        error: err instanceof Error ? err.message : 'Error desconocido al importar',
      };
    }
  };

  return { importMatches };
}
