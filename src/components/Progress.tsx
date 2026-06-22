import { useMemo } from "react";
import type { Store } from "../store";
import { clsx, lastNDays, todayISO } from "../utils";
import { Heatmap, Trend, type TrendPoint } from "./Charts";

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-surface p-4 text-center">
      <div
        className={clsx(
          "font-display text-[2rem] leading-none",
          accent ? "text-amber-500" : "text-slate-800",
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 text-xs text-slate-400">{label}</div>
    </div>
  );
}

export function Progress({ store }: { store: Store }) {
  const { data } = store;

  // Streak and consistency are built on daily rehab — the must-do recovery work.
  const active = useMemo(
    () => data.exercises.filter((e) => !e.archived && e.category === "rehab"),
    [data.exercises],
  );

  const dayDone = (date: string): number => {
    const d = data.days[date];
    if (!d) return 0;
    return active.filter((e) => d.exercises[e.id]?.done).length;
  };

  // Current streak: consecutive days (ending today) with at least one rehab movement done.
  const streak = useMemo(() => {
    let n = 0;
    let cursor = todayISO();
    // allow today to be empty without breaking a prior streak
    if (dayDone(cursor) === 0) cursor = lastNDays(2)[0];
    while (dayDone(cursor) > 0) {
      n++;
      cursor = lastNDays(2, cursor)[0];
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.days, active]);

  const last7 = lastNDays(7);
  const sessionsThisWeek = last7.filter((d) => dayDone(d) > 0).length;

  const totalSessions = useMemo(
    () => Object.keys(data.days).filter((d) => dayDone(d) > 0).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.days, active],
  );

  const heatCells = lastNDays(35).map((date) => {
    const log = data.days[date];
    const has = log && Object.keys(log.exercises).length > 0;
    const intensity = !has || active.length === 0 ? -1 : dayDone(date) / active.length;
    return { date, intensity };
  });

  const range = lastNDays(21);
  const series = (pick: (d: string) => number | null | undefined): TrendPoint[] =>
    range.map((date) => {
      const v = pick(date);
      return { date, value: v == null ? null : v };
    });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2.5">
        <Stat value={`${streak}`} label={streak === 1 ? "day in a row" : "days in a row"} accent />
        <Stat value={`${sessionsThisWeek}/7`} label="days this week" />
        <Stat value={`${totalSessions}`} label="sessions logged" />
      </div>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
          Showing up · last 5 weeks
        </h2>
        <div className="rounded-3xl border border-slate-200 bg-surface p-4">
          <Heatmap cells={heatCells} />
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span>less</span>
            <span className="h-3 w-3 rounded bg-[#dde4d4]" />
            <span className="h-3 w-3 rounded bg-[#c3d6bd]" />
            <span className="h-3 w-3 rounded bg-[#9cc093]" />
            <span className="h-3 w-3 rounded bg-[#6e9a66]" />
            <span className="h-3 w-3 rounded bg-[#456b4f]" />
            <span>more done</span>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
          How it's felt · last 3 weeks
        </h2>
        <p className="px-1 text-xs text-slate-400">
          One day barely moves. Watch the direction of travel instead.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Trend
            label="Mobility (higher is better)"
            points={series((d) => data.days[d]?.mobility)}
            min={1}
            max={5}
            color="#456b4f"
          />
          <Trend
            label="Pain (lower is better)"
            points={series((d) => data.days[d]?.pain)}
            min={0}
            max={10}
            color="#bc7a57"
          />
          <Trend
            label="Effort"
            points={series((d) => data.days[d]?.effort)}
            min={1}
            max={10}
            color="#d38c34"
          />
          <Trend
            label="Energy & mood"
            points={series((d) => data.days[d]?.energy)}
            min={1}
            max={5}
            color="#6f93a6"
          />
        </div>
      </section>

      {data.milestones.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            Recent wins
          </h2>
          <div className="space-y-2">
            {[...data.milestones]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3)
              .map((m) => (
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
