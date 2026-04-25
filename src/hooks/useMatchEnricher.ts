// src/hooks/useMatchEnricher.ts
import type { MatchResult } from '@/services/apifootball';
import { normalize } from '@/utils/stringMatch';
import type { ParsedRow } from './useFileParser';

export type EnrichStatus = 'found' | 'not_found' | 'duplicate';

export interface EnrichedRow extends ParsedRow {
  status: EnrichStatus;
  fixtureId?: number;
  homeTeam?: string;
  homeTeamId?: number;
  homeTeamLogo?: string;
  awayTeam?: string;
  awayTeamId?: number;
  awayTeamLogo?: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
  league?: string;
}

/**
 * Enriquece filas del Excel con datos de partidos reales.
 * El matching es local — no hace llamadas adicionales a APIs.
 *
 * @param matches     Array de MatchResult ya cargado en useMiHistorial
 * @param existingIds matchIds que el usuario ya tiene en su historial
 */
export function useMatchEnricher(matches: MatchResult[], existingIds: string[]) {
  const enrich = (
    rows: ParsedRow[],
    onProgress: (current: number, total: number) => void,
  ): EnrichedRow[] => {
    return rows.map((row, i) => {
      onProgress(i + 1, rows.length);

      // Buscar por fecha exacta
      const byDate = matches.filter(m => m.date.slice(0, 10) === row.fechaISO);

      let matched: MatchResult | undefined;

      if (byDate.length === 1) {
        matched = byDate[0];
      } else if (byDate.length > 1) {
        // Fuzzy match por nombre del rival
        const normalRival = normalize(row.rival);
        matched = byDate.find(m => {
          const home = normalize(m.homeTeam.name);
          const away = normalize(m.awayTeam.name);
          return (
            home.includes(normalRival) || away.includes(normalRival) ||
            normalRival.includes(home) || normalRival.includes(away)
          );
        });
      }

      if (!matched) {
        // Si no hay match, usamos los datos del Excel para crear un "manual match"
        const manualId = `manual-${row.fechaISO}-${normalize(row.rival)}`;
        const isDuplicate = existingIds.includes(manualId);

        return {
          ...row,
          status: isDuplicate ? 'duplicate' : 'not_found',
          homeTeam: row.condicion === 'Local' ? 'Boca Juniors' : row.rival,
          homeTeamId: row.condicion === 'Local' ? 451 : 0,
          awayTeam: row.condicion === 'Local' ? row.rival : 'Boca Juniors',
          awayTeamId: row.condicion === 'Local' ? 0 : 451,
          homeGoals: row.condicion === 'Local' ? row.golesBoca : row.golesRival,
          awayGoals: row.condicion === 'Local' ? row.golesRival : row.golesBoca,
          league: row.competencia,
        };
      }

      const isDuplicate = existingIds.includes(matched.fixtureId.toString());
      return {
        ...row,
        status: isDuplicate ? 'duplicate' : 'found',
        fixtureId: matched.fixtureId,
        homeTeam: matched.homeTeam.name,
        homeTeamId: matched.homeTeam.id,
        homeTeamLogo: matched.homeTeam.logo,
        awayTeam: matched.awayTeam.name,
        awayTeamId: matched.awayTeam.id,
        awayTeamLogo: matched.awayTeam.logo,
        homeGoals: matched.goalsHome,
        awayGoals: matched.goalsAway,
        league: matched.competition,
      };
    });
  };

  return { enrich };
}
