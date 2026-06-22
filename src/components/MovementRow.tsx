import type { Exercise, ExerciseLog, FeelTrend } from "../types";
import { clsx } from "../utils";

const FEELS: { key: FeelTrend; label: string }[] = [
  { key: "easier", label: "Easier" },
  { key: "same", label: "Same" },
  { key: "harder", label: "Harder" },
];

export interface ManageActions {
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  archived?: boolean;
}

export function MovementRow({
  ex,
  log,
  onToggle,
  onFeel,
  manage,
}: {
  ex: Exercise;
  log: ExerciseLog | undefined;
  onToggle: () => void;
  onFeel: (f: FeelTrend) => void;
  manage?: ManageActions;
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
        manage?.archived && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3.5">
        {!manage?.archived && (
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
        )}
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
            {manage?.archived && (
              <span className="text-[11px] text-slate-400">archived</span>
            )}
          </div>
          {meta && <div className="mt-0.5 text-sm text-slate-400">{meta}</div>}
          {ex.cue && <div className="mt-1 text-xs italic text-slate-400">{ex.cue}</div>}

          {done && !manage && (
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

      {manage && (
        <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3 text-sm">
          <button onClick={manage.onEdit} className="font-medium text-brand-600 hover:underline">
            Edit
          </button>
          <button onClick={manage.onArchive} className="font-medium text-slate-500 hover:underline">
            {manage.archived ? "Restore" : "Archive"}
          </button>
          <button onClick={manage.onDelete} className="ml-auto font-medium text-rose-500 hover:underline">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
