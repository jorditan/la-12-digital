const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

/**
 * Parsea una fecha de partido garantizando una zona horaria determinista.
 * Si la cadena no contiene diseño de zona horaria (Z o offset +-HH:MM),
 * se interpreta explícitamente como hora local de Argentina (-03:00).
 */
export function parseMatchDate(value: string | Date | null | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;

  const trimmed = String(value).trim();
  if (!trimmed) return new Date();

  // Si no especifica timezone (Z, z, +HH:MM, -HH:MM), asumir Argentina (-03:00)
  const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(trimmed);

  if (!hasTimezone) {
    const isoBase = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
    const parsed = new Date(`${isoBase}-03:00`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function formatMatchTime(value: string | Date): string {
  const date = parseMatchDate(value);
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ARGENTINA_TZ,
  });
}

function parseIsoDate(value: string): Date {
  return parseMatchDate(value);
}

export function formatIsoDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return parseIsoDate(value).toLocaleDateString(locale, {
    timeZone: ARGENTINA_TZ,
    ...options,
  });
}

export function formatIsoDateEsArLong(value: string): string {
  return formatIsoDate(value, "es-AR", { day: "numeric", month: "long" });
}

export function formatIsoDateEsArShort(value: string): string {
  return formatIsoDate(value, "es-AR", { day: "numeric", month: "short" });
}

export function formatIsoWeekdayEsArShort(value: string): string {
  return formatIsoDate(value, "es-AR", { weekday: "short" }).replace(".", "");
}

export function formatIsoDateEsArWithYear(value: string): string {
  return formatIsoDate(value, "es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatIsoDateEsArNumeric(value: string): string {
  return formatIsoDate(value, "es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getDaysUntilIsoDate(value: string): number {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: ARGENTINA_TZ });

  const todayArgStr = fmt.format(new Date());
  const targetArgStr = fmt.format(parseIsoDate(value));

  const [ty, tm, td] = todayArgStr.split("-").map(Number);
  const [ay, am, ad] = targetArgStr.split("-").map(Number);

  const todayArg = new Date(ty, tm - 1, td);
  const targetArg = new Date(ay, am - 1, ad);

  return Math.round(
    (targetArg.getTime() - todayArg.getTime()) / (1000 * 60 * 60 * 24),
  );
}

