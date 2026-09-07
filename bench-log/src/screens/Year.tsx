import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import {
  QUARTERS,
  QUARTER_LABEL,
  QUARTER_SPAN,
  QUARTER_THEME,
  conceptById,
  totalSessions,
  units,
  unitsForQuarter,
} from '../content';
import { db } from '../db/schema';
import { emptyPrep, setCursorUnit, setTaught } from '../db/records';
import { shortDate } from '../lib/dates';
import { Icon } from '../ui/Icon';
import { PrepBox } from '../ui/PrepBox';
import { Card, ConceptChip, Eyebrow, Field, Pill, Progress, Screen } from '../ui/primitives';

export default function Year() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string>();
  const prepRows = useLiveQuery(() => db.prep.toArray(), [], []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), [], []);

  const prepByUnit = new Map(prepRows.map((p) => [p.unitId, p]));
  const taughtCount = prepRows.filter((p) => p.taught).length;
  const preppedCount = prepRows.filter((p) => p.prepped).length;

  return (
    <Screen
      title="The year"
      subtitle={`${units.length} units · ${totalSessions} sessions · ${preppedCount} prepped`}
      back={{ to: '/plan', label: 'Plan' }}
    >
      <Card className="space-y-2">
        <Eyebrow>Units taught</Eyebrow>
        <Progress done={taughtCount} total={units.length} />
      </Card>

      {QUARTERS.map((quarter) => (
        <section key={quarter} className="space-y-2">
          <div className="flex items-baseline justify-between px-1 pt-2">
            <h2 className="text-base font-bold">
              {QUARTER_LABEL[quarter]} <span className="text-ink-2">· {QUARTER_THEME[quarter]}</span>
            </h2>
            <span className="text-xs text-ink-3">{QUARTER_SPAN[quarter]}</span>
          </div>
          <ul className="space-y-2">
            {unitsForQuarter(quarter).map((unit) => {
              const prep = prepByUnit.get(unit.id) ?? emptyPrep(unit.id);
              const open = openId === unit.id;
              const logged = sessions
                .filter((s) => s.unitId === unit.id)
                .sort((a, b) => a.date.localeCompare(b.date));
              return (
                <li key={unit.id} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? undefined : unit.id)}
                    aria-expanded={open}
                    className="flex w-full items-start justify-between gap-3 p-4 text-left active:bg-line-2"
                  >
                    <span className="min-w-0">
                      <span className="block text-base font-semibold">
                        <span className="mr-1.5 text-ink-3 tabular-nums">{unit.order}</span>
                        {unit.title}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Pill>
                          {logged.length}/{unit.sessionCount} session{unit.sessionCount > 1 ? 's' : ''}
                        </Pill>
                        {prep.prepped ? <Pill tone="moss">Prepped</Pill> : <Pill tone="amber">Not prepped</Pill>}
                        {prep.taught ? <Pill tone="ink">Taught</Pill> : null}
                      </span>
                    </span>
                    <Icon name={open ? 'left' : 'right'} className="mt-1 h-5 w-5 shrink-0 text-ink-3" />
                  </button>

                  {open ? (
                    <div className="space-y-3 border-t border-line-2 p-4">
                      <Field label="What kids do">{unit.kidsDo}</Field>
                      <PrepBox unit={unit} prep={prep} startOpen />
                      <Field label="Materials">{unit.materials}</Field>
                      <div>
                        <Eyebrow>Concepts</Eyebrow>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {unit.conceptIds.map((id) => {
                            const c = conceptById.get(id);
                            return c ? <ConceptChip key={id} id={id} order={c.order} label={c.short} /> : null;
                          })}
                        </div>
                      </div>
                      {logged.length > 0 ? (
                        <Field label="Sessions logged">
                          {logged.map((s) => `${s.ordinal}. ${shortDate(s.date)}`).join(' · ')}
                        </Field>
                      ) : null}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            void setCursorUnit(unit.id);
                            navigate('/');
                          }}
                          className="btn btn-primary"
                        >
                          Teach this next
                        </button>
                        <button
                          type="button"
                          onClick={() => void setTaught(unit.id, !prep.taught)}
                          className="btn btn-quiet"
                        >
                          {prep.taught ? 'Mark not taught' : 'Mark taught'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Screen>
  );
}
