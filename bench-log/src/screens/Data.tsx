import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TABLE_NAMES } from '../db/schema';
import {
  countRows,
  downloadBackup,
  exportAll,
  importAll,
  parseBackup,
  totalRows,
  wipeAll,
  type Backup,
  type BackupCounts,
  type ImportResult,
} from '../db/backup';
import { getSetting } from '../db/records';
import { SETTING } from '../db/types';
import { daysAgo } from '../lib/dates';
import { formatBytes, storageStatus, type StorageStatus } from '../lib/storage';
import { Icon } from '../ui/Icon';
import { Card, ErrorText, Screen } from '../ui/primitives';

const LABEL: Record<string, string> = {
  students: 'Students',
  sessions: 'Sessions',
  attendance: 'Attendance marks',
  ratings: 'Ratings',
  prep: 'Unit prep',
  evidence: 'Evidence links',
  checklist: 'Checklist ticks',
  settings: 'Settings',
};

const STORAGE_COPY: Record<StorageStatus['mode'], { dot: string; text: string }> = {
  persistent: {
    dot: 'bg-moss',
    text: 'Persistent. The browser has agreed not to clear this on its own.',
  },
  'best-effort': {
    dot: 'bg-amber',
    text: 'Best effort. The browser may clear this if it runs short of space, and Safari clears storage for sites not opened in seven days. Add Bench Log to your home screen, and keep exporting.',
  },
  unsupported: {
    dot: 'bg-ink-3',
    text: "This browser won't say whether it will keep the data. Keep exporting.",
  },
};

/** Unglamorous, and the reason the rest of the app can be trusted. */
export default function Data() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ backup: Backup; counts: BackupCounts }>();
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();
  const [wipeConfirm, setWipeConfirm] = useState('');
  const [storage, setStorage] = useState<StorageStatus>();

  const counts = useLiveQuery(async () => countRows(await exportAll()), [], undefined);
  const lastExport = useLiveQuery(() => getSetting(SETTING.lastExportAt), [], undefined);

  useEffect(() => {
    void storageStatus(navigator.storage).then(setStorage);
  }, []);

  async function onExport() {
    setError(undefined);
    try {
      setResult(`Downloaded ${await downloadBackup()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(undefined);
    setResult(undefined);
    try {
      const backup = parseBackup(await file.text());
      setPending({ backup, counts: countRows(backup) });
    } catch (err) {
      setPending(undefined);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function apply(mode: 'replace' | 'merge') {
    if (!pending) return;
    try {
      const r: ImportResult = await importAll(pending.backup, mode);
      const written = totalRows(r.written);
      const skipped = totalRows(r.skipped);
      setResult(
        mode === 'replace'
          ? `Restored ${written} records. This device now matches the file.`
          : `Merged ${written} records; ${skipped} were newer here and kept.`,
      );
      setPending(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const exportWhen = daysAgo(lastExport ? Number(lastExport) : undefined);

  return (
    <Screen title="Data" subtitle="Export, import, and what the browser has agreed to keep." back={{ to: '/plan', label: 'Plan' }}>
      <Card className="space-y-3">
        <h2 className="text-base font-bold">On this device</h2>
        <dl className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {TABLE_NAMES.map((name) => (
            <div key={name} className="rounded-(--radius-control) bg-paper px-3 py-2">
              <dt className="text-xs text-ink-3">{LABEL[name]}</dt>
              <dd className="text-lg font-bold tabular-nums">{counts ? counts[name] : '–'}</dd>
            </div>
          ))}
        </dl>
        {storage ? (
          <div className="flex items-start gap-2.5 rounded-(--radius-control) bg-paper p-3">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STORAGE_COPY[storage.mode].dot}`} />
            <p className="text-xs leading-relaxed text-ink-2">
              {STORAGE_COPY[storage.mode].text}
              {storage.usage !== undefined ? (
                <span className="block text-ink-3">
                  Using {formatBytes(storage.usage)}
                  {storage.quota ? ` of about ${formatBytes(storage.quota)}` : ''}.
                </span>
              ) : null}
            </p>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-base font-bold">Export</h2>
        <p className="prose-body">
          One JSON file with everything in it. This is the backup, and it is how the data moves to a
          second device. Every few sessions, download it and drop it in Drive.
        </p>
        <button type="button" onClick={() => void onExport()} className="btn btn-primary w-full">
          <Icon name="data" className="h-4 w-4" />
          Download backup
        </button>
        <p className="text-xs text-ink-3">{exportWhen ? `Last export ${exportWhen}.` : 'Never exported from this device.'}</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-base font-bold">Import</h2>
        <p className="prose-body">
          Restore onto a fresh device, or pull in what you recorded on the other one. Merge keeps
          whichever copy of each record is newer.
        </p>
        <input ref={fileInput} type="file" accept="application/json,.json" onChange={(e) => void onPick(e)} className="hidden" />
        <button type="button" onClick={() => fileInput.current?.click()} className="btn btn-quiet w-full">
          Choose a backup file
        </button>

        {pending ? (
          <div className="space-y-2 rounded-(--radius-control) border border-line bg-paper p-3">
            <p className="text-sm font-semibold tabular-nums">
              {totalRows(pending.counts)} records: {pending.counts.students} students,{' '}
              {pending.counts.sessions} sessions, {pending.counts.attendance} attendance marks,{' '}
              {pending.counts.ratings} ratings
              {pending.backup.exportedAt ? `, exported ${daysAgo(pending.backup.exportedAt)}` : ''}.
            </p>
            <button type="button" onClick={() => void apply('merge')} className="btn btn-primary w-full">
              Merge, newer wins
            </button>
            <button type="button" onClick={() => void apply('replace')} className="btn btn-quiet w-full">
              Replace everything on this device
            </button>
            <button type="button" onClick={() => setPending(undefined)} className="w-full py-1 text-sm font-medium text-ink-3">
              Cancel
            </button>
          </div>
        ) : null}

        {result ? (
          <p className="rounded-(--radius-control) bg-moss-tint p-3 text-sm font-medium text-moss-deep">{result}</p>
        ) : null}
        <ErrorText>{error}</ErrorText>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-base font-bold">Start over</h2>
        <p className="prose-body">
          Erases every record on this device. The curriculum is in the code, so it comes back
          untouched. Export first.
        </p>
        <input
          value={wipeConfirm}
          onChange={(e) => setWipeConfirm(e.target.value)}
          placeholder="Type ERASE to enable"
          aria-label="Type ERASE to enable"
          className="control tap w-full px-3 text-base"
        />
        <button
          type="button"
          disabled={wipeConfirm !== 'ERASE'}
          onClick={() => {
            void wipeAll().then(() => {
              setWipeConfirm('');
              setResult('Erased. The roster and every record are gone.');
            });
          }}
          className="btn btn-loud w-full"
        >
          Erase all records
        </button>
      </Card>
    </Screen>
  );
}
