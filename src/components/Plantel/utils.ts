import type { Player } from '../../types/football';
import type { PositionCategory } from './types';

export function normalizePosition(player: Player): {
  category: PositionCategory;
  label: string;
} {
  if (player.isStaff) {
    return { category: 'cuerpo_tecnico', label: 'Cuerpo Técnico' };
  }

  const raw = (player.position || player.birth?.place || '').trim().toLowerCase();

  if (raw.includes('arquero') || raw.includes('portero') || raw.includes('goalkeeper') || raw === 'g' || raw === 'gk') {
    return { category: 'arqueros', label: 'Arquero' };
  }

  if (
    raw.includes('defensa') ||
    raw.includes('defensor') ||
    raw.includes('lateral') ||
    raw.includes('central') ||
    raw.includes('zaguero') ||
    raw.includes('defender') ||
    raw === 'd' ||
    raw === 'cb' ||
    raw === 'lb' ||
    raw === 'rb'
  ) {
    return { category: 'defensores', label: 'Defensor' };
  }

  if (
    raw.includes('medio') ||
    raw.includes('volante') ||
    raw.includes('pivote') ||
    raw.includes('enganche') ||
    raw.includes('midfielder') ||
    raw === 'm' ||
    raw === 'cm' ||
    raw === 'dm' ||
    raw === 'am'
  ) {
    return { category: 'mediocampistas', label: 'Mediocampista' };
  }

  if (
    raw.includes('delantero') ||
    raw.includes('atacante') ||
    raw.includes('extremo') ||
    raw.includes('punta') ||
    raw.includes('forward') ||
    raw.includes('attacker') ||
    raw === 'f' ||
    raw === 'fw' ||
    raw === 'st'
  ) {
    return { category: 'delanteros', label: 'Delantero' };
  }

  return { category: 'mediocampistas', label: 'Jugador' };
}

export function formatHeight(height?: string): string {
  if (!height) return '';
  const num = parseFloat(height.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return height;
  if (num > 100) {
    return `${(num / 100).toFixed(2)} m`;
  }
  return `${num.toFixed(2)} m`;
}
