import { ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '../../../hooks/useHorizontalScroll';

interface HorizontalScrollRowProps {
  children: React.ReactNode;
  /** Clases extra para el contenedor scroll (gap, alto, etc.) */
  className?: string;
  /** Clases extra para el wrapper externo (ej: 'md:hidden') */
  wrapperClassName?: string;
}

export function HorizontalScrollRow({
  children,
  className = '',
  wrapperClassName = '',
}: HorizontalScrollRowProps) {
  const { ref, canScrollLeft, canScrollRight, onPointerDown, onPointerMove, stopDrag } =
    useHorizontalScroll();

  return (
    <div className={`relative ${wrapperClassName}`}>
      <div
        ref={ref}
        className={`flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none snap-x snap-mandatory overscroll-x-contain ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        {children}
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
  );
}
