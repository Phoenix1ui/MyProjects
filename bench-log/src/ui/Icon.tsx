export type IconName =
  | 'today'
  | 'roster'
  | 'class'
  | 'plan'
  | 'year'
  | 'teach'
  | 'drops'
  | 'data'
  | 'left'
  | 'right'
  | 'back'
  | 'check'
  | 'plus'
  | 'trash'
  | 'link'
  | 'alert'
  | 'open';

const PATHS: Record<IconName, string> = {
  today: 'M9 4h6v2H9zM7 6h10v14H7zM10 13l2 2 4-4',
  roster:
    'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M16 20h5a5 5 0 0 0-4-4.9',
  class: 'M4 4h16v16H4zM4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16',
  plan: 'M4 6h16M4 12h10M4 18h13M18 10l3 2-3 2',
  year: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h3M8 17h6',
  teach:
    'M12 7c-2-1.6-4.5-2-8-2v13c3.5 0 6 .4 8 2 2-1.6 4.5-2 8-2V5c-3.5 0-6 .4-8 2zM12 7v13',
  drops: 'M4 5h16v4H4zM6 9v10h12V9M10 13h4',
  data: 'M12 4v10m0 0 4-4m-4 4-4-4M5 18h14',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  back: 'M11 5l-7 7 7 7M4 12h16',
  check: 'M5 13l4 4L19 7',
  plus: 'M12 5v14M5 12h14',
  trash: 'M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13M11 11v6M14 11v6',
  link: 'M10 13a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7L11.5 6M14 11a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7L12.5 18',
  alert: 'M12 4l9 16H3zM12 10v4M12 17.2v.1',
  open: 'M14 4h6v6M20 4l-9 9M18 13v6H5V6h6',
};

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The three-bar mark: the heatmap ramp, which is what the app exists for. */
export function Mark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="13" width="5" height="8" rx="1.5" fill="var(--color-level0)" />
      <rect x="9.5" y="8" width="5" height="13" rx="1.5" fill="var(--color-level1)" />
      <rect x="16" y="3" width="5" height="18" rx="1.5" fill="var(--color-moss)" />
    </svg>
  );
}
