import { BOCA_ID, type ProximoPartido } from '../../services/apifootball';
import { ESCUDO_VACIO } from '../../data/equipos';

function formatFechaCorta(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function formatDia(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '');
}

interface TeamCellProps {
  logo: string;
  name: string;
  align: 'left' | 'right';
  bold: boolean;
}

function TeamCell({ logo, name, align, bold }: TeamCellProps) {
  return (
    <div
      className={[
        'flex items-center gap-2',
        align === 'right' ? 'flex-row-reverse' : '',
      ].join(' ')}
    >
      <img
        src={logo}
        alt={name}
        className="w-[18px] h-[18px] object-contain shrink-0"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO;
        }}
      />
      <span
        className={[
          'text-xs leading-tight',
          align === 'right' ? 'text-right' : 'text-left',
          bold ? 'font-semibold text-white' : 'text-text-secondary',
        ].join(' ')}
        style={{ maxWidth: 110 }}
      >
        {name}
      </span>
    </div>
  );
}

interface FixtureTableProps {
  partidos: ProximoPartido[];
}

export function FixtureTable({ partidos }: FixtureTableProps) {
  return (
    <div className="overflow-x-auto -mx-0">
      <table className="w-full border-collapse font-sans">
        {/* Cabecera */}
        <thead>
          <tr className="border-b border-boca-gold/15">
            <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-boca-gold/50 w-[72px]">
              Fecha
            </th>
            <th className="py-2 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-boca-gold/50 w-[50%]">
              Local
            </th>
            <th className="py-2 px-1 text-center text-[10px] font-semibold uppercase tracking-wider text-boca-gold/30 w-8">
              vs
            </th>
            <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-boca-gold/50 w-[50%]">
              Visitante
            </th>
            <th className="py-2 px-3 text-center text-[10px] font-semibold uppercase tracking-wider text-boca-gold/50 w-14 hidden sm:table-cell">
              Hora
            </th>
            <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-boca-gold/50 hidden md:table-cell">
              Copa
            </th>
          </tr>
        </thead>

        {/* Filas */}
        <tbody>
          {partidos.map((p, i) => {
            const bocaEsLocal = p.homeTeam.id === BOCA_ID;

            return (
              <tr
                key={p.fixtureId}
                className={[
                  'border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]',
                  i % 2 !== 0 ? 'bg-white/[0.02]' : '',
                ].join(' ')}
              >
                {/* Fecha */}
                <td className="py-2.5 px-3">
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] uppercase text-boca-gold/40 font-medium">
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
                  <span className="text-[10px] font-bold text-boca-gold/25 tracking-tight">
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
                <td className="py-2.5 px-3 text-center hidden sm:table-cell">
                  <span className="text-xs text-white tabular-nums font-medium">
                    {p.time}
                  </span>
                </td>

                {/* Copa */}
                <td className="py-2.5 px-3 hidden md:table-cell">
                  <span className="inline-block text-[10px] font-sans text-boca-gold/60 bg-boca-blue border border-boca-gold/15 px-1.5 py-px rounded-sm whitespace-nowrap">
                    {p.competition}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
