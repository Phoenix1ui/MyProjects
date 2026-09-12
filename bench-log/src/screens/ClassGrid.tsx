import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { conceptsInOrder } from '../content';
import { db } from '../db/schema';
import { cycleRating } from '../db/records';
import { conceptStats, listActiveStudents, ratingKey, ratingLookup, stuckConcepts } from '../db/reads';
import { averageTone, levelOf } from '../lib/levels';
import { RatingChip, RatingLegend } from '../ui/RatingChip';
import { Card, Empty, Eyebrow, Screen } from '../ui/primitives';

/**
 * The heatmap: the view that says "the class is stuck on concept 9" rather
 * than "one kid is struggling", which is a different and more actionable fact.
 */
export default function ClassGrid() {
  const students = useLiveQuery(() => listActiveStudents(), [], []);
  const ratings = useLiveQuery(() => db.ratings.toArray(), [], []);

  const lookup = ratingLookup(ratings);
  const activeIds = new Set(students.map((s) => s.id));
  const stats = conceptStats(conceptsInOrder, ratings, activeIds);
  const stuck = stuckConcepts(stats);
  const unrated = stats.filter((s) => s.rated === 0).length;
  const rated = ratings.filter((r) => activeIds.has(r.studentId)).length;

  if (students.length === 0) {
    return (
      <Screen title="Class">
        <Empty>
          Add the roster first. Ratings are taken on the Today screen during a session, and they
          land here.
        </Empty>
      </Screen>
    );
  }

  return (
    <Screen
      title="Class"
      subtitle={`${students.length} students · ${conceptsInOrder.length} concepts · ${rated} of ${students.length * conceptsInOrder.length} cells rated`}
    >
      {stuck.length > 0 ? (
        <section className="rounded-(--radius-card) border border-amber-line bg-amber-tint p-4">
          <Eyebrow className="text-amber">The class is stuck on</Eyebrow>
          <Link
            to={`/teach#${stuck[0].concept.id}`}
            className="mt-1 block text-lg leading-snug font-bold text-amber-deep underline decoration-amber-line underline-offset-4"
          >
            {stuck[0].concept.order}. {stuck[0].concept.name}
          </Link>
          <p className="mt-1 text-sm text-amber-deep tabular-nums">
            {stuck[0].counts[0]} not yet, {stuck[0].counts[1]} with help, {stuck[0].counts[2]} on
            their own.
          </p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink">{stuck[0].concept.teachingMove}</p>
          {stuck.length > 1 ? (
            <p className="mt-2 text-sm text-amber-deep">
              Also thin: {stuck.slice(1, 4).map((s) => `${s.concept.order}. ${s.concept.short}`).join(' · ')}
            </p>
          ) : null}
        </section>
      ) : (
        <Card>
          <p className="text-sm text-ink-2">
            {rated === 0
              ? 'No ratings yet. They are quickest to take on the Today screen, right after attendance, for the concepts you just taught.'
              : `Nothing looks stuck. ${unrated} concept${unrated === 1 ? ' has' : 's have'} no ratings at all, which is the more likely gap.`}
          </p>
        </Card>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 h-36 w-32 border-b border-line bg-surface p-2 text-left align-bottom">
                  <span className="eyebrow">Student</span>
                </th>
                {stats.map(({ concept }) => (
                  <th key={concept.id} className="h-36 border-b border-line bg-surface px-0.5 align-bottom">
                    <span
                      className="mx-auto flex h-32 items-center justify-start text-[11px] font-semibold whitespace-nowrap text-ink-2 [writing-mode:vertical-rl]"
                      style={{ transform: 'rotate(180deg)' }}
                      title={concept.name}
                    >
                      {concept.order}. {concept.short}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <th className="sticky left-0 z-10 w-32 max-w-32 border-b border-line-2 bg-surface p-2 text-left text-sm font-semibold">
                    <span className="block truncate">{student.displayName}</span>
                  </th>
                  {stats.map(({ concept }) => (
                    <td key={concept.id} className="border-b border-line-2 p-0.5">
                      <RatingChip
                        cell
                        level={levelOf(lookup.get(ratingKey(student.id, concept.id)))}
                        title={`${student.displayName} · ${concept.short}`}
                        onClick={() => void cycleRating(student.id, concept.id)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th className="sticky left-0 z-10 bg-surface p-2 text-left">
                  <span className="eyebrow">Class</span>
                </th>
                {stats.map(({ concept, average, rated: n }) => (
                  <td key={concept.id} className="p-0.5 text-center">
                    <span
                      className={`block rounded-(--radius-control) py-1 text-xs font-bold tabular-nums ${averageTone(average, n)}`}
                      title={`${n} of ${students.length} rated`}
                    >
                      {n === 0 ? '–' : average.toFixed(1)}
                      <span className="block text-[10px] font-medium opacity-70">
                        {n}/{students.length}
                      </span>
                    </span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Card className="space-y-2">
        <RatingLegend />
        <p className="text-xs text-ink-3">
          Scroll sideways for the rest of the ladder. The bottom row is the class average out of 2,
          over the kids who have been rated.
        </p>
      </Card>
    </Screen>
  );
}
