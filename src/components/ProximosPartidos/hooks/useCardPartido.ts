import { useCallback, useMemo, useState } from 'react';
import { buildGCalLink } from '../../../utils/calendarLink';
import type { ProximoPartido } from '../../../services/apifootball';
import { getCardBorderClass, getDaysUntil, getFixtureTeams } from '../utils';

export function useCardPartido(partido: ProximoPartido) {
  const [h2hOpen, setH2hOpen] = useState(false);

  const { bocaEsLocal, rival } = useMemo(() => getFixtureTeams(partido), [partido]);
  const days = useMemo(() => getDaysUntil(partido.date), [partido.date]);
  const isUrgent = days >= 0 && days <= 1;
  const cardBorderClass = useMemo(() => getCardBorderClass(isUrgent), [isUrgent]);
  const calendarHref = useMemo(() => buildGCalLink(partido), [partido]);

  const openH2h = useCallback(() => setH2hOpen(true), []);
  const closeH2h = useCallback(() => setH2hOpen(false), []);

  return {
    bocaEsLocal,
    rival,
    days,
    cardBorderClass,
    calendarHref,
    h2hOpen,
    openH2h,
    closeH2h,
  };
}
