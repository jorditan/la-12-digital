import { useState, useEffect, useLayoutEffect } from 'react';
import { Newspaper, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { fetchNoticias, type Noticia } from '../../services/apifootball';
import { NoticiaCard } from '../NoticiaCard';

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

export function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [idx, setIdx] = useState(0);
  const VISIBLE = useVisibleCards();

  useEffect(() => {
    fetchNoticias().then(setNoticias);
  }, []);

  // Reajusta idx si VISIBLE cambia y deja el índice fuera de rango
  useEffect(() => {
    const maxIdx = Math.max(0, noticias.length - VISIBLE);
    setIdx(i => Math.min(i, maxIdx));
  }, [VISIBLE, noticias.length]);

  if (noticias.length === 0) return null;

  const maxIdx = Math.max(0, noticias.length - VISIBLE);
  const canPrev = idx > 0;
  const canNext = idx < maxIdx;

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

      {/* Carrusel */}
      <div className="flex flex-col gap-3">
        {/* Fila: botón ← | cards | botón → */}
        <div className="flex items-stretch gap-4 h-[282px]">
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
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
            onClick={() => setIdx(i => Math.min(maxIdx, i + 1))}
            disabled={!canNext}
            aria-label="Noticia siguiente"
            className="bg-boca-blue-light border border-boca-gold px-2 shrink-0 disabled:opacity-25 hover:bg-boca-gold/10 transition-colors"
          >
            <ArrowRight size={24} className="text-boca-gold" />
          </button>
        </div>

        {/* Indicador de estrellas */}
        <div className="flex items-center justify-center gap-2">
          {noticias.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(Math.min(i, maxIdx))}
              aria-label={`Ir a noticia ${i + 1}`}
              className="text-boca-gold hover:scale-110 transition-transform"
            >
              <Star
                size={16}
                fill={i === idx ? 'currentColor' : 'none'}
                strokeWidth={i === idx ? 0 : 1.5}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
