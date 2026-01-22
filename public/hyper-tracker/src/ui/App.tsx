import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { SEED_PLAN } from "@/data/seedPlan";
import { toast } from "sonner";
import ExerciseList from "./ExerciseList/ExerciseList";
import ExerciseCard from "./ExerciseCard/ExerciseCard";
import PlanJsonDialog from "./Modals/PlanJsonDialog";
import ExerciseEditorDialog from "./Modals/ExerciseEditorDialog";
import ColorsDialog, { ThemeFab } from "./ColorPanel";
import CommandPalette from "./CommandPalette";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

function fullDay(k: string) {
  return (
    (
      {
        Mon: "Monday",
        Tue: "Tuesday",
        Wed: "Wednesday",
        Thu: "Thursday",
        Fri: "Friday",
        Sat: "Saturday",
        Sun: "Sunday",
      } as any
    )[k] || k
  );
}

export default function App() {
  const plan = useStore((s) => s.plan);
  const setPlan = useStore((s) => s.setPlan);
  const muted = useStore((s) => s.muted);
  const setMuted = useStore((s) => s.setMuted);
  const replaceProgress = useStore((s) => s.replaceProgress);
  const replaceRestOverrides = useStore((s) => s.replaceRestOverrides);

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
  const mutedRef = useRef(muted);
  useEffect(() => { planRef.current = plan; }, [plan]);
  useEffect(() => { dayIdxRef.current = dayIdx; }, [dayIdx]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase() || "";
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
      window.removeEventListener("keydown", onKey, { capture: true } as any);
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
      />

      <div className={`app-shell ${restActive ? "rest-on" : ""}`}>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Header */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgb(var(--accent-rgb))/0.2] flex items-center justify-center">
                <i className="bx bx-dumbbell text-[rgb(var(--accent-rgb))] text-2xl leading-none" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold">
                  Hypertrophy Workout Tracker
                </h1>
                <p className="text-sm text-subtle">
                  Space = complete set. Rest: next set ring yellow → green when ready.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

              {/* trigger for CommandPalette programmatic open */}
              <span data-planjson-trigger />
              <PlanJsonDialog />
            </div>
          </header>

          {/* Tabs */}
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

          {/* Grid */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <aside className="glass rounded-card p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Exercises</h2>
                <span className="text-sm text-subtle">
                  {plan[dayIdx]?.title ?? ""}
                </span>
                <button
                  className="btn btn-ghost"
                  title="Reset all sets for this day"
                  onClick={() => {
                    const dk = plan[dayIdx]?.dayKey;
                    if (!dk) return;
                    if (confirm(`Reset all sets for ${dk}?`)) {
                      useStore.getState().resetDaySets(dk);
                    }
                  }}
                >
                  <i className="bx bx-reset" /> Reset Sets
                </button>
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

          {/* Hidden theme controls */}
          <ThemeFab />
          <ColorsDialog />
        </div>
      </div>
    </TooltipProvider>
  );
}
