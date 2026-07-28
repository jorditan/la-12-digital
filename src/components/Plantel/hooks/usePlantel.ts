import { useEffect, useState, useMemo, useCallback } from 'react';
import { getTeamSquad } from '../../../services/footballApiService';
import type { Squad } from '../../../types/football';
import type { PlantelJugador, PositionCategory, PositionTab } from '../types';
import { normalizePosition } from '../utils';

export function usePlantel() {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PositionCategory>('todos');

  const loadSquad = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeamSquad();
      setSquad(data);
    } catch (err) {
      console.error('[usePlantel] Error al cargar el plantel:', err);
      setError('No se pudo cargar el plantel profesional en este momento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSquad();
  }, [loadSquad]);

  const jugadores = useMemo<PlantelJugador[]>(() => {
    if (!squad?.players) return [];
    return squad.players.map((p) => {
      const { category, label } = normalizePosition(p);
      return {
        ...p,
        positionCategory: category,
        positionLabel: label,
      };
    });
  }, [squad]);

  const averageAge = useMemo<number>(() => {
    const validPlayers = jugadores.filter((j) => !j.isStaff && j.age > 0);
    if (validPlayers.length === 0) return 0;
    const sum = validPlayers.reduce((acc, j) => acc + j.age, 0);
    return Math.round((sum / validPlayers.length) * 10) / 10;
  }, [jugadores]);

  const tabs = useMemo<PositionTab[]>(() => {
    const counts: Record<PositionCategory, number> = {
      todos: jugadores.length,
      arqueros: 0,
      defensores: 0,
      mediocampistas: 0,
      delanteros: 0,
      cuerpo_tecnico: 0,
    };

    jugadores.forEach((j) => {
      if (counts[j.positionCategory] !== undefined) {
        counts[j.positionCategory]++;
      }
    });

    return [
      { id: 'todos', label: 'Todos', count: counts.todos },
      { id: 'arqueros', label: 'Arqueros', count: counts.arqueros },
      { id: 'defensores', label: 'Defensores', count: counts.defensores },
      { id: 'mediocampistas', label: 'Mediocampistas', count: counts.mediocampistas },
      { id: 'delanteros', label: 'Delanteros', count: counts.delanteros },
      { id: 'cuerpo_tecnico', label: 'Cuerpo Técnico', count: counts.cuerpo_tecnico },
    ];
  }, [jugadores]);

  const jugadoresFiltrados = useMemo<PlantelJugador[]>(() => {
    if (activeTab === 'todos') return jugadores;
    return jugadores.filter((j) => j.positionCategory === activeTab);
  }, [jugadores, activeTab]);

  return {
    squad,
    loading,
    error,
    activeTab,
    setActiveTab,
    tabs,
    jugadores: jugadoresFiltrados,
    totalCount: jugadores.length,
    averageAge,
    reload: loadSquad,
  };
}
