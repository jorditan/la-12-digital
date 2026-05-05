import { CalendarPlus, History, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { ProximoPartido } from '../../services/apifootball';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { buildGCalLink } from '../../utils/calendarLink';
import { H2HModal } from './H2HModal';
import { useFixtureTableH2H } from './hooks/useFixtureTableH2H';
import { TeamCell } from './TeamCell';
import { useFixtureTableRows } from './hooks/useFixtureTableRows';
import { formatDia, getTableRowClass } from './utils';
import { formatIsoDate } from '../../lib/date';

interface FixtureTableProps {
  partidos: ProximoPartido[];
}

export function FixtureTable({ partidos }: FixtureTableProps) {
  const rows = useFixtureTableRows(partidos);
  const { selected, openH2H, closeH2H } = useFixtureTableH2H();
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const toggleDropdown = (id: number) => setOpenDropdownId((prev) => (prev === id ? null : id));

  return (
    <>
      <div className="overflow-x-auto min-w-0">
        <table className="w-full border-collapse font-sans">
          {/* Cabecera */}
          <thead>
            <tr className="border-b border-boca-border-card">
              <th className="py-2 px-3 text-left font-sans font-medium text-sm text-text-muted w-[72px]">
                Fecha
              </th>
              <th className="py-2 px-3 text-right font-sans font-medium text-sm text-text-muted w-[50%] hidden sm:table-cell">
                Local
              </th>
              <th className="py-2 px-1 text-center font-sans font-medium text-sm text-text-muted w-8">
                vs
              </th>
              <th className="py-2 px-3 text-left font-sans font-medium text-sm text-text-muted w-[50%]">
                <span className="sm:hidden">Rival</span>
                <span className="hidden sm:inline">Visitante</span>
              </th>
              <th className="py-2 px-3 text-center font-sans font-medium text-sm text-text-muted w-14">
                Hora
              </th>
              <th className="py-2 px-3 text-left font-sans font-medium text-sm text-text-muted hidden md:table-cell">
                Competencia
              </th>
              <th className="py-2 px-3 w-20" aria-label="Acciones" />
            </tr>
          </thead>

          {/* Filas */}
          <tbody>
            {rows.map(({ partido: p, index, bocaEsLocal, rival }) => {
              return (
                <tr key={p.fixtureId} className={getTableRowClass(index)}>
                  {/* Fecha */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col leading-tight w-full">
                      <span className="font-sans font-medium text-xs text-text-muted">
                        {formatDia(p.date)}
                      </span>
                      <span className="text-sm text-white tabular-nums">
                        {formatIsoDate(p.date, 'es-AR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  </td>

                  {/* Local */}
                  <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                    <div className="flex justify-end">
                      <TeamCell
                        logo={p.homeTeam.logo}
                        name={p.homeTeam.name}
                        align="right"
                        bold={bocaEsLocal}
                      />
                    </div>
                  </td>

                  {/* vs */}
                  <td className="py-2.5 px-1 text-center">
                    <span className="font-sans text-sm text-text-muted">vs</span>
                  </td>

                  {/* Visitante — mobile muestra siempre el rival (no-Boca) */}
                  <td className="py-2.5 px-3">
                    <div className="sm:hidden">
                      <TeamCell logo={rival.logo} name={rival.name} align="left" bold />
                    </div>
                    <div className="hidden sm:block">
                      <TeamCell
                        logo={p.awayTeam.logo}
                        name={p.awayTeam.name}
                        align="left"
                        bold={!bocaEsLocal}
                      />
                    </div>
                  </td>

                  {/* Hora */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="text-sm text-white tabular-nums font-medium">{p.time}</span>
                  </td>

                  {/* Copa */}
                  <td className="py-2.5 px-3 hidden md:table-cell">
                    <Badge
                      variant={p.competition === 'Copa Libertadores' ? 'gold' : 'blue'}
                      className="text-xs px-1.5 whitespace-nowrap"
                    >
                      {p.competition}
                    </Badge>
                  </td>

                  {/* Acciones */}
                  <td className="py-2.5 px-2 text-center relative">
                    {/* Mobile: menú "..." */}
                    <div className="sm:hidden">
                      <button
                        type="button"
                        onClick={() => toggleDropdown(p.fixtureId)}
                        aria-label="Acciones del partido"
                        aria-expanded={openDropdownId === p.fixtureId}
                        aria-haspopup="menu"
                        className="inline-flex items-center justify-center w-7 h-7 rounded-sm border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {openDropdownId === p.fixtureId && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdownId(null)}
                            aria-hidden="true"
                          />
                          <div
                            role="menu"
                            className="absolute right-0 top-full mt-1 z-20 w-max bg-boca-blue border border-boca-border rounded-sm shadow-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                openH2H(p.rivalApiId, rival.name);
                                setOpenDropdownId(null);
                              }}
                              className="flex items-center gap-2.5  px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors w-fit"
                            >
                              <History size={13} className="shrink-0" />
                              <span>Ver últimos partidos</span>
                            </button>
                            <a
                              href={buildGCalLink(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              role="menuitem"
                              onClick={() => setOpenDropdownId(null)}
                              aria-label={`Agregar ${p.homeTeam.name} vs ${p.awayTeam.name} a Google Calendar`}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors w-fit"
                            >
                              <CalendarPlus size={13} className="shrink-0" />
                              <span>Agregar al calendario</span>
                            </a>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tablet+: botones completos (estilo CardPartido) */}
                    <div className="hidden sm:flex items-center justify-center gap-1">
                      <Tooltip content="Agregar al calendario" position="top">
                        <a
                          href={buildGCalLink(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Agregar ${p.homeTeam.name} vs ${p.awayTeam.name} a Google Calendar`}
                          className="group flex items-center justify-center h-8 w-8 rounded-sm bg-white/[0.04] border border-white/[0.08] hover:bg-[#1a73e8]/10 hover:border-[#1a73e8]/30 transition-all duration-200 shrink-0"
                        >
                          <img
                            src="/google_calendar_icon.png"
                            alt=""
                            aria-hidden="true"
                            className="w-4 h-4 object-contain shrink-0 opacity-100 transition-opacity"
                          />
                        </a>
                      </Tooltip>
                      <Tooltip content={`Historial vs ${rival.name}`} position="top">
                        <button
                          type="button"
                          onClick={() => openH2H(p.rivalApiId, rival.name)}
                          aria-label={`Ver historial vs ${rival.name}`}
                          className="flex items-center justify-center h-8 w-8 rounded-sm border bg-white/[0.04] border-white/[0.08] text-white/35 hover:bg-white/[0.07] hover:border-white/20 hover:text-white/60 transition-all duration-200"
                        >
                          <History size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <H2HModal onClose={closeH2H} rivalId={selected.rivalId} rivalName={selected.rivalName} />
      )}
    </>
  );
}
