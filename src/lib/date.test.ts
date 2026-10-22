import { describe, expect, test } from 'vitest';
import { formatIsoDateEsArNumeric, formatMatchTime, parseMatchDate } from './date';

describe('Argentina match time handling', () => {
  test.each(['2026-01-15', '2026-07-15', '2026-11-01', '2026-11-08'])(
    'keeps GMT-3 on %s regardless of Northern Hemisphere daylight saving',
    (day) => {
      expect(formatMatchTime(`${day} 17:00`)).toBe('17:00');
      expect(parseMatchDate(`${day} 17:00`).toISOString()).toBe(`${day}T20:00:00.000Z`);
    },
  );

  test('preserves explicit offsets and the Argentina calendar date near midnight', () => {
    expect(formatMatchTime('2026-10-25T17:00:00-03:00')).toBe('17:00');
    expect(formatIsoDateEsArNumeric('2026-10-26T01:30:00Z')).toBe('25/10/2026');
    expect(formatMatchTime('2026-10-26T01:30:00Z')).toBe('22:30');
  });

  test('treats date-only values as midnight in Argentina', () => {
    expect(parseMatchDate('2026-10-25').toISOString()).toBe('2026-10-25T03:00:00.000Z');
  });

  test.each([null, undefined, '', 'fecha pendiente', new Date(NaN)])(
    'rejects an invalid date instead of inventing the current kickoff: %s',
    (value) => expect(() => parseMatchDate(value)).toThrow(RangeError),
  );
  test('keeps UTC timestamps unchanged and formats them in Buenos Aires', () => {
    const storedUtc = '2026-08-16T00:15:00.000Z';

    expect(parseMatchDate(storedUtc).toISOString()).toBe(storedUtc);
    expect(formatMatchTime(storedUtc)).toBe('21:15');
  });

  test('interprets timezone-less values as Argentina local time', () => {
    const argentinaLocal = '2026-08-15 21:15';

    expect(parseMatchDate(argentinaLocal).toISOString()).toBe('2026-08-16T00:15:00.000Z');
    expect(formatMatchTime(argentinaLocal)).toBe('21:15');
  });
});
