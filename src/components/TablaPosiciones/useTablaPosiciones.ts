import { useEffect, useState } from 'react';
import {
  fetchStandings,
  fetchLibertadoresStandings,
  type StandingRow,
} from '../../services/apifootball';

type Estado = 'loading' | 'error' | 'ok';
export type Competicion = 'liga' | 'libertadores';

export const COMPETITION_OPTIONS = [
  { value: 'liga',         label: 'Liga' },
  { value: 'libertadores', label: 'Copa Lib.' },
] as const satisfies readonly { value: Competicion; label: string }[];

export function useTablaPosiciones() {
  const [rows, setRows]               = useState<StandingRow[]>([]);
  const [estado, setEstado]           = useState<Estado>('loading');
  const [libRows, setLibRows]         = useState<StandingRow[] | null>(null);
  const [libEstado, setLibEstado]     = useState<Estado>('loading');
  const [competicion, setCompeticion] = useState<Competicion>('liga');
  const [activeZone, setActiveZone]   = useState<string>('');

  const cargar = () => {
    setEstado('loading');
    fetchStandings()
      .then((data) => { setRows(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  const cargarLibertadores = () => {
    setLibEstado('loading');
    fetchLibertadoresStandings()
      .then((data) => { setLibRows(data); setLibEstado('ok'); })
      .catch(() => setLibEstado('error'));
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (competicion === 'libertadores' && libRows === null) cargarLibertadores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competicion]);

  const activeRows   = competicion === 'liga' ? rows : (libRows ?? []);
  const activeEstado = competicion === 'liga' ? estado : libEstado;

  const zoneNames = [...new Set(activeRows.map(r => r.zone).filter((z): z is string => Boolean(z)))];
  const hasZones  = zoneNames.length >= 2;
  const bocaZone  = activeRows.find((r) => /boca/i.test(r.team.name))?.zone ?? '';

  const isLibertadores         = competicion === 'libertadores';
  const shouldLockToBocaZone   = isLibertadores && Boolean(bocaZone);
  const shouldShowZoneSelector = hasZones && !shouldLockToBocaZone;

  useEffect(() => {
    if (hasZones && !zoneNames.includes(activeZone)) {
      setActiveZone(bocaZone && zoneNames.includes(bocaZone) ? bocaZone : zoneNames[zoneNames.length - 1]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRows]);

  const displayRows = shouldLockToBocaZone
    ? activeRows.filter((r) => r.zone === bocaZone)
    : hasZones
      ? activeRows.filter((r) => r.zone === activeZone)
      : activeRows;

  const activeZoneLabel = shouldLockToBocaZone ? bocaZone : activeZone;

  const handleCompeticionChange = (comp: Competicion) => {
    setCompeticion(comp);
    setActiveZone('');
  };

  const retry = competicion === 'liga' ? cargar : cargarLibertadores;

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
