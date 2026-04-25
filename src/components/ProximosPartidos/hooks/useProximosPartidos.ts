import { useAsyncData } from "../../../hooks/useAsyncData";
import { fetchUpcomingMatches } from "../../../services/apifootball";

export function useProximosPartidos() {
  const { data, status, retry } = useAsyncData(fetchUpcomingMatches);
  return { partidos: data ?? [], estado: status, cargar: retry };
}
