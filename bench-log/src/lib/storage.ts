/**
 * Asks the browser not to evict the club's records.
 *
 * Safari clears script-writable storage (IndexedDB included) for sites not
 * opened in seven days, and a club that meets weekly sits on that boundary.
 * Home-screen web apps are exempt, and Chrome auto-grants persistence to
 * installed PWAs, so this succeeds exactly when the app is used as intended.
 * It is never a guarantee. The JSON export on /data is still the backup.
 */

export type StorageMode = 'persistent' | 'best-effort' | 'unsupported';

/** The slice of StorageManager we use, so the logic is testable without a browser. */
export interface StorageLike {
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
  estimate?: () => Promise<{ usage?: number; quota?: number }>;
}

/** Never re-requests an existing grant: asking twice can raise a second prompt. */
export async function ensurePersisted(storage: StorageLike | undefined): Promise<StorageMode> {
  if (!storage?.persist || !storage.persisted) return 'unsupported';
  try {
    if (await storage.persisted()) return 'persistent';
    return (await storage.persist()) ? 'persistent' : 'best-effort';
  } catch {
    return 'unsupported';
  }
}

export interface StorageStatus {
  mode: StorageMode;
  usage?: number;
  quota?: number;
}

/** Read-only: the current state, without asking for anything. */
export async function storageStatus(storage: StorageLike | undefined): Promise<StorageStatus> {
  if (!storage?.persisted) return { mode: 'unsupported' };
  let mode: StorageMode;
  try {
    mode = (await storage.persisted()) ? 'persistent' : 'best-effort';
  } catch {
    return { mode: 'unsupported' };
  }
  try {
    const estimate = await storage.estimate?.();
    return { mode, usage: estimate?.usage, quota: estimate?.quota };
  } catch {
    return { mode };
  }
}

export function formatBytes(bytes: number | undefined): string | undefined {
  if (bytes === undefined) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
