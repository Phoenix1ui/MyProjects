import { describe, expect, it, vi } from 'vitest';
import { ensurePersisted, formatBytes, storageStatus, type StorageLike } from '../lib/storage';

describe('ensurePersisted', () => {
  it('does not ask again when the grant already exists', async () => {
    const persist = vi.fn(async () => true);
    expect(await ensurePersisted({ persisted: async () => true, persist })).toBe('persistent');
    expect(persist).not.toHaveBeenCalled();
  });

  it('asks once when there is no grant yet', async () => {
    const persist = vi.fn(async () => true);
    expect(await ensurePersisted({ persisted: async () => false, persist })).toBe('persistent');
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('reports best-effort when the browser says no', async () => {
    const s: StorageLike = { persisted: async () => false, persist: async () => false };
    expect(await ensurePersisted(s)).toBe('best-effort');
  });

  it('treats a missing or throwing API as unsupported', async () => {
    expect(await ensurePersisted(undefined)).toBe('unsupported');
    expect(await ensurePersisted({})).toBe('unsupported');
    expect(
      await ensurePersisted({
        persisted: async () => {
          throw new Error('SecurityError');
        },
        persist: async () => true,
      }),
    ).toBe('unsupported');
  });
});

describe('storageStatus', () => {
  it('reports without ever requesting', async () => {
    const persist = vi.fn(async () => true);
    const status = await storageStatus({
      persisted: async () => false,
      persist,
      estimate: async () => ({ usage: 2048, quota: 500 * 1024 * 1024 }),
    });
    expect(persist).not.toHaveBeenCalled();
    expect(status).toEqual({ mode: 'best-effort', usage: 2048, quota: 524288000 });
  });

  it('still reports the mode when the estimate fails', async () => {
    const status = await storageStatus({
      persisted: async () => true,
      estimate: async () => {
        throw new Error('nope');
      },
    });
    expect(status).toEqual({ mode: 'persistent' });
  });
});

it('formats bytes like a size, not a number', () => {
  expect(formatBytes(512)).toBe('512 B');
  expect(formatBytes(2048)).toBe('2 kB');
  expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  expect(formatBytes(undefined)).toBeUndefined();
});
