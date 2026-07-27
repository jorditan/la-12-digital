import { useMemo } from 'react';
import { usePlantel } from './hooks/usePlantel';
import { PlantelHeader } from './PlantelHeader';
import { PlantelTabs } from './PlantelTabs';
import { JugadorCard } from './JugadorCard';
import { JugadorSkeleton } from './JugadorSkeleton';
import type { PlantelJugador, PositionCategory } from './types';
import { Badge } from '../ui/Badge';
import {
  Shield,
  ShieldAlert,
  Activity,
  Flame,
  Briefcase,
  RotateCcw,
} from 'lucide-react';
import type { ComponentType } from 'react';

interface PositionSection {
  id: PositionCategory;
  title: string;
  IconComponent: ComponentType<{ size?: number | string; className?: string }>;
  players: PlantelJugador[];
}

const SECTION_CONFIG: Array<{
  id: PositionCategory;
  title: string;
  IconComponent: ComponentType<{ size?: number | string; className?: string }>;
}> = [
  { id: 'arqueros', title: 'Arqueros', IconComponent: Shield },
  { id: 'defensores', title: 'Defensores', IconComponent: ShieldAlert },
  { id: 'mediocampistas', title: 'Mediocampistas', IconComponent: Activity },
  { id: 'delanteros', title: 'Delanteros', IconComponent: Flame },
  { id: 'cuerpo_tecnico', title: 'Cuerpo Técnico', IconComponent: Briefcase },
];

export function PlantelView() {
  const {
    loading,
    error,
    activeTab,
    setActiveTab,
    tabs,
    jugadores,
    totalCount,
    averageAge,
    reload,
  } = usePlantel();

  // Agrupar jugadores por sección de posición
  const sections = useMemo<PositionSection[]>(() => {
    return SECTION_CONFIG.map((config) => ({
      ...config,
      players: jugadores.filter((j) => j.positionCategory === config.id),
    })).filter((section) => {
      if (activeTab !== 'todos' && section.id !== activeTab) return false;
      return section.players.length > 0;
    });
  }, [jugadores, activeTab]);

  return (
    <div className="flex-1 min-w-0 px-3 py-3 sm:px-6 sm:py-8 lg:px-10 flex flex-col gap-4 sm:gap-8">
      {/* Header del Plantel con insights de cantidad y promedio de edad */}
      <PlantelHeader totalCount={totalCount} averageAge={averageAge} />

      {/* Selector desplegable de posición (SelectDropdown) */}
      {!loading && !error && (
        <PlantelTabs tabs={tabs} activeTab={activeTab} onSelectTab={setActiveTab} />
      )}

      {/* Estado de carga */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <JugadorSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        /* Estado de error */
        <div className="bg-boca-blue-mid border border-red-500/30 rounded-sm p-8 text-center max-w-md mx-auto my-8 shadow-card">
          <Activity size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-white font-serif text-base mb-4">{error}</p>
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-boca-gold text-boca-blue font-sans text-sm font-bold rounded-sm hover:bg-boca-gold-hover transition-colors"
          >
            <RotateCcw size={16} />
            Reintentar
          </button>
        </div>
      ) : sections.length > 0 ? (
        /* Contenedores por posición en bg-boca-blue-mid border border-boca-border (idénticos a ProximosPartidos y BomboneraWidget) */
        <div className="flex flex-col gap-6 sm:gap-8">
          {sections.map((section) => {
            const Icon = section.IconComponent;
            return (
              <section
                key={section.id}
                className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col p-4 sm:p-6 gap-4 shadow-card"
              >
                {/* Encabezado de la sección con border-b border-boca-border-card */}
                <div className="flex items-center justify-between pb-4 border-b border-boca-border-card">
                  <div className="flex items-center gap-3">
                    <Icon size={24} className="text-boca-gold shrink-0" />
                    <h2 className="type-section-title text-white tracking-tight">
                      {section.title}
                    </h2>
                  </div>
                  <Badge variant="blue" className="font-sans text-sm font-semibold px-3 py-1">
                    {section.players.length} {section.players.length === 1 ? 'integrante' : 'integrantes'}
                  </Badge>
                </div>

                {/* Grid de tarjetas dentro del contenedor azul mid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                  {section.players.map((jugador) => (
                    <JugadorCard key={jugador.id} jugador={jugador} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Estado vacío */
        <div className="bg-boca-blue-mid border border-boca-border rounded-sm p-12 text-center">
          <p className="text-text-muted font-serif text-base">
            No se encontraron integrantes registrados para este filtro.
          </p>
        </div>
      )}
    </div>
  );
}
