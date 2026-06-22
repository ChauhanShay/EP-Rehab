import { useMemo, type CSSProperties } from "react";
import type { Store } from "../store";
import { CATEGORIES, type Exercise, type ExerciseLog, type FeelTrend } from "../types";
import { addDays, clsx, relativeDay, todayISO } from "../utils";
import { SessionArc } from "./SessionArc";

const FEELS: { key: FeelTrend; label: string }[] = [
  { key: "easier", label: "Easier" },
  { key: "same", label: "Same" },
  { key: "harder", label: "Harder" },
];

function MovementRow({
  ex,
  log,
  onToggle,
  onFeel,
}: {
  ex: Exercise;
  log: ExerciseLog | undefined;
  onToggle: () => void;
  onFeel: (f: FeelTrend) => void;
}) {
  const done = !!log?.done;
  const meta = [
    ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.reps ? `${ex.reps} reps` : "",
    ex.holdSeconds ? `${ex.holdSeconds}s hold` : "",
  ]
    .filter(Boolean)
    .join("  ·  ");
  return (
    <div
      className={clsx(
        "rounded-3xl border p-4 transition",
        done ? "border-brand-200 bg-brand-50/50" : "border-slate-200 bg-surface",
      )}
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={onToggle}
          aria-pressed={done}
          aria-label={done ? `Mark ${ex.name} not done` : `Mark ${ex.name} done`}
          className={clsx(
            "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm transition",
            done
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-slate-300 text-transparent hover:border-brand-400",
          )}
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={clsx(
                "font-medium",
                done ? "text-slate-400 line-through" : "text-slate-800",
              )}
            >
              {ex.name}
            </span>
            {ex.area && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                {ex.area}
              </span>
            )}
          </div>
          {meta && <div className="mt-0.5 text-sm text-slate-400">{meta}</div>}
          {ex.cue && <div className="mt-1 text-xs italic text-slate-400">{ex.cue}</div>}

          {done && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-xs text-slate-400">vs last time</span>
              {FEELS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => onFeel(f.key)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-medium transition",
                    log?.feel === f.key
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  set,
  min,
  max,
  lowLabel,
  highLabel,
  tint,
}: {
  label: string;
  hint?: string;
  value: number | undefined;
  set: (v: number) => void;
  min: number;
  max: number;
  lowLabel: string;
  highLabel: string;
  tint: string;
}) {
  const fallback = Math.round((min + max) / 2);
  const touched = value !== undefined;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span
          className={clsx(
            "shrink-0 text-sm tabular-nums",
            touched ? "font-semibold" : "text-slate-300",
          )}
          style={touched ? { color: tint } : undefined}
        >
          {touched ? value : "—"}
        </span>
      </div>
      {hint && <p className="mb-2 text-xs text-slate-400">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        value={value ?? fallback}
        onChange={(e) => set(Number(e.target.value))}
        style={{ "--slider": tint } as CSSProperties}
        aria-label={label}
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
  // The arc tracks daily rehab only — that's the must-do recovery work.
  const rehab = active.filter((e) => e.category === "rehab");
  const rehabDone = rehab.filter((e) => day?.exercises[e.id]?.done).length;
  const frac = rehab.length ? rehabDone / rehab.length : 0;
  const isToday = date === todayISO();
  const isFuture = date > todayISO();

  return (
    <div className="space-y-7">
      {/* Day switcher */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setDate(addDays(date, -1))}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100"
          aria-label="Previous day"
        >
          ‹
        </button>
        <button
          onClick={() => isToday || setDate(todayISO())}
          className={clsx(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            isToday ? "text-slate-500" : "bg-brand-50 text-brand-700",
          )}
        >
          {relativeDay(date)}
          {!isToday && " · back to today"}
        </button>
        <button
          onClick={() => setDate(addDays(date, 1))}
          disabled={isFuture}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      {/* Signature arc — daily rehab progress */}
      <SessionArc frac={frac} done={rehabDone} total={rehab.length} noun="rehab movement" />

      {/* Movements, grouped into Daily rehab and General exercise */}
      {active.length === 0 ? (
        <div className="space-y-3 rounded-3xl border border-dashed border-slate-200 bg-surface p-6 text-sm text-slate-500">
          <p className="font-medium text-slate-700">Nothing planned yet.</p>
          <p>
            <span className="font-medium text-brand-700">Daily rehab</span> — the
            small movements to do every day. These track your recovery and build
            your streak.
          </p>
          <p>
            <span className="font-medium text-slate-700">General exercise</span> —
            optional extras like squats or a walk, for when you're up to it.
          </p>
          <p className="text-slate-400">Add them in the Plan tab to get started.</p>
        </div>
      ) : (
        <div className="space-y-7">
          {CATEGORIES.map((cat) => {
            const items = active.filter((e) => e.category === cat.key);
            if (items.length === 0) return null;
            const catDone = items.filter((e) => day?.exercises[e.id]?.done).length;
            const optional = cat.key === "exercise";
            return (
              <section key={cat.key} className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="flex items-baseline gap-2 text-sm font-semibold text-slate-700">
                    {cat.headline}
                    {optional && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        optional
                      </span>
                    )}
                  </h2>
                  <span className="shrink-0 text-xs tabular-nums text-slate-400">
                    {catDone}/{items.length}
                  </span>
                </div>
                {items.map((ex) => (
                  <MovementRow
                    key={ex.id}
                    ex={ex}
                    log={day?.exercises[ex.id]}
                    onToggle={() => toggleExercise(date, ex.id)}
                    onFeel={(f) => setExerciseFeel(date, ex.id, f)}
                  />
                ))}
              </section>
            );
          })}
        </div>
      )}

      {/* Session check-in */}
      <section className="space-y-5 rounded-3xl border border-slate-200 bg-surface p-5">
        <div>
          <h2 className="font-display text-xl text-slate-800">How did it feel?</h2>
          <p className="mt-1 text-sm text-slate-400">
            A quick gut read. Day to day it barely moves — but over weeks these are
            where you'll see it working.
          </p>
        </div>
        <Slider
          label="Effort"
          hint="How hard the whole session felt."
          value={day?.effort}
          set={(v) => setDayField(date, { effort: v })}
          min={1}
          max={10}
          lowLabel="Easy"
          highLabel="All out"
          tint="#d38c34"
        />
        <Slider
          label="Pain or discomfort"
          value={day?.pain}
          set={(v) => setDayField(date, { pain: v })}
          min={0}
          max={10}
          lowLabel="None"
          highLabel="A lot"
          tint="#bc7a57"
        />
        <Slider
          label="Mobility — how freely you moved"
          value={day?.mobility}
          set={(v) => setDayField(date, { mobility: v })}
          min={1}
          max={5}
          lowLabel="Stiff"
          highLabel="Free & easy"
          tint="#456b4f"
        />
        <Slider
          label="Energy and mood"
          value={day?.energy}
          set={(v) => setDayField(date, { energy: v })}
          min={1}
          max={5}
          lowLabel="Drained"
          highLabel="Bright"
          tint="#6f93a6"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            value={day?.note ?? ""}
            onChange={(e) => setDayField(date, { note: e.target.value })}
            placeholder="A good day, a flare-up, something that felt different…"
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </section>
    </div>
  );
}
