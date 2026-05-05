import { HorizontalScrollRow } from '../ui/HorizontalScrollRow';
import type { ProximoPartido } from '../../services/apifootball';
import { CardPartido } from './CardPartido';

interface ScrollRowProps {
  partidos: ProximoPartido[];
}

export function ScrollRow({ partidos }: ScrollRowProps) {
  return (
    <HorizontalScrollRow>
      {partidos.map((p) => (
        <div key={p.fixtureId} className="snap-start shrink-0">
          <CardPartido partido={p} />
        </div>
      ))}
    </HorizontalScrollRow>
  );
}
