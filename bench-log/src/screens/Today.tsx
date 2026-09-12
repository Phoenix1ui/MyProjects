import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { QUARTER_LABEL, conceptById, schedule, unitById, unitsInOrder } from '../content';
import { db } from '../db/schema';
import {
  cycleRating,
  deleteSession,
  emptyPrep,
  ensureSession,
  findSession,
  getSetting,
  setAllAttendance,
  setCursorUnit,
  setSessionNotes,
  setTaught,
  toggleAttendance,
} from '../db/records';
import { attendanceForSession, listActiveStudents, ratingKey, ratingLookup } from '../db/reads';
import { SETTING } from '../db/types';
import { daysSince, isClubDay, lastClubDay, shortDate } from '../lib/dates';
import { firstName } from '../lib/names';
import { levelOf } from '../lib/levels';
import { AutosaveTextarea } from '../ui/AutosaveTextarea';
import { Icon } from '../ui/Icon';
import { PrepBox } from '../ui/PrepBox';
import { RatingChip, RatingLegend } from '../ui/RatingChip';
import { Card, ConceptChip, Empty, Eyebrow, Field, Notice, Pill } from '../ui/primitives';

/** The screen used standing up, under time pressure. One thumb. */
export default function Today() {
  // The club meets Tue and Wed, so "today" means the club day he is standing in
  // — or the last one, if he is writing notes up on Thursday evening.
  const clubDay = lastClubDay(schedule.days);
  const [date, setDate] = useState(clubDay);

  const cursor = useLiveQuery(() => getSetting(SETTING.cursorUnit), [], undefined);
  const prepRows = useLiveQuery(() => db.prep.toArray(), [], []);
  const students = useLiveQuery(() => listActiveStudents(), [], []);
  const ratings = useLiveQuery(() => db.ratings.toArray(), [], []);
  const lastExport = useLiveQuery(() => getSetting(SETTING.lastExportAt), [], undefined);
  const attendanceRows = useLiveQuery(() => db.attendance.count(), [], 0);

  // Where he is in the year: the saved cursor, else the first unit not yet
  // taught, so the app opens on the right thing without being told.
  const taught = new Set(prepRows.filter((p) => p.taught).map((p) => p.unitId));
  const nextUntaught = unitsInOrder.find((u) => !taught.has(u.id)) ?? unitsInOrder.at(-1)!;
  const unit = (cursor ? unitById.get(cursor) : undefined) ?? nextUntaught;
  const index = unitsInOrder.findIndex((u) => u.id === unit.id);
  const prep = prepRows.find((p) => p.unitId === unit.id) ?? emptyPrep(unit.id);

  // undefined while Dexie resolves, null when the session has not started.
  const session = useLiveQuery(
    async () => (await findSession(unit.id, date)) ?? null,
    [unit.id, date],
    undefined,
  );
  const attendance = useLiveQuery(
    () => (session ? attendanceForSession(session.id) : Promise.resolve([])),
    [session?.id],
    [],
  );

  const presentIds = new Set(attendance.filter((a) => a.present).map((a) => a.studentId));
  const recordedIds = new Set(attendance.map((a) => a.studentId));
  const present = students.filter((s) => presentIds.has(s.id));
  const allHere = students.length > 0 && present.length === students.length;
  const lookup = ratingLookup(ratings);

  async function saveNotes(value: string) {
    const s = await ensureSession(unit.id, date);
    await setSessionNotes(s.id, value);
  }

  async function tap(studentId: string) {
    const s = await ensureSession(unit.id, date);
    await toggleAttendance(s.id, studentId);
  }

  async function markAll(value: boolean) {
    const s = await ensureSession(unit.id, date);
    await setAllAttendance(
      s.id,
      students.map((st) => st.id),
      value,
    );
  }

  const exportAge = daysSince(lastExport ? Number(lastExport) : undefined);
  const exportStale = attendanceRows >= 10 && (exportAge === undefined || exportAge > 14);

  return (
    <div className="space-y-3">
      {exportStale ? (
        <Notice tone="amber" action={{ to: '/data', label: 'Export' }}>
          {exportAge === undefined ? 'Never backed up.' : `Last backup ${exportAge} days ago.`}
        </Notice>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={index <= 0}
          onClick={() => void setCursorUnit(unitsInOrder[index - 1].id)}
          className="btn btn-quiet px-0"
          aria-label="Previous unit"
        >
          <Icon name="left" />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-xs font-semibold text-ink-2">
          {QUARTER_LABEL[unit.quarter]} · Unit {unit.order} of {unitsInOrder.length}
        </p>
        <button
          type="button"
          disabled={index >= unitsInOrder.length - 1}
          onClick={() => void setCursorUnit(unitsInOrder[index + 1].id)}
          className="btn btn-quiet px-0"
          aria-label="Next unit"
        >
          <Icon name="right" />
        </button>
      </div>

      <header className="px-1">
        <h1 className="text-[1.7rem] leading-tight font-bold tracking-tight text-balance">{unit.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Pill>
            {unit.sessionCount} session{unit.sessionCount > 1 ? 's' : ''}
          </Pill>
          {session ? (
            <Pill tone="ink">
              Session {session.ordinal} of {unit.sessionCount}
            </Pill>
          ) : (
            <Pill>Not started</Pill>
          )}
          {prep.taught ? <Pill tone="moss">Taught</Pill> : null}
        </div>
      </header>

      <PrepBox unit={unit} prep={prep} />

      <Card className="space-y-3">
        <Field label="What kids do">{unit.kidsDo}</Field>
        <Field label="Materials">{unit.materials}</Field>
        <div>
          <Eyebrow>Concepts touched</Eyebrow>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {unit.conceptIds.map((id) => {
              const c = conceptById.get(id);
              return c ? <ConceptChip key={id} id={id} order={c.order} label={c.short} /> : null;
            })}
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Who's here</h2>
            <p className="text-sm text-ink-2 tabular-nums">
              {session ? `${present.length} of ${students.length}` : 'Tap a name to start the session'}
            </p>
          </div>
          {students.length > 0 ? (
            <button type="button" onClick={() => void markAll(!allHere)} className="btn btn-quiet">
              {allHere ? 'Clear' : 'All here'}
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <label htmlFor="session-date" className="eyebrow">
            Date
          </label>
          <input
            id="session-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || clubDay)}
            className="control tap px-2.5 text-sm font-medium"
          />
          {date === clubDay ? (
            <span className="text-ink-3">
              {shortDate(date)} · {schedule.time}
            </span>
          ) : (
            <button type="button" onClick={() => setDate(clubDay)} className="font-semibold text-moss">
              Back to {shortDate(clubDay)}
            </button>
          )}
          {isClubDay(schedule.days, date) ? null : (
            <span className="text-amber">Not a club day</span>
          )}
        </div>

        {students.length === 0 ? (
          <Empty>
            No students yet.{' '}
            <Link to="/roster" className="font-semibold text-moss">
              Add the roster
            </Link>
            .
          </Empty>
        ) : (
          <ul className="space-y-1.5">
            {students.map((student) => {
              const here = presentIds.has(student.id);
              const recorded = recordedIds.has(student.id);
              return (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => void tap(student.id)}
                    aria-pressed={here}
                    className={[
                      'flex h-13 w-full items-center justify-between rounded-(--radius-control) border px-4 text-left transition-colors',
                      here ? 'border-moss bg-moss-tint' : 'border-line bg-surface active:bg-line-2',
                    ].join(' ')}
                  >
                    <span className={`text-base font-semibold ${here ? 'text-moss-deep' : 'text-ink'}`}>
                      {student.displayName}
                    </span>
                    {here ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss text-white">
                        <Icon name="check" className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-ink-3">{recorded ? 'Absent' : ''}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Evidence is captured at the moment of observation: today's concepts,
          the kids who are here. This is what makes the heatmap real. */}
      {session && present.length > 0 ? (
        <Card className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">How it landed</h2>
            <p className="text-sm text-ink-2">Tap a name to cycle. Skip anyone you did not see.</p>
          </div>
          {unit.conceptIds.map((conceptId) => {
            const concept = conceptById.get(conceptId);
            if (!concept) return null;
            return (
              <div key={conceptId}>
                <p className="mb-1.5 text-sm font-semibold">
                  <span className="mr-1.5 text-ink-3 tabular-nums">{concept.order}</span>
                  {concept.short}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {present.map((student) => (
                    <RatingChip
                      key={student.id}
                      level={levelOf(lookup.get(ratingKey(student.id, conceptId)))}
                      label={firstName(student.displayName)}
                      title={`${student.displayName} · ${concept.short}`}
                      onClick={() => void cycleRating(student.id, conceptId)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <RatingLegend />
        </Card>
      ) : null}

      <Card>
        {/* Keyed by unit + date, not session id: the first keystroke creates
            the session, and that must not remount the field under his thumb. */}
        <AutosaveTextarea
          key={`${unit.id}:${date}`}
          id="session-notes"
          label="Session notes"
          value={session?.notes ?? ''}
          onSave={saveNotes}
          rows={4}
          placeholder="What happened, who to check on next week, what to re-teach..."
        />
      </Card>

      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{prep.taught ? 'Marked as taught' : 'Finished this unit?'}</p>
          <p className="text-sm text-ink-2">Taught units are skipped when the app picks today's unit.</p>
        </div>
        <button
          type="button"
          onClick={() => void setTaught(unit.id, !prep.taught)}
          className={`btn ${prep.taught ? 'btn-quiet' : 'btn-primary'}`}
        >
          {prep.taught ? 'Undo' : 'Mark taught'}
        </button>
      </Card>

      {session ? (
        <p className="pb-1 text-center">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete the session on ${shortDate(session.date)} and its attendance?`)) {
                void deleteSession(session.id);
              }
            }}
            className="text-sm font-medium text-ink-3 underline decoration-line underline-offset-4"
          >
            Delete this session
          </button>
        </p>
      ) : null}
    </div>
  );
}
