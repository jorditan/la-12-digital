import type { Player } from '../../types/football';

export type PositionCategory =
  | 'todos'
  | 'arqueros'
  | 'defensores'
  | 'mediocampistas'
  | 'delanteros'
  | 'cuerpo_tecnico';

export interface PositionTab {
  id: PositionCategory;
  label: string;
  count: number;
}

export interface PlantelJugador extends Player {
  positionCategory: PositionCategory;
  positionLabel: string;
}
