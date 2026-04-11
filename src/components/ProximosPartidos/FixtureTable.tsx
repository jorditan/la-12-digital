import { CalendarPlus, History } from 'lucide-react';
import type { ProximoPartido } from '../../services/apifootball';
import { Badge } from '../Badge';
import { buildGCalLink } from '../../utils/calendarLink';
import { H2HModal } from './H2HModal';
import { useFixtureTableH2H } from './hooks/useFixtureTableH2H';
import { TeamCell } from './TeamCell';
import { useFixtureTableRows } from './hooks/useFixtureTableRows';
import { formatDia, formatFechaCorta, getTableRowClass } from './utils';

interface FixtureTableProps {
  partidos: ProximoPartido[];
}

export function FixtureTable({ partidos }: FixtureTableProps) {
  const rows = useFixtureTableRows(partidos);
  const { selected, openH2H, closeH2H } = useFixtureTableH2H();

  return (
    <>
      <div className="overflow-x-auto -mx-0">
        <table className="w-full border-collapse font-sans">
          {/* Cabecera */}
          <thead>
            <tr className="border-b border-boca-gold/15">
              <th className="py-2 px-3 text-left type-ui-label uppercase tracking-wider text-boca-gold/50 w-[72px]">
                Fecha
              </th>
              <th className="py-2 px-3 text-right type-ui-label uppercase tracking-wider text-boca-gold/50 w-[50%]">
                Local
              </th>
              <th className="py-2 px-1 text-center type-ui-label uppercase tracking-wider text-boca-gold/30 w-8">
                vs
              </th>
              <th className="py-2 px-3 text-left type-ui-label uppercase tracking-wider text-boca-gold/50 w-[50%]">
                Visitante
              </th>
              <th className="py-2 px-3 text-center type-ui-label uppercase tracking-wider text-boca-gold/50 w-14">
                Hora
              </th>
              <th className="py-2 px-3 text-left type-ui-label uppercase tracking-wider text-boca-gold/50 hidden md:table-cell">
                Copa
              </th>
              <th className="py-2 px-3 w-20" aria-label="Acciones" />
            </tr>
          </thead>

          {/* Filas */}
          <tbody>
            {rows.map(({ partido: p, index, bocaEsLocal, rival }) => {
              return (
                <tr
                  key={p.fixtureId}
                  className={getTableRowClass(index)}
                >
                  {/* Fecha */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col leading-tight w-full">
                      <span className="type-ui-label uppercase text-boca-gold/40">
                        {formatDia(p.date)}
                      </span>
                      <span className="text-xs text-text-secondary tabular-nums">
                        {formatFechaCorta(p.date)}
                      </span>
                    </div>
                  </td>

                  {/* Local */}
                  <td className="py-2.5 px-3 text-right">
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
                    <span className="type-ui-label text-boca-gold/25 tracking-tight">
                      vs
                    </span>
                  </td>

                  {/* Visitante */}
                  <td className="py-2.5 px-3">
                    <TeamCell
                      logo={p.awayTeam.logo}
                      name={p.awayTeam.name}
                      align="left"
                      bold={!bocaEsLocal}
                    />
                  </td>

                  {/* Hora */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="text-xs text-white tabular-nums font-medium">
                      {p.time}
                    </span>
                  </td>

                  {/* Copa */}
                  <td className="py-2.5 px-3 hidden md:table-cell">
                    <Badge
                      variant={p.competition === 'Copa Libertadores' ? 'gold' : 'blue'}
                      className="px-1.5 whitespace-nowrap"
                    >
                      {p.competition}
                    </Badge>
                  </td>

                  {/* Acciones */}
                  <td className="py-2.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openH2H(p.rivalApiId, rival.name)}
                        aria-label={`Ver historial vs ${rival.name}`}
                        className="inline-flex items-center justify-center text-white/25 hover:text-boca-gold transition-colors"
                      >
                        <History size={14} />
                      </button>
                      <a
                        href={buildGCalLink(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Agregar ${p.homeTeam.name} vs ${p.awayTeam.name} a Google Calendar`}
                        className="inline-flex items-center justify-center text-white/25 hover:text-boca-gold transition-colors"
                      >
                        <CalendarPlus size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <H2HModal
          onClose={closeH2H}
          rivalId={selected.rivalId}
          rivalName={selected.rivalName}
        />
      )}
    </>
  );
}
