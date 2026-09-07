import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/schema';
import { wipeAll } from '../db/backup';
import {
  addEvidence,
  addStudent,
  cycleRating,
  deleteSession,
  emptyPrep,
  ensureSession,
  setAllAttendance,
  setPrepNotes,
  setPrepped,
  setStudentActive,
  setTaught,
  toggleAttendance,
  toggleChecklistItem,
} from '../db/records';
import {
  attendanceStats,
  conceptStats,
  masteryPercent,
  sessionsForUnit,
  stuckConcepts,
} from '../db/reads';
import { concepts } from '../content';
import type { SkillRating } from '../db/types';

beforeEach(async () => {
  await wipeAll();
});

const rating = (studentId: string, conceptId: string, level: 0 | 1 | 2): SkillRating => ({
  studentId,
  conceptId,
  level,
  updatedAt: 1,
});

describe('roster', () => {
  it('stores the normalised name and nothing else about the kid', async () => {
    const s = await addStudent('amara t');
    expect(s.displayName).toBe('Amara T.');
    expect(Object.keys(s).sort()).toEqual(['active', 'displayName', 'id', 'joinedAt', 'updatedAt']);
  });

  it('rejects a surname before it reaches the database', async () => {
    await expect(addStudent('Amara Thompson')).rejects.toThrow(/single initial/i);
    expect(await db.students.count()).toBe(0);
  });

  it('refuses a duplicate, but revives a kid who left and came back', async () => {
    const first = await addStudent('Amara T.');
    await expect(addStudent('amara t')).rejects.toThrow(/already on the roster/i);
    await setStudentActive(first.id, false);
    const again = await addStudent('Amara T.');
    expect(again.id).toBe(first.id);
    expect(again.active).toBe(true);
    expect(await db.students.count()).toBe(1);
  });

  it('soft-deletes, so September attendance survives a November departure', async () => {
    const s = await addStudent('Ben K.');
    const session = await ensureSession('u01', '2026-09-09');
    await toggleAttendance(session.id, s.id);
    await setStudentActive(s.id, false);
    expect((await db.students.get(s.id))?.active).toBe(false);
    expect(await db.attendance.where('studentId').equals(s.id).count()).toBe(1);
  });
});

describe('sessions: a unit is not a session', () => {
  it('is idempotent per (unit, date) and numbers sessions within the unit', async () => {
    const a = await ensureSession('u04', '2026-09-16');
    const same = await ensureSession('u04', '2026-09-16');
    const b = await ensureSession('u04', '2026-09-23');
    const other = await ensureSession('u05', '2026-09-30');
    expect(same.id).toBe(a.id);
    expect([a.ordinal, b.ordinal, other.ordinal]).toEqual([1, 2, 1]);
    expect(await db.sessions.count()).toBe(3);
  });

  it('renumbers by date, so a back-dated catch-up session slots in where it belongs', async () => {
    await ensureSession('u04', '2026-09-23');
    await ensureSession('u04', '2026-09-16');
    const ordered = await sessionsForUnit('u04');
    expect(ordered.map((s) => [s.date, s.ordinal])).toEqual([
      ['2026-09-16', 1],
      ['2026-09-23', 2],
    ]);
  });

  it('closes the gap when a mis-tapped session is deleted', async () => {
    const one = await ensureSession('u04', '2026-09-16');
    await ensureSession('u04', '2026-09-23');
    await ensureSession('u04', '2026-09-30');
    const kid = await addStudent('Cleo M.');
    await toggleAttendance(one.id, kid.id);

    await deleteSession(one.id);

    expect(await db.attendance.count()).toBe(0);
    expect((await sessionsForUnit('u04')).map((s) => s.ordinal)).toEqual([1, 2]);
  });

  it('does not double-create when two taps land at once', async () => {
    const results = await Promise.all([
      ensureSession('u02', '2026-10-07'),
      ensureSession('u02', '2026-10-07'),
      ensureSession('u02', '2026-10-07'),
    ]);
    expect(new Set(results.map((r) => r.id)).size).toBe(1);
    expect(await db.sessions.count()).toBe(1);
  });
});

