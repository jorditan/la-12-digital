import { Download, LayoutGrid, List } from 'lucide-react';
import { Button } from '../ui/Button';
import { SectionHeader } from '../ui/SectionHeader';
import { FixtureTable } from './FixtureTable';
import { ScrollRow } from './ScrollRow';
import { useProximosPartidos } from './hooks/useProximosPartidos';
import { useProximosPartidosView } from './hooks/useProximosPartidosView';
import { SkeletonRow } from './SkeletonRow';

export function ProximosPartidos() {
  const { partidos, estado, cargar } = useProximosPartidos();
  const { vista, setVista, canShowActions, downloadAll } = useProximosPartidosView(partidos, estado);

  const headerAction = canShowActions ? (
    <div className="flex items-center gap-2">
      <Button
        onClick={downloadAll}
        variant="ghost"
        size="icon"
        aria-label="Descargar todos los partidos como .ics"
        title="Exportar al calendario (.ics)"
        className="text-text-secondary hover:text-boca-gold transition-colors"
      >
        <Download size={14} />
      </Button>

      <div className="flex items-center gap-0.5 bg-boca-blue rounded-sm p-0.5 border border-boca-gold/10">
        <Button
          aria-label="Vista tarjetas"
          onClick={() => setVista('cards')}
          variant="ghost"
          size="icon"
          className={[
            'rounded-[2px] transition-colors',
            vista === 'cards' ? 'bg-boca-gold/15 text-boca-gold' : 'text-text-secondary hover:text-white',
          ].join(' ')}
        >
          <LayoutGrid size={14} />
        </Button>
        <Button
          aria-label="Vista tabla"
          onClick={() => setVista('tabla')}
          variant="ghost"
          size="icon"
          className={[
            'rounded-[2px] transition-colors',
            vista === 'tabla' ? 'bg-boca-gold/15 text-boca-gold' : 'text-text-secondary hover:text-white',
          ].join(' ')}
        >
          <List size={14} />
        </Button>
      </div>
    </div>
  ) : undefined;

  return (
    <section aria-label="Próximos partidos" className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col">
      <SectionHeader title="Próximos partidos" action={headerAction} />

      {/* Content */}
      <div className="px-6 pt-4 pb-6 flex flex-col gap-3">
        {estado === 'loading' && <SkeletonRow />}

        {estado === 'error' && (
          <div className="flex items-center gap-3 py-6 px-4 bg-boca-blue-light rounded-sm border border-boca-gold/10">
            <p className="font-sans text-sm text-text-secondary flex-1">
              No se pudieron cargar los próximos partidos
            </p>
            <Button onClick={cargar} variant="secondary" size="sm" className="shrink-0">
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
