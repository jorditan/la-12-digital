import { LayoutGrid, List } from 'lucide-react';
import { Button } from '../ui/Button';
import { FixtureTable } from './FixtureTable';
import { ScrollRow } from './ScrollRow';
import { useProximosPartidos } from './hooks/useProximosPartidos';
import { useProximosPartidosView } from './hooks/useProximosPartidosView';
import { SkeletonRow } from './SkeletonRow';

type Vista = 'cards' | 'tabla';

const VIEW_BUTTONS: { id: Vista; icon: typeof LayoutGrid; label: string }[] = [
  { id: 'cards', icon: LayoutGrid, label: 'Vista tarjetas' },
  { id: 'tabla', icon: List, label: 'Vista tabla' },
];

export function ProximosPartidos() {
  const { partidos, estado, cargar } = useProximosPartidos();
  const { vista, setVista, canShowActions } = useProximosPartidosView(partidos, estado);

  return (
    <section
      aria-label="Próximos partidos"
      className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-boca-border-card px-6 pt-6 pb-3 flex items-center justify-between gap-3">
        <h2 className="type-section-title text-white">Próximos partidos</h2>

        {canShowActions && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-boca-blue rounded-sm p-0.5 border border-boca-gold/10">
              {VIEW_BUTTONS.map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  aria-label={label}
                  onClick={() => setVista(id)}
                  variant="ghost"
                  size="icon"
                  className={[
                    'rounded-[2px] transition-colors',
                    vista === id
                      ? 'bg-boca-gold/15 text-boca-gold'
                      : 'text-text-secondary hover:text-white',
                  ].join(' ')}
                >
                  <Icon size={14} />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pt-4 pb-6 flex flex-col gap-3">
        {estado === 'loading' && <SkeletonRow />}

        {estado === 'error' && (
          <div className="flex items-center gap-3 py-6 px-4 bg-boca-blue-light rounded-sm border border-boca-gold/10">
            <p className="font-sans text-sm text-text-secondary flex-1">
              No se pudieron cargar los próximos partidos
            </p>
            <Button
              onClick={cargar}
              variant="text"
              className="text-xs text-boca-gold border border-boca-gold/30 rounded px-4 py-2 hover:bg-boca-gold/10 shrink-0"
            >
              Reintentar
            </Button>
          </div>
        )}

        {estado === 'ok' && partidos.length === 0 && (
          <p className="font-sans text-sm text-white/50 py-6 text-center">
            No hay próximos partidos disponibles
          </p>
        )}

        {estado === 'ok' && partidos.length > 0 && vista === 'cards' && (
          <ScrollRow partidos={partidos} />
        )}

        {estado === 'ok' && partidos.length > 0 && vista === 'tabla' && (
          <FixtureTable partidos={partidos} />
        )}
      </div>
    </section>
  );
}