describe('attendance', () => {
  it('toggles unrecorded -> present -> absent -> present', async () => {
    const kid = await addStudent('Dev P.');
    const session = await ensureSession('u01', '2026-09-09');
    expect(await toggleAttendance(session.id, kid.id)).toBe(true);
    expect(await toggleAttendance(session.id, kid.id)).toBe(false);
    expect(await toggleAttendance(session.id, kid.id)).toBe(true);
    expect(await db.attendance.count()).toBe(1);
  });

  it('counts sessions held since a kid joined, not since the year began', async () => {
    const early = { ...(await addStudent('Amara T.')), joinedAt: 0 };
    const s1 = await ensureSession('u01', '2000-01-01');
    const s2 = await ensureSession('u01', '2999-01-01');
    const late = { ...(await addStudent('Ben K.')), joinedAt: Date.now() };
    await setAllAttendance(s1.id, [early.id], true);
    await setAllAttendance(s2.id, [early.id, late.id], true);
    await toggleAttendance(s2.id, late.id);

    const stats = attendanceStats(
      [early, late],
      await db.sessions.toArray(),
      await db.attendance.toArray(),
    );
    expect(stats.get(early.id)).toEqual({ present: 2, held: 2 });
    expect(stats.get(late.id)).toEqual({ present: 0, held: 1 });
  });
});

describe('ratings', () => {
  it('cycles 0 -> 1 -> 2 -> 0, starting an unrated concept at 0', async () => {
    const kid = await addStudent('Ella R.');
    const seen = [];
    for (let i = 0; i < 4; i++) seen.push(await cycleRating(kid.id, 'varchg'));
    expect(seen).toEqual([0, 1, 2, 0]);
    expect(await db.ratings.count()).toBe(1);
  });

  it('scores mastery with "with help" worth half and unrated worth nothing', () => {
    const ratings = [rating('s1', 'seq', 2), rating('s1', 'var', 1), rating('s2', 'seq', 2)];
    expect(masteryPercent('s1', ratings, 10)).toBe(15);
    expect(masteryPercent('s3', ratings, 10)).toBe(0);
  });

  it('finds the concept the class is stuck on, and ignores kids who left', () => {
    const active = new Set(['s1', 's2', 's3']);
    const ratings = [
      rating('s1', 'sensornum', 0),
      rating('s2', 'sensornum', 1),
      rating('s3', 'sensornum', 0),
      rating('gone', 'sensornum', 2),
      rating('s1', 'seq', 2),
      rating('s2', 'seq', 2),
      rating('s1', 'cond', 0), // one kid is not a class problem
    ];
    const stats = conceptStats(concepts, ratings, active);
    const sensor = stats.find((s) => s.concept.id === 'sensornum')!;
    expect(sensor).toMatchObject({ rated: 3, counts: [2, 1, 0] });
    expect(sensor.average).toBeCloseTo(1 / 3);

    const stuck = stuckConcepts(stats);
    expect(stuck.map((s) => s.concept.id)).toEqual(['sensornum']);
  });
});

describe('prep and taught', () => {
  it('has an empty record for a unit never opened, without writing one', async () => {
    expect(await db.prep.get('u09')).toBeUndefined();
    expect(emptyPrep('u09')).toMatchObject({ prepped: false, taught: false, notes: '' });
  });

  it('keeps notes across a prep toggle and stamps the time', async () => {
    await setPrepNotes('u11', 'k=0.4 wobbles on our floor, try 0.25');
    await setPrepped('u11', true);
    let prep = (await db.prep.get('u11'))!;
    expect(prep.notes).toContain('0.25');
    expect(prep.preppedAt).toBeTypeOf('number');
    await setPrepped('u11', false);
    prep = (await db.prep.get('u11'))!;
    expect(prep.notes).toContain('0.25');
    expect(prep.preppedAt).toBeUndefined();
  });

  it('tracks taught separately from prepped', async () => {
    await setTaught('u01', true);
    const prep = (await db.prep.get('u01'))!;
    expect(prep).toMatchObject({ prepped: false, taught: true });
    expect(prep.taughtAt).toBeTypeOf('number');
  });
});

describe('evidence', () => {
  it('toggles a checklist item', async () => {
    expect(await toggleChecklistItem('cp1', 'cp1-e1')).toBe(true);
    expect(await toggleChecklistItem('cp1', 'cp1-e1')).toBe(false);
  });

  it('stores a link and refuses anything that is not one', async () => {
    await addEvidence({
      checkpointId: 'cp1',
      label: 'Square drive videos',
      url: 'https://drive.google.com/drive/folders/abc',
      kind: 'video',
    });
    await expect(
      addEvidence({ checkpointId: 'cp1', label: 'x', url: 'my folder', kind: 'doc' }),
    ).rejects.toThrow(/https/);
    await expect(
      addEvidence({ checkpointId: 'cp1', label: ' ', url: 'https://x.test', kind: 'doc' }),
    ).rejects.toThrow(/label/i);
    expect(await db.evidence.count()).toBe(1);
  });
});
