import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  savePlanToFirebase,
  saveRestOverridesToFirebase,
  saveMutedToFirebase,
  saveColorsToFirebase,
} from "@/lib/sync";
import { isFirebaseConfigured } from "@/lib/firebase";

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

export type ProgEntry = {
  sets: Record<number, boolean>;
  notes: string;
  video: string;
  weight: string;
  reps: string;
};

type S = {
  plan: Day[];
  progress: Record<string, Record<string, ProgEntry>>; // progress[dayKey][exerciseId]
  restOverrides: Record<string, Record<string, number>>;
  muted: boolean;
  colors: Record<string, string>;

  // Flag to prevent sync loops (skip saving when receiving remote updates)
  _skipSync: boolean;

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
  setPlan: (p: Day[], skipSync?: boolean) => void;
  reorderBlock: (dayIdx: number, from: number, to: number) => void;
  addExercise: (dayIdx: number, exercise: Exercise) => void;
  insertExercise: (dayIdx: number, afterIdx: number, exercise: Exercise) => void;
  moveExerciseToDay: (fromDayIdx: number, exIdx: number, toDayIdx: number) => boolean;

  // progress / notes ops
  upsertProg: (dayKey: string, exId: string, up: (p: ProgEntry) => void) => void;

  // rest override
  setRestOverride: (dayKey: string, exId: string, sec: number) => void;

  // global mute
  setMuted: (m: boolean, skipSync?: boolean) => void;

  // colors
  setColors: (c: Record<string, string>, skipSync?: boolean) => void;

  // import/export helpers
  replaceProgress: (p: S["progress"]) => void;
  replaceRestOverrides: (r: S["restOverrides"], skipSync?: boolean) => void;

  // sync from remote (Firebase) - updates all global data without triggering saves
  syncFromRemote: (data: {
    plan?: Day[];
    restOverrides?: Record<string, Record<string, number>>;
    muted?: boolean;
    colors?: Record<string, string>;
  }) => void;

  // reset sets only (keep notes, video, weight/reps)
  resetDaySets: (dayKey: string) => void;
};

// Helper to sync plan changes to Firebase
function syncPlan(plan: Day[], skipSync: boolean) {
  if (!skipSync && isFirebaseConfigured()) {
    savePlanToFirebase(plan);
  }
}

// Helper to sync restOverrides to Firebase
function syncRestOverrides(
  restOverrides: Record<string, Record<string, number>>,
  skipSync: boolean
) {
  if (!skipSync && isFirebaseConfigured()) {
    saveRestOverridesToFirebase(restOverrides);
  }
}

export const useStore = create<S>()(
  persist(
    (set, get) => ({
      plan: [],
      progress: {},
      restOverrides: {},
      muted: false,
      colors: {},
      _skipSync: false,

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
        syncPlan(plan, get()._skipSync);
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
        syncPlan(plan, get()._skipSync);
        return true;
      },

      setPlan: (p, skipSync = false) => {
        set({ plan: p });
        syncPlan(p, skipSync || get()._skipSync);
      },

      reorderBlock: (dayIdx, from, to) => {
        const plan = structuredClone(get().plan);
        const arr = plan[dayIdx].blocks;
        const [m] = arr.splice(from, 1);
        arr.splice(to, 0, m);
        set({ plan });
        syncPlan(plan, get()._skipSync);
      },

      addExercise: (dayIdx, exercise) => {
        const plan = structuredClone(get().plan);
        plan[dayIdx].blocks.push(exercise);
        set({ plan });
        syncPlan(plan, get()._skipSync);
      },

      insertExercise: (dayIdx, afterIdx, exercise) => {
        const plan = structuredClone(get().plan);
        const day = plan[dayIdx];
        if (!day) return;
        day.blocks.splice(afterIdx + 1, 0, exercise);
        set({ plan });
        syncPlan(plan, get()._skipSync);
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
        syncPlan(plan, get()._skipSync);
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
        };
        const curr = progress[dayKey]?.[exId] ?? base;
        up(curr);
        progress[dayKey] ||= {};
        progress[dayKey][exId] = curr;
        set({ progress });
        // Progress stays local - no Firebase sync
      },

      setRestOverride: (dayKey, exId, sec) => {
        const ro = structuredClone(get().restOverrides);
        ro[dayKey] ||= {};
        ro[dayKey][exId] = sec;
        set({ restOverrides: ro });
        syncRestOverrides(ro, get()._skipSync);
      },

      setMuted: (m, skipSync = false) => {
        set({ muted: m });
        if (!skipSync && !get()._skipSync && isFirebaseConfigured()) {
          saveMutedToFirebase(m);
        }
      },

      setColors: (c, skipSync = false) => {
        set({ colors: c });
        if (!skipSync && !get()._skipSync && isFirebaseConfigured()) {
          saveColorsToFirebase(c);
        }
      },

      replaceProgress: (p) => set({ progress: p ?? {} }),

      replaceRestOverrides: (r, skipSync = false) => {
        set({ restOverrides: r ?? {} });
        if (!skipSync && !get()._skipSync && isFirebaseConfigured()) {
          saveRestOverridesToFirebase(r ?? {});
        }
      },

      // Sync from remote Firebase - updates state without triggering saves
      syncFromRemote: (data) => {
        set({ _skipSync: true });
        if (data.plan !== undefined) set({ plan: data.plan });
        if (data.restOverrides !== undefined) set({ restOverrides: data.restOverrides });
        if (data.muted !== undefined) set({ muted: data.muted });
        if (data.colors !== undefined) set({ colors: data.colors });
        set({ _skipSync: false });
      },

      // Reset only the boolean "sets" maps for a given day; keep notes/video/weight/reps
      resetDaySets: (dayKey) => {
        const progress = structuredClone(get().progress);
        if (progress[dayKey]) {
          for (const exId of Object.keys(progress[dayKey])) {
            progress[dayKey][exId].sets = {};
          }
        }
        set({ progress });
        // Progress stays local - no Firebase sync
      },
    }),
    {
      name: "hyper-tracker-v3",
      partialize: (state) => ({
        // Only persist progress locally - global data syncs via Firebase
        progress: state.progress,
        // Also persist global data locally as fallback when Firebase is not configured
        plan: state.plan,
        restOverrides: state.restOverrides,
        muted: state.muted,
        colors: state.colors,
        // Explicitly exclude: clipboard, restActive, restOwner, _skipSync (session-only)
      }),
    }
  )
);
