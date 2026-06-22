import { formatShort } from "../utils";

export interface TrendPoint {
  date: string;
  value: number | null;
}

interface TrendProps {
  points: TrendPoint[];
  min: number;
  max: number;
  color: string;
  /** When true, higher values are "better" (affects nothing visually, documents intent). */
  label: string;
  unit?: string;
}

/** Hand-rolled SVG line chart that tolerates gaps (null values). */
export function Trend({ points, min, max, color, label, unit }: TrendProps) {
  const W = 320;
  const H = 96;
  const padX = 6;
  const padY = 10;
  const span = Math.max(1, points.length - 1);
  const scaleX = (i: number) => padX + (i / span) * (W - padX * 2);
  const scaleY = (v: number) =>
    padY + (1 - (v - min) / Math.max(1, max - min)) * (H - padY * 2);

  const present = points
    .map((p, i) => ({ i, value: p.value }))
    .filter((x): x is { i: number; value: number } => x.value !== null);

  const linePath = present
    .map((x, k) => `${k === 0 ? "M" : "L"} ${scaleX(x.i)} ${scaleY(x.value)}`)
    .join(" ");

  const last = present.length ? present[present.length - 1].value : undefined;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm text-slate-400">
          {last == null ? "—" : `${last}${unit ?? ""} latest`}
        </span>
      </div>
      {present.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-sm text-slate-400">
          No check-ins yet
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
          <line
            x1={padX}
            y1={H - padY}
            x2={W - padX}
            y2={H - padY}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {present.map((x) => (
            <circle
              key={x.i}
              cx={scaleX(x.i)}
              cy={scaleY(x.value)}
              r={3}
              fill={color}
            />
          ))}
        </svg>
      )}
    </div>
  );
}

interface HeatmapProps {
  cells: { date: string; intensity: number }[]; // intensity 0..1, -1 = no data
}

/** Consistency calendar: a row of weeks coloured by how complete each day was. */
export function Heatmap({ cells }: HeatmapProps) {
  const color = (v: number) => {
    if (v < 0) return "#eef2f1";
    if (v === 0) return "#dbeae7";
    if (v < 0.34) return "#99f6e4";
    if (v < 0.67) return "#2dd4bf";
    if (v < 1) return "#0d9488";
    return "#0f766e";
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {cells.map((c) => (
        <div
          key={c.date}
          title={`${formatShort(c.date)}${c.intensity < 0 ? " · no session" : ` · ${Math.round(c.intensity * 100)}% done`}`}
          className="h-5 w-5 rounded-[5px]"
          style={{ backgroundColor: color(c.intensity) }}
        />
      ))}
    </div>
  );
}
