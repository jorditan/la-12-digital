import type { ReactNode } from 'react';
import { ESCUDO_VACIO } from '../../data/equipos';
import { Button } from '../ui/Button';
import { SelectDropdown } from '../ui/SelectDropdown';
import { Tab } from '../ui/Tab';
import { useTablaPosiciones, COMPETITION_OPTIONS } from './useTablaPosiciones';

type TablaPosicionesProps = {
  headerAction?: ReactNode;
};

export function TablaPosiciones({ headerAction }: TablaPosicionesProps) {
  const {
    competicion,
    handleCompeticionChange,
    activeEstado,
    displayRows,
    shouldShowZoneSelector,
    zoneNames,
    activeZone,
    setActiveZone,
    isLibertadores,
    activeZoneLabel,
    retry,
  } = useTablaPosiciones();

  return (
    <section
      aria-label="Posiciones"
      className="h-full bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-boca-border-card bg-boca-blue-mid px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-3 flex items-center justify-between gap-3">
        <h2 className="type-section-title text-white shrink-0">
          Posiciones
        </h2>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <Tab
            options={COMPETITION_OPTIONS}
            value={competicion}
            onChange={handleCompeticionChange}
            fullWidth
            className="min-w-0 flex-1 max-w-[11rem]"
          />
          {headerAction}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-h-0 px-2 pb-3 pt-3 sm:px-3 sm:pb-4 flex flex-col">
        {activeEstado === 'loading' && <SkeletonTabla />}

        {activeEstado === 'error' && (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="font-sans text-sm text-text-secondary">
              No se pudo cargar la tabla
            </p>
            <Button
              onClick={retry}
              variant="text"
              className="text-sm text-boca-gold rounded px-4 py-2 hover:bg-boca-gold/10"
            >
              Reintentar
            </Button>
          </div>
        )}

        {activeEstado === 'ok' && shouldShowZoneSelector && (
          <div className="pb-2">
            <SelectDropdown
              options={zoneNames.map(z => ({ value: z, label: z }))}
              value={activeZone}
              onChange={setActiveZone}
              className="w-full"
            />
          </div>
        )}

        {activeEstado === 'ok' && isLibertadores && activeZoneLabel && (
          <div className="pb-2">
            <div className="inline-flex items-center rounded-sm border border-boca-gold/20 bg-boca-gold/10 px-2.5 py-1 font-sans text-xs font-medium uppercase tracking-wide text-boca-gold">
              {activeZoneLabel}
            </div>
          </div>
        )}

        {activeEstado === 'ok' && displayRows.length === 0 && (
          <p className="font-sans text-sm text-white/50 py-8 text-center px-4">
            {isLibertadores
              ? 'Todavía no hay datos del grupo de Boca en la Libertadores'
              : 'No hay datos de posiciones disponibles'}
          </p>
        )}

        {activeEstado === 'ok' && displayRows.length > 0 && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full table-fixed caption-bottom text-sm">
              <thead>
                <tr>
                  <th className="h-10 w-8 px-2 text-left align-middle font-sans text-[11px] font-medium uppercase tracking-wide text-text-secondary">#</th>
                  <th className="h-10 px-2 text-left align-middle font-sans text-[11px] font-medium tracking-wide text-text-secondary">Equipos</th>
                  <th className="h-10 w-10 px-1 text-center align-middle font-sans text-[11px] font-medium uppercase tracking-wide text-boca-gold">PTS</th>
                  <th className="h-10 w-9 px-1 text-center align-middle font-sans text-[11px] font-medium uppercase tracking-wide text-text-secondary">PJ</th>
                  <th className="h-10 w-9 px-1 text-center align-middle font-sans text-[11px] font-medium uppercase tracking-wide text-text-secondary">G</th>
                  <th className="h-10 w-9 px-1 text-center align-middle font-sans text-[11px] font-medium uppercase tracking-wide text-text-secondary">E</th>
                  <th className="h-10 w-9 px-1 text-center align-middle font-sans text-[11px] font-medium uppercase tracking-wide text-text-secondary">P</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => {
                  const esBoca = /boca/i.test(row.team.name);
                  return (
                    <tr
                      key={row.team.id}
                      className={[
                        'border-b border-boca-gold/5 transition-colors last:border-b-0 hover:bg-white/[0.03]',
                        esBoca ? 'bg-boca-gold/[0.07] border-2 border-l-boca-gold hover:bg-boca-gold/[0.10]' : '',
                      ].join(' ')}
                    >
                      <td className={`px-2 py-2.5 align-middle font-sans text-sm ${esBoca ? 'text-boca-gold font-semibold' : 'text-text-secondary'}`}>
                        {row.rank}
                      </td>
                      <td className="px-2 py-2.5 align-middle">
                        <div className="flex items-center gap-2">
                          <img
                            src={row.team.logo}
                            alt={row.team.name}
                            width={16}
                            height={16}
                            className="shrink-0 object-contain"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
                          />
                          <span className={`font-sans text-sm truncate ${esBoca ? 'text-boca-gold font-semibold' : 'text-white'}`}>
                            {row.team.name}
                          </span>
                        </div>
                      </td>
                      <td className={`px-1 py-2.5 align-middle text-center font-sans text-sm font-semibold tabular-nums ${esBoca ? 'text-boca-gold' : 'text-white'}`}>
                        {row.points}
                      </td>
                      <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">{row.all.played}</td>
                      <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">{row.all.win}</td>
                      <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">{row.all.draw}</td>
                      <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">{row.all.lose}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SkeletonTabla() {
  return (
    <div className="animate-pulse py-2 space-y-0">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-boca-gold/5 last:border-b-0">
          <div className="h-3 w-4 bg-white/10 rounded shrink-0" />
          <div className="size-4 bg-white/10 rounded shrink-0" />
          <div className="h-3 flex-1 bg-white/10 rounded" />
          <div className="h-3 w-6 bg-white/10 rounded" />
          <div className="h-3 w-5 bg-white/10 rounded" />
          <div className="h-3 w-5 bg-white/10 rounded" />
          <div className="h-3 w-5 bg-white/10 rounded" />
          <div className="h-3 w-5 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
