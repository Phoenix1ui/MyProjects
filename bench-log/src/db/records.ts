import { db, newId } from './schema';
import { normaliseStudentName } from '../lib/names';
import { today } from '../lib/dates';
import {
  SETTING,
  type EvidenceKind,
  type Level,
  type PrepRecord,
  type Session,
  type Student,
} from './types';

/**
 * Every write in the app goes through this file. Screens never touch
 * db.table.put. That keeps the invariants (session ordinals, soft deletes, the
 * 0-1-2-0 rating cycle, updatedAt on every row) in one tested place.
 */

const now = () => Date.now();

// --- Students ---------------------------------------------------------------

export async function addStudent(rawName: string): Promise<Student> {
  const result = normaliseStudentName(rawName);
  if (!result.ok) throw new Error(result.reason);
  const wanted = result.value.toLocaleLowerCase();

  return db.transaction('rw', db.students, async () => {
    const existing = (await db.students.toArray()).find(
      (s) => s.displayName.toLocaleLowerCase() === wanted,
    );
    if (existing?.active) throw new Error(`${result.value} is already on the roster.`);
    if (existing) {
      const revived = { ...existing, active: true, updatedAt: now() };
      await db.students.put(revived);
      return revived;
    }
    const student: Student = {
      id: newId('stu'),
      displayName: result.value,
      joinedAt: now(),
      active: true,
      updatedAt: now(),
    };
    await db.students.add(student);
    return student;
  });
}

/** Soft delete only. Attendance history is part of the year's evidence. */
export async function setStudentActive(id: string, active: boolean): Promise<void> {
  await db.students.update(id, { active, updatedAt: now() });
}

export async function renameStudent(id: string, rawName: string): Promise<string> {
  const result = normaliseStudentName(rawName);
  if (!result.ok) throw new Error(result.reason);
  await db.students.update(id, { displayName: result.value, updatedAt: now() });
  return result.value;
}

// --- Sessions ---------------------------------------------------------------

/**
 * Ordinals are derived from dates, never trusted. Renumbering after every add
 * and delete means "Session 2 of 3" stays true even after a mis-tap is deleted.
 * Call inside a transaction that holds `sessions`.
 */
export async function renumberSessions(unitId: string): Promise<void> {
  const rows = await db.sessions.where('unitId').equals(unitId).toArray();
  rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const changed = rows
    .map((row, i) => ({ row, ordinal: i + 1 }))
    .filter(({ row, ordinal }) => row.ordinal !== ordinal)
    .map(({ row, ordinal }) => ({ ...row, ordinal, updatedAt: now() }));
  if (changed.length) await db.sessions.bulkPut(changed);
}

/** The session for this unit on this date, created if this is the first thing that happened. */
export async function ensureSession(unitId: string, date: string = today()): Promise<Session> {
  return db.transaction('rw', db.sessions, async () => {
    const existing = await db.sessions.where({ unitId, date }).first();
    if (existing) return existing;
    const session: Session = {
      id: newId('ses'),
      unitId,
      date,
      ordinal: 0,
      notes: '',
      updatedAt: now(),
    };
    await db.sessions.add(session);
    await renumberSessions(unitId);
    return (await db.sessions.get(session.id)) ?? session;
  });
}

export async function findSession(unitId: string, date: string): Promise<Session | undefined> {
  return db.sessions.where({ unitId, date }).first();
}

export async function setSessionNotes(sessionId: string, notes: string): Promise<void> {
  await db.sessions.update(sessionId, { notes, updatedAt: now() });
}

/** Removes a session and its attendance, then closes the gap in the ordinals. */
export async function deleteSession(sessionId: string): Promise<void> {
  await db.transaction('rw', db.sessions, db.attendance, async () => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;
    await db.attendance.where('sessionId').equals(sessionId).delete();
    await db.sessions.delete(sessionId);
    await renumberSessions(session.unitId);
  });
}

// --- Attendance -------------------------------------------------------------

export async function setAttendance(sessionId: string, studentId: string, present: boolean) {
  await db.attendance.put({ sessionId, studentId, present, updatedAt: now() });
}

