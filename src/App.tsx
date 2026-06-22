import { useRef, useState } from "react";
import { useStore } from "./store";
import type { AppData } from "./types";
import { clsx, todayISO } from "./utils";
import { Today } from "./components/Today";
import { Program } from "./components/Program";
import { Progress } from "./components/Progress";
import { Milestones } from "./components/Milestones";

type Tab = "today" | "progress" | "wins" | "program";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "today", label: "Today", icon: "✓" },
  { key: "progress", label: "Progress", icon: "📈" },
  { key: "wins", label: "Wins", icon: "🏅" },
  { key: "program", label: "Programme", icon: "🗂" },
];

function Settings({ store, onClose }: { store: ReturnType<typeof useStore>; onClose: () => void }) {
  const { data, setPerson, importData, resetAll } = store;
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ep-rehab-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        if (!Array.isArray(parsed.exercises)) throw new Error("bad file");
        importData(parsed);
        alert("Data imported.");
        onClose();
      } catch {
        alert("That didn't look like a valid EP-Rehab backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Who's this for?
          </label>
          <input
            value={data.person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="Name (shown in the header)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          Everything is saved privately in this browser only. Use Export to back up or
          move it to another device, then Import there.
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportData}
            className="rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Export backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = "";
            }}
          />
        </div>

        <button
          onClick={() => {
            if (confirm("Reset everything back to the starter programme? This wipes all logs and wins."))
              resetAll();
          }}
          className="w-full rounded-xl py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
        >
          Reset all data
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>("today");
  const [date, setDate] = useState(todayISO());
  const [showSettings, setShowSettings] = useState(false);

  const who = store.data.person.trim();

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#f6f7f6] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f6f7f6]/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-brand-700">
              EP-Rehab
            </h1>
            <p className="text-xs text-slate-400">
              {who ? `${who}'s rehab tracker` : "Rehab & mobility tracker"}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <main className="px-5 py-5">
        {tab === "today" && <Today store={store} date={date} setDate={setDate} />}
        {tab === "progress" && <Progress store={store} />}
        {tab === "wins" && <Milestones store={store} />}
        {tab === "program" && <Program store={store} />}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="grid grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition",
                tab === t.key ? "text-brand-700" : "text-slate-400 hover:text-slate-600",
              )}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {showSettings && <Settings store={store} onClose={() => setShowSettings(false)} />}
    </div>
  );
}
