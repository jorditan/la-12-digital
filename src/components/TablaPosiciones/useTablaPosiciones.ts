import { useEffect, useState } from "react";
import {
  fetchStandings,
  fetchLibertadoresStandings,
  type StandingRow,
} from "../../services/apifootball";

type Estado = "loading" | "error" | "ok";
export type Competicion = "liga" | "libertadores";

export const COMPETITION_OPTIONS = [
  { value: "liga", label: "Liga" },
  { value: "libertadores", label: "Copa Lib." },
] as const satisfies readonly { value: Competicion; label: string }[];

export function getFriendlyZoneLabel(zoneName: string): string {
  if (!zoneName) return "";
  const lower = zoneName.toLowerCase();

  if (lower.includes("grupo a")) return "Clausura — Grupo A";
  if (lower.includes("grupo b")) return "Clausura — Grupo B";
  if (lower.includes("zona a")) return "Apertura — Zona A";
  if (lower.includes("zona b")) return "Apertura — Zona B";
  if (lower.includes("anual")) return "Tabla Anual";
  if (lower.includes("promedios")) return "Promedios";

  return zoneName;
}

export function useTablaPosiciones() {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [estado, setEstado] = useState<Estado>("loading");
  const [libRows, setLibRows] = useState<StandingRow[] | null>(null);
  const [libEstado, setLibEstado] = useState<Estado>("loading");
  const [competicion, setCompeticion] = useState<Competicion>("liga");
  const [activeZone, setActiveZone] = useState<string>("");

  const cargar = () => {
    setEstado("loading");
    fetchStandings()
      .then((data) => {
        setRows(data);
        setEstado("ok");
      })
      .catch(() => setEstado("error"));
  };

  const cargarLibertadores = () => {
    setLibEstado("loading");
    fetchLibertadoresStandings()
      .then((data) => {
        setLibRows(data);
        setLibEstado("ok");
      })
      .catch(() => setLibEstado("error"));
  };

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    if (competicion === "libertadores" && libRows === null)
      cargarLibertadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competicion]);

  const activeRows = competicion === "liga" ? rows : (libRows ?? []);
  const activeEstado = competicion === "liga" ? estado : libEstado;

  // Extraer y ordenar zonas: Clausura primero (Grupo), luego Apertura (Zona), Tabla Anual, Promedios
  const rawZoneNames = [
    ...new Set(
      activeRows.map((r) => r.zone).filter((z): z is string => Boolean(z)),
    ),
  ];

  const zoneWeight = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes("grupo")) return 1; // Clausura
    if (l.includes("zona")) return 2;  // Apertura
    if (l.includes("anual")) return 3; // Tabla Anual
    if (l.includes("promedios")) return 4; // Promedios
    return 5;
  };

  const zoneNames = [...rawZoneNames].sort(
    (a, b) => zoneWeight(a) - zoneWeight(b)
  );

  const hasZones = zoneNames.length >= 2;

  // Encontrar todas las zonas donde juega Boca
  const bocaRows = activeRows.filter((r) => /boca/i.test(r.team.name));
  const bocaZones = bocaRows.map((r) => r.zone).filter(Boolean) as string[];

  // Priorizar la zona del torneo en curso de Boca (ej. Grupo A / Clausura)
  const currentBocaZone =
    bocaZones.find((z) => z.toLowerCase().includes("grupo")) ||
    bocaZones[0] ||
    "";

  const isLibertadores = competicion === "libertadores";
  const shouldLockToBocaZone = isLibertadores && Boolean(currentBocaZone);
  const shouldShowZoneSelector = hasZones && !shouldLockToBocaZone;

  useEffect(() => {
    if (hasZones && (!activeZone || !zoneNames.includes(activeZone))) {
      setActiveZone(
        currentBocaZone && zoneNames.includes(currentBocaZone)
          ? currentBocaZone
          : zoneNames[0],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRows]);

  const displayRows = shouldLockToBocaZone
    ? activeRows.filter((r) => r.zone === currentBocaZone)
    : hasZones
      ? activeRows.filter((r) => r.zone === activeZone)
      : activeRows;

  const activeZoneLabel = shouldLockToBocaZone ? currentBocaZone : activeZone;

  const handleCompeticionChange = (comp: Competicion) => {
    setCompeticion(comp);
    setActiveZone("");
  };

  const retry = competicion === "liga" ? cargar : cargarLibertadores;

  return {
    competicion,
    handleCompeticionChange,
    activeEstado,
    displayRows,
    shouldShowZoneSelector,
    zoneNames,
    activeZone,
    setActiveZone,
    isLibertadores,
    activeZoneLabel,
    retry,
  };
}
