import { useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { parseSets } from "@/utils/sets";
import { ytEmbedUrl, calistreeQueryFromName } from "@/utils/video";
import { useRestTimer } from "@/hooks/useRestTimer";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const REST_DEFAULTS: Record<string, number> = {
  Strength: 120,
  Hypertrophy: 90,
  Isolation: 60,
  Prehab: 45,
  Rehab: 30,
};

export default function ExerciseCard({
  dayIdx,
  exIdx,
  onNext,
}: {
  dayIdx: number;
  exIdx: number;
  onNext: () => void;
}) {
  const plan = useStore((s) => s.plan);
  const progress = useStore((s) => s.progress);
  const setProgress = useStore((s) => s.upsertProg);
  const restOverrides = useStore((s) => s.restOverrides);
  const setRestOverride = useStore((s) => s.setRestOverride);
  const muted = useStore((s) => s.muted);
  const restOwner = useStore((s) => s.restOwner);

  const day = plan[dayIdx];
  const ex = day?.blocks[exIdx];
  const dk = day?.dayKey ?? "";
  const exId = ex?.id ?? "";

  const prog =
    (dk && exId && progress[dk]?.[exId]) || {
      sets: {},
      notes: "",
      video: "",
      weight: "",
      reps: "",
    };

  const totalSets = parseSets(ex?.sets);
  const override = (dk && exId && restOverrides[dk]?.[exId]) ?? (REST_DEFAULTS[ex?.focus ?? ""] || 90);

  const nextIdx = useMemo(() => {
    for (let i = 0; i < totalSets; i++) {
      if (!prog.sets[i]) return i;
    }
    return -1;
  }, [totalSets, prog.sets]);

  // timer wires into store with this exercise as owner
  const timer = useRestTimer(
    override,
    () => {
      if (!muted) bell();
      autoStartNext();
    },
    exId
  );

  useEffect(() => {
    timer.setTotal(override);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [override]);

  // 🔑 LISTEN FOR GLOBAL HOTKEY EVENTS DISPATCHED BY <App/>
  useEffect(() => {
    if (!day || !ex) return;

    const onCompleteNext = () => {
      if (nextIdx >= 0) {
        // Mark set done inline to avoid stale closure issues
        if (prog.sets[nextIdx]) return;
        setProgress(dk, exId, (p) => {
          p.sets[nextIdx] = true;
        });
        const newCompleted = Object.values(prog.sets).filter(Boolean).length + 1;
        if (newCompleted === totalSets) {
          toast.success(`${ex.name} complete! Great work!`);
        } else {
          toast.success(`Set ${nextIdx + 1} done! Rest ${override}s`, { duration: 2000 });
        }
        timer.start();
      }
    };
    const onSkip = () => {
      if (timer.active) timer.stop();
      else onNext();
    };
    const onPlus = () => timer.add(15);
    const onMinus = () => timer.add(-15);

    document.addEventListener("ec-complete-next", onCompleteNext as EventListener);
    document.addEventListener("ec-skip", onSkip as EventListener);
    document.addEventListener("ec-plus", onPlus as EventListener);
    document.addEventListener("ec-minus", onMinus as EventListener);

    return () => {
      document.removeEventListener("ec-complete-next", onCompleteNext as EventListener);
      document.removeEventListener("ec-skip", onSkip as EventListener);
      document.removeEventListener("ec-plus", onPlus as EventListener);
      document.removeEventListener("ec-minus", onMinus as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextIdx, onNext, timer, day, ex, dk, exId, prog, totalSets, override, setProgress]);

  // Early return AFTER all hooks
  if (!day || !ex) return null;

  function bell() {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const now = ctx.currentTime;
      const seq = [
        { f: 780, d: 0.12 },
        { f: 1040, d: 0.16 },
      ];
      let t = now;
      seq.forEach((s) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = s.f;
        g.gain.setValueAtTime(0.06, t);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + s.d);
        t += s.d + 0.02;
      });
    } catch {
      // Audio not available
    }
  }

  function autoStartNext() {
    if (nextIdx >= 0) return;
    if (exIdx < day.blocks.length - 1) onNext();
  }

  function markSetDone(i: number) {
    if (i < 0) return;
    if (prog.sets[i]) {
      if (confirm("Reset this set?")) {
        setProgress(dk, ex.id, (p) => {
          delete p.sets[i];
        });
        toast.info(`Set ${i + 1} reset`);
      }
      return;
    }
    setProgress(dk, ex.id, (p) => {
      p.sets[i] = true;
    });

    // Show completion feedback
    const newCompleted = Object.values(prog.sets).filter(Boolean).length + 1;
    if (newCompleted === totalSets) {
      toast.success(`${ex.name} complete! Great work!`);
    } else {
      toast.success(`Set ${i + 1} done! Rest ${override}s`, { duration: 2000 });
    }

    timer.start();
  }

  const embed = ytEmbedUrl(prog.video);
  const pct = timer.active
    ? Math.max(0, Math.min(100, 100 * (1 - timer.rem / Math.max(1, timer.total))))
    : 0;

  const completedSets = Object.values(prog.sets).filter(Boolean).length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="transition-colors current-ex" data-rest-active={restOwner === ex.id}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-lg sm:text-xl font-semibold mb-1 break-words">{ex.name}</div>
          <div className="text-sm text-subtle mb-2 break-words">
            {ex.sets || ""} {ex.tempo ? `· ${ex.tempo}` : ""} {ex.cue ? `· ${ex.cue}` : ""}
          </div>
          {totalSets > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="pill bg-[rgb(var(--accent-rgb))/0.2] text-[rgb(var(--accent-rgb))]">
                {nextIdx >= 0 ? `Set ${nextIdx + 1}/${totalSets}` : "Complete!"}
              </span>
              {completedSets > 0 && totalSets > 0 && (
                <span className="text-xs text-subtle">
                  {Math.round(progressPercent)}% done
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <label className="text-xs text-subtle">Rest</label>
          <input
            className="input w-20 sm:w-24 text-center"
            type="number"
            min={10}
            step={5}
            value={override}
            onChange={(e) => {
              const v = Math.max(5, parseInt(e.target.value || "0", 10));
              setRestOverride(dk, ex.id, v);
              if (timer.active) timer.setTotal(v);
            }}
          />
        </div>
      </div>

      {/* Sets UI */}
      {totalSets > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <button
              className={`btn btn-solid ${nextIdx < 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={nextIdx < 0}
              onClick={() => markSetDone(nextIdx)}
            >
              <i className="bx bx-check-double mr-1" />
              Complete Set
            </button>
            <button
              className="btn btn-ghost"
              title="Undo last set"
              onClick={() => {
                for (let i = totalSets - 1; i >= 0; i--) {
                  if (prog.sets[i]) {
                    useStore.getState().upsertProg(dk, ex.id, (p) => {
                      delete p.sets[i];
                    });
                    break;
                  }
                }
              }}
            >
              <i className="bx bx-undo" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4 mt-1">
            {Array.from({ length: totalSets }, (_, s) => {
              const done = !!prog.sets[s];
              const isNext = s === nextIdx;
              return (
                <button
                  key={s}
                  className={`btn ${done ? "btn-solid" : "btn-ghost"} ${isNext ? "ring-2 ring-[rgb(var(--accent-rgb))]" : ""}`}
                  onClick={() => markSetDone(s)}
                >
                  Set {s + 1}
                  {done ? " ✓" : ""}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mb-4 mt-2">
          <button className="btn btn-solid" onClick={() => timer.start()}>
            <i className="bx bx-timer mr-1" />
            Start Block Timer
          </button>
        </div>
      )}

      {/* notes/weight/reps */}
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-subtle block mb-1">Notes</label>
          <textarea
            className="input h-28"
            placeholder="How did it feel? Cues that helped, etc."
            value={prog.notes}
            onChange={(e) =>
              setProgress(dk, ex.id, (p) => {
                p.notes = e.target.value;
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-subtle block mb-1">Weight</label>
            <div className="relative">
              <input
                className="input pr-20"
                placeholder="e.g., 40 lb"
                value={prog.weight}
                onChange={(e) =>
                  setProgress(dk, ex.id, (p) => {
                    p.weight = e.target.value;
                  })
                }
              />
              {/* Quick increment buttons */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                <button
                  type="button"
                  className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors"
                  title="-5"
                  onClick={() => {
                    const num = parseFloat(prog.weight) || 0;
                    setProgress(dk, ex.id, (p) => {
                      p.weight = String(Math.max(0, num - 5));
                    });
                  }}
                >
                  -5
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors"
                  title="+5"
                  onClick={() => {
                    const num = parseFloat(prog.weight) || 0;
                    setProgress(dk, ex.id, (p) => {
                      p.weight = String(num + 5);
                    });
                  }}
                >
                  +5
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-subtle block mb-1">Reps</label>
            <input
              className="input"
              placeholder="target/actual"
              value={prog.reps}
              onChange={(e) =>
                setProgress(dk, ex.id, (p) => {
                  p.reps = e.target.value;
                })
              }
            />
          </div>
        </div>
      </div>

      {/* video + calistree */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-subtle">
            Technique (YouTube) —{" "}
            <a
              className="underline"
              target="_blank"
              href={"https://www.youtube.com/results?search_query=" + encodeURIComponent(ex.name + " technique")}
            >
              search
            </a>
          </label>
          <button
            className="btn btn-ghost"
            title="Open Calistree datasheet"
            onClick={() => {
              const url = calistreeQueryFromName(ex.name);
              const w = window.open(url, "_blank");
              w?.focus();
            }}
          >
            <i className="bx bx-info-circle" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Paste specific YouTube link"
            value={prog.video}
            onChange={(e) =>
              setProgress(dk, ex.id, (p) => {
                p.video = e.target.value;
              })
            }
          />
          <button className="btn btn-ghost" title="Save video URL">
            <i className="bx bx-save" />
          </button>
          {prog.video && (
            <a className="btn btn-ghost" target="_blank" href={prog.video}>
              <i className="bx bx-link-external" />
            </a>
          )}
        </div>
        {embed && (
          <div className="aspect-video w-full rounded-lg overflow-hidden mt-2">
            <iframe
              src={embed}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        )}
      </div>

      {/* rest bar + controls */}
      <div className="mt-4">
        <Progress value={pct} className={`h-3 ${timer.active ? "bg-[rgb(var(--warn))/20]" : ""}`} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rest:</span>
            <span className={`font-mono text-lg ${timer.active && timer.rem <= 10 ? "text-[rgb(var(--warn))]" : ""}`}>
              {timer.active ? `${timer.rem}s` : "—"}
            </span>
            {timer.active && (
              <span className="pill py-1 px-2 text-xs bg-[rgb(var(--warn))/0.2] text-[rgb(var(--warn))]">
                {timer.paused ? "PAUSED" : "REST"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost px-2"
              title="-15s"
              onClick={() => timer.add(-15)}
              disabled={!timer.active}
            >
              <i className="bx bx-minus" />
              <span className="text-xs ml-1 hidden sm:inline">15s</span>
            </button>
            <button
              className="btn btn-ghost px-2"
              title="Pause/Resume"
              onClick={() => timer.toggle()}
              disabled={!timer.active}
            >
              <i className={`bx ${timer.paused ? "bx-play" : "bx-pause"}`} />
            </button>
            <button
              className="btn btn-ghost px-2"
              title="+15s"
              onClick={() => timer.add(15)}
              disabled={!timer.active}
            >
              <i className="bx bx-plus" />
              <span className="text-xs ml-1 hidden sm:inline">15s</span>
            </button>
            <button
              className="btn btn-ghost px-2"
              title="Skip (S)"
              onClick={() => {
                if (timer.active) timer.stop();
                else onNext();
              }}
            >
              <i className="bx bx-skip-next" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
