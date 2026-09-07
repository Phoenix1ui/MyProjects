import type { Level } from '../db/types';

/**
 * One place for how a rating looks, so the Today strip, the roster grid and the
 * heatmap agree. It is a ramp, not a traffic light: "not yet" is pale, not red.
 * A class grid that paints a kid red teaches the wrong thing about the number.
 */
export type LevelOrNone = Level | 'none';

export const LEVEL_MARK: Record<LevelOrNone, string> = {
  none: '·',
  0: '○',
  1: '◐',
  2: '●',
};

export const LEVEL_TEXT: Record<LevelOrNone, string> = {
  none: 'Not rated',
  0: 'Not yet',
  1: 'With help',
  2: 'On their own',
};

/** Tailwind classes for a rating cell or chip. */
export const LEVEL_CELL: Record<LevelOrNone, string> = {
  none: 'bg-surface border-dashed border-line text-ink-3',
  0: 'bg-level0 border-level0 text-ink-2',
  1: 'bg-level1 border-level1 text-ink',
  2: 'bg-moss border-moss text-white',
};

export function levelOf(level: Level | undefined): LevelOrNone {
  return level === undefined ? 'none' : level;
}

/** Colour for a class-average figure: quiet until it means something. */
export function averageTone(average: number, rated: number): string {
  if (rated === 0) return 'text-ink-3';
  if (average < 1) return 'bg-amber-tint text-amber';
  if (average < 1.6) return 'bg-level1/60 text-ink';
  return 'bg-moss-tint text-moss-deep';
}
