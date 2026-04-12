import { ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import type { ProximoPartido } from '../../services/apifootball';
import { CardPartido } from './CardPartido';
import { MobileFixtureTable } from './MobileFixtureTable';

interface ScrollRowProps {
  partidos: ProximoPartido[];
}

export function ScrollRow({ partidos }: ScrollRowProps) {
  const { ref, canScrollLeft, canScrollRight, onPointerDown, onPointerMove, stopDrag } = useHorizontalScroll();

  return (
    <>
      {/* Mobile: tabla compacta */}
      <MobileFixtureTable partidos={partidos} />

      {/* Desktop/tablet: scroll de cards */}
      <div className="relative hidden sm:block">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
          onPointerLeave={stopDrag}
        >
          {partidos.map((p) => (
            <CardPartido key={p.fixtureId} partido={p} />
          ))}
        </div>

        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 h-[calc(100%-8px)] w-12 bg-gradient-to-r from-boca-blue-mid to-transparent" />
        )}

        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-16 bg-gradient-to-l from-boca-blue-mid to-transparent flex items-center justify-end pr-1">
            <ChevronRight size={18} className="text-boca-gold/60 animate-pulse" />
          </div>
        )}
      </div>
    </>
  );
}
