import { describe, expect, test } from 'vitest';
import { isDatasetStale, STALE_HOURS } from './dataFreshnessService';

const NOW = Date.parse('2026-08-12T18:00:00.000Z');

function hoursAgo(hours: number): string {
  return new Date(NOW - hours * 60 * 60 * 1000).toISOString();
}

describe('isDatasetStale', () => {
  test('keeps recent successful data fresh even if a later sync failed', () => {
    expect(isDatasetStale(hoursAgo(1), NOW)).toBe(false);
  });

  test('becomes stale only after the 36-hour threshold', () => {
    expect(isDatasetStale(hoursAgo(STALE_HOURS), NOW)).toBe(false);
    expect(isDatasetStale(hoursAgo(STALE_HOURS + 0.01), NOW)).toBe(true);
  });

  test('treats missing or invalid success timestamps as stale', () => {
    expect(isDatasetStale(null, NOW)).toBe(true);
    expect(isDatasetStale('invalid-date', NOW)).toBe(true);
  });
});
