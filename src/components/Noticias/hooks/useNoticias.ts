import { useState, useEffect, useLayoutEffect } from 'react';
import { fetchNoticias, type Noticia } from '../../../services/apifootball';

type Estado = 'loading' | 'error' | 'ok';

function useVisibleCards() {
  const [visible, setVisible] = useState(1);

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

export function useNoticias() {
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

  useEffect(() => {
    const maxIdx = Math.max(0, noticias.length - VISIBLE);
    setIdx(i => Math.min(i, maxIdx));
  }, [VISIBLE, noticias.length]);

  const pageCount   = Math.ceil(noticias.length / VISIBLE);
  const currentPage = Math.floor(idx / VISIBLE);
  const canPrev     = currentPage > 0;
  const canNext     = currentPage < pageCount - 1;

  const irPrev = () => setIdx(Math.max(0, currentPage - 1) * VISIBLE);
  const irNext = () => setIdx(Math.min(pageCount - 1, currentPage + 1) * VISIBLE);
  const irPagina = (page: number) => setIdx(page * VISIBLE);

  return {
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
  };
}
