/**
 * When the club meets. Content, not a record: it changes once a year, in a text
 * editor. The Today screen defaults its date to the most recent club day, and
 * Plan shows the next one.
 *
 * Two 45-minute sessions a week is about the same contact time as one long
 * weekly session, so the year still fits; the units are paced for it.
 */
export interface ClubSchedule {
  /** JavaScript weekday numbers: 0 Sunday ... 6 Saturday. */
  days: number[];
  /** Shown next to the date, e.g. '3:15 - 4:00 pm'. Never used for logic. */
  time: string;
  /** One line for headers: 'Tue & Wed, 3:15 - 4:00 pm'. */
  label: string;
  /** Minutes per session; used for pacing notes only. */
  minutes: number;
}

export const schedule: ClubSchedule = {
  days: [2, 3],
  time: '3:15 - 4:00 pm',
  label: 'Tue & Wed, 3:15 - 4:00 pm',
  minutes: 45,
};
