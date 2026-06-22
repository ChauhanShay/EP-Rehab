import { useCallback, useEffect, useState } from "react";
import type { AppData, DayLog, Exercise, FeelTrend, Milestone } from "./types";
import { isoDate, uid } from "./utils";

const STORAGE_KEY = "ep-rehab/v1";

function seed(): AppData {
  const now = isoDate();
  const mk = (
    name: string,
    area: string,
    extra: Partial<Exercise> = {},
  ): Exercise => ({
    id: uid(),
    name,
    area,
    createdAt: now,
    ...extra,
  });
  return {
    version: 1,
    person: "",
    exercises: [
      mk("Ankle pumps", "Ankle", { sets: 2, reps: 15, cue: "Slow and controlled, full range." }),
      mk("Seated knee extensions", "Knee", { sets: 3, reps: 10, cue: "Straighten fully, hold 2s." }),
      mk("Glute bridge", "Hips", { sets: 3, reps: 8, holdSeconds: 5 }),
      mk("Standing balance", "Balance", { holdSeconds: 30, cue: "Hold a surface if needed." }),
    ],
    days: {},
    milestones: [],
  };
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed || !Array.isArray(parsed.exercises)) return seed();
    return {
      version: 1,
      person: parsed.person ?? "",
      exercises: parsed.exercises,
      days: parsed.days ?? {},
      milestones: parsed.milestones ?? [],
    };
  } catch {
    return seed();
  }
}

export function useStore() {
  const [data, setData] = useState<AppData>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked — ignore */
    }
  }, [data]);

  const setPerson = useCallback((person: string) => {
    setData((d) => ({ ...d, person }));
  }, []);

  const addExercise = useCallback((ex: Omit<Exercise, "id" | "createdAt">) => {
    setData((d) => ({
      ...d,
      exercises: [...d.exercises, { ...ex, id: uid(), createdAt: isoDate() }],
    }));
  }, []);

  const updateExercise = useCallback((id: string, patch: Partial<Exercise>) => {
    setData((d) => ({
      ...d,
      exercises: d.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const removeExercise = useCallback((id: string) => {
    setData((d) => ({ ...d, exercises: d.exercises.filter((e) => e.id !== id) }));
  }, []);

  const ensureDay = (days: Record<string, DayLog>, date: string): DayLog =>
    days[date] ?? { date, exercises: {} };

  const toggleExercise = useCallback((date: string, exId: string) => {
    setData((d) => {
      const day = ensureDay(d.days, date);
      const cur = day.exercises[exId];
      const next: DayLog = {
        ...day,
        exercises: {
          ...day.exercises,
          [exId]: { done: !cur?.done, feel: cur?.feel },
        },
      };
      return { ...d, days: { ...d.days, [date]: next } };
    });
  }, []);

  const setExerciseFeel = useCallback(
    (date: string, exId: string, feel: FeelTrend) => {
      setData((d) => {
        const day = ensureDay(d.days, date);
        const cur = day.exercises[exId] ?? { done: true };
        const nextFeel = cur.feel === feel ? undefined : feel;
        return {
          ...d,
          days: {
            ...d.days,
            [date]: {
              ...day,
              exercises: { ...day.exercises, [exId]: { ...cur, feel: nextFeel } },
            },
          },
        };
      });
    },
    [],
  );

  const setDayField = useCallback(
    (date: string, patch: Partial<Omit<DayLog, "date" | "exercises">>) => {
      setData((d) => {
        const day = ensureDay(d.days, date);
        return { ...d, days: { ...d.days, [date]: { ...day, ...patch } } };
      });
    },
    [],
  );

  const addMilestone = useCallback((text: string, date: string) => {
    setData((d) => ({
      ...d,
      milestones: [{ id: uid(), text, date, pinned: false }, ...d.milestones],
    }));
  }, []);

  const updateMilestone = useCallback(
    (id: string, patch: Partial<Milestone>) => {
      setData((d) => ({
        ...d,
        milestones: d.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      }));
    },
    [],
  );

  const removeMilestone = useCallback((id: string) => {
    setData((d) => ({ ...d, milestones: d.milestones.filter((m) => m.id !== id) }));
  }, []);

  const importData = useCallback((incoming: AppData) => {
    setData({
      version: 1,
      person: incoming.person ?? "",
      exercises: incoming.exercises ?? [],
      days: incoming.days ?? {},
      milestones: incoming.milestones ?? [],
    });
  }, []);

  const resetAll = useCallback(() => setData(seed()), []);

  return {
    data,
    setPerson,
    addExercise,
    updateExercise,
    removeExercise,
    toggleExercise,
    setExerciseFeel,
    setDayField,
    addMilestone,
    updateMilestone,
    removeMilestone,
    importData,
    resetAll,
  };
}

export type Store = ReturnType<typeof useStore>;
