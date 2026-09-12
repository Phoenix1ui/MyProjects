import { LEVEL_CELL, LEVEL_MARK, LEVEL_TEXT, type LevelOrNone } from '../lib/levels';

/**
 * One tap cycles not yet -> with help -> on their own -> not yet. Used on the
 * Today strip (label = first name), the roster grid (label = concept) and the
 * class grid (no label, a 44px cell).
 */
export function RatingChip({
  level,
  label,
  title,
  onClick,
  cell = false,
}: {
  level: LevelOrNone;
  label?: string;
  title: string;
  onClick: () => void;
  cell?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${title}: ${LEVEL_TEXT[level]}`}
      aria-label={`${title}: ${LEVEL_TEXT[level]}`}
      className={[
        'tap inline-flex items-center justify-center gap-1.5 border font-semibold transition-colors',
        cell ? 'h-11 w-11 rounded-(--radius-control) text-base' : 'rounded-(--radius-control) px-2.5 text-sm',
        LEVEL_CELL[level],
      ].join(' ')}
    >
      {label ? <span className="max-w-[7rem] truncate">{label}</span> : null}
      <span aria-hidden className="text-base leading-none">
        {LEVEL_MARK[level]}
      </span>
    </button>
  );
}

export function RatingLegend() {
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-2">
      {(['none', 0, 1, 2] as const).map((level) => (
        <span key={String(level)} className="inline-flex items-center gap-1">
          <span aria-hidden className="text-base leading-none">
            {LEVEL_MARK[level]}
          </span>
          {LEVEL_TEXT[level]}
        </span>
      ))}
    </p>
  );
}
