export type FeelTrend = "easier" | "same" | "harder";

export type Category = "rehab" | "exercise";

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: "rehab", label: "Rehab" },
  { key: "exercise", label: "Exercise" },
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
