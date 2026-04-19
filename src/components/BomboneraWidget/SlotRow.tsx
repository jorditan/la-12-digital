import type { HourlyForecast } from "../../services/weather";

export function SlotRow({
  slot,
  label,
  isMatch,
}: {
  slot: HourlyForecast;
  label: "Entrada" | "Partido" | "Salida";
  isMatch: boolean;
}) {
  // slot.time is "YYYY-MM-DDTHH:MM" local Argentina — extract HH:MM directly
  const hora = slot.time.slice(11, 16);

  const badgeClass = isMatch
    ? "type-ui-label inline-flex items-center px-2 py-px rounded-sm bg-boca-gold/25 text-boca-gold border border-boca-gold/30"
    : "type-ui-label inline-flex items-center px-2 py-px rounded-sm bg-boca-border-card text-white";

  return (
    <div
      className={`flex items-center gap-2.5 py-2 px-3 rounded-sm ${isMatch ? "bg-boca-gold/[0.05]" : ""}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: isMatch
            ? "var(--color-boca-gold, #FFD700)"
            : "var(--color-text-secondary, #8BA3C7)",
        }}
      />
      <span
        className="type-ui-label text-text-secondary tabular-nums w-10 flex-shrink-0"
        style={{ fontSize: "11px" }}
      >
        {hora}
      </span>
      <span
        className="type-ui-label text-white flex-1 leading-none"
        style={{ fontSize: "11px" }}
      >
        {slot.tempC}° · {slot.description}
        {slot.windSpeedKmh > 15 && (
          <span className="text-text-secondary">
            {" "}
            · {slot.windSpeedKmh} km/h
          </span>
        )}
      </span>
      <span
        className={badgeClass}
        style={{ fontSize: "10px", whiteSpace: "nowrap" }}
      >
        {isMatch ? "Partido ✓" : label}
      </span>
    </div>
  );
}
