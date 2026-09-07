import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { conceptsInOrder } from '../content';
import { db } from '../db/schema';
import { addStudent, cycleRating, setStudentActive } from '../db/records';
import {
  attendanceStats,
  listStudents,
  masteryPercent,
  ratingKey,
  ratingLookup,
} from '../db/reads';
import { normaliseStudentName } from '../lib/names';
import { levelOf } from '../lib/levels';
import { Icon } from '../ui/Icon';
import { RatingChip, RatingLegend } from '../ui/RatingChip';
import { Card, Empty, ErrorText, Screen } from '../ui/primitives';

export default function Roster() {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string>();
  const [openId, setOpenId] = useState<string>();
  const [showLeft, setShowLeft] = useState(false);

  const students = useLiveQuery(() => listStudents(), [], []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), [], []);
  const attendance = useLiveQuery(() => db.attendance.toArray(), [], []);
  const ratings = useLiveQuery(() => db.ratings.toArray(), [], []);

  const active = students.filter((s) => s.active);
  const left = students.filter((s) => !s.active);
  const stats = attendanceStats(students, sessions, attendance);
  const lookup = ratingLookup(ratings);
  const preview = draft.trim() ? normaliseStudentName(draft) : undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addStudent(draft);
      setDraft('');
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <Screen
      title="Roster"
      subtitle={`${active.length} in the club${left.length ? ` · ${left.length} left` : ''}`}
    >
      <Card>
        <form onSubmit={(e) => void submit(e)} className="space-y-2">
          <label htmlFor="new-student" className="eyebrow block">
            Add a student
          </label>
          <div className="flex gap-2">
            <input
              id="new-student"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(undefined);
              }}
              placeholder="Amara T."
              autoComplete="off"
              autoCapitalize="words"
              className="control tap min-w-0 flex-1 px-3 text-base"
            />
            <button type="submit" className="btn btn-primary">
              <Icon name="plus" className="h-4 w-4" />
              Add
            </button>
          </div>
          <p className="text-xs text-ink-3">
            {preview?.ok
              ? `Saves as ${preview.value}`
              : 'First name and last initial. No surnames, no emails, no photos. Ever.'}
          </p>
          <ErrorText>{error ?? (preview && !preview.ok ? preview.reason : undefined)}</ErrorText>
        </form>
      </Card>

      {active.length === 0 ? (
        <Empty>Nobody on the roster yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {active.map((student) => {
            const open = openId === student.id;
            const stat = stats.get(student.id) ?? { present: 0, held: 0 };
            const mastery = masteryPercent(student.id, ratings, conceptsInOrder.length);
            return (
              <li key={student.id} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? undefined : student.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left active:bg-line-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-base font-semibold">{student.displayName}</span>
                    <span className="block text-sm text-ink-2 tabular-nums">
                      {stat.present} of {stat.held} session{stat.held === 1 ? '' : 's'} · {mastery}% on
                      their own
                    </span>
                  </span>
                  <Icon name={open ? 'left' : 'right'} className="h-5 w-5 shrink-0 text-ink-3" />
                </button>

                {open ? (
                  <div className="space-y-3 border-t border-line-2 p-4">
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {conceptsInOrder.map((concept) => (
                        <RatingChip
                          key={concept.id}
                          level={levelOf(lookup.get(ratingKey(student.id, concept.id)))}
                          label={`${concept.order}. ${concept.short}`}
                          title={`${student.displayName} · ${concept.name}`}
                          onClick={() => void cycleRating(student.id, concept.id)}
                        />
                      ))}
                    </div>
                    <RatingLegend />
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Remove ${student.displayName} from the club? Their attendance and ratings are kept.`,
                          )
                        ) {
                          void setStudentActive(student.id, false);
                        }
                      }}
                      className="text-sm font-medium text-ink-3 underline decoration-line underline-offset-4"
                    >
                      Left the club
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {left.length > 0 ? (
        <Card>
          <button
            type="button"
            onClick={() => setShowLeft((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-ink-2">Left the club ({left.length})</span>
            <Icon name={showLeft ? 'left' : 'right'} className="h-4 w-4 text-ink-3" />
          </button>
          {showLeft ? (
            <ul className="mt-3 space-y-1.5">
              {left.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between gap-3 rounded-(--radius-control) bg-paper px-3 py-2"
                >
                  <span className="text-sm text-ink-2 tabular-nums">
                    {student.displayName} · {stats.get(student.id)?.present ?? 0} sessions kept
                  </span>
                  <button
                    type="button"
                    onClick={() => void setStudentActive(student.id, true)}
                    className="text-sm font-semibold text-moss"
                  >
                    Came back
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}
