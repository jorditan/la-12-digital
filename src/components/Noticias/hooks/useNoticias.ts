import { useState, useEffect, useCallback } from "react";
import { fetchNoticias, type Noticia } from "../../../services/apifootball";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

type Estado = "loading" | "error" | "ok";

function useVisibleCards() {
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  if (isLg) return 3;
  if (isMd) return 2;
  return 1;
}

export function useNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [estado, setEstado] = useState<Estado>("loading");
  const [idx, setIdx] = useState(0); // Índice global de la primera noticia visible
  const [total, setTotal] = useState(0);
  
  const VISIBLE = useVisibleCards();
  const PAGE_SIZE = 12; // Cuántas noticias pedimos al server por vez

  const cargarPagina = useCallback(async (serverPage: number) => {
    try {
      const data = await fetchNoticias(serverPage, PAGE_SIZE);
      setTotal(data.total);
      return data.results;
    } catch (err) {
      console.error("Error cargando noticias:", err);
      throw err;
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    setEstado("loading");
    cargarPagina(0)
      .then((results) => {
        setNoticias(results);
        setEstado("ok");
      })
      .catch(() => setEstado("error"));
  }, [cargarPagina]);

  const irPagina = async (pageIdx: number) => {
    const targetIdx = pageIdx * VISIBLE;
    
    // ¿Necesitamos cargar más noticias del servidor?
    if (targetIdx + VISIBLE > noticias.length && noticias.length < total) {
      setEstado("loading");
      const nextServerPage = Math.floor(noticias.length / PAGE_SIZE);
      try {
        const nuevosItems = await cargarPagina(nextServerPage);
        setNoticias(prev => [...prev, ...nuevosItems]);
        setIdx(targetIdx);
        setEstado("ok");
      } catch {
        setEstado("error");
      }
    } else {
      setIdx(targetIdx);
    }
  };

  const pageCount = Math.ceil(total / VISIBLE);
  const currentPage = Math.floor(idx / VISIBLE);
  
  const canPrev = idx > 0;
  const canNext = idx + VISIBLE < total;

  const irPrev = () => irPagina(currentPage - 1);
  const irNext = () => irPagina(currentPage + 1);

  return {
    noticias,
    estado,
    idx,
    VISIBLE,
    pageCount,
    currentPage,
    canPrev,
    canNext,
    cargar: () => irPagina(0),
    irPrev,
    irNext,
    irPagina,
  };
}
