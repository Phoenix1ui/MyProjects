import { useState } from 'react';
import type { Unit } from '../content';
import type { PrepRecord } from '../db/types';
import { setPrepNotes, setPrepped } from '../db/records';
import { longDate } from '../lib/dates';
import { AutosaveTextarea } from './AutosaveTextarea';
import { Icon } from './Icon';

/**
 * The contrast is the whole point: loud amber when he has not learned it yet, a
 * quiet single line when he has. Marking it prepped collapses it on the spot;
 * the loud-to-quiet flip is the feedback.
 */
export function PrepBox({
  unit,
  prep,
  startOpen = false,
}: {
  unit: Unit;
  prep: PrepRecord;
  startOpen?: boolean;
}) {
  const { prepped } = prep;
  const [open, setOpen] = useState(startOpen);
  const showBody = !prepped || open;

  function toggle() {
    const next = !prepped;
    void setPrepped(unit.id, next);
    if (next && !startOpen) setOpen(false);
  }

  return (
    <section
      className={[
        'rounded-(--radius-card) border p-4 transition-colors',
        prepped ? 'border-line bg-surface' : 'border-amber-line bg-amber-tint',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={showBody}
          className="tap -m-1 flex min-w-0 flex-1 items-center gap-2.5 p-1 text-left"
        >
          <span
            className={[
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              prepped ? 'bg-moss-tint text-moss-deep' : 'bg-amber text-white',
            ].join(' ')}
          >
            <Icon name={prepped ? 'check' : 'alert'} className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className={`block text-sm font-bold ${prepped ? 'text-ink' : 'text-amber-deep'}`}>
              {prepped ? 'Prepped' : 'Not prepped yet'}
            </span>
            <span className={`block text-xs ${prepped ? 'text-ink-3' : 'text-amber'}`}>
              {prepped && prep.preppedAt
                ? `${longDate(prep.preppedAt)} · tap to review`
                : 'What you need to know before you can teach it'}
            </span>
          </span>
        </button>
        <button type="button" onClick={toggle} className={`btn ${prepped ? 'btn-quiet' : 'btn-loud'}`}>
          {prepped ? 'Undo' : "I've prepped it"}
        </button>
      </div>

      {showBody ? (
        <div className="mt-3 space-y-3">
          <p className={`text-[0.95rem] leading-relaxed ${prepped ? 'text-ink-2' : 'text-ink'}`}>
            {unit.teacherPrep}
          </p>
          <AutosaveTextarea
            key={unit.id}
            id={`prep-${unit.id}`}
            label="Notes to self"
            value={prep.notes}
            onSave={(v) => setPrepNotes(unit.id, v)}
            placeholder="Readings on our floor, what went wrong last time, what to say..."
          />
        </div>
      ) : null}
    </section>
  );
}
