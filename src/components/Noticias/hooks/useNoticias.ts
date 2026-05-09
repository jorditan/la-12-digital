import { useState, useEffect, useCallback } from "react";
import { fetchNoticias, type Noticia } from "../../../services/apifootball";

type Estado = "loading" | "error" | "ok";

const VISIBLE = 3;

export function useNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [estado, setEstado] = useState<Estado>("loading");
  const [idx, setIdx] = useState(0);

  const cargar = useCallback(async () => {
    setEstado("loading");
    try {
      const data = await fetchNoticias();
      setNoticias(data.results);
      setIdx(0);
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const total = noticias.length;
  const pageCount = Math.floor(total / VISIBLE);
  const currentPage = Math.floor(idx / VISIBLE);

  const canPrev = idx > 0;
  const canNext = currentPage + 1 < pageCount;

  const irPrev = () => setIdx(Math.max(0, idx - VISIBLE));
  const irNext = () => setIdx(idx + VISIBLE);
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
