import type { HourlyForecast } from '../../services/weather';
import { StatRow } from './StatRow';

export function StatsGrid({ slot }: { slot: HourlyForecast }) {
  return (
    <div className="flex gap-2 min-h-[90px]">
      {/* Temperatura — columna izquierda grande */}
      <div className="bg-boca-gold/[0.07] border border-boca-gold/10 rounded-sm px-4 flex flex-col justify-center min-w-[88px]">
        <p
          className="font-bold text-boca-gold leading-none text-[2.4rem] font-sans"
        >
          {slot.tempC}°
        </p>
        <p className="type-ui-label text-text-secondary mt-1.5 tracking-[0.06em]">
          TEMP.
        </p>
      </div>

      {/* Stats apilados — columna derecha */}
      <div className="bg-boca-gold/[0.07] border border-boca-gold/10 rounded-sm flex-1 flex flex-col divide-y divide-boca-gold/10">
        <StatRow label="Humedad" value={<>{slot.humidityPct}<span style={{ fontSize: '0.65rem' }}>%</span></>} />
        <StatRow
          label="Viento"
          value={
            <>{slot.windSpeedKmh}<span style={{ fontSize: '0.65rem' }}> km/h {slot.windDir}</span></>
          }
        />
        <StatRow
          label="Probabilidad de lluvia"
          value={<>{slot.precipitationProbPct}<span style={{ fontSize: '0.65rem' }}>%</span></>}
          warn={slot.precipitationProbPct > 40}
        />
      </div>
    </div>
  );
}
