import { useMemo, useState } from "react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchStandings } from "../../services/apifootball";

export function getFriendlyZoneLabel(zoneName: string): string {
  // Promiedos groups Grupo A/B under Clausura and Zona A/B under Apertura.
  const group = /^grupo ([ab])$/i.exec(zoneName.trim());
  if (group) return `Clausura — Grupo ${group[1].toUpperCase()}`;
  const zone = /^zona ([ab])$/i.exec(zoneName.trim());
  if (zone) return `Apertura — Zona ${zone[1].toUpperCase()}`;
  if (/^promedios\b/i.test(zoneName)) return "Promedios";
  if (/^tabla anual\b/i.test(zoneName)) return "Tabla Anual";
  return zoneName;
}

export function useTablaPosiciones() {
  const { data, status: activeEstado, retry } = useAsyncData(fetchStandings);
  const [selectedZone, setActiveZone] = useState("");

  const zoneNames = useMemo(
    () => [...new Set((data ?? []).map((row) => row.zone).filter(
      (zone): zone is string => Boolean(zone),
    ))],
    [data],
  );
  const defaultZone = data?.find((row) => /boca/i.test(row.team.name) && row.zone)?.zone;
  const activeZone = zoneNames.includes(selectedZone)
    ? selectedZone
    : defaultZone ?? zoneNames[0] ?? "";
  const displayRows = useMemo(
    () => (data ?? [])
      .filter((row) => !activeZone || row.zone === activeZone)
      .sort((a, b) => a.rank - b.rank),
    [data, activeZone],
  );

  return {
    activeEstado,
    displayRows,
    shouldShowZoneSelector: zoneNames.length > 1,
    zoneNames,
    activeZone,
    setActiveZone,
    activeZoneLabel: activeZone,
    retry,
  };
}
