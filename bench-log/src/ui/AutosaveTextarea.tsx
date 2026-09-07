import { useAutosave } from '../lib/useAutosave';

/**
 * A textarea that saves itself. Mount with `key={recordKey}`; see useAutosave.
 */
export function AutosaveTextarea({
  id,
  label,
  value,
  onSave,
  rows = 3,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  rows?: number;
  placeholder?: string;
}) {
  const field = useAutosave(value, onSave);
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-1 block">
        {label}
      </label>
      <textarea
        id={id}
        value={field.value}
        onChange={(e) => field.onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="control w-full p-3 text-[0.95rem] leading-relaxed"
      />
      <p className="mt-1 h-4 text-right text-xs text-ink-3" aria-live="polite">
        {field.state === 'saving' ? 'Saving' : field.state === 'saved' ? 'Saved' : ''}
      </p>
    </div>
  );
}
