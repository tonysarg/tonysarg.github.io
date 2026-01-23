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
  notes?: string;
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
  progress: Record<string, Record<string, ProgEntry>>; // progress[dayKey][exerciseId]
  restOverrides: Record<string, Record<string, number>>;
  muted: boolean;

  // global rest state
  restActive: boolean;
  restOwner: string | null;
  setRestActive: (active: boolean, owner?: string | null) => void;

  // clipboard (session-only, not persisted)
  clipboard: Exercise | null;
  setClipboard: (ex: Exercise | null) => void;
  copyExercise: (dayIdx: number, exIdx: number) => Exercise | null;
  pasteExercise: (dayIdx: number, afterIdx?: number) => boolean;
  duplicateExercise: (dayIdx: number, exIdx: number) => boolean;

  // plan ops
  setPlan: (p: Day[]) => void;
  reorderBlock: (dayIdx: number, from: number, to: number) => void;
  addExercise: (dayIdx: number, exercise: Exercise) => void;
  insertExercise: (dayIdx: number, afterIdx: number, exercise: Exercise) => void;
  moveExerciseToDay: (fromDayIdx: number, exIdx: number, toDayIdx: number) => boolean;

  // progress / notes ops
  upsertProg: (dayKey: string, exId: string, up: (p: ProgEntry) => void) => void;

  // rest override
  setRestOverride: (dayKey: string, exId: string, sec: number) => void;

  // global mute
  setMuted: (m: boolean) => void;

  // import/export helpers
  replaceProgress: (p: S["progress"]) => void;
  replaceRestOverrides: (r: S["restOverrides"]) => void;

  // reset sets only (keep notes, video, weight/reps/history)
  resetDaySets: (dayKey: string) => void;
};

export const useStore = create<S>()(
  persist(
    (set, get) => ({
      plan: [],
      progress: {},
      restOverrides: {},
      muted: false,

      // rest state
      restActive: false,
      restOwner: null,
      setRestActive: (active, owner = null) =>
        set({ restActive: active, restOwner: active ? owner : null }),

      // clipboard (session-only)
      clipboard: null,
      setClipboard: (ex) => set({ clipboard: ex }),

      copyExercise: (dayIdx, exIdx) => {
        const plan = get().plan;
        const ex = plan[dayIdx]?.blocks?.[exIdx];
        if (!ex) return null;
        const copy = structuredClone(ex);
        set({ clipboard: copy });
        return copy;
      },

      pasteExercise: (dayIdx, afterIdx) => {
        const clipboard = get().clipboard;
        if (!clipboard) return false;
        const plan = structuredClone(get().plan);
        const day = plan[dayIdx];
        if (!day) return false;

        // Create new exercise with unique ID
        const newEx: Exercise = {
          ...clipboard,
          id: `${day.dayKey}-${Date.now()}`,
        };

        // Insert after specified index, or at end
        const insertAt = afterIdx !== undefined ? afterIdx + 1 : day.blocks.length;
        day.blocks.splice(insertAt, 0, newEx);
        set({ plan });
        return true;
      },

      duplicateExercise: (dayIdx, exIdx) => {
        const plan = structuredClone(get().plan);
        const day = plan[dayIdx];
        const ex = day?.blocks?.[exIdx];
        if (!ex) return false;

        const newEx: Exercise = {
          ...structuredClone(ex),
          id: `${day.dayKey}-${Date.now()}`,
          name: `${ex.name} (copy)`,
        };

        day.blocks.splice(exIdx + 1, 0, newEx);
        set({ plan });
        return true;
      },

      setPlan: (p) => set({ plan: p }),

      reorderBlock: (dayIdx, from, to) => {
        const plan = structuredClone(get().plan);
        const arr = plan[dayIdx].blocks;
        const [m] = arr.splice(from, 1);
        arr.splice(to, 0, m);
        set({ plan });
      },

      addExercise: (dayIdx, exercise) => {
        const plan = structuredClone(get().plan);
        plan[dayIdx].blocks.push(exercise);
        set({ plan });
      },

      insertExercise: (dayIdx, afterIdx, exercise) => {
        const plan = structuredClone(get().plan);
        const day = plan[dayIdx];
        if (!day) return;
        day.blocks.splice(afterIdx + 1, 0, exercise);
        set({ plan });
      },

      moveExerciseToDay: (fromDayIdx, exIdx, toDayIdx) => {
        if (fromDayIdx === toDayIdx) return false;
        const plan = structuredClone(get().plan);
        const fromDay = plan[fromDayIdx];
        const toDay = plan[toDayIdx];
        if (!fromDay || !toDay) return false;
        const ex = fromDay.blocks[exIdx];
        if (!ex) return false;

        // Remove from source day
        fromDay.blocks.splice(exIdx, 1);
        // Create new exercise with new day's key
        const newEx: Exercise = {
          ...ex,
          id: `${toDay.dayKey}-${Date.now()}`,
        };
        // Add to target day
        toDay.blocks.push(newEx);
        set({ plan });
        return true;
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

      // 🔁 reset only the boolean "sets" maps for a given day; keep notes/video/history/etc.
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
      partialize: (state) => ({
        plan: state.plan,
        progress: state.progress,
        restOverrides: state.restOverrides,
        muted: state.muted,
        // Explicitly exclude: clipboard, restActive, restOwner (session-only)
      }),
    }
  )
);
