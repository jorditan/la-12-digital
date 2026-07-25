import { Badge } from './ui/Badge';

const URGENCY_HOURS = {
  CRITICAL: 3,
  TODAY: 24,
  TOMORROW: 48,
  MAX_DAYS: 7,
} as const;

interface MatchUrgencyBadgeProps {
  matchDate: string | Date;
}

type UrgencyLevel = 'critical' | 'today' | 'tomorrow' | 'days';

const ARGENTINA_TZ = 'America/Argentina/Buenos_Aires';

function getUrgencyInfo(matchDate: string | Date): { level: UrgencyLevel; label: string } | null {
  const now = new Date();
  const target = new Date(matchDate);

  const diffMs = target.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return null;

  // Crítico: menos de 3 horas para el partido
  if (diffHours <= URGENCY_HOURS.CRITICAL) {
    const hours = Math.ceil(diffHours);
    return { level: 'critical', label: hours <= 1 ? 'En breve' : `En ${hours}h` };
  }

  // Comparación por día calendario en zona horaria de Argentina
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: ARGENTINA_TZ });
  const todayStr = fmt.format(now);
  const targetStr = fmt.format(target);

  if (todayStr === targetStr) {
    return { level: 'today', label: 'Hoy' };
  }

  const [ty, tm, td] = todayStr.split('-').map(Number);
  const [ay, am, ad] = targetStr.split('-').map(Number);
  const todayDate = new Date(ty, tm - 1, td);
  const targetDate = new Date(ay, am - 1, ad);

  const daysDiff = Math.round((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    return { level: 'tomorrow', label: '¡Mañana!' };
  }

  if (daysDiff > 1 && daysDiff <= URGENCY_HOURS.MAX_DAYS) {
    return { level: 'days', label: `En ${daysDiff} días` };
  }

  return null;
}

export function MatchUrgencyBadge({ matchDate }: MatchUrgencyBadgeProps) {
  const info = getUrgencyInfo(matchDate);
  if (!info) return null;

  if (info.level === 'critical') {
    return (
      <Badge variant="gold" className="gap-1.5 px-1.5 text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-boca-blue animate-pulse shrink-0" />
        {info.label}
      </Badge>
    );
  }

  if (info.level === 'today') {
    return <Badge variant="gold">{info.label}</Badge>;
  }

  if (info.level === 'tomorrow') {
    return (
      <Badge variant="urgency" className="animate-pulse">
        {info.label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="blue"
      className="bg-transparent border border-boca-border text-text-muted px-1.5 text-xs"
    >
      {info.label}
    </Badge>
  );
}
