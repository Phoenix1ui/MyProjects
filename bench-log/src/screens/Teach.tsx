import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  aiPolicy,
  aiResistantAssessments,
  bugHunt,
  conceptsInOrder,
  firstUnitForConcept,
  lessonShapes,
} from '../content';
import { Card, Eyebrow, Pill, Screen } from '../ui/primitives';

type Tab = 'ladder' | 'shapes' | 'ai';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ladder', label: 'The ladder' },
  { id: 'shapes', label: 'Lesson shapes' },
  { id: 'ai', label: 'AI rule' },
];

/** Read-only. What he reads the night before. */
export default function Teach() {
  const location = useLocation();
  const [tab, setTab] = useState<Tab>('ladder');
  const [query, setQuery] = useState('');

  // Concept chips anywhere in the app link here with #conceptId. The ladder is
  // the default tab, so arriving with a hash only needs the scroll.
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? conceptsInOrder.filter((c) =>
        [c.name, c.short, c.kidWords, c.misconception, c.teachingMove, c.masteryCheck]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    : conceptsInOrder;

  return (
    <Screen title="Teach" subtitle="The ladder, the shapes, and the AI rule." back={{ to: '/plan', label: 'Plan' }}>
      <div className="flex gap-1.5" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`btn flex-1 ${tab === t.id ? 'btn-primary' : 'btn-quiet'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ladder' ? (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: wobble, threshold, becomes..."
            aria-label="Search concepts"
            className="control tap w-full px-3 text-base"
          />
          <ol className="space-y-3">
            {visible.map((concept) => {
              const unit = firstUnitForConcept(concept.id);
              return (
                <li key={concept.id} id={concept.id} className="card scroll-mt-4 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-control) bg-ink text-sm font-bold text-white tabular-nums">
                      {concept.order}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base leading-snug font-bold text-balance">{concept.name}</h2>
                      {unit ? (
                        <p className="mt-1">
                          <Pill>
                            First taught in {unit.order}. {unit.title}
                          </Pill>
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <dl className="mt-3 space-y-2.5">
                    <Block label="Say it like this">{concept.kidWords}</Block>
                    <Block label="Where they get stuck" tone="amber">
                      {concept.misconception}
                    </Block>
                    <Block label="Teaching move" tone="moss">
                      {concept.teachingMove}
                    </Block>
                    <Block label="They've got it when">{concept.masteryCheck}</Block>
                  </dl>
                </li>
              );
            })}
          </ol>
          {visible.length === 0 ? (
            <Card>
              <p className="text-sm text-ink-2">Nothing matches "{query}".</p>
            </Card>
          ) : null}
        </>
      ) : null}

      {tab === 'shapes' ? (
        <ul className="space-y-3">
          {lessonShapes.map((shape) => (
            <li key={shape.id} className="card p-4">
              <h2 className="text-base font-bold">{shape.name}</h2>
              <p className="mt-0.5 text-[0.95rem] text-ink-2">{shape.oneLine}</p>
              <ol className="mt-3 space-y-2">
                {shape.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[0.95rem] leading-relaxed">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper text-xs font-bold text-ink-2 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-ink">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 rounded-(--radius-control) bg-paper p-3">
                <Eyebrow>Use when</Eyebrow>
                <p className="prose-body mt-1">{shape.useWhen}</p>
              </div>
            </li>
          ))}
          <li className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold">{bugHunt.name}</h2>
              <Pill tone="amber">{bugHunt.cadence}</Pill>
            </div>
            <p className="prose-body mt-2">{bugHunt.text}</p>
          </li>
        </ul>
      ) : null}

      {tab === 'ai' ? (
        <div className="space-y-3">
          <Card>
            <p className="text-[0.95rem] leading-relaxed">
              The question is not "AI or no AI". It is <strong>what is this kid's job right now</strong>.
              When the job is to produce something, AI is a legitimate tool. When the job is to build a
              structure in their head, AI removes the load-bearing struggle. So the policy is staged.
            </p>
          </Card>
          {aiPolicy.map((stage) => (
            <Card key={stage.quarters} className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="ink">{stage.quarters}</Pill>
                <span className="text-xs text-ink-3">{stage.scope}</span>
              </div>
              <p className="text-base font-bold">{stage.policy}</p>
              <p className="prose-body">{stage.howYouSayIt}</p>
            </Card>
          ))}
          <Card>
            <h2 className="text-base font-bold">Why it needs no policing</h2>
            <p className="prose-body mt-1">
              AI cannot tell a kid what their robot will do on your floor. Every scoring device below
              is AI-resistant for that reason alone.
            </p>
            <ul className="mt-3 space-y-2">
              {aiResistantAssessments.map((item) => (
                <li key={item.name} className="rounded-(--radius-control) bg-paper p-3">
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="prose-body mt-0.5">{item.text}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}
    </Screen>
  );
}

function Block({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: 'amber' | 'moss';
  children: ReactNode;
}) {
  const bg = tone === 'amber' ? 'bg-amber-tint' : tone === 'moss' ? 'bg-moss-tint' : 'bg-paper';
  const fg = tone === 'amber' ? 'text-amber' : tone === 'moss' ? 'text-moss-deep' : 'text-ink-3';
  return (
    <div className={`rounded-(--radius-control) p-3 ${bg}`}>
      <dt className={`eyebrow ${fg}`}>{label}</dt>
      <dd className="mt-1 text-[0.95rem] leading-relaxed text-ink">{children}</dd>
    </div>
  );
}
