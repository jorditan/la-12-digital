import { useState, useMemo, useCallback } from 'react';
import { usePlantel } from '../../Plantel/hooks/usePlantel';
import type { PlantelJugador } from '../../Plantel/types';
import type { LineupMap, SlotCoordinate } from '../types';
import { FORMATIONS_PRESETS } from '../utils/formations';

export function useArmaTu11() {
  const { squad, loading, error, reload } = usePlantel();
  const [formationId, setFormationId] = useState<string>('4-3-3');
  const [lineup, setLineup] = useState<LineupMap>({});
  const [selectedSlot, setSelectedSlot] = useState<SlotCoordinate | null>(null);

  const currentFormation = useMemo(() => {
    return (
      FORMATIONS_PRESETS.find((f) => f.id === formationId) || FORMATIONS_PRESETS[0]
    );
  }, [formationId]);

  // Lista de todos los jugadores disponibles
  const allPlayers = useMemo<PlantelJugador[]>(() => {
    if (!squad?.players) return [];
    return squad.players.map((p) => ({
      ...p,
      positionCategory: p.isStaff
        ? 'cuerpo_tecnico'
        : (p.position?.toLowerCase().includes('arquero') || p.position === 'G'
            ? 'arqueros'
            : p.position?.toLowerCase().includes('defensa') || p.position === 'D'
            ? 'defensores'
            : p.position?.toLowerCase().includes('delantero') || p.position === 'F'
            ? 'delanteros'
            : 'mediocampistas') as any,
      positionLabel: p.position || 'Jugador',
    }));
  }, [squad]);

  // IDs de jugadores ya asignados en la cancha
  const assignedPlayerIds = useMemo<Set<number | string>>(() => {
    const set = new Set<number | string>();
    Object.values(lineup).forEach((player) => {
      if (player) set.add(player.id);
    });
    return set;
  }, [lineup]);

  // Promedio de edad de los 11 elegidos
  const averageAge = useMemo<number>(() => {
    const selected = Object.values(lineup).filter(
      (p): p is PlantelJugador => p !== null && p.age > 0
    );
    if (selected.length === 0) return 0;
    const sum = selected.reduce((acc, p) => acc + p.age, 0);
    return Math.round((sum / selected.length) * 10) / 10;
  }, [lineup]);

  const assignedCount = useMemo<number>(() => {
    return Object.values(lineup).filter(Boolean).length;
  }, [lineup]);

  const assignPlayer = useCallback(
    (slotId: string, player: PlantelJugador) => {
      setLineup((prev) => {
        const next = { ...prev };
        // Si el jugador ya estaba en otra posición, liberarla
        Object.keys(next).forEach((key) => {
          if (next[key]?.id === player.id) {
            next[key] = null;
          }
        });
        next[slotId] = player;
        return next;
      });
      setSelectedSlot(null);
    },
    []
  );

  const removePlayer = useCallback((slotId: string) => {
    setLineup((prev) => ({
      ...prev,
      [slotId]: null,
    }));
  }, []);

  const clearLineup = useCallback(() => {
    setLineup({});
  }, []);

  return {
    loading,
    error,
    reload,
    allPlayers,
    formationId,
    setFormationId,
    currentFormation,
    lineup,
    selectedSlot,
    setSelectedSlot,
    assignedPlayerIds,
    assignedCount,
    averageAge,
    assignPlayer,
    removePlayer,
    clearLineup,
  };
}
