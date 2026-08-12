import { describe, expect, test } from 'vitest';
import { formatMatchTime, parseMatchDate } from './date';

describe('Argentina match time handling', () => {
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
