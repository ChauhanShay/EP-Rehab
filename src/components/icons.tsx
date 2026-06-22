interface IconProps {
  className?: string;
}

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Sunrise over a horizon — the day's session. */
export function TodayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M3 18h18" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      <path d="M12 4v3M4.5 8.5l1.5 1.5M19.5 8.5L18 10" />
    </svg>
  );
}

/** A gently rising line — progress over time. */
export function ProgressIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M4 16c3 0 4-3 7-6.5S17 5 20 5" />
      <circle cx="20" cy="5" r="1.4" fill="currentColor" stroke="none" />
      <path d="M4 20h16" opacity="0.4" />
    </svg>
  );
}

/** A sprout — small wins growing into recovery. */
export function WinsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M12 20v-7" />
      <path d="M12 13c0-3-2-4.5-5-4.5 0 3 2 4.5 5 4.5Z" />
      <path d="M12 11.5c0-2.6 2-4 4.5-4 0 2.6-2 4-4.5 4Z" />
    </svg>
  );
}

/** Stacked rows — the plan of movements. */
export function PlanIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M9 7h11M9 12h11M9 17h11" />
      <circle cx="4.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="17" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
