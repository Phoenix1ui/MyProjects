import { describe, expect, it } from 'vitest';
import { daysAgo, isClubDay, isoDate, lastClubDay, nextClubDay } from '../lib/dates';
import { schedule } from '../content';

// 2026-09-08 is a Tuesday, 2026-09-09 a Wednesday.
const TUE = new Date(2026, 8, 8, 12);
const WED = new Date(2026, 8, 9, 12);
const THU = new Date(2026, 8, 10, 12);
const MON = new Date(2026, 8, 14, 12);

describe('club days (Tue & Wed)', () => {
  it('knows the club meets Tuesday and Wednesday', () => {
    expect(schedule.days).toEqual([2, 3]);
  });

  it('defaults Today to the club day itself on a club day', () => {
    expect(lastClubDay(schedule.days, TUE)).toBe('2026-09-08');
    expect(lastClubDay(schedule.days, WED)).toBe('2026-09-09');
  });

  it('falls back to the most recent club day for notes written later', () => {
    expect(lastClubDay(schedule.days, THU)).toBe('2026-09-09');
    expect(lastClubDay(schedule.days, MON)).toBe('2026-09-09');
  });

  it('finds the next club day strictly after today', () => {
    expect(nextClubDay(schedule.days, TUE)).toBe('2026-09-09');
    expect(nextClubDay(schedule.days, WED)).toBe('2026-09-15');
    expect(nextClubDay(schedule.days, THU)).toBe('2026-09-15');
  });

  it('classifies a date', () => {
    expect(isClubDay(schedule.days, '2026-09-08')).toBe(true);
    expect(isClubDay(schedule.days, '2026-09-10')).toBe(false);
  });
});

describe('dates', () => {
  it('formats local dates without a timezone shift', () => {
    expect(isoDate(new Date(2026, 8, 9, 23, 59))).toBe('2026-09-09');
    expect(isoDate(new Date(2026, 8, 9, 0, 1))).toBe('2026-09-09');
  });

  it('describes how long ago a backup was', () => {
    const now = Date.UTC(2026, 8, 12);
    expect(daysAgo(undefined, now)).toBeUndefined();
    expect(daysAgo(now - 3_600_000, now)).toBe('today');
    expect(daysAgo(now - 86_400_000, now)).toBe('yesterday');
    expect(daysAgo(now - 12 * 86_400_000, now)).toBe('12 days ago');
  });
});
