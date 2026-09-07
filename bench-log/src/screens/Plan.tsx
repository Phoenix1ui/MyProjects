import type { ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { checkpoints, conceptsInOrder, unitById, unitsInOrder } from '../content';
import { db } from '../db/schema';
import { getSetting, setCursorUnit } from '../db/records';
import { SETTING } from '../db/types';
import { daysAgo } from '../lib/dates';
import { Icon, type IconName } from '../ui/Icon';
import { Card, Pill, Progress, Screen, type Tone } from '../ui/primitives';

/**
 * The laptop-the-night-before screen. One glance answers: what is next, is it
 * prepped, what is due, when did I last back up. Everything else is a tap away.
 */
export default function Plan() {
  const navigate = useNavigate();
  const cursor = useLiveQuery(() => getSetting(SETTING.cursorUnit), [], undefined);
  const prepRows = useLiveQuery(() => db.prep.toArray(), [], []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), [], []);
  const checklist = useLiveQuery(() => db.checklist.toArray(), [], []);
  const evidence = useLiveQuery(() => db.evidence.count(), [], 0);
  const attendance = useLiveQuery(() => db.attendance.count(), [], 0);
  const lastExport = useLiveQuery(() => getSetting(SETTING.lastExportAt), [], undefined);

  const taught = new Set(prepRows.filter((p) => p.taught).map((p) => p.unitId));
  const prepped = new Set(prepRows.filter((p) => p.prepped).map((p) => p.unitId));
  const next = (cursor ? unitById.get(cursor) : undefined) ?? unitsInOrder.find((u) => !taught.has(u.id)) ?? unitsInOrder.at(-1)!;
  const nextLogged = sessions.filter((s) => s.unitId === next.id).length;
  const isPrepped = prepped.has(next.id);

  const done = new Set(checklist.filter((c) => c.done).map((c) => `${c.checkpointId}/${c.evidenceItemId}`));
  const nextDrop =
    checkpoints.find((cp) => cp.evidenceItems.some((e) => !done.has(`${cp.id}/${e.id}`))) ?? checkpoints.at(-1)!;
  const dropDone = nextDrop.evidenceItems.filter((e) => done.has(`${nextDrop.id}/${e.id}`)).length;

  const exportWhen = daysAgo(lastExport ? Number(lastExport) : undefined);
  const records = attendance + sessions.length + evidence;

  return (
    <Screen title="Plan" subtitle="The night before, on the laptop.">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Next up</p>
            <h2 className="mt-0.5 text-lg leading-snug font-bold">
              {next.order}. {next.title}
            </h2>
          </div>
          <Pill tone={isPrepped ? 'moss' : 'amber'}>{isPrepped ? 'Prepped' : 'Not prepped'}</Pill>
        </div>
        <p className="prose-body">{next.kidsDo}</p>
        <p className="text-sm text-ink-3 tabular-nums">
          {nextLogged} of {next.sessionCount} session{next.sessionCount > 1 ? 's' : ''} logged
        </p>
        <button
          type="button"
          onClick={() => {
            void setCursorUnit(next.id);
            navigate('/');
          }}
          className="btn btn-primary w-full"
        >
          Open in Today
        </button>
      </Card>

      <ul className="space-y-2">
        <Row
          to="/year"
          icon="year"
          title="Year"
          detail={`${taught.size} of ${unitsInOrder.length} units taught · ${prepped.size} prepped`}
        >
          <Progress done={taught.size} total={unitsInOrder.length} />
        </Row>
        <Row
          to="/teach"
          icon="teach"
          title="Teach"
          detail={`${conceptsInOrder.length} concepts · three lesson shapes · the AI rule`}
        />
        <Row
          to="/drops"
          icon="drops"
          title="Drops"
          detail={`${nextDrop.title} · due ${nextDrop.dueWindow.toLowerCase()}`}
        >
          <Progress done={dropDone} total={nextDrop.evidenceItems.length} />
        </Row>
        <Row
          to="/data"
          icon="data"
          title="Data"
          detail={exportWhen ? `Backed up ${exportWhen} · ${records} records` : `Never backed up · ${records} records`}
          tone={records > 0 && !exportWhen ? 'amber' : undefined}
        />
      </ul>
    </Screen>
  );
}

function Row({
  to,
  icon,
  title,
  detail,
  tone,
  children,
}: {
  to: string;
  icon: IconName;
  title: string;
  detail: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <li>
      <Link to={to} className="card flex items-center gap-3 p-4 active:bg-line-2">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-control) ${
            tone === 'amber' ? 'bg-amber-tint text-amber' : 'bg-paper text-ink-2'
          }`}
        >
          <Icon name={icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          <span className={`block text-sm tabular-nums ${tone === 'amber' ? 'text-amber' : 'text-ink-2'}`}>
            {detail}
          </span>
          {children ? <span className="mt-2 block">{children}</span> : null}
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-ink-3" />
      </Link>
    </li>
  );
}
