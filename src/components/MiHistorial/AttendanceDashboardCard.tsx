interface AttendanceDashboardCardProps {
  total: number;
  onNavigate: () => void;
}

export function AttendanceDashboardCard({ total, onNavigate }: AttendanceDashboardCardProps) {
  return (
    <button
      onClick={onNavigate}
      className="group w-full bg-boca-blue-light border border-boca-border rounded-xl p-5 flex items-center justify-between hover:border-boca-gold transition-colors text-left"
    >
      <div>
        <p className="type-caption text-text-muted">Mi Historial</p>
        <p className="type-section-title text-boca-gold mt-0.5">
          {total}
          <span className="type-body text-text-muted ml-2 font-normal">
            {total === 1 ? 'partido asistido' : 'partidos asistidos'}
          </span>
        </p>
      </div>
      <span className="type-button text-text-muted group-hover:text-boca-gold transition-colors">
        Ver historial →
      </span>
    </button>
  );
}
