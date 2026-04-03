/**
 * Planteles históricos del Club Atlético Boca Juniors.
 * Fuente: boca_equipos.json — datos verificados.
 * Usados en el juego "El Equipo de Memoria" de La 12 Digital.
 */

import rawData from './boca_equipos.json';

export interface JugadorEquipo {
  nombre: string;
  posicion: string;
  rol: 'Titular' | 'Suplente';
}

export interface BocaEquipo {
  campeonato: string;
  descripcion: string;
  formacion_tactica: string;
  equipo_completo: JugadorEquipo[];
}

export const BOCA_EQUIPOS: BocaEquipo[] = rawData as BocaEquipo[];
