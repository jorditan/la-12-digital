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

function getUrgencyInfo(matchDate: string | Date): { level: UrgencyLevel; label: string } | null {
  const now = new Date();
  const date = new Date(matchDate);
  const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return null;
  if (diffHours <= URGENCY_HOURS.CRITICAL) {
    const hours = Math.ceil(diffHours);
    return { level: 'critical', label: hours <= 1 ? 'Ahora' : `En ${hours}h` };
  }
  if (diffHours <= URGENCY_HOURS.TODAY) return { level: 'today', label: 'Hoy' };
  if (diffHours <= URGENCY_HOURS.TOMORROW) return { level: 'tomorrow', label: '¡Mañana!' };
  const days = Math.round(diffHours / 24);
  if (days <= URGENCY_HOURS.MAX_DAYS) return { level: 'days', label: `En ${days} días` };
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
