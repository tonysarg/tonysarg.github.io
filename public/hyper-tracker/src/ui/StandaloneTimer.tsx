import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { Progress } from "@/components/ui/progress";

const PRESETS = [
  { label: "30s", value: 30 },
  { label: "45s", value: 45 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "2m", value: 120 },
  { label: "3m", value: 180 },
  { label: "5m", value: 300 },
];

export default function StandaloneTimer() {
  const muted = useStore((s) => s.muted);
  const [duration, setDuration] = useState(90);
  const [customInput, setCustomInput] = useState("90");
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [endAt, setEndAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const pauseStamp = useRef(0);

  const bell = useCallback(() => {
    if (muted) return;
    try {
      const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
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
  }, [muted]);

  useEffect(() => {
    if (!active || paused) return;

    const interval = setInterval(() => {
      const rem = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(rem);

      if (rem <= 0) {
        clearInterval(interval);
        setActive(false);
        bell();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [active, paused, endAt, bell]);

  function start(secs?: number) {
    const d = secs ?? duration;
    setDuration(d);
    setEndAt(Date.now() + d * 1000);
    setRemaining(d);
    setActive(true);
    setPaused(false);
    pauseStamp.current = 0;
  }

  function stop() {
    setActive(false);
    setPaused(false);
    setRemaining(0);
  }

  function toggle() {
    if (!active) return;
    if (paused) {
      const delta = Date.now() - pauseStamp.current;
      setEndAt((p) => p + delta);
      setPaused(false);
    } else {
      pauseStamp.current = Date.now();
      setPaused(true);
    }
  }

  function addTime(sec: number) {
    if (!active) return;
    setEndAt((p) => p + sec * 1000);
    setRemaining((r) => r + sec);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const pct = active ? Math.max(0, Math.min(100, 100 * (1 - remaining / duration))) : 0;
  const isWarning = active && remaining <= 10 && remaining > 0;
  const isComplete = active && remaining === 0;

  return (
    <div className="glass rounded-card p-6 shadow-soft">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <i className="bx bx-timer text-[rgb(var(--accent-rgb))]" />
        Quick Timer
      </h2>

      {/* Timer display */}
      <div
        className={`text-center py-8 rounded-lg mb-4 transition-colors ${
          isComplete
            ? "bg-[rgb(var(--accent-rgb))/0.2]"
            : isWarning
            ? "bg-[rgb(var(--warn))/0.2]"
            : "bg-white/5"
        }`}
      >
        <div
          className={`text-6xl font-mono font-bold transition-colors ${
            isComplete
              ? "text-[rgb(var(--accent-rgb))]"
              : isWarning
              ? "text-[rgb(var(--warn))]"
              : ""
          }`}
        >
          {active ? formatTime(remaining) : formatTime(duration)}
        </div>
        {active && (
          <div className="text-sm text-subtle mt-2">
            {paused ? "Paused" : isComplete ? "Complete!" : "Running..."}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <Progress
        value={pct}
        className={`h-2 mb-4 ${
          isWarning ? "bg-[rgb(var(--warn))/20]" : isComplete ? "bg-[rgb(var(--accent-rgb))/20]" : ""
        }`}
      />

      {/* Preset buttons */}
      {!active && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              className={`btn ${
                duration === p.value ? "btn-solid" : "btn-ghost"
              }`}
              onClick={() => {
                setDuration(p.value);
                setCustomInput(String(p.value));
              }}
            >
              {p.label}
            </button>
          ))}
          <div className="col-span-4 flex items-center gap-2">
            <input
              type="number"
              className="input flex-1"
              placeholder="Custom (sec)"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v > 0) setDuration(v);
              }}
              min={1}
            />
            <span className="text-sm text-subtle">seconds</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!active ? (
          <button className="btn btn-solid px-8" onClick={() => start()}>
            <i className="bx bx-play mr-2" />
            Start
          </button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => addTime(-15)} title="-15s">
              <i className="bx bx-minus" />
              15s
            </button>
            <button className="btn btn-ghost" onClick={toggle} title={paused ? "Resume" : "Pause"}>
              <i className={`bx ${paused ? "bx-play" : "bx-pause"}`} />
            </button>
            <button className="btn btn-ghost" onClick={() => addTime(15)} title="+15s">
              <i className="bx bx-plus" />
              15s
            </button>
            <button className="btn btn-danger" onClick={stop} title="Stop">
              <i className="bx bx-stop" />
            </button>
          </>
        )}
      </div>

      {/* Quick actions when timer complete */}
      {isComplete && (
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn btn-solid" onClick={() => start(duration)}>
            <i className="bx bx-refresh mr-1" />
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
