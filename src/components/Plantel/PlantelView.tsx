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
    <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-10">
      {/* Header del Plantel */}
      <PlantelHeader totalCount={totalCount} />

      {/* Tabs de navegación por posición */}
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
        <div className="bg-boca-blue-light border border-red-500/30 rounded-sm p-8 text-center max-w-md mx-auto my-8 shadow-card">
          <Activity size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-white font-serif text-base mb-4">{error}</p>
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-boca-gold text-boca-blue font-sans text-xs font-bold rounded-sm hover:bg-boca-gold-hover transition-colors"
          >
            <RotateCcw size={14} />
            Reintentar
          </button>
        </div>
      ) : sections.length > 0 ? (
        /* Contenedores agrupados por posición con encabezados de sección del Dashboard */
        <div className="flex flex-col gap-10">
          {sections.map((section) => {
            const Icon = section.IconComponent;
            return (
              <section key={section.id} className="flex flex-col gap-4">
                {/* Encabezado de sección tipo Dashboard (size={24}, text-boca-gold, font-serif 32px/2xl) */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Icon size={24} className="text-boca-gold shrink-0" />
                    <h2 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-tight">
                      {section.title}
                    </h2>
                  </div>
                  <Badge variant="blue" className="font-sans text-xs font-semibold px-2.5 py-0.5">
                    {section.players.length} {section.players.length === 1 ? 'integrante' : 'integrantes'}
                  </Badge>
                </div>

                {/* Grid de jugadores de la posición */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <div className="bg-boca-blue-light border border-boca-border rounded-sm p-12 text-center">
          <p className="text-text-muted font-serif text-base">
            No se encontraron integrantes registrados para este filtro.
          </p>
        </div>
      )}
    </div>
  );
}
