interface MatchUrgencyBadgeProps {
  matchDate: string | Date;
  showIcon?: boolean;
}

type UrgencyLevel = 'critical' | 'upcoming' | 'near' | null;

function getUrgencyLevel(matchDate: string | Date): UrgencyLevel {
  const now = new Date();
  const date = new Date(matchDate);
  const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return null;
  if (diffHours <= 3) return 'critical';
  if (diffHours <= 24) return 'upcoming';
  if (diffHours <= 72) return 'near';
  return null;
}

const BASE = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide';

const BADGE_CONFIG: Record<NonNullable<UrgencyLevel>, { className: string; icon: string; label: string }> = {
  critical: {
    className: 'bg-boca-gold text-boca-blue',
    icon: '🔴',
    label: '¡HOY!',
  },
  upcoming: {
    className: 'bg-boca-gold/20 text-boca-gold border border-boca-gold/30',
    icon: '⏰',
    label: 'Mañana',
  },
  near: {
    className: 'bg-white/5 text-white/60 border border-white/10',
    icon: '📅',
    label: 'Pronto',
  },
};

export function MatchUrgencyBadge({ matchDate, showIcon = true }: MatchUrgencyBadgeProps) {
  const level = getUrgencyLevel(matchDate);
  if (!level) return null;

  const config = BADGE_CONFIG[level];

  return (
    <span className={`${BASE} ${config.className}`}>
      {showIcon && <span aria-hidden="true">{config.icon}</span>}
      {config.label}
    </span>
  );
}
