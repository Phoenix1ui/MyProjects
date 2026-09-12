import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Icon, Mark, type IconName } from './ui/Icon';
import Today from './screens/Today';
import Roster from './screens/Roster';
import ClassGrid from './screens/ClassGrid';
import Plan from './screens/Plan';
import Year from './screens/Year';
import Teach from './screens/Teach';
import Drops from './screens/Drops';
import Data from './screens/Data';

interface Tab {
  to: string;
  label: string;
  icon: IconName;
}

/**
 * Two contexts, two surfaces. Standing up in the club room the phone shows a
 * four-tab bar: the three screens used during a session, plus Plan. Sitting at
 * the laptop the night before, a sidebar shows everything. Same routes.
 */
const SESSION: Tab[] = [
  { to: '/', label: 'Today', icon: 'today' },
  { to: '/roster', label: 'Roster', icon: 'roster' },
  { to: '/class', label: 'Class', icon: 'class' },
];

const PLANNING: Tab[] = [
  { to: '/plan', label: 'Plan', icon: 'plan' },
  { to: '/year', label: 'Year', icon: 'year' },
  { to: '/teach', label: 'Teach', icon: 'teach' },
  { to: '/drops', label: 'Drops', icon: 'drops' },
  { to: '/data', label: 'Data', icon: 'data' },
];

export default function App() {
  const { pathname } = useLocation();
  const inPlanning = PLANNING.some((t) => pathname.startsWith(t.to));

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[13.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface px-3 py-5 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Mark />
          <span className="text-base font-bold tracking-tight">Bench Log</span>
        </div>
        <SideGroup label="In session" tabs={SESSION} />
        <SideGroup label="Planning" tabs={PLANNING} />
        <p className="mt-auto px-2 text-xs leading-relaxed text-ink-3">
          Everything here lives on this device. Export from Data every few sessions.
        </p>
      </aside>

      <main
        className="mx-auto w-full max-w-2xl px-3 pt-4 md:px-8 md:pt-8"
        style={{ paddingBottom: 'calc(var(--bar-height) + env(safe-area-inset-bottom) + 1.5rem)' }}
      >
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/class" element={<ClassGrid />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/year" element={<Year />} />
          <Route path="/teach" element={<Teach />} />
          <Route path="/drops" element={<Drops />} />
          <Route path="/data" element={<Data />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="flex h-(--bar-height) items-stretch">
          {[...SESSION, PLANNING[0]].map((tab) => {
            const active = tab.to === '/plan' ? inPlanning : undefined;
            return (
              <li key={tab.to} className="flex-1">
                <NavLink
                  to={tab.to}
                  end={tab.to === '/'}
                  className={({ isActive }) =>
                    [
                      'flex h-full flex-col items-center justify-center gap-0.5 text-[0.68rem] font-semibold',
                      (active ?? isActive) ? 'text-moss-deep' : 'text-ink-3',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          'flex h-7 w-12 items-center justify-center rounded-full',
                          (active ?? isActive) ? 'bg-moss-tint' : '',
                        ].join(' ')}
                      >
                        <Icon name={tab.icon} />
                      </span>
                      {tab.label}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function SideGroup({ label, tabs }: { label: string; tabs: Tab[] }) {
  return (
    <div className="mb-5">
      <p className="eyebrow mb-1.5 px-2">{label}</p>
      <ul className="space-y-0.5">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2.5 rounded-(--radius-control) px-2 py-1.5 text-sm font-medium',
                  isActive ? 'bg-moss-tint text-moss-deep' : 'text-ink-2 hover:bg-line-2',
                ].join(' ')
              }
            >
              <Icon name={tab.icon} className="h-4.5 w-4.5" />
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
