/**
 * Local-time ISO date, 'YYYY-MM-DD'. Never UTC: a club session at 3:45pm on a
 * Tuesday must not land on Wednesday because of a timezone offset.
 */
const pad = (n: number) => String(n).padStart(2, '0');

export function isoDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function today(): string {
  return isoDate();
}

/** 'Tue 9 Sep' - short enough for a phone header. */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function longDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** 'today', 'yesterday', '12 days ago', or undefined when never. */
export function daysAgo(ms: number | undefined, now = Date.now()): string | undefined {
  if (!ms) return undefined;
  const days = Math.floor((now - ms) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

export function daysSince(ms: number | undefined, now = Date.now()): number | undefined {
  if (!ms) return undefined;
  return Math.floor((now - ms) / 86_400_000);
}