/** The one-thumb path: unrecorded or absent -> present, present -> absent. */
export async function toggleAttendance(sessionId: string, studentId: string): Promise<boolean> {
  return db.transaction('rw', db.attendance, async () => {
    const current = await db.attendance.get([sessionId, studentId]);
    const present = !current?.present;
    await db.attendance.put({ sessionId, studentId, present, updatedAt: now() });
    return present;
  });
}

export async function setAllAttendance(sessionId: string, studentIds: string[], present: boolean) {
  const stamp = now();
  await db.attendance.bulkPut(
    studentIds.map((studentId) => ({ sessionId, studentId, present, updatedAt: stamp })),
  );
}

// --- Skill ratings ----------------------------------------------------------

export async function setRating(studentId: string, conceptId: string, level: Level) {
  await db.ratings.put({ studentId, conceptId, level, updatedAt: now() });
}

/** Tapping cycles 0 -> 1 -> 2 -> 0. An unrated concept starts the cycle at 0. */
export async function cycleRating(studentId: string, conceptId: string): Promise<Level> {
  return db.transaction('rw', db.ratings, async () => {
    const current = await db.ratings.get([studentId, conceptId]);
    const level: Level = current === undefined ? 0 : (((current.level + 1) % 3) as Level);
    await db.ratings.put({ studentId, conceptId, level, updatedAt: now() });
    return level;
  });
}

export async function clearRating(studentId: string, conceptId: string) {
  await db.ratings.delete([studentId, conceptId]);
}

// --- Prep / taught ----------------------------------------------------------

export function emptyPrep(unitId: string): PrepRecord {
  return { unitId, prepped: false, notes: '', taught: false, updatedAt: 0 };
}

async function upsertPrep(unitId: string, patch: Partial<PrepRecord>) {
  await db.transaction('rw', db.prep, async () => {
    const current = (await db.prep.get(unitId)) ?? emptyPrep(unitId);
    await db.prep.put({ ...current, ...patch, unitId, updatedAt: now() });
  });
}

export async function setPrepped(unitId: string, prepped: boolean) {
  await upsertPrep(unitId, { prepped, preppedAt: prepped ? now() : undefined });
}

export async function setPrepNotes(unitId: string, notes: string) {
  await upsertPrep(unitId, { notes });
}

export async function setTaught(unitId: string, taught: boolean) {
  await upsertPrep(unitId, { taught, taughtAt: taught ? now() : undefined });
}

// --- Checkpoints ------------------------------------------------------------

export async function addEvidence(input: {
  checkpointId: string;
  label: string;
  url: string;
  kind: EvidenceKind;
  evidenceItemId?: string;
}): Promise<string> {
  const label = input.label.trim();
  const url = input.url.trim();
  if (!label) throw new Error('Give it a label.');
  if (!url) throw new Error('Paste the Drive link.');
  if (!/^https?:\/\/\S+$/i.test(url)) throw new Error('The link must start with https://');

  const id = newId('ev');
  const stamp = now();
  await db.evidence.add({
    id,
    checkpointId: input.checkpointId,
    evidenceItemId: input.evidenceItemId || undefined,
    kind: input.kind,
    label,
    url,
    addedAt: stamp,
    updatedAt: stamp,
  });
  return id;
}

export async function deleteEvidence(id: string) {
  await db.evidence.delete(id);
}

export async function setChecklistItem(checkpointId: string, evidenceItemId: string, done: boolean) {
  await db.checklist.put({ checkpointId, evidenceItemId, done, updatedAt: now() });
}

export async function toggleChecklistItem(checkpointId: string, evidenceItemId: string) {
  return db.transaction('rw', db.checklist, async () => {
    const current = await db.checklist.get([checkpointId, evidenceItemId]);
    const done = !current?.done;
    await db.checklist.put({ checkpointId, evidenceItemId, done, updatedAt: now() });
    return done;
  });
}

// --- Settings ---------------------------------------------------------------

export async function getSetting(key: string): Promise<string | undefined> {
  return (await db.settings.get(key))?.value;
}

export async function setSetting(key: string, value: string) {
  await db.settings.put({ key, value, updatedAt: now() });
}

export async function setCursorUnit(unitId: string) {
  await setSetting(SETTING.cursorUnit, unitId);
}
