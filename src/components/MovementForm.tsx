import { useState } from "react";
import type { Category, Exercise } from "../types";
import { clsx } from "../utils";

export interface MovementPayload {
  name: string;
  category: Category;
  daily: boolean;
  area: string;
  sets?: number;
  reps?: number;
  holdSeconds?: number;
  cue?: string;
}

function numOrUndef(s: string): number | undefined {
  const n = Number(s);
  return s.trim() === "" || Number.isNaN(n) ? undefined : n;
}

const field =
  "w-full rounded-2xl border border-slate-200 bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function MovementForm({
  category,
  initial,
  onSave,
  onCancel,
}: {
  category: Category;
  initial?: Exercise;
  onSave: (payload: MovementPayload) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [area, setArea] = useState(initial?.area ?? "");
  const [sets, setSets] = useState(initial?.sets?.toString() ?? "");
  const [reps, setReps] = useState(initial?.reps?.toString() ?? "");
  const [hold, setHold] = useState(initial?.holdSeconds?.toString() ?? "");
  const [cue, setCue] = useState(initial?.cue ?? "");
  const [daily, setDaily] = useState(initial?.daily ?? category === "rehab");

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category,
      daily,
      area: area.trim(),
      sets: numOrUndef(sets),
      reps: numOrUndef(reps),
      holdSeconds: numOrUndef(hold),
      cue: cue.trim() || undefined,
    });
  };

  return (
    <div className="space-y-3 rounded-3xl border border-brand-200 bg-surface p-4 shadow-sm">
      <input
        autoFocus
        className={field}
        placeholder="Movement name (e.g. Glute bridge)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className={field}
        placeholder="Body area — optional (e.g. Hips, Knee)"
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-2">
        <input className={field} type="number" inputMode="numeric" placeholder="Sets" value={sets} onChange={(e) => setSets(e.target.value)} />
        <input className={field} type="number" inputMode="numeric" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
        <input className={field} type="number" inputMode="numeric" placeholder="Hold (s)" value={hold} onChange={(e) => setHold(e.target.value)} />
      </div>
      <textarea
        className={clsx(field, "resize-none")}
        rows={2}
        placeholder="Form cue or reminder (optional)"
        value={cue}
        onChange={(e) => setCue(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setDaily((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-medium text-slate-700">
            Repeat every day
          </span>
          <span className="block text-xs text-slate-400">
            {daily
              ? "Shows up automatically each day."
              : "Stays in the library — add it on the days you do it."}
          </span>
        </span>
        <span
          className={clsx(
            "relative h-6 w-11 shrink-0 rounded-full transition",
            daily ? "bg-brand-600" : "bg-slate-300",
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
              daily ? "left-[22px]" : "left-0.5",
            )}
          />
        </span>
      </button>
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="flex-1 rounded-2xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {initial ? "Save changes" : "Add movement"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
