import { Newspaper, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { type Noticia } from '../../services/apifootball';
import { Button } from '../ui/Button';
import { NoticiaCard } from '../NoticiaCard';
import { SkeletonBox } from '../ui/Skeleton';
import { useNoticias } from './hooks/useNoticias';
import { NoticiasPagination } from './NoticiasPagination';

/**
 * Mobile View: Slider táctil con snap
 */
function NoticiasMobileSlider({ noticias }: { noticias: Noticia[] }) {
  const { ref, canScrollLeft, canScrollRight, onPointerDown, onPointerMove, stopDrag } =
    useHorizontalScroll();

  return (
    <div className="md:hidden relative">
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none snap-x snap-mandatory overscroll-x-contain"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        {noticias.map((noticia) => (
          <div key={noticia.id} className="shrink-0 w-[75vw] snap-start">
            <NoticiaCard noticia={noticia} className="h-[240px]" />
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

/**
 * Loading Skeleton
 */
function NoticiasSkeleton() {
  return (
    <div className="flex gap-4 h-[340px]">
      {[1, 2, 3].map((i) => (
        <SkeletonBox
          key={i}
          className="flex-1 bg-boca-gold/5 border border-white/5"
        />
      ))}
    </div>
  );
}

/**
 * Main Component
 */
export function Noticias() {
  const {
    noticias,
    estado,
    idx,
    VISIBLE,
    pageCount,
    currentPage,
    canPrev,
    canNext,
    cargar,
    irPrev,
    irNext,
    irPagina,
  } = useNoticias();

  if (estado === 'loading' && noticias.length === 0) {
    return (
      <section className="w-full">
        <NoticiasHeader />
        <NoticiasSkeleton />
      </section>
    );
  }

  if (estado === 'error') {
    return (
      <section className="w-full">
        <NoticiasHeader />
        <div className="flex flex-col items-center justify-center py-12 border border-white/5 rounded-sm bg-white/2">
          <p className="text-white/40 mb-4">No se pudieron cargar las noticias</p>
          <Button onClick={cargar} variant="outline" className="text-boca-gold border-boca-gold/30">
            Reintentar
          </Button>
        </div>
      </section>
    );
  }

  if (noticias.length === 0) return null;

  const currentNoticias = noticias.slice(idx, idx + VISIBLE);

  return (
    <section aria-label="Noticias" className="w-full">
      <NoticiasHeader />

      <NoticiasMobileSlider noticias={noticias} />

      <div className="hidden md:flex flex-col">
        <div className="flex items-stretch gap-4 h-[360px]">
          <Button
            onClick={irPrev}
            disabled={!canPrev}
            variant="ghost"
            className="bg-white/2 px-2 shrink-0 disabled:opacity-10 hover:bg-white/5 transition-colors border-boca-gold-dark/30 border"
          >
            <ArrowLeft size={32} className="text-boca-gold" />
          </Button>

          <div className="flex flex-1 gap-4 min-w-0">
            {currentNoticias.map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} className="flex-1" />
            ))}
            {/* Relleno para mantener layout */}
            {currentNoticias.length < VISIBLE &&
              Array.from({ length: VISIBLE - currentNoticias.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex-1" />
              ))}
          </div>

          <Button
            onClick={irNext}
            disabled={!canNext}
            variant="ghost"
            className="bg-white/2 px-2 shrink-0 disabled:opacity-10 hover:bg-white/5 transition-colors border-boca-gold-dark/30 border"
          >
            <ArrowRight size={32} className="text-boca-gold" />
          </Button>
        </div>

        <NoticiasPagination
          pageCount={pageCount}
          currentPage={currentPage}
          onPageChange={irPagina}
        />
      </div>
    </section>
  );
}

function NoticiasHeader() {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Newspaper size={24} className="text-boca-gold shrink-0" />
        <h2 className="font-serif font-bold text-[32px] leading-10 text-boca-gold tracking-tight">
          Noticias
        </h2>
      </div>
      <div className="w-full h-px bg-white/10 mb-6" />
    </>
  );
}
