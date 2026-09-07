/**
 * Content is the curriculum. It ships in the repo as TypeScript, is read-only at
 * runtime, and is edited in a text editor and versioned in git. It is never
 * written to IndexedDB and there is no admin UI for it — see CLAUDE.md.
 *
 * Because it is hand-edited, src/test/content.test.ts checks its integrity:
 * every concept a unit names exists, orders are unique, evidence ids are unique.
 */

export type Quarter = 'q1' | 'q2' | 'q3' | 'q4';

export interface Concept {
  id: string;
  order: number;
  /** Column label on the heatmap. Keep it under 13 characters. */
  short: string;
  name: string;
  /** How to say it to a 13-year-old. */
  kidWords: string;
  /** Where they get stuck. */
  misconception: string;
  /** What to do about it. */
  teachingMove: string;
  /** They've got it when… */
  masteryCheck: string;
}

export interface Unit {
  id: string;
  order: number;
  quarter: Quarter;
  title: string;
  /** 1–5. Attendance is per session, never per unit. */
  sessionCount: number;
  kidsDo: string;
  /** What HE needs to know first. Written to himself. */
  teacherPrep: string;
  materials: string;
  conceptIds: string[];
}

export interface EvidenceItem {
  id: string;
  text: string;
}

export interface Checkpoint {
  id: string;
  quarter: Quarter;
  title: string;
  dueWindow: string;
  visibleOutcome: string;
  minimumBar: string;
  evidenceItems: EvidenceItem[];
}

export interface LessonShape {
  id: string;
  name: string;
  oneLine: string;
  steps: string[];
  useWhen: string;
}

export interface AiPolicyStage {
  quarters: string;
  scope: string;
  policy: string;
  howYouSayIt: string;
}

export const QUARTERS: Quarter[] = ['q1', 'q2', 'q3', 'q4'];

export const QUARTER_LABEL: Record<Quarter, string> = {
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
};

export const QUARTER_SPAN: Record<Quarter, string> = {
  q1: 'September – October',
  q2: 'November – December',
  q3: 'January – March',
  q4: 'April – June',
};

export const QUARTER_THEME: Record<Quarter, string> = {
  q1: 'It moves',
  q2: 'It decides',
  q3: 'It controls',
  q4: 'They produce',
};
