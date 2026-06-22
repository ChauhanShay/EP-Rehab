import { useState } from "react";
import type { Store } from "../store";
import { formatShort, todayISO } from "../utils";

export function Milestones({ store }: { store: Store }) {
  const { data, addMilestone, updateMilestone, removeMilestone } = store;
  const [text, setText] = useState("");
  const [date, setDate] = useState(todayISO());

  const submit = () => {
    if (!text.trim()) return;
    addMilestone(text.trim(), date);
    setText("");
    setDate(todayISO());
  };

  const sorted = [...data.milestones].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Wins & milestones
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          The progress numbers miss — “knelt without pain”, “walked to the shop”,
          “first stair without the rail”. These are the real proof it’s working.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What went well or felt easier than before?"
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-brand-400"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="ml-auto rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
          >
            Log win
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
          No wins logged yet — the first one’s coming. 💪
        </p>
      ) : (
        <ul className="space-y-2.5">
          {sorted.map((m) => (
            <li
              key={m.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <span className="mt-0.5 text-lg">🏅</span>
              <div className="min-w-0 flex-1">
                <p className="text-slate-800">{m.text}</p>
                <p className="mt-0.5 text-xs text-slate-400">{formatShort(m.date)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs">
                <button
                  onClick={() => updateMilestone(m.id, { pinned: !m.pinned })}
                  className={m.pinned ? "text-amber-500" : "text-slate-300 hover:text-slate-500"}
                  aria-label="Pin"
                  title={m.pinned ? "Unpin" : "Pin"}
                >
                  {m.pinned ? "★ pinned" : "☆ pin"}
                </button>
                <button
                  onClick={() => removeMilestone(m.id)}
                  className="text-slate-300 hover:text-rose-500"
                >
                  remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
