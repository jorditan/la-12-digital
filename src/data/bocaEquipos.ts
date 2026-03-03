/**
 * Planteles históricos del Club Atlético Boca Juniors.
 * Fuente: boca_equipos.json — datos verificados.
 * Usados en el juego "El Equipo de Memoria" de La 12 Digital.
 */

import rawData from '../../boca_equipos.json';

export interface BocaEquipo {
  campeonato: string;
  descripcion: string;
  equipo_completo: string[];
}

export const BOCA_EQUIPOS: BocaEquipo[] = rawData as BocaEquipo[];
