import { useEffect, useState } from 'react';
import { fetchLastMatches, BOCA_ID, type MatchResult } from '../../services/apifootball';
import { Badge } from '../Badge';
import { Button } from '../Button';

type Estado = 'loading' | 'error' | 'ok';
type Resultado = 'victoria' | 'derrota' | 'empate';

function getResultado(match: MatchResult): Resultado {
  const bocaEsLocal = match.homeTeam.id === BOCA_ID;
  const bocaGano = bocaEsLocal ? match.homeTeam.winner : match.awayTeam.winner;
  if (bocaGano === true) return 'victoria';
  if (match.goalsAway === match.goalsHome) return 'empate';
  return 'derrota';
}

function getRival(match: MatchResult) {
  return match.homeTeam.id === BOCA_ID ? match.awayTeam : match.homeTeam;
}

function formatFecha(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

const ROW_STYLE: Record<Resultado, string> = {
  victoria: 'border-l-2 border-l-green-400 bg-green-500/[0.2]',
  derrota:  'border-l-2 border-l-red-400 bg-red-500/[0.2]',
  empate:   'border-l-2 border-l-slate-400 bg-slate-500/[0.2]',
};

export function UltimosPartidos() {
  const [partidos, setPartidos] = useState<MatchResult[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');

  const cargar = () => {
    setEstado('loading');
    fetchLastMatches()
      .then((data) => { setPartidos(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  useEffect(() => { cargar(); }, []);

  return (
    <section aria-label="Últimos partidos" className="h-full">
      <div className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col h-full">

        {/* Header */}
        <div className="border-b border-boca-border-card px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
          <h2 className="type-section-title text-white">Últimos partidos</h2>
        </div>

        {/* Loading */}
        {estado === 'loading' && (
          <div className="flex flex-col">
            {Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Error */}
        {estado === 'error' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center px-6">
            <p className="font-sans text-sm text-white/50">No se pudieron cargar los partidos</p>
            <Button
              onClick={cargar}
              variant="text"
              className="text-xs text-boca-gold border border-boca-gold/30 rounded px-4 py-2 hover:bg-boca-gold/10"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Empty */}
        {estado === 'ok' && partidos.length === 0 && (
          <p className="font-sans text-sm text-white/50 py-6 text-center px-6">
            No se encontraron partidos recientes
          </p>
        )}

        {/* Table */}
        {estado === 'ok' && partidos.length > 0 && (
          <div className="overflow-x-auto px-3 pb-3 sm:px-8 sm:pb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-boca-border-card">
                  <th className="px-2 sm:px-6 py-2 text-left font-sans font-medium text-sm text-text-muted">Día</th>
                  <th className="px-2 sm:px-3 py-2 text-left font-sans font-medium text-sm text-text-muted">Rival</th>
                  <th className="hidden sm:table-cell px-2 py-2 text-left font-sans font-medium text-sm text-text-muted max-w-[70px]">Copa</th>
                  <th className="px-2 sm:px-6 py-2 text-right font-sans font-medium text-sm text-text-muted">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {partidos.map((match, idx) => {
                  const resultado = getResultado(match);
                  const rival = getRival(match);
                  const bocaEsLocal = match.homeTeam.id === BOCA_ID;
                  const golesBoca  = bocaEsLocal ? match.goalsHome : match.goalsAway;
                  const golesRival = bocaEsLocal ? match.goalsAway : match.goalsHome;

                  return (
                    <tr
                      key={match.fixtureId}
                      className={`${ROW_STYLE[resultado]}${idx < partidos.length - 1 ? ' border-b border-white/[0.04]' : ''}`}
                    >
                      <td className="px-2 sm:px-6 py-2 sm:py-3 font-sans font-medium text-sm text-white whitespace-nowrap">
                        {formatFecha(match.date)}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 font-sans font-normal text-sm text-white max-w-[110px] truncate" title={rival.name}>
                        {rival.name}
                      </td>
                      <td className="hidden sm:table-cell px-2 py-2 sm:py-3 max-w-[70px]">
                        {match.competition && (
                          <Badge
                            variant={match.competition === 'Copa Libertadores' ? 'gold' : 'blue'}
                            className="text-[9px] px-1.5 py-px whitespace-nowrap"
                          >
                            {match.competition === 'Copa Libertadores' ? 'Libertadores' : 'Liga profesional'}
                          </Badge>
                        )}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-3 font-sans font-normal text-sm text-white text-right whitespace-nowrap">
                        {golesBoca ?? '-'} - {golesRival ?? '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Leyenda de colores */}
            <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400/70 inline-block shrink-0" />
                <span>Victoria</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400/60 inline-block shrink-0" />
                <span>Empate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400/70 inline-block shrink-0" />
                <span>Derrota</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-6 py-3 border-b border-white/5">
      <div className="h-4 w-10 bg-white/10 rounded" />
      <div className="h-4 flex-1 bg-white/10 rounded" />
      <div className="h-4 w-12 bg-white/10 rounded" />
    </div>
  );
}
