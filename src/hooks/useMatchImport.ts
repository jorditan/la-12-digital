// src/hooks/useMatchImport.ts
import type { UpsertAttendancePayload } from '@/types/attendance';
import { normalize } from '@/utils/stringMatch';
import type { EnrichedRow } from './useMatchEnricher';

export interface ImportResult {
  success: boolean;
  count: number;
  error?: string;
}

/**
 * Persiste en Supabase los partidos con status 'found' o 'not_found'.
 * Recibe upsert de useMatchAttendance para reutilizar la lógica existente
 * (que también cachea en la tabla matches).
 */
export function useMatchImport(
  upsert: (payload: UpsertAttendancePayload) => Promise<void>,
) {
  const importMatches = async (rows: EnrichedRow[]): Promise<ImportResult> => {
    // Importamos tanto los encontrados como los no encontrados (manuales)
    const toImport = rows.filter(r => r.status === 'found' || r.status === 'not_found');

    try {
      for (const row of toImport) {
        // Para partidos manuales, generamos un ID determinístico pero que no colisione con IDs de la API
        const matchId = row.status === 'found' 
          ? row.fixtureId!.toString() 
          : `manual-${row.fechaISO}-${normalize(row.rival).replace(/\s+/g, '')}`;

        await upsert({
          matchId,
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
