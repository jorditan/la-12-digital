import { useMemo } from 'react';
import { usePlantel } from './hooks/usePlantel';
import { PlantelHeader } from './PlantelHeader';
import { PlantelTabs } from './PlantelTabs';
import { JugadorCard } from './JugadorCard';
import { JugadorSkeleton } from './JugadorSkeleton';
import type { PlantelJugador, PositionCategory } from './types';
import { Badge } from '../ui/Badge';
import { Activity, RotateCcw } from 'lucide-react';

interface PositionSection {
  id: PositionCategory;
  title: string;
  icon: string;
  players: PlantelJugador[];
}

const SECTION_CONFIG: Array<{ id: PositionCategory; title: string; icon: string }> = [
  { id: 'arqueros', title: 'Arqueros', icon: '🧤' },
  { id: 'defensores', title: 'Defensores', icon: '🛡️' },
  { id: 'mediocampistas', title: 'Mediocampistas', icon: '⚽' },
  { id: 'delanteros', title: 'Delanteros', icon: '🎯' },
  { id: 'cuerpo_tecnico', title: 'Cuerpo Técnico', icon: '📋' },
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
          <Activity className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-white font-serif text-base mb-4">{error}</p>
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-boca-gold text-boca-blue font-sans text-xs font-bold rounded-sm hover:bg-boca-gold-hover transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      ) : sections.length > 0 ? (
        /* Contenedores agrupados por posición */
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.id} className="flex flex-col gap-4">
              {/* Encabezado de sección */}
              <div className="flex items-center justify-between pb-2 border-b border-boca-border">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl" role="img" aria-label={section.title}>
                    {section.icon}
                  </span>
                  <h2 className="font-serif font-bold text-lg text-white tracking-wide">
                    {section.title}
                  </h2>
                </div>
                <Badge variant="blue" className="font-sans text-xs font-semibold px-2 py-0.5">
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
          ))}
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
