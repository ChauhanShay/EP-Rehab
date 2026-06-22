import { useMemo } from "react";
import type { Store } from "../store";
import type { FeelTrend } from "../types";
import { addDays, clsx, relativeDay, todayISO } from "../utils";

const FEELS: { key: FeelTrend; label: string; emoji: string }[] = [
  { key: "easier", label: "Easier", emoji: "🙂" },
  { key: "same", label: "Same", emoji: "😐" },
  { key: "harder", label: "Harder", emoji: "😣" },
];

function Slider({
  label,
  hint,
  value,
  set,
  min,
  max,
  lowLabel,
  highLabel,
}: {
  label: string;
  hint?: string;
  value: number | undefined;
  set: (v: number) => void;
  min: number;
  max: number;
  lowLabel: string;
  highLabel: string;
}) {
  const set_ = value ?? Math.round((min + max) / 2);
  const touched = value !== undefined;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span
          className={clsx(
            "text-sm tabular-nums",
            touched ? "font-semibold text-brand-700" : "text-slate-300",
          )}
        >
          {touched ? value : "—"}
        </span>
      </div>
      {hint && <p className="mb-2 text-xs text-slate-400">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        value={set_}
        onChange={(e) => set(Number(e.target.value))}
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export function Today({
  store,
  date,
  setDate,
}: {
  store: Store;
  date: string;
  setDate: (d: string) => void;
}) {
  const { data, toggleExercise, setExerciseFeel, setDayField } = store;
  const active = useMemo(
    () => data.exercises.filter((e) => !e.archived),
    [data.exercises],
  );
  const day = data.days[date];
  const doneCount = active.filter((e) => day?.exercises[e.id]?.done).length;
  const pct = active.length ? Math.round((doneCount / active.length) * 100) : 0;
  const isFuture = date > todayISO();

  return (
    <div className="space-y-5">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setDate(addDays(date, -1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          aria-label="Previous day"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-800">
            {relativeDay(date)}
          </div>
          <button
            onClick={() => setDate(todayISO())}
            className="text-xs text-brand-600 hover:underline"
          >
            {date === todayISO() ? "" : "jump to today"}
          </button>
        </div>
        <button
          onClick={() => setDate(addDays(date, 1))}
          disabled={isFuture}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      {/* Completion summary */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm/5 text-brand-100">Session progress</div>
            <div className="mt-0.5 text-2xl font-bold">
              {doneCount} / {active.length}{" "}
              <span className="text-base font-medium text-brand-100">
                exercises
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold tabular-nums">{pct}%</div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-800/50">
          <div
            className="h-full rounded-full bg-brand-200 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Exercises */}
      <section className="space-y-2.5">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Exercises
        </h2>
        {active.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            No exercises yet. Add some in the Program tab.
          </p>
        )}
        {active.map((ex) => {
          const log = day?.exercises[ex.id];
          const done = !!log?.done;
          const meta = [
            ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.reps ? `${ex.reps} reps` : "",
            ex.holdSeconds ? `${ex.holdSeconds}s hold` : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <div
              key={ex.id}
              className={clsx(
                "rounded-2xl border bg-white p-3.5 transition",
                done ? "border-brand-200 bg-brand-50/40" : "border-slate-200",
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleExercise(date, ex.id)}
                  aria-pressed={done}
                  className={clsx(
                    "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition",
                    done
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 text-transparent hover:border-brand-400",
                  )}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "font-medium",
                        done ? "text-slate-500 line-through" : "text-slate-800",
                      )}
                    >
                      {ex.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                      {ex.area}
                    </span>
                  </div>
                  {meta && <div className="text-sm text-slate-400">{meta}</div>}
                  {ex.cue && (
                    <div className="mt-0.5 text-xs italic text-slate-400">
                      {ex.cue}
                    </div>
                  )}

                  {done && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className="mr-1 text-xs text-slate-400">
                        vs last time:
                      </span>
                      {FEELS.map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setExerciseFeel(date, ex.id, f.key)}
                          className={clsx(
                            "rounded-full px-2.5 py-1 text-xs transition",
                            log?.feel === f.key
                              ? "bg-brand-600 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                          )}
                        >
                          {f.emoji} {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Session check-in */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            How did it feel?
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Quick gut-feel ratings. These build the trends that show slow progress.
          </p>
        </div>
        <Slider
          label="Effort"
          hint="How hard the whole session felt."
          value={day?.effort}
          set={(v) => setDayField(date, { effort: v })}
          min={1}
          max={10}
          lowLabel="Very easy"
          highLabel="Max effort"
        />
        <Slider
          label="Pain / discomfort"
          value={day?.pain}
          set={(v) => setDayField(date, { pain: v })}
          min={0}
          max={10}
          lowLabel="None"
          highLabel="Severe"
        />
        <Slider
          label="Mobility — how freely she moved"
          value={day?.mobility}
          set={(v) => setDayField(date, { mobility: v })}
          min={1}
          max={5}
          lowLabel="Stiff / restricted"
          highLabel="Free & easy"
        />
        <Slider
          label="Energy / mood"
          value={day?.energy}
          set={(v) => setDayField(date, { energy: v })}
          min={1}
          max={5}
          lowLabel="Drained"
          highLabel="Great"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            value={day?.note ?? ""}
            onChange={(e) => setDayField(date, { note: e.target.value })}
            placeholder="Anything worth remembering — a good day, a flare-up, a small win…"
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </section>
    </div>
  );
}
