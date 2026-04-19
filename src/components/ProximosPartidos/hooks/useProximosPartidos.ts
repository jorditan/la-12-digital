import { useCallback, useEffect, useState } from "react";
import {
  fetchUpcomingMatches,
  type ProximoPartido,
} from "../../../services/apifootball";

type Estado = "loading" | "error" | "ok";

export function useProximosPartidos() {
  const [partidos, setPartidos] = useState<ProximoPartido[]>([]);
  const [estado, setEstado] = useState<Estado>("loading");

  const cargar = useCallback(() => {
    setEstado("loading");
    fetchUpcomingMatches()
      .then((data) => {
        setPartidos(data);
        setEstado("ok");
      })
      .catch(() => setEstado("error"));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { partidos, estado, cargar };
}
