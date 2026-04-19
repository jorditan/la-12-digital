import { useMemo } from "react";
import type { ProximoPartido } from "../../../services/apifootball";
import { getFixtureTeams } from "../utils";

export function useFixtureTableRows(partidos: ProximoPartido[]) {
  return useMemo(
    () =>
      partidos.map((partido, index) => {
        const { bocaEsLocal, rival } = getFixtureTeams(partido);
        return {
          partido,
          index,
          bocaEsLocal,
          rival,
        };
      }),
    [partidos],
  );
}
