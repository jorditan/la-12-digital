const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

function parseIsoDate(value: string): Date {
  return new Date(value);
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
