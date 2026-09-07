import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

/**
 * Screen header. `back` is shown on phones only: on a laptop the sidebar is
 * always there, on a phone the planning screens live behind the Plan tab.
 */
export function Screen({
  title,
  subtitle,
  back,
  right,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: { to: string; label: string };
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <header className="px-1">
        {back ? (
          <Link
            to={back.to}
            className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-moss md:hidden"
          >
            <Icon name="back" className="h-4 w-4" />
            {back.label}
          </Link>
        ) : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[1.6rem] leading-tight font-bold tracking-tight text-balance">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-ink-2">{subtitle}</p> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </header>
      {children}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card p-4 ${className}`}>{children}</section>;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="prose-body mt-1">{children}</div>
    </div>
  );
}

export type Tone = 'neutral' | 'moss' | 'amber' | 'ink';

const PILL: Record<Tone, string> = {
  neutral: 'bg-line-2 text-ink-2',
  moss: 'bg-moss-tint text-moss-deep',
  amber: 'bg-amber-tint text-amber',
  ink: 'bg-ink text-white',
};

export function Pill({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${PILL[tone]}`}
    >
      {children}
    </span>
  );
}

export function Progress({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-2">
        <div
          className={`h-full rounded-full transition-[width] ${pct === 100 ? 'bg-moss' : 'bg-ink'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-ink-2">
        {done}/{total}
      </span>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-(--radius-card) border border-dashed border-line px-4 py-6 text-center text-sm text-ink-2">
      {children}
    </p>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-sm font-medium text-amber">
      {children}
    </p>
  );
}

/** A quiet one-line notice with an action, for things that are true but not urgent. */
export function Notice({
  tone,
  children,
  action,
}: {
  tone: 'amber' | 'neutral';
  children: ReactNode;
  action?: { to: string; label: string };
}) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-3 rounded-(--radius-control) border px-3 py-2 text-sm',
        tone === 'amber'
          ? 'border-amber-line bg-amber-tint text-amber-deep'
          : 'border-line bg-surface text-ink-2',
      ].join(' ')}
    >
      <span className="min-w-0">{children}</span>
      {action ? (
        <Link to={action.to} className="shrink-0 font-semibold underline underline-offset-4">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** Concept chips link into the reference. Used on Today and Year. */
export function ConceptChip({ order, label, id }: { order: number; label: string; id: string }) {
  return (
    <Link
      to={`/teach#${id}`}
      className="tap inline-flex items-center gap-1.5 rounded-(--radius-control) border border-line bg-surface px-2.5 text-sm font-medium text-ink-2 active:bg-line-2"
    >
      <span className="text-xs font-bold tabular-nums text-ink-3">{order}</span>
      {label}
    </Link>
  );
}
