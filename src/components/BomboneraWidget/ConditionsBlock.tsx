import type { HourlyForecast } from '../../services/weather';

function conditionsText(slot: HourlyForecast): string {
  const parts: string[] = [];

  if (slot.tempC < 5)       parts.push('Temperatura muy fría');
  else if (slot.tempC < 15) parts.push('Temperatura fresca');
  else if (slot.tempC < 28) parts.push('Temperatura agradable');
  else                       parts.push('Temperatura calurosa');

  if (slot.precipitationProbPct < 20)       parts.push('Sin riesgo de lluvia significativo');
  else if (slot.precipitationProbPct < 40)  parts.push('Posibilidad leve de lluvia');
  else if (slot.precipitationProbPct < 60)  parts.push('Lluvia probable');
  else                                       parts.push('Alta probabilidad de lluvia');

  if (slot.windSpeedKmh > 40) parts.push('Viento fuerte');

  return parts.join(' · ');
}

export function ConditionsBlock({ slot }: { slot: HourlyForecast }) {
  return (
    <div className="bg-boca-gold/[0.05] border border-boca-gold/10 rounded-sm px-3 py-2.5">
      <p className="type-ui-label text-boca-gold mb-1 text-[10px] tracking-[0.08em]">
        CONDICIONES DEL PARTIDO
      </p>
      <p className="type-ui-label text-text-secondary text-[11px]">
        {conditionsText(slot)}
      </p>
    </div>
  );
}
