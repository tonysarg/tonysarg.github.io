import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { parseSets } from "@/utils/sets";



type Range = {
  from?: number;
  to?: number;
  includeUndated?: boolean; // only true for All-time
  label?: string;
};


// ===== Expanded muscle mapping (approximate) =====
const MUSCLE_MAP: Array<{ k: RegExp; m: string[] }> = [
  // Chest
  { k:/bench|press|db press|incline|decline|push-up|pushup|dip/i, m:["Chest","Front Delts","Triceps"] },
  { k:/fly|pec deck|cable crossover/i, m:["Chest"] },

  // Back (vertical)
  { k:/pull[-\s]?up|chin[-\s]?up|lat pulldown|pulldown|straight[-\s]?arm pulldown/i, m:["Lats","Upper Back","Biceps"] },
  // Back (horizontal)
  { k:/row|pendlay|seal row|t-bar/i, m:["Upper Back","Lats","Biceps"] },
  { k:/pullover/i, m:["Lats","Upper Back"] },
  { k:/shrug/i, m:["Traps"] },
  { k:/face pull|rear delt|reverse fly/i, m:["Rear Delts","Upper Back"] },

  // Delts
  { k:/overhead press|ohp|shoulder press|arnold press/i, m:["Front Delts","Side Delts","Triceps"] },
  { k:/lateral raise|side raise/i, m:["Side Delts"] },

  // Arms
  { k:/curl(?!.*hamstring)|biceps curl|incline curl|preacher|spider curl|cable curl|ez curl/i, m:["Biceps"] },
  { k:/hammer curl|zottman/i, m:["Brachialis","Biceps"] },
  { k:/pushdown|triceps extension|skullcrusher|overhead triceps|rope extension/i, m:["Triceps"] },

  // Legs
  { k:/squat|goblet|leg press/i, m:["Quads","Glutes"] },
  { k:/lunge|split squat|step[-\s]?up/i, m:["Quads","Glutes","Hamstrings"] },
  { k:/romanian deadlift|rdl|deadlift|hip hinge/i, m:["Hamstrings","Glutes"] },
  { k:/calf raise|calves/i, m:["Calves"] },

  // Core / misc
  { k:/pallof|anti-rotation|plank|leg raise|hanging raise|ab wheel|sit[-\s]?up/i, m:["Core"] },
  { k:/wrist curl|forearm|rice bucket/i, m:["Forearms"] },

  // Bands (route to closest)
  { k:/band.*pushdown/i, m:["Triceps"] },
  { k:/band.*curl/i, m:["Biceps"] },
  { k:/band.*pulldown|band.*straight[-\s]?arm/i, m:["Lats","Upper Back","Biceps"] },
];

// Rough “load class” for fun “volume hints” (no history needed)
function loadClass(focus: string) {
  if (/strength/i.test(focus)) return 1.3;
  if (/hypertrophy/i.test(focus)) return 1.0;
  if (/isolation/i.test(focus)) return 0.8;
  if (/rehab|prehab/i.test(focus)) return 0.6;
  return 1.0;
}
function musclesFor(name: string) {
  const set = new Set<string>();
  for (const rule of MUSCLE_MAP) {
    if (rule.k.test(name)) {
      rule.m.forEach(x => set.add(x));
    }
  }
  // If nothing matched, categorize generically so analytics isn’t empty.
  if (!set.size) set.add("General");
  return Array.from(set);
}

