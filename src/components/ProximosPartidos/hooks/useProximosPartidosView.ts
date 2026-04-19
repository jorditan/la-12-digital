import { useCallback, useMemo, useState } from "react";
import { downloadIcsFile } from "../../../utils/calendarLink";
import type { ProximoPartido } from "../../../services/apifootball";
import type { VistaProximosPartidos } from "../types";

export function useProximosPartidosView(
  partidos: ProximoPartido[],
  estado: "loading" | "error" | "ok",
) {
  const [vista, setVista] = useState<VistaProximosPartidos>("cards");

  const canShowActions = estado === "ok" && partidos.length > 0;

  const downloadAll = useCallback(() => {
    downloadIcsFile(partidos);
  }, [partidos]);

  return useMemo(
    () => ({
      vista,
      setVista,
      canShowActions,
      downloadAll,
    }),
    [canShowActions, downloadAll, vista],
  );
}
