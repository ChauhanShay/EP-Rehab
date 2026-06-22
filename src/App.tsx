import { useRef, useState } from "react";
import { useStore } from "./store";
import type { AppData } from "./types";
import { clsx, formatLong, todayISO } from "./utils";
import { Today } from "./components/Today";
import { Program } from "./components/Program";
import { Progress } from "./components/Progress";
import { Milestones } from "./components/Milestones";
import { TodayIcon, ProgressIcon, WinsIcon, PlanIcon } from "./components/icons";

type Tab = "today" | "progress" | "wins" | "plan";

const TABS: { key: Tab; label: string; Icon: typeof TodayIcon }[] = [
  { key: "today", label: "Today", Icon: TodayIcon },
  { key: "progress", label: "Progress", Icon: ProgressIcon },
  { key: "wins", label: "Wins", Icon: WinsIcon },
  { key: "plan", label: "Plan", Icon: PlanIcon },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Settings({
  store,
  onClose,
}: {
  store: ReturnType<typeof useStore>;
  onClose: () => void;
}) {
  const { data, setPerson, importData, resetAll } = store;
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
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
        onClose();
      } catch {
        alert("That doesn't look like an EP-Rehab backup file. Pick the .json file you exported.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-5 rounded-t-[28px] bg-surface p-6 shadow-xl sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-slate-800">Settings</h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Who's this for?
          </label>
          <input
            value={data.person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="First name"
            className="w-full rounded-2xl border border-slate-200 bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Used for the greeting at the top.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
          Everything stays on this device, in this browser — no account, nothing
          sent anywhere. Export a backup to keep it safe or move it to another
          phone, then Import it there.
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={exportData}
            className="rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Export backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
            if (
              confirm(
                "Start over with the example plan? This clears every logged session and win.",
              )
            )
              resetAll();
          }}
          className="w-full rounded-2xl py-2.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
        >
          Start over
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-ground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-ground/85 px-6 pb-4 pt-5 backdrop-blur-md">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-[1.75rem] leading-tight text-slate-800">
              {greeting()}
              {who ? `, ${who}` : ""}
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">{formatLong(todayISO())}</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-surface text-slate-500 transition hover:bg-slate-50"
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.14.61.5.6.9V10a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        {tab === "today" && <Today store={store} date={date} setDate={setDate} />}
        {tab === "progress" && <Progress store={store} />}
        {tab === "wins" && <Milestones store={store} />}
        {tab === "plan" && <Program store={store} />}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-slate-200 bg-surface/95 backdrop-blur-md">
        <div className="grid grid-cols-4 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {TABS.map(({ key, label, Icon }) => {
            const activeTab = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                aria-current={activeTab ? "page" : undefined}
                className={clsx(
                  "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition",
                  activeTab ? "text-brand-700" : "text-slate-400 hover:text-slate-600",
                )}
              >
                <span
                  className={clsx(
                    "grid h-9 w-9 place-items-center rounded-full transition",
                    activeTab && "bg-brand-50",
                  )}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {showSettings && <Settings store={store} onClose={() => setShowSettings(false)} />}
    </div>
  );
}
