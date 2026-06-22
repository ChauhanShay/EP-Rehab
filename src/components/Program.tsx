import { useState } from "react";
import type { Store } from "../store";
import type { Exercise } from "../types";
import { clsx } from "../utils";

const BLANK = {
  name: "",
  area: "",
  sets: "",
  reps: "",
  holdSeconds: "",
  cue: "",
};

type FormState = typeof BLANK;

function toForm(e: Exercise): FormState {
  return {
    name: e.name,
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

  const startAdd = () => {
    setForm(BLANK);
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
      area: form.area.trim() || "General",
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
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  const FormCard = (
    <div className="space-y-3 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
      <input
        autoFocus
        className={field}
        placeholder="Exercise name (e.g. Glute bridge)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className={field}
        placeholder="Body area (e.g. Hips, Knee, Balance)"
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
          className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {editingId ? "Save changes" : "Add exercise"}
        </button>
        <button
          onClick={cancel}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          The programme
        </h2>
        {!adding && !editingId && (
          <button
            onClick={startAdd}
            className="rounded-full bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            + Add
          </button>
        )}
      </div>

      {adding && FormCard}

      {data.exercises.length === 0 && !adding && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
          No exercises yet. Tap “Add” to build the programme.
        </p>
      )}

      <div className="space-y-2.5">
        {data.exercises.map((ex) =>
          editingId === ex.id ? (
            <div key={ex.id}>{FormCard}</div>
          ) : (
            <div
              key={ex.id}
              className={clsx(
                "rounded-2xl border border-slate-200 bg-white p-4",
                ex.archived && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{ex.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                      {ex.area}
                    </span>
                    {ex.archived && (
                      <span className="text-[11px] text-slate-400">archived</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm text-slate-400">
                    {[
                      ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ex.reps ? `${ex.reps} reps` : null,
                      ex.holdSeconds ? `${ex.holdSeconds}s hold` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No target set"}
                  </div>
                  {ex.cue && (
                    <div className="mt-1 text-xs italic text-slate-400">{ex.cue}</div>
                  )}
                </div>
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
                    if (confirm(`Delete “${ex.name}”? This can't be undone.`))
                      removeExercise(ex.id);
                  }}
                  className="ml-auto font-medium text-rose-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
