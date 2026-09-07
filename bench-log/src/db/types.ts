/**
 * Records are what actually happened. They live in IndexedDB and are the only
 * thing the app writes. Every record carries `updatedAt` so that a backup can be
 * merged newer-wins, and so a future sync layer has something to work with. That
 * is the one piece of groundwork worth laying now, because it costs nothing.
 */

/** Not yet / with help / on their own. */
export type Level = 0 | 1 | 2;

export const LEVEL_LABEL: Record<Level, string> = {
  0: 'Not yet',
  1: 'With help',
  2: 'On their own',
};

export interface Student {
  id: string;
  /** 'Amara T.' - enforced at input by lib/names. Nothing else is ever stored. */
  displayName: string;
  joinedAt: number;
  /** Soft delete. A kid who leaves in November still attended in September. */
  active: boolean;
  updatedAt: number;
}

export interface Session {
  id: string;
  unitId: string;
  /** Local ISO date, 'YYYY-MM-DD'. */
  date: string;
  /** Position within the unit by date, 1-based. Renumbered on every add and delete. */
  ordinal: number;
  notes: string;
  updatedAt: number;
}

export interface AttendanceRecord {
  sessionId: string;
  studentId: string;
  present: boolean;
  updatedAt: number;
}

export interface SkillRating {
  studentId: string;
  conceptId: string;
  level: Level;
  updatedAt: number;
}

export interface PrepRecord {
  unitId: string;
  prepped: boolean;
  preppedAt?: number;
  /** Notes-to-self while learning it. */
  notes: string;
  /** "Mark taught" is per unit, so it lives on the per-unit record. */
  taught: boolean;
  taughtAt?: number;
  updatedAt: number;
}

export type EvidenceKind = 'video' | 'photo' | 'code' | 'doc' | 'csv' | 'other';
export const EVIDENCE_KINDS: EvidenceKind[] = ['video', 'photo', 'code', 'doc', 'csv', 'other'];

export interface EvidenceLink {
  id: string;
  checkpointId: string;
  /** Which checklist item this satisfies, if any. */
  evidenceItemId?: string;
  kind: EvidenceKind;
  label: string;
  /** Points at Drive. The app stores links, never files. */
  url: string;
  addedAt: number;
  updatedAt: number;
}

export interface ChecklistState {
  checkpointId: string;
  evidenceItemId: string;
  done: boolean;
  updatedAt: number;
}

/** Small key/value bag: the Today cursor, the last export time. */
export interface Setting {
  key: string;
  value: string;
  updatedAt: number;
}

export const SETTING = {
  cursorUnit: 'today.unitId',
  lastExportAt: 'data.lastExportAt',
} as const;
