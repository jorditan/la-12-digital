import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Newspaper, Star, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { fetchNoticias, type Noticia } from '../../services/apifootball';
import { NoticiaCard } from '../NoticiaCard';

type Estado = 'loading' | 'error' | 'ok';

function useVisibleCards() {
  const [visible, setVisible] = useState(1); // mobile-first: arranca en 1

  useLayoutEffect(() => {
    const getVisible = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768)  return 2;
      return 1;
    };
    setVisible(getVisible());
    const handler = () => setVisible(getVisible());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return visible;
}

function NoticiasMobileSlider({ noticias }: { noticias: Noticia[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!ref.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = ref.current;
    setCanScrollLeft(sl > 4);
    setCanScrollRight(sl + clientWidth < scrollWidth - 4);
  };

  useEffect(() => { checkScroll(); }, [noticias]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = ref.current!.scrollLeft;
    ref.current!.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    ref.current!.scrollLeft = scrollLeft.current - (e.clientX - startX.current);
  };

  const stopDrag = () => { dragging.current = false; };

  return (
    <div className="md:hidden relative">
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onScroll={checkScroll}
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
        <div className="pointer-events-none absolute left-0 top-0 h-[calc(100%-8px)] w-10 bg-gradient-to-r from-[#001529] to-transparent" />
      )}

      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-14 bg-gradient-to-l from-[#001529] to-transparent flex items-center justify-end pr-1">
          <ChevronRight size={18} className="text-boca-gold/60 animate-pulse" />
        </div>
      )}
    </div>
  );
}

export function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');
  const [idx, setIdx] = useState(0);
  const VISIBLE = useVisibleCards();

  const cargar = () => {
    setEstado('loading');
    fetchNoticias()
      .then(data => { setNoticias(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  useEffect(() => { cargar(); }, []);

  // Reajusta idx si VISIBLE cambia y deja el índice fuera de rango
  useEffect(() => {
    const maxIdx = Math.max(0, noticias.length - VISIBLE);
    setIdx(i => Math.min(i, maxIdx));
  }, [VISIBLE, noticias.length]);

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
        <button
          onClick={cargar}
          className="font-sans text-sm font-medium text-boca-gold border border-boca-gold/30 rounded px-4 py-2 hover:bg-boca-gold/10 transition-colors shrink-0"
        >
          Reintentar
        </button>
      </div>
    </section>
  );

  if (noticias.length === 0) return null;

  const pageCount   = Math.ceil(noticias.length / VISIBLE);
  const currentPage = Math.floor(idx / VISIBLE);
  const canPrev     = currentPage > 0;
  const canNext     = currentPage < pageCount - 1;

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
          <button
            onClick={() => setIdx(Math.max(0, currentPage - 1) * VISIBLE)}
            disabled={!canPrev}
            aria-label="Noticia anterior"
            className="bg-boca-blue-light border border-boca-gold px-2 shrink-0 disabled:opacity-25 hover:bg-boca-gold/10 transition-colors"
          >
            <ArrowLeft size={24} className="text-boca-gold" />
          </button>

          <div className="flex flex-1 gap-4 min-w-0">
            {noticias.slice(idx, idx + VISIBLE).map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} className="flex-1 min-w-0" />
            ))}
          </div>

          <button
            onClick={() => setIdx(Math.min(pageCount - 1, currentPage + 1) * VISIBLE)}
            disabled={!canNext}
            aria-label="Noticia siguiente"
            className="bg-boca-blue-light border border-boca-gold px-2 shrink-0 disabled:opacity-25 hover:bg-boca-gold/10 transition-colors"
          >
            <ArrowRight size={24} className="text-boca-gold" />
          </button>
        </div>

        {/* Indicador de estrellas */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, page) => (
            <button
              key={page}
              onClick={() => setIdx(page * VISIBLE)}
              aria-label={`Ir a página ${page + 1}`}
              className="text-boca-gold hover:scale-110 transition-transform"
            >
              <Star
                size={16}
                fill={page === currentPage ? 'currentColor' : 'none'}
                strokeWidth={page === currentPage ? 0 : 1.5}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
