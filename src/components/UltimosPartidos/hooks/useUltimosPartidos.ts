import { useEffect, useState } from 'react';
import { fetchLastMatches, BOCA_ID, type MatchResult } from '../../../services/apifootball';

type Estado = 'loading' | 'error' | 'ok';
type Resultado = 'victoria' | 'derrota' | 'empate';

export function getResultado(match: MatchResult): Resultado {
  const bocaEsLocal = match.homeTeam.id === BOCA_ID;
  const bocaGano = bocaEsLocal ? match.homeTeam.winner : match.awayTeam.winner;
  if (bocaGano === true) return 'victoria';
  if (match.goalsAway === match.goalsHome) return 'empate';
  return 'derrota';
}

export function getRival(match: MatchResult) {
  return match.homeTeam.id === BOCA_ID ? match.awayTeam : match.homeTeam;
}

export function formatFecha(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export const ROW_STYLE: Record<Resultado, string> = {
  victoria: 'border-l-2 border-l-green-400 bg-green-500/[0.2]',
  derrota:  'border-l-2 border-l-red-400 bg-red-500/[0.2]',
  empate:   'border-l-2 border-l-slate-400 bg-slate-500/[0.2]',
};

export function useUltimosPartidos() {
  const [partidos, setPartidos] = useState<MatchResult[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');

  const cargar = () => {
    setEstado('loading');
    fetchLastMatches()
      .then((data) => { setPartidos(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  useEffect(() => { cargar(); }, []);

  return { partidos, estado, cargar };
}
