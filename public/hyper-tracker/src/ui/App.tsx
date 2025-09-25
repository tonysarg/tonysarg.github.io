import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { SEED_PLAN } from "@/data/seedPlan";
import { toast } from "sonner";
import ExerciseList from "./ExerciseList/ExerciseList";
import ExerciseCard from "./ExerciseCard/ExerciseCard";
import PlanJsonDialog from "./Modals/PlanJsonDialog";
import ExerciseEditorDialog from "./Modals/ExerciseEditorDialog";
import ColorsDialog, { ThemeFab } from "./ColorPanel";
import CommandPalette from "./CommandPalette";
import Analytics from "./Analytics";


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


type Period = "all" | "7d" | "30d" | "this-week" | "custom";

function startOfThisWeekMs() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun..6=Sat
  // Make week start Monday
  const diff = (day === 0 ? -6 : 1 - day);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d.getTime();
}

export default function App() {
  const plan = useStore((s) => s.plan);
  const setPlan = useStore((s) => s.setPlan);
  const muted = useStore((s) => s.muted);
  const setMuted = useStore((s) => s.setMuted);
  const replaceProgress = useStore((s) => s.replaceProgress);
  const replaceRestOverrides = useStore((s) => s.replaceRestOverrides);

  const [dayIdx, setDayIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
const [analyticsRefresh, setAnalyticsRefresh] = useState(0);
  const [period, setPeriod] = useState<Period>("all");
  const [customStart, setCustomStart] = useState<string>(""); // YYYY-MM-DD
  const [customEnd, setCustomEnd] = useState<string>("");     // YYYY-MM-DD

   const range = (() => {
    const now = Date.now();
    if (period === "7d") return { from: now - 7 * 86400000, to: now, includeUndated: false, label: "Last 7 days" };
    if (period === "30d") return { from: now - 30 * 86400000, to: now, includeUndated: false, label: "Last 30 days" };
    if (period === "this-week") return { from: startOfThisWeekMs(), to: now, includeUndated: false, label: "This week" };
    if (period === "custom") {
      const from = customStart ? new Date(customStart + "T00:00:00").getTime() : undefined;
      const to = customEnd ? new Date(customEnd + "T23:59:59").getTime() : undefined;
      return { from, to, includeUndated: false, label: "Custom" };
    }
    return { includeUndated: true, label: "All-time" }; // "all"
  })();


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
  }, [plan.length]); // re-run only until plan is populated

  useEffect(() => {
    const days = plan.length;
    const blocks = plan[dayIdx]?.blocks.length ?? 0;

    if (dayIdx >= days) setDayIdx(0);
    if (exIdx >= blocks) setExIdx(0);
  }, [plan.length, dayIdx, exIdx, plan[dayIdx]?.blocks.length]);

  return (
    <TooltipProvider delayDuration={200}>
      {/* global toasts */}
      <Toaster richColors closeButton />

      {/* Command palette (Ctrl/Cmd+K) */}
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

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--accent))/0.2] flex items-center justify-center">
              <i className="bx bx-dumbbell text-[color:rgb(var(--accent))] text-2xl leading-none" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                Hypertrophy Workout Tracker
              </h1>
              <p className="text-sm text-slate-300/80">
                Space = complete set. Rest: next set ring yellow → green when
                ready.
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
                    className={`bx ${
                      muted ? "bx-volume-mute" : "bx-volume-full"
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>{muted ? "Unmute" : "Mute"}</TooltipContent>
            </Tooltip>

            {/* mark as trigger for CommandPalette programmatic open */}
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
                      ? "btn-solid border-[rgb(var(--accent))]"
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
              <span className="text-sm text-slate-300/80">
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

          <section className="mt-6 glass rounded-card p-4 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Analytics</h2>
            <span className="text-xs opacity-70 hidden sm:inline">({range.label})</span>
          </div>

          {/* Period controls */}
          <div className="flex flex-wrap items-center gap-2">
            {(["all","7d","30d","this-week","custom"] as Period[]).map(p => (
              <button
                key={p}
                className={`btn btn-ghost px-2 py-1 text-sm ${period===p ? "ring-1 ring-[rgb(var(--accent))]" : ""}`}
                onClick={() => setPeriod(p)}
                title={
                  p==="all" ? "All-time" :
                  p==="7d" ? "Last 7 days" :
                  p==="30d" ? "Last 30 days" :
                  p==="this-week" ? "This week" : "Custom range"
                }
              >
                {p==="all" ? "All" :
                 p==="7d" ? "7d" :
                 p==="30d" ? "30d" :
                 p==="this-week" ? "This Week" : "Custom"}
              </button>
            ))}

            {/* Custom date pickers (only visible when selected) */}
            {period === "custom" && (
              <div className="flex items-center gap-2">
                <label className="text-xs opacity-70">From</label>
                <input
                  type="date"
                  className="input input-sm w-36"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
                <label className="text-xs opacity-70">To</label>
                <input
                  type="date"
                  className="input input-sm w-36"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            )}

            <button
              className="btn btn-ghost"
              title="Recompute"
              onClick={() => setAnalyticsRefresh((x) => x + 1)}
            >
              <i className="bx bx-refresh" />
            </button>
          </div>
        </div>

        <Analytics refreshKey={analyticsRefresh} range={range} />
      </section>

        {/* Hidden theme controls */}
        <ThemeFab />
        <ColorsDialog />
      </div>
    </TooltipProvider>
  );
}
