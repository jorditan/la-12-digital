import { Newspaper, Star, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { type Noticia } from '../../services/apifootball';
import { Button } from '../ui/Button';
import { NoticiaCard } from '../NoticiaCard';
import { useNoticias } from './hooks/useNoticias';

function NoticiasMobileSlider({ noticias }: { noticias: Noticia[] }) {
  const { ref, canScrollLeft, canScrollRight, onPointerDown, onPointerMove, stopDrag } = useHorizontalScroll();

  return (
    <div className="md:hidden relative">
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        {noticias.map((noticia) => (
          <div key={noticia.id} className="shrink-0 w-[65vw]">
            <NoticiaCard noticia={noticia} className="h-[220px]" />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-[calc(100%-8px)] w-10 bg-gradient-to-r from-boca-blue to-transparent" />
      )}

      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-14 bg-gradient-to-l from-boca-blue to-transparent flex items-center justify-end pr-1">
          <ChevronRight size={18} className="text-boca-gold/60 animate-pulse" />
        </div>
      )}
    </div>
  );
}

export function Noticias() {
  const { noticias, estado, idx, VISIBLE, pageCount, currentPage, canPrev, canNext, cargar, irPrev, irNext, irPagina } = useNoticias();

  if (estado === 'loading') return (
    <section aria-label="Noticias" className="w-full">
      <div className="flex items-center gap-4 mb-4">
        <Newspaper size={24} className="text-boca-gold shrink-0" />
        <h2 className="font-serif font-bold text-[22px] sm:text-[32px] leading-tight sm:leading-10 text-boca-gold tracking-tight">Noticias</h2>
      </div>
      <div className="w-full h-px bg-boca-gold/30 mb-4" />
      <div className="flex gap-4 h-[260px] sm:h-[340px]">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex-1 animate-pulse bg-boca-gold/10 border border-boca-gold/10 rounded-sm" />
        ))}
      </div>
    </section>
  );

  if (estado === 'error') return (
    <section aria-label="Noticias" className="w-full">
      <div className="flex items-center gap-4 mb-4">
        <Newspaper size={24} className="text-boca-gold shrink-0" />
        <h2 className="font-serif font-bold text-[22px] sm:text-[32px] leading-tight sm:leading-10 text-boca-gold tracking-tight">Noticias</h2>
      </div>
      <div className="w-full h-px bg-boca-gold/30 mb-4" />
      <div className="flex items-center gap-3 py-8 px-4 border border-boca-gold/10 rounded-sm">
        <p className="font-sans text-sm text-white/50 flex-1">No se pudieron cargar las noticias</p>
        <Button
          onClick={cargar}
          variant="text"
          className="text-sm text-boca-gold border border-boca-gold/30 rounded px-4 py-2 hover:bg-boca-gold/10 shrink-0"
        >
          Reintentar
        </Button>
      </div>
    </section>
  );

  if (noticias.length === 0) return null;

  return (
    <section aria-label="Noticias" className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Newspaper size={24} className="text-boca-gold shrink-0" />
        <h2 className="font-serif font-bold text-[32px] leading-10 text-boca-gold tracking-tight">
          Noticias
        </h2>
      </div>

      {/* Separador dorado */}
      <div className="w-full h-px bg-boca-gold/30 mb-4" />

      {/* Mobile: slider con drag y fade */}
      <NoticiasMobileSlider noticias={noticias} />

      {/* Desktop: carrusel con botones */}
      <div className="hidden md:flex flex-col gap-3">
        {/* Fila: botón ← | cards | botón → */}
        <div className="flex items-stretch gap-4 h-[340px]">
          <Button
            onClick={irPrev}
            disabled={!canPrev}
            aria-label="Noticia anterior"
            variant="secondary"
            className="bg-boca-blue-light px-2 shrink-0 disabled:opacity-25 hover:bg-boca-gold/10"
          >
            <ArrowLeft size={24} className="text-boca-gold" />
          </Button>

          <div className="flex flex-1 gap-4 min-w-0">
            {noticias.slice(idx, idx + VISIBLE).map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} className="flex-1 min-w-0" />
            ))}
          </div>

          <Button
            onClick={irNext}
            disabled={!canNext}
            aria-label="Noticia siguiente"
            variant="secondary"
            className="bg-boca-blue-light px-2 shrink-0 disabled:opacity-25 hover:bg-boca-gold/10"
          >
            <ArrowRight size={24} className="text-boca-gold" />
          </Button>
        </div>

        {/* Indicador de estrellas */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, page) => (
            <Button
              key={page}
              onClick={() => irPagina(page)}
              aria-label={`Ir a página ${page + 1}`}
              variant="ghost"
              size="icon"
              className="text-boca-gold hover:scale-110"
            >
              <Star
                size={16}
                fill={page === currentPage ? 'currentColor' : 'none'}
                strokeWidth={page === currentPage ? 0 : 1.5}
              />
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
