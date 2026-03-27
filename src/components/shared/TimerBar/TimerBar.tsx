interface TimerBarProps {
  timer: number;
  total: number;
}

export function TimerBar({ timer, total }: TimerBarProps) {
  const pct = (timer / total) * 100;
  const color =
    pct > 50 ? 'bg-boca-gold' : pct > 25 ? 'bg-orange-400' : 'bg-red-500';

  return (
    <div className="h-1 w-full bg-boca-blue rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-1000 ease-linear`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
