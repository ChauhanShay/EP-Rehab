import { useState } from "react";
import type { Store } from "../store";
import { CATEGORIES, type Category, type Exercise } from "../types";
import { clsx } from "../utils";

type FormState = {
  name: string;
  category: Category;
  area: string;
  sets: string;
  reps: string;
  holdSeconds: string;
  cue: string;
};

const BLANK: FormState = {
  name: "",
  category: "rehab",
  area: "",
  sets: "",
  reps: "",
  holdSeconds: "",
  cue: "",
};

function toForm(e: Exercise): FormState {
  return {
    name: e.name,
    category: e.category,
    area: e.area,
    sets: e.sets?.toString() ?? "",
    reps: e.reps?.toString() ?? "",
    holdSeconds: e.holdSeconds?.toString() ?? "",
    cue: e.cue ?? "",
  };
}

function numOrUndef(s: string): number | undefined {
  const n = Number(s);
  return s.trim() === "" || Number.isNaN(n) ? undefined : n;
}

export function Program({ store }: { store: Store }) {
  const { data, addExercise, updateExercise, removeExercise } = store;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);

  const startAdd = (category: Category) => {
    setForm({ ...BLANK, category });
    setAdding(true);
    setEditingId(null);
  };
  const startEdit = (e: Exercise) => {
    setForm(toForm(e));
    setEditingId(e.id);
    setAdding(false);
  };
  const cancel = () => {
    setAdding(false);
    setEditingId(null);
    setForm(BLANK);
  };

  const submit = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      category: form.category,
      area: form.area.trim(),
      sets: numOrUndef(form.sets),
      reps: numOrUndef(form.reps),
      holdSeconds: numOrUndef(form.holdSeconds),
      cue: form.cue.trim() || undefined,
    };
    if (editingId) updateExercise(editingId, payload);
    else addExercise(payload);
    cancel();
  };

  const field =
    "w-full rounded-2xl border border-slate-200 bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  const FormCard = (
    <div className="space-y-3 rounded-3xl border border-brand-200 bg-surface p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setForm({ ...form, category: c.key })}
            className={clsx(
              "rounded-xl py-2 text-sm font-medium transition",
              form.category === c.key
                ? "bg-surface text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <input
        autoFocus
        className={field}
        placeholder="Movement name (e.g. Glute bridge)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className={field}
        placeholder="Body area — optional (e.g. Hips, Knee)"
        value={form.area}
        onChange={(e) => setForm({ ...form, area: e.target.value })}
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          className={field}
          type="number"
          inputMode="numeric"
          placeholder="Sets"
          value={form.sets}
          onChange={(e) => setForm({ ...form, sets: e.target.value })}
        />
        <input
          className={field}
          type="number"
          inputMode="numeric"
          placeholder="Reps"
          value={form.reps}
          onChange={(e) => setForm({ ...form, reps: e.target.value })}
        />
        <input
          className={field}
          type="number"
          inputMode="numeric"
          placeholder="Hold (s)"
          value={form.holdSeconds}
          onChange={(e) => setForm({ ...form, holdSeconds: e.target.value })}
        />
      </div>
      <textarea
        className={clsx(field, "resize-none")}
        rows={2}
        placeholder="Form cue / reminder (optional)"
        value={form.cue}
        onChange={(e) => setForm({ ...form, cue: e.target.value })}
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={!form.name.trim()}
          className="flex-1 rounded-2xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {editingId ? "Save changes" : "Add movement"}
        </button>
        <button
          onClick={cancel}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const card = (ex: Exercise) => {
    if (editingId === ex.id) return <div key={ex.id}>{FormCard}</div>;
    const target =
      [
        ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ex.reps ? `${ex.reps} reps` : null,
        ex.holdSeconds ? `${ex.holdSeconds}s hold` : null,
      ]
        .filter(Boolean)
        .join(" · ") || "No target set";
    return (
      <div
        key={ex.id}
        className={clsx(
          "rounded-3xl border border-slate-200 bg-surface p-4",
          ex.archived && "opacity-60",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-800">{ex.name}</span>
            {ex.area && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                {ex.area}
              </span>
            )}
            {ex.archived && (
              <span className="text-[11px] text-slate-400">archived</span>
            )}
          </div>
          <div className="mt-0.5 text-sm text-slate-400">{target}</div>
          {ex.cue && <div className="mt-1 text-xs italic text-slate-400">{ex.cue}</div>}
        </div>
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3 text-sm">
          <button
            onClick={() => startEdit(ex)}
            className="font-medium text-brand-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => updateExercise(ex.id, { archived: !ex.archived })}
            className="font-medium text-slate-500 hover:underline"
          >
            {ex.archived ? "Restore" : "Archive"}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${ex.name}"? This can't be undone.`))
                removeExercise(ex.id);
            }}
            className="ml-auto font-medium text-rose-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const busy = adding || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="font-display text-2xl text-slate-800">The plan</h2>
        <p className="mt-0.5 text-sm text-slate-400">
          Build the movements you'll work through each day, split into rehab and
          exercise.
        </p>
      </div>

      {adding && FormCard}

      {CATEGORIES.map((cat) => {
        const items = data.exercises.filter((e) => e.category === cat.key);
        return (
          <section key={cat.key} className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {cat.label}
              </h3>
              {!busy && (
                <button
                  onClick={() => startAdd(cat.key)}
                  className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  + Add
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-slate-200 bg-surface px-4 py-5 text-center text-sm text-slate-400">
                No {cat.label.toLowerCase()} movements yet.
              </p>
            ) : (
              items.map(card)
            )}
          </section>
        );
      })}
    </div>
  );
}
