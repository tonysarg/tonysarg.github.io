import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { SEED_PLAN } from "@/data/seedPlan";
import { toast } from "sonner";
import ExerciseList from "./ExerciseList/ExerciseList";
import ExerciseCard from "./ExerciseCard/ExerciseCard";
import PlanJsonDialog from "./Modals/PlanJsonDialog";
import ExerciseEditorDialog from "./Modals/ExerciseEditorDialog";
import AddExerciseDialog from "./Modals/AddExerciseDialog";
import KeyboardShortcutsDialog from "./Modals/KeyboardShortcutsDialog";
import StandaloneTimer from "./StandaloneTimer";
import ColorsDialog, { ThemeFab } from "./ColorPanel";
import CommandPalette from "./CommandPalette";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const DAY_NAMES: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function fullDay(k: string): string {
  return DAY_NAMES[k] || k;
}

type AppMode = "workout" | "timer";

export default function App() {
  const plan = useStore((s) => s.plan);
  const setPlan = useStore((s) => s.setPlan);
  const muted = useStore((s) => s.muted);
  const setMuted = useStore((s) => s.setMuted);
  const replaceProgress = useStore((s) => s.replaceProgress);
  const replaceRestOverrides = useStore((s) => s.replaceRestOverrides);

  const [mode, setMode] = useState<AppMode>("workout");
  const [restActive, setRestActive] = useState(false);
  const [dayIdx, setDayIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);

  // Load plan.json once if no plan yet
  useEffect(() => {
    (async () => {
      if (plan.length) return;

      try {
        const url = new URL("plan.json", import.meta.env.BASE_URL).toString();
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();

        if (j && j.plan) setPlan(j.plan);
        if (j && j.progress) replaceProgress(j.progress);
        if (j && j.restOverrides) replaceRestOverrides(j.restOverrides);
        if (j && typeof j.muted === "boolean") setMuted(j.muted);
      } catch (err) {
        console.error("Failed to load plan.json:", err);
        toast.error("Failed to load plan.json; using seed");
        setPlan(SEED_PLAN);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.length]);

  // Keep indices in range if plan changes
  useEffect(() => {
    const days = plan.length;
    const blocks = plan[dayIdx]?.blocks.length ?? 0;
    if (dayIdx >= days) setDayIdx(0);
    if (exIdx >= blocks) setExIdx(0);
  }, [plan.length, dayIdx, exIdx, plan[dayIdx]?.blocks.length]);

  // Rest on/off class for shell
  useEffect(() => {
    const on = () => setRestActive(true);
    const off = () => setRestActive(false);
    document.addEventListener("rest-on", on);
    document.addEventListener("rest-off", off);
    return () => {
      document.removeEventListener("rest-on", on);
      document.removeEventListener("rest-off", off);
    };
  }, []);

  // --------- Global hotkeys (robust, single subscription, no stale closures)
  const planRef = useRef(plan);
  const dayIdxRef = useRef(dayIdx);
  const exIdxRef = useRef(exIdx);
  const mutedRef = useRef(muted);
  useEffect(() => { planRef.current = plan; }, [plan]);
  useEffect(() => { dayIdxRef.current = dayIdx; }, [dayIdx]);
  useEffect(() => { exIdxRef.current = exIdx; }, [exIdx]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase() || "";

      // Allow Ctrl+C/V even in inputs for copy/paste exercises
      const isCtrlC = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c";
      const isCtrlV = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v";
      const isCtrlD = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d";

      // Handle Ctrl+C/V/D globally (but not in text fields unless specifically for exercises)
      if (isCtrlC && !["input", "textarea"].includes(tag)) {
        e.preventDefault();
        const copied = useStore.getState().copyExercise(dayIdxRef.current, exIdxRef.current);
        if (copied) {
          toast.success(`Copied "${copied.name}"`);
        }
        return;
      }

      if (isCtrlV && !["input", "textarea"].includes(tag)) {
        e.preventDefault();
        const clipboard = useStore.getState().clipboard;
        if (clipboard) {
          const pasted = useStore.getState().pasteExercise(dayIdxRef.current, exIdxRef.current);
          if (pasted) {
            toast.success(`Pasted "${clipboard.name}"`);
            setExIdx((i) => i + 1); // Move to the new exercise
          }
        } else {
          toast.info("Nothing to paste. Copy an exercise first (Ctrl+C)");
        }
        return;
      }

      if (isCtrlD && !["input", "textarea"].includes(tag)) {
        e.preventDefault();
        const plan = planRef.current;
        const exName = plan[dayIdxRef.current]?.blocks?.[exIdxRef.current]?.name;
        const duplicated = useStore.getState().duplicateExercise(dayIdxRef.current, exIdxRef.current);
        if (duplicated && exName) {
          toast.success(`Duplicated "${exName}"`);
          setExIdx((i) => i + 1); // Move to the duplicate
        }
        return;
      }

      if (["input", "textarea", "select"].includes(tag)) return;
      if (target?.isContentEditable) return;

      const send = (name: string) =>
        document.dispatchEvent(new CustomEvent(name));
      const blocksLen =
        planRef.current[dayIdxRef.current]?.blocks?.length ?? 0;

      // Normalize + / - across layouts & numpad
      const isPlus =
        e.key === "+" || (e.key === "=" && e.shiftKey) || e.code === "NumpadAdd";
      const isMinus =
        e.key === "-" || e.key === "_" || e.code === "NumpadSubtract";

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        send("ec-complete-next");
      } else if ((e.key || "").toLowerCase() === "s") {
        e.preventDefault();
        send("ec-skip");
      } else if (isPlus) {
        e.preventDefault();
        send("ec-plus");
      } else if (isMinus) {
        e.preventDefault();
        send("ec-minus");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setExIdx((i) => Math.min(i + 1, Math.max(0, blocksLen - 1)));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setExIdx((i) => Math.max(0, i - 1));
      } else if ((e.key || "").toLowerCase() === "m") {
        e.preventDefault();
        setMuted(!mutedRef.current);
      }
    };

    // capture:true helps intercept default page scroll on Space
    window.addEventListener("keydown", onKey, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKey, { capture: true });
  }, [setMuted]);

  return (
    <TooltipProvider delayDuration={200}>
      <Toaster richColors closeButton />
      <CommandPalette
        onOpenPlanJson={() =>
          document
            .querySelector<HTMLButtonElement>("[data-planjson-trigger]")
            ?.click()
        }
        onOpenColors={() =>
          document.dispatchEvent(new CustomEvent("open-colors"))
        }
        onNextExercise={() => setExIdx((i) => i + 1)}
        onPrevExercise={() => setExIdx((i) => Math.max(0, i - 1))}
        onSwitchMode={setMode}
      />

      <div className={`app-shell ${restActive ? "rest-on" : ""}`}>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgb(var(--accent-rgb))/0.2] flex items-center justify-center shrink-0">
                <i className="bx bx-dumbbell text-[rgb(var(--accent-rgb))] text-2xl leading-none" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold">
                  Hyper Tracker
                </h1>
                <p className="text-sm text-subtle hidden sm:block">
                  {mode === "workout"
                    ? "Space = complete set. Rest timer rings when ready."
                    : "Quick timer for any workout"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode switcher */}
              <div className="flex items-center bg-white/5 rounded-md p-1">
                <button
                  className={`btn px-3 py-1.5 text-sm ${
                    mode === "workout" ? "btn-solid" : "btn-ghost"
                  }`}
                  onClick={() => setMode("workout")}
                >
                  <i className="bx bx-list-check mr-1" />
                  <span className="hidden sm:inline">Workout</span>
                </button>
                <button
                  className={`btn px-3 py-1.5 text-sm ${
                    mode === "timer" ? "btn-solid" : "btn-ghost"
                  }`}
                  onClick={() => setMode("timer")}
                >
                  <i className="bx bx-timer mr-1" />
                  <span className="hidden sm:inline">Timer</span>
                </button>
              </div>
              <KeyboardShortcutsDialog />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setMuted(!muted)}
                  >
                    <i
                      className={`bx ${muted ? "bx-volume-mute" : "bx-volume-full"}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{muted ? "Unmute" : "Mute"}</TooltipContent>
              </Tooltip>

              {mode === "workout" && (
                <>
                  {/* trigger for CommandPalette programmatic open */}
                  <span data-planjson-trigger />
                  <PlanJsonDialog />
                </>
              )}
            </div>
          </header>

          {mode === "workout" ? (
            <>
              {/* Day Tabs */}
              <section className="mt-6 glass rounded-card p-3 md:p-4 shadow-soft">
                <div className="flex flex-wrap gap-2">
                  {plan.map((d, i) => {
                    const active = i === dayIdx;
                    const subtitle = d.title.replace(/^\w+\s[–-]\s/, "");
                    return (
                      <button
                        key={d.dayKey}
                        className={`btn text-left ${
                          active
                            ? "btn-solid border-[rgb(var(--accent-rgb))]"
                            : "btn-ghost hover:bg-white/10"
                        }`}
                        title={d.title}
                        onClick={() => {
                          setDayIdx(i);
                          setExIdx(0);
                        }}
                      >
                        <div className="leading-tight">
                          <div className="font-semibold">{fullDay(d.dayKey)}</div>
                          <div className="text-[11px] opacity-80">{subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Workout Grid */}
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <aside className="glass rounded-card p-4 shadow-soft">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <h2 className="text-lg font-semibold">Exercises</h2>
                    <div className="flex items-center gap-2">
                      <AddExerciseDialog dayIdx={dayIdx} />
                      <button
                        className="btn btn-ghost"
                        title="Reset all sets for this day"
                        onClick={() => {
                          const dk = plan[dayIdx]?.dayKey;
                          if (!dk) return;
                          if (confirm(`Reset all sets for ${fullDay(dk)}?`)) {
                            useStore.getState().resetDaySets(dk);
                          }
                        }}
                      >
                        <i className="bx bx-reset" /> Reset
                      </button>
                    </div>
                  </div>
                  <ExerciseList
                    dayIdx={dayIdx}
                    activeIdx={exIdx}
                    onSelect={setExIdx}
                  />
                </aside>

                <main className="glass rounded-card p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Current Exercise</h2>
                    <ExerciseEditorDialog
                      dayIdx={dayIdx}
                      exIdx={exIdx}
                      exId={plan[dayIdx]?.blocks?.[exIdx]?.id}
                    />
                  </div>
                  <div className="mt-3">
                    <ExerciseCard
                      dayIdx={dayIdx}
                      exIdx={exIdx}
                      onNext={() => setExIdx((i) => i + 1)}
                    />
                  </div>
                </main>
              </div>
            </>
          ) : (
            /* Timer Mode */
            <div className="mt-6 max-w-md mx-auto">
              <StandaloneTimer />
            </div>
          )}

          {/* Hidden theme controls */}
          <ThemeFab />
          <ColorsDialog />
        </div>
      </div>
    </TooltipProvider>
  );
}
