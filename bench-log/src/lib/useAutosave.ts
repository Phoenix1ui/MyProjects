import { useEffect, useRef, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved';

/**
 * A text field that writes itself to IndexedDB shortly after typing stops.
 * There is no save button on a phone in a classroom, and no network, so the
 * write cannot fail for the reasons a save button exists to guard against.
 *
 * One instance edits one record. Mount it with `key={recordId}` so switching
 * records remounts it: the unmount flushes any pending write and the new
 * instance starts from the new record's text. Key by what identifies the record
 * logically (unit + date for session notes), not by an id that appears only
 * once the first write has created the row.
 */
export function useAutosave(remote: string, save: (value: string) => Promise<void>, delay = 600) {
  const [value, setValue] = useState(remote);
  const [state, setState] = useState<SaveState>('idle');
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<string | undefined>(undefined);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  // A late-arriving record (Dexie resolves after first paint) or an import.
  // Never while the user is mid-edit.
  useEffect(() => {
    if (!dirty.current) setValue(remote);
  }, [remote]);

  // Unmount: write whatever is still pending.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      const text = pending.current;
      pending.current = undefined;
      if (text !== undefined) void saveRef.current(text);
    },
    [],
  );

  const onChange = (next: string) => {
    dirty.current = true;
    pending.current = next;
    setValue(next);
    setState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      const text = pending.current;
      pending.current = undefined;
      if (text === undefined) return;
      void saveRef.current(text).then(() => {
        if (pending.current === undefined) dirty.current = false;
        setState('saved');
      });
    }, delay);
  };

  return { value, onChange, state };
}
