import type { ProximoPartido } from '../../services/apifootball';
import { MatchUrgencyBadge } from '../MatchUrgencyBadge';
import { getFixtureTeams, formatFechaCorta, formatDia } from './utils';

interface MobileFixtureTableProps {
  partidos: ProximoPartido[];
}

export function MobileFixtureTable({ partidos }: MobileFixtureTableProps) {
  return (
    <div className="block sm:hidden overflow-x-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-boca-border text-text-muted">
            <th className="py-2 pr-3 text-left type-ui-label uppercase tracking-wider text-xs">Fecha</th>
            <th className="py-2 pr-3 text-left type-ui-label uppercase tracking-wider text-xs">Rival</th>
            <th className="py-2 pr-3 text-left type-ui-label uppercase tracking-wider text-xs">Hora</th>
            <th className="py-2 text-center type-ui-label uppercase tracking-wider text-xs">Estado</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((match) => {
            const { rival } = getFixtureTeams(match);
            return (
              <tr
                key={match.fixtureId}
                className="border-b border-boca-border/40 h-12 text-text-muted"
              >
                <td className="py-2 pr-3 whitespace-nowrap">
                  <div className="flex flex-col leading-tight">
                    <span className="type-ui-label uppercase text-boca-gold/40 text-[10px]">
                      {formatDia(match.date)}
                    </span>
                    <span className="text-xs tabular-nums">{formatFechaCorta(match.date)}</span>
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <span className="truncate block max-w-[110px] text-white text-xs">{rival.name}</span>
                </td>
                <td className="py-2 pr-3 whitespace-nowrap text-xs tabular-nums">{match.time}</td>
                <td className="py-2 text-center">
                  <MatchUrgencyBadge matchDate={match.date} showIcon={false} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
