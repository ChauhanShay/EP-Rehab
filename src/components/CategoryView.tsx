import { useMemo, useState, type CSSProperties } from "react";
import type { Store } from "../store";
import { CATEGORIES, type Category } from "../types";
import { addDays, clsx, relativeDay, todayISO } from "../utils";
import { SessionArc } from "./SessionArc";
import { MovementRow } from "./MovementRow";
import { MovementForm } from "./MovementForm";

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
          className={clsx("shrink-0 text-sm tabular-nums", touched ? "font-semibold" : "text-slate-300")}
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

export function CategoryView({
  store,
  date,
  setDate,
  category,
  showArc = false,
  showCheckin = false,
}: {
  store: Store;
  date: string;
  setDate: (d: string) => void;
  category: Category;
  showArc?: boolean;
  showCheckin?: boolean;
}) {
  const { data, toggleExercise, setExerciseFeel, setDayField, addExercise, updateExercise, removeExercise } = store;
  const meta = CATEGORIES.find((c) => c.key === category)!;

  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const all = useMemo(
    () => data.exercises.filter((e) => e.category === category),
    [data.exercises, category],
  );
  const live = all.filter((e) => !e.archived);
  const archived = all.filter((e) => e.archived);

  const day = data.days[date];
  const doneCount = live.filter((e) => day?.exercises[e.id]?.done).length;
  const frac = live.length ? doneCount / live.length : 0;

  const isToday = date === todayISO();
  const isFuture = date > todayISO();

  const closeForm = () => {
    setAdding(false);
    setEditId(null);
  };

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

      {showArc ? (
        <SessionArc frac={frac} done={doneCount} total={live.length} noun="rehab movement" />
      ) : (
        <div className="text-center">
          <h2 className="font-display text-3xl text-slate-800">{meta.headline}</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-400">{meta.blurb}</p>
          {live.length > 0 && (
            <p className="mt-2 text-sm font-medium text-brand-700">
              {doneCount} of {live.length} done today
            </p>
          )}
        </div>
      )}

      {/* List header with manage toggle */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            {showArc ? meta.headline : "Movements"}
          </h3>
          {all.length > 0 && (
            <button
              onClick={() => {
                setEditing((v) => !v);
                closeForm();
              }}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              {editing ? "Done" : "Edit list"}
            </button>
          )}
        </div>

        {/* Live movements */}
        {live.map((ex) =>
          editId === ex.id ? (
            <MovementForm
              key={ex.id}
              category={category}
              initial={ex}
              onSave={(p) => {
                updateExercise(ex.id, p);
                closeForm();
              }}
              onCancel={closeForm}
            />
          ) : (
            <MovementRow
              key={ex.id}
              ex={ex}
              log={day?.exercises[ex.id]}
              onToggle={() => toggleExercise(date, ex.id)}
              onFeel={(f) => setExerciseFeel(date, ex.id, f)}
              manage={
                editing
                  ? {
                      onEdit: () => {
                        setEditId(ex.id);
                        setAdding(false);
                      },
                      onArchive: () => updateExercise(ex.id, { archived: true }),
                      onDelete: () => {
                        if (confirm(`Delete "${ex.name}"? This can't be undone.`)) removeExercise(ex.id);
                      },
                    }
                  : undefined
              }
            />
          ),
        )}

        {/* Archived (only while editing) */}
        {editing &&
          archived.map((ex) => (
            <MovementRow
              key={ex.id}
              ex={ex}
              log={undefined}
              onToggle={() => {}}
              onFeel={() => {}}
              manage={{
                archived: true,
                onEdit: () => setEditId(ex.id),
                onArchive: () => updateExercise(ex.id, { archived: false }),
                onDelete: () => {
                  if (confirm(`Delete "${ex.name}"? This can't be undone.`)) removeExercise(ex.id);
                },
              }}
            />
          ))}

        {/* Add */}
        {adding ? (
          <MovementForm
            category={category}
            onSave={(p) => {
              addExercise(p);
              closeForm();
            }}
            onCancel={closeForm}
          />
        ) : (
          !editId && (
            <button
              onClick={() => {
                setAdding(true);
                setEditId(null);
              }}
              className="w-full rounded-3xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-400 transition hover:border-brand-300 hover:text-brand-600"
            >
              + Add {meta.label.toLowerCase()} movement
            </button>
          )
        )}

        {all.length === 0 && !adding && (
          <p className="px-1 text-center text-sm text-slate-400">{meta.blurb}</p>
        )}
      </section>

      {/* Rehab check-in */}
      {showCheckin && (
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-surface p-5">
          <div>
            <h2 className="font-display text-xl text-slate-800">How did it feel?</h2>
            <p className="mt-1 text-sm text-slate-400">
              A quick gut read. Day to day it barely moves — but over weeks these are
              where you'll see it working.
            </p>
          </div>
          <Slider label="Effort" hint="How hard the whole session felt." value={day?.effort} set={(v) => setDayField(date, { effort: v })} min={1} max={10} lowLabel="Easy" highLabel="All out" tint="#d38c34" />
          <Slider label="Pain or discomfort" value={day?.pain} set={(v) => setDayField(date, { pain: v })} min={0} max={10} lowLabel="None" highLabel="A lot" tint="#bc7a57" />
          <Slider label="Mobility — how freely you moved" value={day?.mobility} set={(v) => setDayField(date, { mobility: v })} min={1} max={5} lowLabel="Stiff" highLabel="Free & easy" tint="#456b4f" />
          <Slider label="Energy and mood" value={day?.energy} set={(v) => setDayField(date, { energy: v })} min={1} max={5} lowLabel="Drained" highLabel="Bright" tint="#6f93a6" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={day?.note ?? ""}
              onChange={(e) => setDayField(date, { note: e.target.value })}
              placeholder="A good day, a flare-up, something that felt different…"
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </section>
      )}
    </div>
  );
}