function dayName(k: string) { return ({ Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" } as any)[k] || k; } function StatCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) { return ( <div className="glass rounded-lg p-3"> <div className="text-xs opacity-70">{label}</div> <div className="text-2xl font-semibold"> {value}{suffix ? suffix : ""} </div> </div> ); }

export default function Analytics({
  refreshKey,
  range,
}: {
  refreshKey?: number;
  range?: Range;
}) {
  const plan = useStore(s => s.plan);
  const progress = useStore(s => s.progress);

  function inRange(v: any): boolean {
    // Accept either boolean true (undated) or { done, t } objects
    if (v && typeof v === "object") {
      const t = (v.t ?? v.ts ?? v.time) as number | undefined;
      const done = v.done ?? v.completed ?? true;
      if (!done) return false;
      if (typeof t === "number") {
        if (range?.from && t < range.from) return false;
        if (range?.to && t > range.to) return false;
        return true;
      }
      // no timestamp on an object → include only if allowed
      return !!range?.includeUndated;
    }
    // boolean true set without timestamp
    if (v === true) return !!range?.includeUndated;
    return false;
  }

  const a = useMemo(() => {
    const summary = {
      plannedSets: 0,
      completedSets: 0,
      byFocus: {} as Record<string, number>,
      byMuscle: {} as Record<string, number>,
      byDay: [] as Array<{ dayKey: string; title: string; planned: number; completed: number }>,
      volumeHint: 0,
    };

    plan.forEach((d) => {
      let dayPlanned = 0;
      let dayCompleted = 0;

      d.blocks.forEach((ex) => {
        const n = parseSets(ex.sets);
        dayPlanned += n;
        summary.plannedSets += n;

        const doneSetsMap = progress?.[d.dayKey]?.[ex.id]?.sets || {};
        let doneCount = 0;
        for (const k in doneSetsMap) {
          if (inRange(doneSetsMap[k])) doneCount++;
        }
        dayCompleted += doneCount;
        summary.completedSets += doneCount;

        summary.byFocus[ex.focus] = (summary.byFocus[ex.focus] || 0) + n;
        summary.volumeHint += n * loadClass(ex.focus);

        musclesFor(ex.name).forEach((m) => {
          summary.byMuscle[m] = (summary.byMuscle[m] || 0) + n;
        });
      });

      summary.byDay.push({
        dayKey: d.dayKey,
        title: d.title,
        planned: dayPlanned,
        completed: dayCompleted,
      });
    });

    return summary;
  }, [plan, progress, refreshKey, range?.from, range?.to, range?.includeUndated]);

  const focusTop = Object.entries(a.byFocus).sort((x, y) => y[1] - x[1]).slice(0, 3);
  const muscles = Object.entries(a.byMuscle).sort((x, y) => y[1] - x[1]);

  return (
    <>
      {/* Top stats */}
      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Planned Sets" value={a.plannedSets} />
        <StatCard label="Completed Sets" value={a.completedSets} />
        <StatCard
          label="Completion %"
          value={a.plannedSets ? Math.round((100 * a.completedSets) / a.plannedSets) : 0}
          suffix="%"
        />
        <div className="glass rounded-lg p-3">
          <div className="text-xs opacity-70">Focus Mix (top)</div>
          <div className="mt-1 text-sm">
            {focusTop.length ? focusTop.map(([k, v]) => `${k}: ${v}`).join(" · ") : "—"}
          </div>
        </div>
      </div>

      {/* Per-day completion */}
      <div className="mt-4">
        <div className="font-semibold mb-1">Per-Day Completion</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {a.byDay.map((d) => {
            const pct = d.planned ? Math.round((100 * d.completed) / d.planned) : 0;
            const subtitle = (d.title || "").replace(/^\w+\s[–-]\s/, "");
            return (
              <div key={d.dayKey} className="glass rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{dayName(d.dayKey)}</div>
                  <div className="pill bg-[rgb(var(--accent))/0.2] text-[rgb(var(--accent))]">{pct}%</div>
                </div>
                <div className="text-xs opacity-70 mt-1">{subtitle}</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[rgb(var(--accent))]" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {d.completed} / {d.planned} sets
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Muscle hits */}
      <div className="mt-4 text-sm text-slate-300/90">
        <div className="font-semibold mb-1">Muscle “hits” (by planned sets)</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {muscles.length
            ? muscles.map(([m, v]) => (
                <div key={m} className="glass rounded-lg p-2 flex items-center justify-between">
                  <span>{m}</span>
                  <span className="pill bg-[rgb(var(--accent))/0.2] text-[rgb(var(--accent))]">{v}</span>
                </div>
              ))
            : "—"}
        </div>
      </div>

      {/* Volume hint */}
      <div className="mt-4 glass rounded-lg p-3">
        <div className="text-xs opacity-70">Volume Hint (sets × focus load factor)</div>
        <div className="text-2xl font-semibold">{Math.round(a.volumeHint)}</div>
      </div>
    </>
  );
}