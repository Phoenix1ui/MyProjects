import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { QUARTER_LABEL, checkpoints, type Checkpoint } from '../content';
import { db } from '../db/schema';
import { addEvidence, deleteEvidence, toggleChecklistItem } from '../db/records';
import { evidenceForCheckpoint } from '../db/reads';
import { EVIDENCE_KINDS, type EvidenceKind } from '../db/types';
import { longDate } from '../lib/dates';
import { Icon } from '../ui/Icon';
import { ErrorText, Eyebrow, Pill, Progress, Screen } from '../ui/primitives';

export default function Drops() {
  const checklist = useLiveQuery(() => db.checklist.toArray(), [], []);
  const done = new Set(checklist.filter((c) => c.done).map((c) => `${c.checkpointId}/${c.evidenceItemId}`));

  return (
    <Screen
      title="Portfolio drops"
      subtitle="Evidence lives in Drive. This is the list of what is still missing."
      back={{ to: '/plan', label: 'Plan' }}
    >
      {checkpoints.map((cp) => (
        <DropCard key={cp.id} checkpoint={cp} done={done} />
      ))}
    </Screen>
  );
}

function DropCard({ checkpoint, done }: { checkpoint: Checkpoint; done: Set<string> }) {
  const [open, setOpen] = useState(false);
  const evidence = useLiveQuery(() => evidenceForCheckpoint(checkpoint.id), [checkpoint.id], []);
  const ticked = checkpoint.evidenceItems.filter((e) => done.has(`${checkpoint.id}/${e.id}`)).length;
  const total = checkpoint.evidenceItems.length;
  const linksByItem = new Map<string, number>();
  for (const link of evidence) {
    if (link.evidenceItemId) linksByItem.set(link.evidenceItemId, (linksByItem.get(link.evidenceItemId) ?? 0) + 1);
  }

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full p-4 text-left active:bg-line-2"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold">{checkpoint.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Pill tone={ticked === total ? 'moss' : 'amber'}>{checkpoint.dueWindow}</Pill>
              <span className="text-xs text-ink-3">{QUARTER_LABEL[checkpoint.quarter]}</span>
            </div>
          </div>
          <Icon name={open ? 'left' : 'right'} className="mt-1 h-5 w-5 shrink-0 text-ink-3" />
        </div>
        <div className="mt-3">
          <Progress done={ticked} total={total} />
        </div>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-line-2 p-4">
          <div className="rounded-(--radius-control) bg-paper p-3">
            <Eyebrow>What it looks like</Eyebrow>
            <p className="prose-body mt-1">{checkpoint.visibleOutcome}</p>
            <Eyebrow className="mt-3">Minimum bar</Eyebrow>
            <p className="prose-body mt-1">{checkpoint.minimumBar}</p>
          </div>

          <div>
            <Eyebrow className="mb-2">Checklist</Eyebrow>
            <ul className="space-y-1.5">
              {checkpoint.evidenceItems.map((item) => {
                const isDone = done.has(`${checkpoint.id}/${item.id}`);
                const links = linksByItem.get(item.id) ?? 0;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void toggleChecklistItem(checkpoint.id, item.id)}
                      aria-pressed={isDone}
                      className={[
                        'flex w-full items-start gap-3 rounded-(--radius-control) border p-3 text-left transition-colors',
                        isDone ? 'border-moss bg-moss-tint' : 'border-line bg-surface active:bg-line-2',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                          isDone ? 'border-moss bg-moss text-white' : 'border-line bg-surface',
                        ].join(' ')}
                      >
                        {isDone ? <Icon name="check" className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[0.95rem] leading-snug ${isDone ? 'text-moss-deep' : 'text-ink'}`}>
                          {item.text}
                        </span>
                        {links > 0 ? (
                          <span className="mt-0.5 block text-xs text-ink-3">
                            {links} link{links > 1 ? 's' : ''} attached
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Evidence checkpoint={checkpoint} />
        </div>
      ) : null}
    </section>
  );
}

function Evidence({ checkpoint }: { checkpoint: Checkpoint }) {
  const evidence = useLiveQuery(() => evidenceForCheckpoint(checkpoint.id), [checkpoint.id], []);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [kind, setKind] = useState<EvidenceKind>('video');
  const [itemId, setItemId] = useState('');
  const [error, setError] = useState<string>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addEvidence({ checkpointId: checkpoint.id, label, url, kind, evidenceItemId: itemId || undefined });
      setLabel('');
      setUrl('');
      setItemId('');
      setError(undefined);
      setAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Eyebrow>Evidence ({evidence.length})</Eyebrow>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-moss"
        >
          <Icon name="plus" className="h-4 w-4" />
          {adding ? 'Cancel' : 'Add a link'}
        </button>
      </div>

      {adding ? (
        <form onSubmit={(e) => void submit(e)} className="mb-3 space-y-2 rounded-(--radius-control) bg-paper p-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label, e.g. Square drive videos"
            aria-label="Label"
            className="control tap w-full px-3 text-base"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="https://drive.google.com/..."
            aria-label="Link"
            className="control tap w-full px-3 text-base"
          />
          <div className="flex gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as EvidenceKind)}
              aria-label="Kind"
              className="control tap flex-1 px-3 text-sm"
            >
              {EVIDENCE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              aria-label="Checklist item"
              className="control tap flex-[2] px-3 text-sm"
            >
              <option value="">Not tied to a checklist item</option>
              {checkpoint.evidenceItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.text}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Save link
          </button>
          <p className="text-xs text-ink-3">The app stores the link, never the file. Keep the files in Drive.</p>
          <ErrorText>{error}</ErrorText>
        </form>
      ) : null}

      {evidence.length === 0 ? (
        <p className="rounded-(--radius-control) border border-dashed border-line p-4 text-center text-sm text-ink-3">
          Nothing linked yet.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {evidence.map((link) => (
            <li key={link.id} className="flex items-center gap-2 rounded-(--radius-control) border border-line p-2.5">
              <a href={link.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-control) bg-paper text-ink-2">
                  <Icon name="link" className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{link.label}</span>
                  <span className="block text-xs text-ink-3">
                    {link.kind} · {longDate(link.addedAt)}
                  </span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove the link "${link.label}"?`)) void deleteEvidence(link.id);
                }}
                aria-label={`Remove ${link.label}`}
                className="tap flex shrink-0 items-center justify-center rounded-(--radius-control) text-ink-3 active:bg-line-2"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
