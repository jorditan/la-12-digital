import type { MatchForecast } from '../../services/weather';
import { SlotRow } from './SlotRow';

export function ForecastRows({ forecast }: { forecast: MatchForecast | null }) {
  if (!forecast) {
    return (
      <div className="flex flex-col gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-9 bg-white/[0.03] rounded-sm animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {forecast.slotBefore && <SlotRow slot={forecast.slotBefore} label="Entrada" isMatch={false} />}
      {forecast.slotMatch  && <SlotRow slot={forecast.slotMatch}  label="Partido" isMatch={true} />}
      {forecast.slotAfter  && <SlotRow slot={forecast.slotAfter}  label="Salida"  isMatch={false} />}
    </div>
  );
}
