import { useState } from "react";
import { History } from "@/store/useStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HistoryDialogProps {
  exerciseName: string;
  history: History[];
}

export default function HistoryDialog({ exerciseName, history }: HistoryDialogProps) {
  const [open, setOpen] = useState(false);

  const hasHistory = history && history.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn btn-ghost">
          <i className="bx bx-time-five mr-1" />
          History
          {hasHistory && (
            <span className="ml-1 text-xs opacity-70">({history.length})</span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg glass rounded-card text-sand shadow-soft border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-sand">
            <i className="bx bx-history mr-2" />
            History: {exerciseName}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto">
          {!hasHistory ? (
            <div className="text-center py-8 text-subtle">
              <i className="bx bx-info-circle text-3xl mb-2" />
              <p>No history yet.</p>
              <p className="text-xs mt-1">
                Enter weight/reps and complete a set to start tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 20).map((entry, i) => {
                const date = new Date(entry.ts);
                const dateStr = date.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const timeStr = date.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <div
                    key={entry.ts}
                    className={`p-3 rounded-md ${
                      i === 0
                        ? "bg-[rgb(var(--accent-rgb))/0.15] border border-[rgb(var(--accent-rgb))/0.3]"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold">
                          {entry.weight || "—"}
                        </div>
                        <span className="text-subtle">×</span>
                        <div className="text-lg font-semibold">
                          {entry.reps || "—"}
                        </div>
                      </div>
                      <div className="text-right text-xs text-subtle">
                        {isToday ? (
                          <span className="text-[rgb(var(--accent-rgb))]">Today</span>
                        ) : (
                          dateStr
                        )}
                        <span className="block">{timeStr}</span>
                      </div>
                    </div>
                    {i === 0 && (
                      <div className="text-xs text-[rgb(var(--accent-rgb))] mt-1">
                        Most recent
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasHistory && history.length > 20 && (
          <div className="text-xs text-subtle text-center mt-2">
            Showing latest 20 of {history.length} entries
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
