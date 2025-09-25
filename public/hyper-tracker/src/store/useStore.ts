// src/store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Exercise = {
  id: string; // stable unique id per exercise
  name: string;
  sets: string;
  tempo?: string;
  cue?: string;
  focus: string;
};

export type Day = {
  dayKey: string;
  title: string;
  blocks: Exercise[];
};

export type History = { ts: number; weight: string; reps: string };

export type ProgEntry = {
  sets: Record<number, boolean>;
  notes: string;
  video: string;
  weight: string;
  reps: string;
  history: History[];
};

type S = {
  plan: Day[];
  progress: Record<string, Record<string, ProgEntry>>; // keyed by exercise.id
  restOverrides: Record<string, Record<string, number>>;
  muted: boolean;

  // plan ops
  setPlan: (p: Day[]) => void;
  reorderBlock: (dayIdx: number, from: number, to: number) => void;

  // progress / notes ops
  upsertProg: (dayKey: string, exId: string, up: (p: ProgEntry) => void) => void;

  // rest override
  setRestOverride: (dayKey: string, exId: string, sec: number) => void;

  // global
  setMuted: (m: boolean) => void;

  // full-state import/export
  replaceProgress: (p: S["progress"]) => void;
  replaceRestOverrides: (r: S["restOverrides"]) => void;
  resetDaySets: (dayKey: string) => void;
};

export const useStore = create<S>()(
  persist(
    (set, get) => ({
      plan: [],
      progress: {},
      restOverrides: {},
      muted: false,

      setPlan: (p) => set({ plan: p }),

      reorderBlock: (dayIdx, from, to) => {
        const plan = structuredClone(get().plan);
        const arr = plan[dayIdx].blocks;
        const [m] = arr.splice(from, 1);
        arr.splice(to, 0, m);
        set({ plan });
      },

      upsertProg: (dayKey, exId, up) => {
        const progress = structuredClone(get().progress);
        const base: ProgEntry = {
          sets: {},
          notes: "",
          video: "",
          weight: "",
          reps: "",
          history: [],
        };
        const curr = progress[dayKey]?.[exId] ?? base;
        up(curr);
        progress[dayKey] ||= {};
        progress[dayKey][exId] = curr;
        set({ progress });
      },

      setRestOverride: (dayKey, exId, sec) => {
        const ro = structuredClone(get().restOverrides);
        ro[dayKey] ||= {};
        ro[dayKey][exId] = sec;
        set({ restOverrides: ro });
      },

      setMuted: (m) => set({ muted: m }),

      replaceProgress: (p) => set({ progress: p ?? {} }),
      replaceRestOverrides: (r) => set({ restOverrides: r ?? {} }),

      resetDaySets: (dayKey) => {
        const progress = structuredClone(get().progress);
        if (progress[dayKey]) {
          for (const exId of Object.keys(progress[dayKey])) {
            progress[dayKey][exId].sets = {};
          }
        }
        set({ progress });
      },
    }),
    {
      name: "hyper-tracker-v3",
    }
  )
);
