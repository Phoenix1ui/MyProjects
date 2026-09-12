import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/schema';
import {
  BACKUP_FORMAT,
  backupFilename,
  countRows,
  exportAll,
  importAll,
  parseBackup,
  totalRows,
  wipeAll,
} from '../db/backup';
import {
  addEvidence,
  addStudent,
  cycleRating,
  ensureSession,
  setPrepNotes,
  setPrepped,
  setSessionNotes,
  toggleAttendance,
  toggleChecklistItem,
} from '../db/records';

async function seedAYearInMiniature() {
  const amara = await addStudent('Amara T.');
  const ben = await addStudent('Ben K.');
  const session = await ensureSession('u03', '2026-09-23');
  await toggleAttendance(session.id, amara.id);
  await toggleAttendance(session.id, ben.id);
  await setSessionNotes(session.id, 'Box and index card landed. Say "becomes".');
  await cycleRating(amara.id, 'varchg');
  await cycleRating(amara.id, 'varchg');
  await setPrepped('u03', true);
  await toggleChecklistItem('cp1', 'cp1-e1');
  await addEvidence({
    checkpointId: 'cp1',
    label: 'Square drive videos',
    url: 'https://drive.google.com/drive/folders/abc',
    kind: 'video',
  });
  return { amara, ben, session };
}

beforeEach(async () => {
  await wipeAll();
});

describe('export / import round trip', () => {
  it('restores every table onto an empty device', async () => {
    const { amara, session } = await seedAYearInMiniature();
    const backup = await exportAll();
    const before = countRows(backup);
    expect(totalRows(before)).toBeGreaterThan(6);

    await wipeAll();
    const result = await importAll(backup, 'replace');
    expect(result.written).toEqual(before);

    expect((await db.students.get(amara.id))?.displayName).toBe('Amara T.');
    expect((await db.sessions.get(session.id))?.notes).toContain('becomes');
    expect((await db.attendance.get([session.id, amara.id]))?.present).toBe(true);
    expect((await db.ratings.get([amara.id, 'varchg']))?.level).toBe(1);
    expect((await db.prep.get('u03'))?.prepped).toBe(true);
    expect((await db.checklist.get(['cp1', 'cp1-e1']))?.done).toBe(true);
    expect(await exportAll().then(countRows)).toEqual(before);
  });

  it('survives JSON.stringify, which is how it actually travels', async () => {
    await seedAYearInMiniature();
    const text = JSON.stringify(await exportAll(), null, 2);
    await wipeAll();
    await importAll(parseBackup(text), 'replace');
    expect(await db.students.count()).toBe(2);
  });
});

describe('merge is newer-wins per row', () => {
  it('brings the laptop\'s prep notes over without clobbering the phone\'s newer ones', async () => {
    // Laptop: writes prep notes for two units, exports.
    await setPrepNotes('u03', 'laptop: box prop is in the cupboard');
    await setPrepNotes('u04', 'laptop: protractor from the maths room');
    const laptop = await exportAll();

    // Phone: separately, later, edits u03 and records attendance.
    await wipeAll();
    await new Promise((r) => setTimeout(r, 5));
    await setPrepNotes('u03', 'phone: prop found, also bring a marker');
    const kid = await addStudent('Amara T.');
    const session = await ensureSession('u03', '2026-09-23');
    await toggleAttendance(session.id, kid.id);

    const result = await importAll(laptop, 'merge');

    expect((await db.prep.get('u03'))?.notes).toContain('phone:');
    expect((await db.prep.get('u04'))?.notes).toContain('laptop:');
    expect(await db.attendance.count()).toBe(1);
    expect(result.skipped.prep).toBe(1);
    expect(result.written.prep).toBe(1);
  });

  it('lets an old backup with no timestamps fill gaps but never overwrite', async () => {
    await setPrepNotes('u03', 'current');
    const legacy = parseBackup(
      JSON.stringify({
        format: BACKUP_FORMAT,
        version: 1,
        data: {
          prep: [
            { unitId: 'u03', prepped: true, notes: 'stale', taught: false },
            { unitId: 'u05', prepped: true, notes: 'only in backup', taught: false },
          ],
        },
      }),
    );
    await importAll(legacy, 'merge');
    expect((await db.prep.get('u03'))?.notes).toBe('current');
    expect((await db.prep.get('u05'))?.notes).toBe('only in backup');
  });

  it('replace clears what is here', async () => {
    await seedAYearInMiniature();
    const backup = await exportAll();
    await wipeAll();
    const extra = await addStudent('Cleo M.');
    await importAll(backup, 'replace');
    expect(await db.students.count()).toBe(2);
    expect(await db.students.get(extra.id)).toBeUndefined();
  });
});

describe('parseBackup rejects the wrong file with a sentence he can act on', () => {
  it.each([
    ['not json at all', /isn't JSON/i],
    ['{"hello":"world"}', /not a Bench Log backup/i],
    [JSON.stringify({ format: BACKUP_FORMAT, version: 99, data: {} }), /newer/i],
    [JSON.stringify({ format: BACKUP_FORMAT, version: 2, data: { students: 'nope' } }), /damaged/i],
  ])('%s', (text, message) => {
    expect(() => parseBackup(text)).toThrow(message);
  });

  it('fills in tables a backup does not carry', () => {
    const text = JSON.stringify({ format: BACKUP_FORMAT, version: 2, data: { students: [] } });
    expect(countRows(parseBackup(text)).evidence).toBe(0);
  });
});

it('names the file so a folder of them sorts by date', () => {
  expect(backupFilename(new Date(2026, 8, 9))).toBe('bench-log-2026-09-09.json');
});
