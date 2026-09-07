import { db } from './schema';
import { nameSortKey } from '../lib/names';
import { isoDate } from '../lib/dates';
import type { AttendanceRecord, Level, Session, SkillRating, Student } from './types';
import type { Concept } from '../content';

/**
 * Reads, and the pure derivations the screens share. Anything that turns raw
 * rows into a number a teacher acts on lives here, where it can be tested.
 */

// --- Queries ----------------------------------------------------------------

export async function listStudents(): Promise<Student[]> {
  const rows = await db.students.toArray();
  return rows.sort((a, b) => nameSortKey(a.displayName).localeCompare(nameSortKey(b.displayName)));
}

export async function listActiveStudents(): Promise<Student[]> {
  return (await listStudents()).filter((s) => s.active);
}

export async function sessionsForUnit(unitId: string): Promise<Session[]> {
  const rows = await db.sessions.where('unitId').equals(unitId).toArray();
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

export async function attendanceForSession(sessionId: string): Promise<AttendanceRecord[]> {
  return db.attendance.where('sessionId').equals(sessionId).toArray();
}

export async function evidenceForCheckpoint(checkpointId: string) {
  const rows = await db.evidence.where('checkpointId').equals(checkpointId).toArray();
  return rows.sort((a, b) => b.addedAt - a.addedAt);
}

// --- Attendance -------------------------------------------------------------

export interface AttendanceStat {
  present: number;
  /** Sessions held on or after the day they joined: the honest denominator. */
  held: number;
}

export function attendanceStats(
  students: Student[],
  sessions: Session[],
  attendance: AttendanceRecord[],
): Map<string, AttendanceStat> {
  const stats = new Map<string, AttendanceStat>();
  for (const student of students) {
    const joined = isoDate(new Date(student.joinedAt));
    const held = sessions.filter((s) => s.date >= joined).length;
    stats.set(student.id, { present: 0, held });
  }
  for (const row of attendance) {
    const stat = stats.get(row.studentId);
    if (stat && row.present) stat.present += 1;
  }
  return stats;
}

// --- Ratings ----------------------------------------------------------------

export function ratingKey(studentId: string, conceptId: string): string {
  return `${studentId} ${conceptId}`;
}

export type RatingLookup = ReadonlyMap<string, Level>;

export function ratingLookup(ratings: SkillRating[]): RatingLookup {
  return new Map(ratings.map((r) => [ratingKey(r.studentId, r.conceptId), r.level]));
}

/**
 * Share of the ladder a student can do on their own, "with help" counting
 * half. Unrated counts as not-yet: the number exists to show missing evidence,
 * not to flatter the roster.
 */
export function masteryPercent(
  studentId: string,
  ratings: SkillRating[],
  conceptCount: number,
): number {
  if (conceptCount === 0) return 0;
  let score = 0;
  for (const r of ratings) {
    if (r.studentId === studentId) score += r.level / 2;
  }
  return Math.round((score / conceptCount) * 100);
}

export interface ConceptStat {
  concept: Concept;
  /** Mean level across rated active students; 0 when nobody is rated. */
  average: number;
  rated: number;
  counts: [number, number, number];
}

export function conceptStats(
  concepts: Concept[],
  ratings: SkillRating[],
  activeIds: ReadonlySet<string>,
): ConceptStat[] {
  return concepts.map((concept) => {
    const counts: [number, number, number] = [0, 0, 0];
    for (const r of ratings) {
      if (r.conceptId === concept.id && activeIds.has(r.studentId)) counts[r.level] += 1;
    }
    const rated = counts[0] + counts[1] + counts[2];
    const average = rated ? (counts[1] + counts[2] * 2) / rated : 0;
    return { concept, average, rated, counts };
  });
}

/**
 * "Stuck" needs enough evidence to mean anything: at least `minRated` kids
 * rated and an average below "with help". Sorted worst first.
 */
export function stuckConcepts(stats: ConceptStat[], minRated = 2, below = 1.2): ConceptStat[] {
  return stats
    .filter((s) => s.rated >= minRated && s.average < below)
    .sort((a, b) => a.average - b.average || b.rated - a.rated);
}
