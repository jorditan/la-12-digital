import { useMemo } from "react";
import { useAsyncData } from "./useAsyncData";
import { fetchHeadToHead, type H2HMatch } from "../services/footballApiService";

/**
 * Historial de enfrentamientos directos Boca vs un rival.
 *
 * @param rivalId  ID del rival en la LiveScore API (null = no fetcha nada).
 *
 * Retorna el estado unificado de useAsyncData:
 *   status: 'loading' | 'error' | 'ok'
 *   data:   H2HMatch[] | null
 *   error:  Error | null
 *   retry:  () => void
 *
 * Resultados siempre desde la perspectiva de Boca (result: 'win' | 'loss' | 'draw').
 */
export function useHeadToHead(rivalId: number | null) {
  const fetcher = useMemo(
    () => (rivalId !== null ? () => fetchHeadToHead(rivalId) : null),
    [rivalId],
  );

  return useAsyncData<H2HMatch[]>(fetcher ?? (() => Promise.resolve([])), [
    rivalId,
  ]);
}
