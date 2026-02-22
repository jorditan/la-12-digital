import { useEffect, useState } from 'react';
import { fetchLastMatches, BOCA_ID, type MatchResult } from '../../services/apifootball';

type Estado = 'loading' | 'error' | 'ok';
type Resultado = 'victoria' | 'derrota' | 'empate';

function getResultado(match: MatchResult): Resultado {
  const bocaEsLocal = match.homeTeam.id === BOCA_ID;
  const bocaGano = bocaEsLocal ? match.homeTeam.winner : match.awayTeam.winner;
  if (bocaGano === true) return 'victoria';
  if (bocaGano === false) return 'derrota';
  return 'empate';
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

const ROW_BG: Record<Resultado, string> = {
  victoria: 'bg-[#1A4D2E]',
  derrota:  'bg-[#7A1F1F]',
  empate:   'bg-[#4A5568]',
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
    <section aria-label="Últimos partidos">
      <div className="bg-[#031d46] border border-[#00396e] rounded-sm overflow-hidden flex flex-col">

        {/* Header */}
        <div className="border-b border-[#003d7a] px-6 pt-6 pb-3">
          <h2 className="type-section-title text-white">Últimos partidos</h2>
        </div>

        {/* Loading */}
        {estado === 'loading' && (
          <div className="flex flex-col">
            {Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Error */}
        {estado === 'error' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center px-6">
            <p className="font-sans text-sm text-white/50">No se pudieron cargar los partidos</p>
            <button
              onClick={cargar}
              className="font-sans text-xs font-medium text-boca-gold border border-boca-gold/30 rounded px-4 py-2 hover:bg-boca-gold/10 transition-colors"
            >
              Reintentar
            </button>
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
          <div className="overflow-x-auto pl-8 pr-8 pb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#003d7a]">
                  <th className="px-6 py-2 text-left font-sans font-medium text-sm text-[#64748b]">Día</th>
                  <th className="px-3 py-2 text-left font-sans font-medium text-sm text-[#64748b]">Rival</th>
                  <th className="px-6 py-2 text-right font-sans font-medium text-sm text-[#64748b]">Resultado</th>
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
                      className={`${ROW_BG[resultado]}${idx < partidos.length - 1 ? ' border-b border-black/20' : ''}`}
                    >
                      <td className="px-6 py-3 font-sans font-medium text-sm text-white whitespace-nowrap">
                        {formatFecha(match.date)}
                      </td>
                      <td className="px-3 py-3 font-sans font-normal text-sm text-white">
                        {rival.name}
                      </td>
                      <td className="px-6 py-3 font-sans font-normal text-sm text-white text-right whitespace-nowrap">
                        {golesBoca ?? '-'} - {golesRival ?? '-'}
                      </td>
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

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-6 py-3 border-b border-white/5">
      <div className="h-4 w-10 bg-white/10 rounded" />
      <div className="h-4 flex-1 bg-white/10 rounded" />
      <div className="h-4 w-12 bg-white/10 rounded" />
    </div>
  );
}
