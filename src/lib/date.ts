function parseIsoDate(value: string): Date {
  return new Date(value);
}

export function formatIsoDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return parseIsoDate(value).toLocaleDateString(locale, options);
}

export function formatIsoDateEsArLong(value: string): string {
  return formatIsoDate(value, 'es-AR', { day: 'numeric', month: 'long' });
}

export function formatIsoDateEsArShort(value: string): string {
  return formatIsoDate(value, 'es-AR', { day: 'numeric', month: 'short' });
}

export function formatIsoWeekdayEsArShort(value: string): string {
  return formatIsoDate(value, 'es-AR', { weekday: 'short' }).replace('.', '');
}

export function formatIsoDateEsArWithYear(value: string): string {
  return formatIsoDate(value, 'es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatIsoDateEsArNumeric(value: string): string {
  return formatIsoDate(value, 'es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getDaysUntilIsoDate(value: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = parseIsoDate(value);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
