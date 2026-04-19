import { Badge } from "./ui/Badge";

interface MatchUrgencyBadgeProps {
  matchDate: string | Date;
}

type UrgencyLevel = "critical" | "upcoming" | "near" | null;

function getUrgencyLevel(matchDate: string | Date): UrgencyLevel {
  const now = new Date();
  const date = new Date(matchDate);
  const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return null;
  if (diffHours <= 3) return "critical";
  if (diffHours <= 24) return "upcoming";
  if (diffHours <= 72) return "near";
  return null;
}

export function MatchUrgencyBadge({ matchDate }: MatchUrgencyBadgeProps) {
  const level = getUrgencyLevel(matchDate);
  if (!level) return null;

  if (level === "critical") {
    return (
      <Badge variant="gold" className="gap-1.5 px-1.5 py-px text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-boca-blue animate-pulse shrink-0" />
        HOY
      </Badge>
    );
  }

  if (level === "upcoming") {
    return (
      <Badge
        variant="gold"
        className="bg-transparent border border-boca-gold/40 text-boca-gold px-1.5 py-px text-[10px]"
      >
        Mañana
      </Badge>
    );
  }

  // near
  return (
    <Badge
      variant="blue"
      className="bg-transparent border border-boca-border text-text-muted px-1.5 py-px text-[10px]"
    >
      Esta semana
    </Badge>
  );
}
