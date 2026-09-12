import Dexie, { type Table } from 'dexie';
import type {
  AttendanceRecord,
  ChecklistState,
  EvidenceLink,
  PrepRecord,
  Session,
  Setting,
  SkillRating,
  Student,
} from './types';

/**
 * The one persistence layer. There is no network call anywhere in the app,
 * which is what makes "works with no wifi" true rather than aspirational.
 *
 * Booleans are not valid IndexedDB keys, so `active`, `present`, `prepped` and
 * `taught` are deliberately unindexed. A one-club roster is filtered in memory.
 */
export class BenchLogDb extends Dexie {
  students!: Table<Student, string>;
  sessions!: Table<Session, string>;
  attendance!: Table<AttendanceRecord, [string, string]>;
  ratings!: Table<SkillRating, [string, string]>;
  prep!: Table<PrepRecord, string>;
  evidence!: Table<EvidenceLink, string>;
  checklist!: Table<ChecklistState, [string, string]>;
  settings!: Table<Setting, string>;

  constructor(name = 'benchlog') {
    super(name);
    this.version(1).stores({
      students: 'id, displayName',
      sessions: 'id, unitId, date, [unitId+date]',
      attendance: '[sessionId+studentId], sessionId, studentId',
      ratings: '[studentId+conceptId], studentId, conceptId',
      prep: 'unitId',
      evidence: 'id, checkpointId, evidenceItemId',
      checklist: '[checkpointId+evidenceItemId], checkpointId',
      settings: 'key',
    });
  }
}

export const db = new BenchLogDb();

/** Every table in a stable order. Export, import and wipe walk this list. */
export const TABLE_NAMES = [
  'students',
  'sessions',
  'attendance',
  'ratings',
  'prep',
  'evidence',
  'checklist',
  'settings',
] as const;

export type TableName = (typeof TABLE_NAMES)[number];

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replaceAll('-', '').slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${rand}`;
}
