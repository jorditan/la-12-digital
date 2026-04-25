import type { EnrichedRow } from '@/hooks/useMatchEnricher';
import { Badge } from '../ui/Badge';
import { TeamLogo } from '../ui/TeamLogo';

export const StatusDot = ({ status }: { status: EnrichedRow['status'] }) => {
  const colors: Record<EnrichedRow['status'], string> = {
    found: 'bg-[#4ade80]',
    duplicate: 'bg-text-muted/30',
    not_found: 'bg-boca-gold',
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status]}`} />;
};

export const PreviewRow = ({ row }: { row: EnrichedRow }) => {
  const rival = row.homeTeam && row.awayTeam ? `${row.homeTeam} vs ${row.awayTeam}` : row.rival;
  const score =
    row.homeGoals !== undefined && row.awayGoals !== undefined
      ? ` ${row.homeGoals}-${row.awayGoals}`
      : '';
  
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-boca-border/20 last:border-0 text-left">
      <StatusDot status={row.status} />
      
      {/* Logos en miniatura si están disponibles */}
      <div className="flex items-center -space-x-1 shrink-0">
        <TeamLogo src={row.homeTeamLogo} alt="Local" size={14} className="border border-black/20 rounded-full bg-white/5" />
        <TeamLogo src={row.awayTeamLogo} alt="Visitante" size={14} className="border border-black/20 rounded-full bg-white/5" />
      </div>

      <span className="type-caption text-text-nav flex-1 min-w-0 truncate">
        {row.fecha} · {rival}
        {score}
      </span>
      {row.league && (
        <Badge className="text-[10px]" variant="blue">
          {row.league}
        </Badge>
      )}
    </div>
  );
};
