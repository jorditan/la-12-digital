import type { PlantelJugador } from '../Plantel/types';

export type PositionCategory =
  | 'arqueros'
  | 'defensores'
  | 'mediocampistas'
  | 'delanteros';

export interface SlotCoordinate {
  id: string; // e.g. 'arq', 'dfi', 'dfc1', etc.
  name: string; // Display label on tactical pitch, e.g. 'ARQ', 'DFC', 'MC', 'DC'
  category: PositionCategory;
  top: number; // Vertical percentage 0-100
  left: number; // Horizontal percentage 0-100
}

export interface TacticalFormation {
  id: string; // '4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2'
  label: string;
  slots: SlotCoordinate[];
}

export type LineupMap = Record<string, PlantelJugador | null>;
