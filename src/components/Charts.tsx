import type { CSSProperties } from "react";
import { formatShort, parseISO } from "../utils";

export interface MetricPoint {
  date: string;
  value: number | null;
}

const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

/**
 * A felt-sense trend: smoothed line over a soft area fill, with a
 * period-over-period delta badge that knows which direction is "better".
 */
export function MetricChart({
  label,
  points,
  min,
  max,
  color,
  higherIsBetter,
  unit = "",
}: {
  label: string;
  points: MetricPoint[];
  min: number;
  max: number;
  color: string;
  higherIsBetter?: boolean; // undefined = neutral
  unit?: string;
}) {
  const W = 320;
  const H = 116;
  const padX = 8;
  const padTop = 10;
  const padBot = 16;
  const span = Math.max(1, points.length - 1);
  const sx = (i: number) => padX + (i / span) * (W - padX * 2);
  const sy = (v: number) =>
    padTop + (1 - (v - min) / Math.max(1, max - min)) * (H - padTop - padBot);

  const present = points
    .map((p, i) => ({ i, value: p.value }))
    .filter((x): x is { i: number; value: number } => x.value !== null);

  // light 3-window smoothing across present points
  const sm = present.map((p, k) => {
    const a = present[k - 1]?.value ?? p.value;
    const b = present[k + 1]?.value ?? p.value;
    return { i: p.i, value: (a + p.value + b) / 3 };
  });

  const line = sm.map((x, k) => `${k ? "L" : "M"} ${sx(x.i)} ${sy(x.value)}`).join(" ");
  const baseline = sy(min);
  const area =
    sm.length > 1
      ? `${line} L ${sx(sm[sm.length - 1].i)} ${baseline} L ${sx(sm[0].i)} ${baseline} Z`
      : "";

  // delta: recent window vs the one before it
  const vals = present.map((p) => p.value);
  const half = Math.min(7, Math.floor(vals.length / 2));
  let delta: number | null = null;
  if (half > 0) {
    const recent = avg(vals.slice(-half));
    const prev = avg(vals.slice(-2 * half, -half));
    delta = recent - prev;
  }
  const improving =
    delta == null || higherIsBetter === undefined || Math.abs(delta) < 0.05
      ? null
      : higherIsBetter
        ? delta > 0
        : delta < 0;
  const deltaColor = improving == null ? "#94a08b" : improving ? "#456b4f" : "#bc7a57";
  const arrow = delta == null ? "" : delta > 0.05 ? "↑" : delta < -0.05 ? "↓" : "→";

  const last = present.length ? present[present.length - 1].value : null;
  const gid = "g" + label.replace(/[^a-z]/gi, "");

  return (
    <div className="rounded-3xl border border-slate-200 bg-surface p-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {delta != null && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ color: deltaColor, backgroundColor: deltaColor + "1a" }}
          >
            {arrow} {Math.abs(delta).toFixed(1)} vs prev
          </span>
        )}
      </div>
      <div className="mb-2 text-xs text-slate-400">
        {last == null ? "No check-ins yet" : `Now ${last}${unit}`}
      </div>
      {present.length === 0 ? (
        <div className="flex h-[88px] items-center justify-center text-sm text-slate-300">
          Rate it after a session to start the trend
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {area && <path d={area} fill={`url(#${gid})`} />}
          {line && (
            <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          )}
          {present.map((p) => (
            <circle key={p.i} cx={sx(p.i)} cy={sy(p.value)} r={2.4} fill={color} opacity={0.5} />
          ))}
        </svg>
      )}
    </div>
  );
}

export interface CalCell {
  date: string;
  intensity: number; // 0..1, or -1 for no session
}

const heatColor = (v: number) => {
  if (v < 0) return "#e6eadd";
  if (v === 0) return "#dde4d4";
  if (v < 0.34) return "#c3d6bd";
  if (v < 0.67) return "#9cc093";
  if (v < 1) return "#6e9a66";
  return "#456b4f";
};

/** Weekday-aligned consistency calendar (Mon→Sun rows, one column per week). */
export function Calendar({ cells }: { cells: CalCell[] }) {
  if (cells.length === 0) return null;
  const first = parseISO(cells[0].date);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const lead = Array.from({ length: offset }, (_, i) => `lead-${i}`);

  const rows7: CSSProperties = {
    display: "grid",
    gridTemplateRows: "repeat(7, 14px)",
    gap: "4px",
  };

  return (
    <div className="flex gap-2 overflow-x-auto">
      <div
        className="text-[10px] leading-none text-slate-300"
        style={{ ...rows7, alignItems: "center" }}
      >
        <span>M</span>
        <span />
        <span>W</span>
        <span />
        <span>F</span>
        <span />
        <span>S</span>
      </div>
      <div style={{ ...rows7, gridAutoFlow: "column", gridAutoColumns: "14px" }}>
        {lead.map((k) => (
          <div key={k} className="h-[14px] w-[14px]" />
        ))}
        {cells.map((c) => (
          <div
            key={c.date}
            title={`${formatShort(c.date)}${c.intensity < 0 ? " · no session" : ` · ${Math.round(c.intensity * 100)}% done`}`}
            className="h-[14px] w-[14px] rounded-[4px]"
            style={{ backgroundColor: heatColor(c.intensity) }}
          />
        ))}
      </div>
    </div>
  );
}
