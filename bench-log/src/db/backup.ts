import Dexie from 'dexie';
import { db, TABLE_NAMES, type TableName } from './schema';
import { setSetting } from './records';
import { SETTING } from './types';

/**
 * The escape hatch. This is the backup, this is how data moves to a second
 * device, and it is what makes adding real sync later a non-event. Plain JSON
 * with everything in it, readable by anyone with a text editor.
 */

export const BACKUP_FORMAT = 'bench-log-backup';
export const BACKUP_VERSION = 2;

export type BackupRow = Record<string, unknown>;
export type BackupData = Record<TableName, BackupRow[]>;

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: number;
  data: BackupData;
}

export type BackupCounts = Record<TableName, number>;

export async function exportAll(): Promise<Backup> {
  const data = {} as BackupData;
  for (const name of TABLE_NAMES) data[name] = await db.table(name).toArray();
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: Date.now(), data };
}

export function countRows(backup: Backup): BackupCounts {
  const counts = {} as BackupCounts;
  for (const name of TABLE_NAMES) counts[name] = backup.data[name]?.length ?? 0;
  return counts;
}

export function totalRows(counts: BackupCounts): number {
  return Object.values(counts).reduce((n, c) => n + c, 0);
}

/** Parses and validates a file's text, throwing a sentence he can act on. */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That file isn't JSON. Pick the .json file you exported.");
  }
  if (!raw || typeof raw !== 'object') throw new Error('That file is empty.');

  const c = raw as Partial<Backup>;
  if (c.format !== BACKUP_FORMAT) throw new Error('That file is not a Bench Log backup.');
  if (typeof c.version !== 'number' || c.version > BACKUP_VERSION) {
    throw new Error(
      `That backup is from a newer Bench Log (v${String(c.version)}). Update the app first.`,
    );
  }
  if (!c.data || typeof c.data !== 'object') throw new Error('That backup has no data in it.');

  const data = {} as BackupData;
  for (const name of TABLE_NAMES) {
    const rows = (c.data as Partial<BackupData>)[name];
    if (rows === undefined) {
      data[name] = [];
    } else if (!Array.isArray(rows)) {
      throw new Error(`That backup's "${name}" section is damaged.`);
    } else {
      data[name] = rows;
    }
  }
  return {
    format: BACKUP_FORMAT,
    version: c.version,
    exportedAt: typeof c.exportedAt === 'number' ? c.exportedAt : 0,
    data,
  };
}

export type ImportMode = 'replace' | 'merge';

export interface ImportResult {
  written: BackupCounts;
  skipped: BackupCounts;
}

/**
 * Replace wipes first. Merge is newer-wins per row by `updatedAt`, which is what
 * makes it safe to bring a laptop's prep notes onto the phone without clobbering
 * the attendance the phone recorded since. A row with no timestamp on either
 * side counts as older, so the incoming copy wins.
 */
export async function importAll(backup: Backup, mode: ImportMode): Promise<ImportResult> {
  const written = {} as BackupCounts;
  const skipped = {} as BackupCounts;
  const tables = TABLE_NAMES.map((name) => db.table(name));

  await db.transaction('rw', tables, async () => {
    for (const name of TABLE_NAMES) {
      const table = db.table(name);
      const rows = backup.data[name];
      written[name] = 0;
      skipped[name] = 0;

      if (mode === 'replace') {
        await table.clear();
        if (rows.length) await table.bulkPut(rows);
        written[name] = rows.length;
        continue;
      }

      const keyPath = table.schema.primKey.keyPath as string | string[];
      const keep: BackupRow[] = [];
      for (const row of rows) {
        const key = Dexie.getByKeyPath(row, keyPath) as string | string[];
        const existing = (await table.get(key)) as { updatedAt?: number } | undefined;
        const incoming = (row as { updatedAt?: number }).updatedAt ?? 0;
        if (existing && (existing.updatedAt ?? 0) > incoming) {
          skipped[name] += 1;
        } else {
          keep.push(row);
        }
      }
      if (keep.length) await table.bulkPut(keep);
      written[name] = keep.length;
    }
  });

  return { written, skipped };
}

export async function wipeAll(): Promise<void> {
  const tables = TABLE_NAMES.map((name) => db.table(name));
  await db.transaction('rw', tables, async () => {
    for (const name of TABLE_NAMES) await db.table(name).clear();
  });
}

const pad = (n: number) => String(n).padStart(2, '0');

export function backupFilename(when: Date = new Date()): string {
  return `bench-log-${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}.json`;
}

/** Browser only: turns the export into a download and records when it happened. */
export async function downloadBackup(): Promise<string> {
  const backup = await exportAll();
  const name = backupFilename();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  await setSetting(SETTING.lastExportAt, String(Date.now()));
  return name;
}
