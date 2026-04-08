import type { ProximoPartido } from '../services/apifootball';

const ICS_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas por defecto

function matchTitle(p: ProximoPartido): string {
  return `${p.homeTeam.name} vs ${p.awayTeam.name} — ${p.competition}`;
}

/** Formatea una fecha ISO a "YYYYMMDDTHHmmssZ" (sin separadores) para Google Calendar */
function toGCalDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/** Genera el link de "Add to Google Calendar" para un partido */
export function buildGCalLink(partido: ProximoPartido): string {
  const start = toGCalDate(partido.date);
  const end = toGCalDate(new Date(new Date(partido.date).getTime() + ICS_DURATION_MS).toISOString());

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: matchTitle(partido),
    dates: `${start}/${end}`,
    details: partido.competition,
    location: partido.venueName,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ── ICS export ────────────────────────────────────────────────────────────────

/** Formatea una fecha ISO a "YYYYMMDDTHHmmssZ" para el formato iCalendar */
function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Escapa caracteres especiales según RFC 5545 */
function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildIcsEvent(p: ProximoPartido): string {
  const start = toIcsDate(p.date);
  const end = toIcsDate(new Date(new Date(p.date).getTime() + ICS_DURATION_MS).toISOString());

  return [
    'BEGIN:VEVENT',
    `UID:boca-${p.fixtureId}@la12digital.com`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(matchTitle(p))}`,
    `LOCATION:${escapeIcs(p.venueName)}`,
    `DESCRIPTION:${escapeIcs(p.competition)}`,
    'END:VEVENT',
  ].join('\r\n');
}

/** Descarga un archivo .ics con todos los partidos recibidos */
export function downloadIcsFile(partidos: ProximoPartido[]): void {
  const events = partidos.map(buildIcsEvent).join('\r\n');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La 12 Digital//Boca Juniors//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'boca-partidos.ics';
  a.click();
  URL.revokeObjectURL(url);
}
