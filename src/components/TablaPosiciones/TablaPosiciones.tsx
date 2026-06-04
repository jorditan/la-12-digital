import type { ReactNode } from 'react';
import { ESCUDO_VACIO } from '../../data/equipos';
import { Button } from '../ui/Button';
import { SelectDropdown } from '../ui/SelectDropdown';
import { Tab } from '../ui/Tab';
import { SkeletonBox, SkeletonText } from '../ui/Skeleton';
import { useTablaPosiciones, COMPETITION_OPTIONS } from './useTablaPosiciones';

type TablaPosicionesProps = {
  headerAction?: ReactNode;
};

const getAnualRankClass = (rank: number, totalRows: number): string => {
  const exactClasses: Record<number, string> = {
    1: 'border-l-2 border-l-[#0CF737] bg-[#0CF737]/[0.02]',
    2: 'border-l-2 border-l-[#F5CB25] bg-[#F5CB25]/[0.02]',
    3: 'border-l-2 border-l-[#F5CB25] bg-[#F5CB25]/[0.02]',
  };
  if (exactClasses[rank]) return exactClasses[rank];
  if (rank >= 4 && rank <= 9) return 'border-l-2 border-l-[#23EBE4] bg-[#23EBE4]/[0.02]';
  if (rank === totalRows) return 'border-l-2 border-l-[#E61034] bg-[#E61034]/[0.02]';
  return '';
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
        <h2 className="type-section-title text-white shrink-0">Posiciones</h2>
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
            <p className="font-sans text-sm text-text-secondary">No se pudo cargar la tabla</p>
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
              options={zoneNames.map((z) => ({ value: z, label: z }))}
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
                {activeZoneLabel?.toLowerCase().includes('promedios') ? (
                  <tr>
                    <th className="h-10 w-8 px-2 text-left align-middle font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                      #
                    </th>
                    <th className="h-10 px-2 text-left align-middle font-sans text-xs font-medium tracking-wide text-text-secondary">
                      Equipos
                    </th>
                    <th className="h-10 w-16 px-1 text-center align-middle font-sans text-xs font-medium uppercase tracking-wide text-boca-gold">
                      PROM
                    </th>
                    <th className="h-10 w-12 px-1 text-center align-middle font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                      PTS
                    </th>
                    <th className="h-10 w-10 px-1 text-center align-middle font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                      PJ
                    </th>
                  </tr>
                ) : (
                  <tr>
                    <th className="h-10 w-8 px-2 text-left align-middle font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                      #
                    </th>
                    <th className="h-10 px-2 text-left align-middle font-sans text-xs font-medium tracking-wide text-text-secondary">
                      Equipos
                    </th>
                    <th className="h-10 w-10 px-1 text-center align-middle font-sans text-xs font-medium uppercase tracking-wide text-boca-gold">
                      PTS
                    </th>
                    <th className="h-10 w-9 px-1 text-center align-middle font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                      PJ
                    </th>
                    <th className="h-10 w-9 px-1 text-center align-middle font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                      G
                    </th>
                    <th className="h-10 w-9 px-1 text-center align-middle font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                      E
                    </th>
                    <th className="h-10 w-9 px-1 text-center align-middle font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                      P
                    </th>
                  </tr>
                )}
              </thead>
              <tbody>
                {displayRows.map((row) => {
                  const esBoca = /boca/i.test(row.team.name);
                  const isPromedios = activeZoneLabel?.toLowerCase().includes('promedios');
                  const isAnual = activeZoneLabel?.toLowerCase().includes('anual');
                  const labelLower = activeZoneLabel?.toLowerCase() || "";
                  const isRegularStage = labelLower.includes("apertura") ||
                                         labelLower.includes("clausura") ||
                                         labelLower.includes("zona");

                  // Determine class based on rank and zone, matching Promiedos highlights
                  let rankClass = "";
                  if (esBoca) {
                    rankClass = "bg-boca-gold/[0.07] border-2 border-l-boca-gold hover:bg-boca-gold/[0.10]";
                  } else if (isAnual) {
                    rankClass = getAnualRankClass(row.rank, displayRows.length);
                  } else if (isRegularStage && row.rank <= 8) {
                    rankClass = "border-l-2 border-l-[#23EBE4] bg-[#23EBE4]/[0.05] hover:bg-[#23EBE4]/[0.08]";
                  } else if (isPromedios && row.rank === displayRows.length) {
                    rankClass = "border-l-2 border-l-[#E61034] bg-[#E61034]/[0.02]";
                  }

                  return (
                    <tr
                      key={row.team.id}
                      className={[
                        'border-b border-boca-gold/5 transition-colors last:border-b-0 hover:bg-white/[0.03]',
                        rankClass,
                      ].join(' ')}
                    >
                      <td
                        className={`px-2 py-2.5 align-middle font-sans text-sm ${esBoca ? 'text-boca-gold font-semibold' : 'text-text-secondary'}`}
                      >
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
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO;
                            }}
                          />
                          <span
                            className={`font-sans text-sm truncate ${esBoca ? 'text-boca-gold font-semibold' : 'text-white'}`}
                          >
                            {row.team.name}
                          </span>
                        </div>
                      </td>
                      {isPromedios ? (
                        <>
                          <td
                            className={`px-1 py-2.5 align-middle text-center font-sans text-sm font-semibold tabular-nums ${esBoca ? 'text-boca-gold' : 'text-white'}`}
                          >
                            {row.goalDiff ? (row.goalDiff / 1000).toFixed(3) : '0.000'}
                          </td>
                          <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">
                            {row.points}
                          </td>
                          <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">
                            {row.all.played}
                          </td>
                        </>
                      ) : (
                        <>
                          <td
                            className={`px-1 py-2.5 align-middle text-center font-sans text-sm font-semibold tabular-nums ${esBoca ? 'text-boca-gold' : 'text-white'}`}
                          >
                            {row.points}
                          </td>
                          <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">
                            {row.all.played}
                          </td>
                          <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">
                            {row.all.win}
                          </td>
                          <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">
                            {row.all.draw}
                          </td>
                          <td className="px-1 py-2.5 align-middle text-center font-sans text-sm text-text-secondary tabular-nums">
                            {row.all.lose}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Referencias Leyenda para Tabla Anual y Promedios */}
            {activeZoneLabel?.toLowerCase().includes('anual') && (
              <div className="mt-4 border-t border-boca-border-card pt-3 px-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-secondary font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0CF737] inline-block shrink-0" />
                  <span>
                    Campeón de Liga, clasificado a Libertadores 2027 y Supercopa Internacional
                    2026{' '}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F5CB25] inline-block shrink-0" />
                  <span>Copa Libertadores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#23EBE4] inline-block shrink-0" />
                  <span>Copa Sudamericana</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E61034] inline-block shrink-0" />
                  <span>Descenso</span>
                </div>
              </div>
            )}
            {activeZoneLabel?.toLowerCase().includes('promedios') && (
              <div className="mt-4 border-t border-boca-border-card pt-3 px-2 flex items-center gap-1.5 text-xs text-text-secondary font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E61034] inline-block shrink-0" />
                <span>Zona de Descenso (Promedios)</span>
              </div>
            )}
            {activeZoneLabel &&
              (activeZoneLabel.includes('Apertura') ||
                activeZoneLabel.includes('Clausura') ||
                activeZoneLabel.includes('Zona')) && (
                <div className="mt-4 border-t border-boca-border-card pt-3 px-2 flex items-center gap-1.5 text-xs text-text-secondary font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#23EBE4] inline-block shrink-0" />
                  <span>Clasificación a octavos de final</span>
                </div>
              )}
          </div>
        )}
      </div>
    </section>
  );
}

function SkeletonTabla() {
  return (
    <div className="py-2 space-y-0">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-2.5 border-b border-boca-gold/5 last:border-b-0"
        >
          <SkeletonText width="w-4" height="h-3" className="shrink-0" />
          <SkeletonBox className="size-4 shrink-0" />
          <SkeletonText width="flex-1" height="h-3" />
          <SkeletonText width="w-6" height="h-3" />
          <SkeletonText width="w-5" height="h-3" />
          <SkeletonText width="w-5" height="h-3" />
          <SkeletonText width="w-5" height="h-3" />
          <SkeletonText width="w-5" height="h-3" />
        </div>
      ))}
    </div>
  );
}
