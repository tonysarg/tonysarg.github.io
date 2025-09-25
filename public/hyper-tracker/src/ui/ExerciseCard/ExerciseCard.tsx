import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { parseSets, setCountFromString, setStringWithCount } from "@/utils/sets";
import { ytEmbedUrl, calistreeQueryFromName } from "@/utils/video";
import { useRestTimer } from "@/hooks/useRestTimer";
import { Progress } from "@/components/ui/progress";

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

  const day = plan[dayIdx];
  if (!day) return null;
  const ex = day.blocks[exIdx];
  if (!ex) return null;

  const dk = day.dayKey;
  const prog =
    progress[dk]?.[ex.id] ?? {
      sets: {},
      notes: "",
      video: "",
      weight: "",
      reps: "",
      history: [],
    };
  const totalSets = parseSets(ex.sets);

  const override =
    restOverrides[dk]?.[ex.id] ?? (REST_DEFAULTS[ex.focus] || 90);
  const nextIdx = nextIncompleteSet(totalSets, prog.sets);

  const timer = useRestTimer(override, () => {
    if (!muted) bell();
    autoStartNext();
  });

  useEffect(() => {
    timer.setTotal(override);
  }, [override]); // eslint-disable-line

  function nextIncompleteSet(
    total: number,
    map: Record<number, boolean>
  ) {
    for (let i = 0; i < total; i++) if (!map[i]) return i;
    return -1;
  }

  function bell() {
    try {
      const ctx =
        new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const seq = [
        { f: 780, d: 0.12 },
        { f: 1040, d: 0.16 },
      ];
      let t = now;
      seq.forEach((s) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = s.f;
        g.gain.setValueAtTime(0.06, t);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + s.d);
        t += s.d + 0.02;
      });
    } catch {}
  }

  function autoStartNext() {
    const idx = nextIncompleteSet(totalSets, prog.sets);
    if (idx >= 0) return;
    if (exIdx < day.blocks.length - 1) onNext();
  }

  function markSetDone(i: number) {
    if (prog.sets[i]) {
      if (confirm("Reset this set?")) {
        setProgress(dk, ex.id, (p) => {
          delete p.sets[i];
        });
      }
      return;
    }
    setProgress(dk, ex.id, (p) => {
      p.sets[i] = true;
      if (
        (p.weight && p.weight.trim()) ||
        (p.reps && p.reps.trim())
      ) {
        p.history.unshift({
          ts: Date.now(),
          weight: p.weight || "",
          reps: p.reps || "",
        });
        p.history = p.history.slice(0, 20);
      }
    });
    timer.start();
  }

  function adjustSets(delta: number) {
    const n = Math.max(0, setCountFromString(ex.sets) + delta);
    plan[dayIdx].blocks[exIdx].sets = setStringWithCount(
      ex.sets,
      n
    );
    setProgress(dk, ex.id, (p) => {
      Object.keys(p.sets).forEach((k) => {
        if (+k >= n) delete p.sets[+k];
      });
    });
  }

  const embed = ytEmbedUrl(prog.video);
  const nextLabel =
    nextIdx >= 0
      ? `Next: Set ${nextIdx + 1} of ${totalSets}`
      : "All sets complete";
  const pct = timer.active
    ? Math.max(
        0,
        Math.min(100, 100 * (1 - timer.rem / Math.max(1, timer.total)))
      )
    : 0;

  return (
    <div className="glass rounded-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold mb-1">{ex.name}</div>
          <div className="text-sm text-slate-300/80 mb-2">
            {ex.sets || ""} {ex.tempo ? `· ${ex.tempo}` : ""}{" "}
            {ex.cue ? `· Cue: ${ex.cue}` : ""}
          </div>
          {totalSets > 0 && (
            <div className="text-sm mb-2">
              <span className="pill bg-[rgb(var(--accent))/0.2] text-[rgb(var(--accent))]">
                {nextLabel}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <label className="text-xs text-slate-300/80 block mb-1">
            Rest (sec)
          </label>
          <input
            className="input w-28 text-right"
            type="number"
            min={10}
            step={5}
            value={override}
            onChange={(e) => {
              const v = Math.max(
                5,
                parseInt(e.target.value || "0", 10)
              );
              setRestOverride(dk, ex.id, v);
              if (timer.active) timer.setTotal(v);
            }}
          />
        </div>
      </div>

      {totalSets > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <button
              className={`btn btn-solid ${
                nextIdx < 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={nextIdx < 0}
              onClick={() => markSetDone(nextIdx)}
            >
              <i className="bx bx-check-double mr-1"></i>
              Complete Set
            </button>
            <button
              className="btn btn-ghost"
              title="Undo last set"
              onClick={() => {
                for (let i = totalSets - 1; i >= 0; i--) {
                  if (prog.sets[i]) {
                    useStore
                      .getState()
                      .upsertProg(dk, ex.id, (p) => {
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
                  className={`btn ${
                    done
                      ? "btn-solid"
                      : "btn-ghost"
                  } ${isNext ? "ring-2 ring-[rgb(var(--accent))]" : ""}`}
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
          <button
            className="btn btn-solid"
            onClick={() => timer.start()}
          >
            <i className="bx bx-timer mr-1"></i>Start Block Timer
          </button>
        </div>
      )}

      {/* notes/weight/reps */}
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-300/80 block mb-1">
            Notes
          </label>
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
            <label className="text-xs text-slate-300/80 block mb-1">
              Weight
            </label>
            <input
              className="input"
              placeholder="e.g., 40 lb"
              value={prog.weight}
              onChange={(e) =>
                setProgress(dk, ex.id, (p) => {
                  p.weight = e.target.value;
                })
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-300/80 block mb-1">
              Reps
            </label>
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
          <label className="text-xs text-slate-300/80">
            Technique (YouTube) —{" "}
            <a
              className="underline"
              target="_blank"
              href={
                "https://www.youtube.com/results?search_query=" +
                encodeURIComponent(ex.name + " technique")
              }
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
          <button className="btn btn-ghost">
            <i className="bx bx-save" />
          </button>
          {prog.video && (
            <a
              className="btn btn-ghost"
              target="_blank"
              href={prog.video}
            >
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
        <Progress value={pct} className="h-2" />
        <div className="flex items-center justify-between mt-2">
          <div>
            Rest:{" "}
            <span>{timer.active ? `${timer.rem}s` : "—"}</span>{" "}
            {timer.active && (
              <span className="pill bg-[rgb(var(--warn))/0.2] text-[rgb(var(--warn))] ml-2">
                REST
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost"
              title="-15s"
              onClick={() => timer.add(-15)}
            >
              <i className="bx bx-minus" />
            </button>
            <button
              className="btn btn-ghost"
              title="Pause/Resume"
              onClick={() => timer.toggle()}
            >
              <i
                className={`bx ${
                  timer.paused ? "bx-play" : "bx-pause"
                }`}
              />
            </button>
            <button
              className="btn btn-ghost"
              title="+15s"
              onClick={() => timer.add(15)}
            >
              <i className="bx bx-plus" />
            </button>
            <button
              className="btn btn-ghost"
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

      {/* history */}
      <div className="mt-2">
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (!prog.history?.length) {
              alert(
                "No history yet. Enter weight/reps then complete a set."
              );
              return;
            }
            const lines = prog.history
              .slice(0, 10)
              .map(
                (en) =>
                  `${new Date(en.ts).toLocaleDateString()} ${new Date(
                    en.ts
                  ).toLocaleTimeString()} — ${en.weight} × ${en.reps}`
              )
              .join("\n");
            alert(lines);
          }}
        >
          <i className="bx bx-time-five mr-1"></i>History
        </button>
      </div>
    </div>
  );
}
