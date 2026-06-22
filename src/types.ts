export type FeelTrend = "easier" | "same" | "harder";

export type Category = "rehab" | "exercise";

export interface CategoryMeta {
  key: Category;
  label: string; // short, for toggles and counts
  headline: string; // section heading
  blurb: string; // one-line explanation of what belongs here
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "rehab",
    label: "Rehab",
    headline: "Daily rehab",
    blurb:
      "The small movements to do every day. These are what the day's progress and your streak are built on.",
  },
  {
    key: "exercise",
    label: "Exercise",
    headline: "General exercise",
    blurb:
      "Optional extras like squats or a walk. Good to do when you can — they don't count towards the daily goal.",
  },
];

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  area: string;
  sets?: number;
  reps?: number;
  holdSeconds?: number;
  cue?: string;
  createdAt: string;
  archived?: boolean;
}

export interface ExerciseLog {
  done: boolean;
  feel?: FeelTrend;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  exercises: Record<string, ExerciseLog>;
  effort?: number; // 1-10, how hard the session felt
  pain?: number; // 0-10, discomfort during/after
  mobility?: number; // 1-5, how freely you moved (1 stiff -> 5 free)
  energy?: number; // 1-5, energy / mood
  note?: string;
}

export interface Milestone {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  pinned?: boolean;
}

export interface AppData {
  version: number;
  person: string;
  exercises: Exercise[];
  days: Record<string, DayLog>;
  milestones: Milestone[];
}
