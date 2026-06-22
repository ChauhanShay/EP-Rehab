import { useMemo, useState } from "react";
import type { Store } from "../store";
import type { FeelTrend } from "../types";
import { clsx, lastNDays, todayISO } from "../utils";
import { Calendar, MetricChart, type MetricPoint } from "./Charts";

const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

const RANGES = [
  { key: 14, label: "2w" },
  { key: 42, label: "6w" },
  { key: 84, label: "12w" },
];

const FEEL_LABEL: Record<FeelTrend, string> = {
  easier: "trending easier",
  same: "holding steady",
  harder: "feeling harder",
};
const FEEL_COLOR: Record<FeelTrend, string> = {
  easier: "#456b4f",
  same: "#94a08b",
  harder: "#bc7a57",
};

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-surface p-3.5 text-center">
      <div className={clsx("font-display text-[1.9rem] leading-none", accent ? "text-amber-500" : "text-slate-800")}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] leading-tight text-slate-400">{label}</div>
    </div>
  );
}

export function Progress({ store }: { store: Store }) {
  const { data } = store;
  const [range, setRange] = useState(42);

  const rehab = useMemo(
    () => data.exercises.filter((e) => !e.archived && e.category === "rehab"),
    [data.exercises],
  );

  const dayDone = (date: string): number => {
    const d = data.days[date];
    if (!d) return 0;
    return rehab.filter((e) => d.exercises[e.id]?.done).length;
  };
  const dayHasSession = (date: string) => {
    const d = data.days[date];
    return !!d && Object.keys(d.exercises).length > 0;
  };

  // streaks
  const streak = useMemo(() => {
    let n = 0;
    let cursor = todayISO();
    if (dayDone(cursor) === 0) cursor = lastNDays(2)[0]; // today may be unstarted
    while (dayDone(cursor) > 0) {
      n++;
      cursor = lastNDays(2, cursor)[0];
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.days, rehab]);

  const bestStreak = useMemo(() => {
    let best = 0;
    let run = 0;
    for (const d of lastNDays(180)) {
      if (dayDone(d) > 0) {
        run++;
        best = Math.max(best, run);
      } else run = 0;
    }
    return best;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.days, rehab]);

  const last7 = lastNDays(7);
  const thisWeek = last7.filter((d) => dayDone(d) > 0).length;
  const totalDays = useMemo(
    () => Object.keys(data.days).filter((d) => dayDone(d) > 0).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.days, rehab],
  );

  const last14 = lastNDays(14);
  const adherence =
    rehab.length === 0
      ? 0
      : Math.round(
          (last14.reduce((s, d) => s + dayDone(d), 0) / (14 * rehab.length)) * 100,
        );

  // metric deltas for the momentum line
  const metricDelta = (pick: (d: string) => number | undefined) => {
    const vals = lastNDays(14).map(pick).filter((v): v is number => v != null);
    const half = Math.min(7, Math.floor(vals.length / 2));
    if (half === 0) return 0;
    return avg(vals.slice(-half)) - avg(vals.slice(-2 * half, -half));
  };
  const mobilityD = metricDelta((d) => data.days[d]?.mobility);
  const painD = metricDelta((d) => data.days[d]?.pain);

  const momentum = (() => {
    let head: string;
    if (streak >= 2) head = `${streak} days of rehab in a row.`;
    else if (thisWeek > 0) head = `${thisWeek} ${thisWeek === 1 ? "day" : "days"} of rehab this week.`;
    else head = "A fresh start — log today's rehab to begin.";
    let tail = "";
    if (mobilityD > 0.1) tail = " You're moving more freely than last week.";
    else if (painD < -0.1) tail = " Less pain than last week.";
    else if (streak >= 3) tail = " Keep the run going.";
    return head + tail;
  })();

  // calendar
  const calCells = lastNDays(range).map((date) => ({
    date,
    intensity:
      !dayHasSession(date) || rehab.length === 0 ? -1 : dayDone(date) / rehab.length,
  }));

  // trends
  const rangeDays = lastNDays(range);
  const series = (pick: (d: string) => number | null | undefined): MetricPoint[] =>
    rangeDays.map((date) => ({ date, value: pick(date) ?? null }));

  // per-movement adherence + dominant feel (last 28 days)
  const movementStats = useMemo(() => {
    const window = lastNDays(28);
    return rehab.map((ex) => {
      let done = 0;
      const feels: Record<FeelTrend, number> = { easier: 0, same: 0, harder: 0 };
      for (const d of window) {
        const log = data.days[d]?.exercises[ex.id];
        if (log?.done) done++;
        if (log?.feel) feels[log.feel]++;
      }
      const dominant = (Object.entries(feels) as [FeelTrend, number][])
        .filter(([, n]) => n > 0)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      return { ex, adherence: Math.round((done / 28) * 100), dominant };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.days, rehab]);

  const recentWins = [...data.milestones].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="font-display text-2xl text-slate-800">Progress</h2>
        <p className="mt-0.5 text-sm text-slate-400">
          The slow stuff, made visible. Built on your daily rehab.
        </p>
      </div>

      {/* Momentum hero */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-600 p-5 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-display text-5xl leading-none">{streak}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-brand-100">
              day{streak === 1 ? "" : "s"} in a row
            </div>
          </div>
          <p className="flex-1 text-sm leading-relaxed text-brand-50">{momentum}</p>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[11px] text-brand-100">
            <span>This week</span>
            <span>{thisWeek}/7 days</span>
          </div>
          <div className="flex gap-1.5">
            {last7.map((d) => (
              <div
                key={d}
                className={clsx(
                  "h-2 flex-1 rounded-full",
                  dayDone(d) > 0 ? "bg-brand-200" : "bg-brand-800/40",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <Stat value={`${bestStreak}`} label="best streak" accent />
        <Stat value={`${totalDays}`} label="days logged" />
        <Stat value={`${adherence}%`} label="done · last 2w" />
      </div>

      {/* Range toggle */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Showing up
        </h3>
        <div className="flex gap-1 rounded-full bg-slate-100 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                range === r.key ? "bg-surface text-brand-700 shadow-sm" : "text-slate-500",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-surface p-4">
        <Calendar cells={calCells} />
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span>less</span>
          {["#dde4d4", "#c3d6bd", "#9cc093", "#6e9a66", "#456b4f"].map((c) => (
            <span key={c} className="h-3 w-3 rounded" style={{ backgroundColor: c }} />
          ))}
          <span>more done</span>
        </div>
      </div>

      {/* Trends */}
      <section className="space-y-2">
        <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          How it's felt
        </h3>
        <p className="px-1 text-xs text-slate-400">
          One day barely moves. The badge compares this week to last.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricChart label="Mobility" points={series((d) => data.days[d]?.mobility)} min={1} max={5} color="#456b4f" higherIsBetter />
          <MetricChart label="Pain" points={series((d) => data.days[d]?.pain)} min={0} max={10} color="#bc7a57" higherIsBetter={false} />
          <MetricChart label="Effort" points={series((d) => data.days[d]?.effort)} min={1} max={10} color="#d38c34" />
          <MetricChart label="Energy" points={series((d) => data.days[d]?.energy)} min={1} max={5} color="#6f93a6" higherIsBetter />
        </div>
      </section>

      {/* Per-movement */}
      {movementStats.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Each movement · last 4 weeks
          </h3>
          <div className="space-y-2">
            {movementStats.map(({ ex, adherence: ad, dominant }) => (
              <div key={ex.id} className="rounded-3xl border border-slate-200 bg-surface p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-slate-800">{ex.name}</span>
                  <span className="shrink-0 text-sm tabular-nums text-slate-400">{ad}% done</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${ad}%` }} />
                </div>
                {dominant && (
                  <div className="mt-2 text-xs font-medium" style={{ color: FEEL_COLOR[dominant] }}>
                    {FEEL_LABEL[dominant]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent wins */}
      {recentWins.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Recent wins
          </h3>
          <div className="space-y-2">
            {recentWins.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700"
              >
                <span aria-hidden="true">🌱</span>
                <span className="flex-1">{m.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
