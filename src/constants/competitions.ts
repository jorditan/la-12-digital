/**
 * Constantes de competiciones compartidas para el Frontend
 */
export const COMPETITION_IDS = {
  LIGA_PROFESIONAL: 23,
  COPA_LIBERTADORES: 329,
  COPA_SUDAMERICANA: 11,
  COPA_ARGENTINA: 14,
} as const;

export const PROMIEDOS_LEAGUE_SLUGS = {
  [COMPETITION_IDS.LIGA_PROFESIONAL]: { slug: 'liga-profesional', id: 'hc' },
  [COMPETITION_IDS.COPA_LIBERTADORES]: { slug: 'libertadores', id: 'bac' },
  [COMPETITION_IDS.COPA_SUDAMERICANA]: { slug: 'conmebol-sudamericana', id: 'dij' },
} as const;

export const COMPETITION_NAMES: Record<number, string> = {
  [COMPETITION_IDS.LIGA_PROFESIONAL]: 'Liga Profesional',
  [COMPETITION_IDS.COPA_LIBERTADORES]: 'Copa Libertadores',
  [COMPETITION_IDS.COPA_SUDAMERICANA]: 'Copa Sudamericana',
  [COMPETITION_IDS.COPA_ARGENTINA]: 'Copa Argentina',
};
