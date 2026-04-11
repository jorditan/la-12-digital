interface UrgencyBadgeProps {
  days: number;
}

export function UrgencyBadge({ days }: UrgencyBadgeProps) {
  if (days < 0) return null;

  if (days === 0) {
    return (
      <div className="inline-flex items-center justify-center text-center gap-1 px-2 py-0.5 rounded-sm bg-boca-gold text-boca-blue text-[10px] font-bold uppercase tracking-wide">
        <span className="size-1.5 rounded-full text-center bg-boca-blue animate-pulse" />
        <span className="text-center">¡HOY!</span>
      </div>
    );
  }

  if (days === 1) {
    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-boca-gold/20 text-boca-gold text-[10px] font-semibold uppercase tracking-wide border border-boca-gold/30">
        Mañana
      </span>
    );
  }

  if (days <= 7) {
    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-white/5 text-white/60 text-[10px] font-medium uppercase tracking-wide border border-white/10">
        En {days} días
      </span>
    );
  }

  return null;
}
