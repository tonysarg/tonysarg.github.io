import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ExerciseLookup from "@/ui/components/ExerciseLookup";
import { ExerciseSuggestion } from "@/data/exerciseDatabase";

import {
  AlertDialog as Confirm,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as ConfirmFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ExerciseEditorDialog({
  dayIdx,
  exIdx,
  exId,
}: {
  dayIdx: number;
  exIdx: number;
  exId?: string;
}) {
  const plan = useStore((s) => s.plan);
  const setPlan = useStore((s) => s.setPlan);

  const d = plan[dayIdx];

  // --- resolve index from id (stable across reorders) ---
  const resolveIdxFromId = (id: string | undefined) => {
    if (id == null) return -1;
    const blocks = d?.blocks || [];
    return blocks.findIndex((b) => b.id === id);
  };

  // Keep a local idx that tracks whichever source is most reliable.
  const [idx, setIdx] = useState(() => {
    const byId = resolveIdxFromId(exId);
    return byId >= 0 ? byId : exIdx;
  });

  const [open, setOpen] = useState(false);

  // Local fields
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [tempo, setTempo] = useState("");
  const [cue, setCue] = useState("");
  const [focus, setFocus] = useState("Hypertrophy");

  // When parent props change (e.g., user changes selection), re-resolve.
  useEffect(() => {
    const byId = resolveIdxFromId(exId);
    setIdx(byId >= 0 ? byId : exIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayIdx, exIdx, exId, plan]);

  // Handle list "Edit" button (custom event)
  useEffect(() => {
    const handler = (e: CustomEvent<{ dayIdx: number; exIdx: number; exId?: string }>) => {
      if (e.detail.dayIdx !== dayIdx) return;
      const incomingId = e.detail.exId;
      const byId = resolveIdxFromId(incomingId);
      setIdx(byId >= 0 ? byId : e.detail.exIdx);
      setOpen(true);
    };
    document.addEventListener("open-ex-editor", handler as EventListener);
    return () => document.removeEventListener("open-ex-editor", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayIdx, plan]);

  // Refresh form when dialog opens or idx changes
  useEffect(() => {
    if (!open) return;
    const fresh = d?.blocks[idx];
    setName(fresh?.name || "");
    setSets(fresh?.sets || "");
    setTempo(fresh?.tempo || "");
    setCue(fresh?.cue || "");
    setFocus(fresh?.focus || "Hypertrophy");
  }, [open, dayIdx, idx, d]);

  // Also ensure clicking the dialog trigger uses the latest mapping
  function openFromHeaderButton() {
    const byId = resolveIdxFromId(exId);
    setIdx(byId >= 0 ? byId : exIdx);
    setOpen(true);
  }

  // Early return AFTER all hooks
  if (!d) return null;

  const ex = d.blocks[idx];

  function handleExerciseSelect(exercise: ExerciseSuggestion) {
    // Auto-fill defaults when selecting from suggestions
    if (exercise.defaultSets && !sets) setSets(exercise.defaultSets);
    if (exercise.defaultFocus) setFocus(exercise.defaultFocus);
  }

  function save() {
    if (!name.trim()) {
      toast.error("Exercise name is required");
      return;
    }
    const clone = structuredClone(plan);
    const e = clone[dayIdx].blocks[idx];
    e.name = name.trim();
    e.sets = sets.trim();
    e.tempo = tempo.trim();
    e.cue = cue.trim();
    e.focus = focus.trim();
    setPlan(clone);
    setOpen(false);
    toast.success(`Saved "${name.trim()}"`);
  }
  function reallyRemove() {
    const removedName = ex?.name || "Exercise";
    const clone = structuredClone(plan);
    clone[dayIdx].blocks.splice(idx, 1);
    setPlan(clone);
    setOpen(false);
    toast.success(`Deleted "${removedName}"`);
  }

  function handleDuplicate() {
    const duplicated = useStore.getState().duplicateExercise(dayIdx, idx);
    if (duplicated) {
      toast.success(`Duplicated "${ex?.name}"`);
      setOpen(false);
    }
  }

  function handleCopy() {
    const copied = useStore.getState().copyExercise(dayIdx, idx);
    if (copied) {
      toast.success(`Copied "${copied.name}" to clipboard`);
    }
  }

  function handleMoveToDay(toDayIdx: number) {
    if (toDayIdx === dayIdx) return;
    const moved = useStore.getState().moveExerciseToDay(dayIdx, idx, toDayIdx);
    if (moved) {
      const targetDay = plan[toDayIdx];
      toast.success(`Moved "${ex?.name}" to ${targetDay.title}`);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn btn-ghost" onClick={openFromHeaderButton}>
          <i className="bx bx-edit-alt mr-1" />
          Edit
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl glass rounded-card text-sand shadow-soft border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-sand">Edit Exercise</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label htmlFor="edit-name" className="text-sand/90">
              Name
            </Label>
            <ExerciseLookup
              id="edit-name"
              value={name}
              onChange={setName}
              onSelect={handleExerciseSelect}
              placeholder="Search exercises..."
              className="input bg-soil/80 text-sand border-white/10 placeholder:text-[rgb(var(--ink)/0.5)]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sets" className="text-sand/90">
                Sets × Reps
              </Label>
              <Input
                id="sets"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="e.g., 3×8–10"
                className="bg-soil/80 text-sand border-white/10 placeholder:text-[rgb(var(--ink)/0.5)]"
              />
            </div>
            <div>
              <Label className="text-sand/90">Focus</Label>
              <Select value={focus} onValueChange={setFocus}>
                <SelectTrigger className="bg-soil/80 text-sand border-white/10">
                  <SelectValue placeholder="Focus" />
                </SelectTrigger>
                <SelectContent className="bg-card text-sand border border-white/10">
                  {["Strength", "Hypertrophy", "Isolation", "Prehab", "Rehab"].map(
                    (x) => (
                      <SelectItem
                        key={x}
                        value={x}
                        className="data-[highlighted]:bg-soil data-[highlighted]:text-sand"
                      >
                        {x}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tempo" className="text-sand/90">
              Tempo
            </Label>
            <Input
              id="tempo"
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
              placeholder="Lower 2s, pause 1s, lift 1s"
              className="bg-soil/80 text-sand border-white/10 placeholder:text-[rgb(var(--ink)/0.5)]"
            />
          </div>

          <div>
            <Label htmlFor="cue" className="text-sand/90">
              Key Cue
            </Label>
            <Textarea
              id="cue"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="Elbows tucked"
              className="bg-soil/80 text-sand border-white/10 placeholder:text-[rgb(var(--ink)/0.5)]"
            />
          </div>
          {/* Move to Day */}
          {plan.length > 1 && (
            <div>
              <Label className="text-sand/90">Move to Day</Label>
              <Select
                value={String(dayIdx)}
                onValueChange={(v) => handleMoveToDay(parseInt(v, 10))}
              >
                <SelectTrigger className="bg-soil/80 text-sand border-white/10">
                  <SelectValue placeholder="Select day..." />
                </SelectTrigger>
                <SelectContent className="bg-card text-sand border border-white/10">
                  {plan.map((day, i) => (
                    <SelectItem
                      key={day.dayKey}
                      value={String(i)}
                      disabled={i === dayIdx}
                      className="data-[highlighted]:bg-soil data-[highlighted]:text-sand"
                    >
                      {day.title} {i === dayIdx ? "(current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="text-xs text-subtle">
            {plan[dayIdx].title} · #{idx + 1}
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <div className="flex gap-2 flex-1">
            <Confirm>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <i className="bx bx-trash mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass rounded-card text-sand border border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sand">
                    Delete "{ex?.name}"?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sand/80">
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <ConfirmFooter>
                  <AlertDialogCancel className="bg-soil text-sand border border-white/10 hover:bg-soil/80">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={reallyRemove}>Delete</AlertDialogAction>
                </ConfirmFooter>
              </AlertDialogContent>
            </Confirm>
            <Button variant="secondary" size="sm" onClick={handleCopy} title="Copy to clipboard (Ctrl+C)">
              <i className="bx bx-copy mr-1" />
              Copy
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDuplicate} title="Duplicate exercise (Ctrl+D)">
              <i className="bx bx-duplicate mr-1" />
              Duplicate
            </Button>
          </div>
          <Button onClick={save}>
            <i className="bx bx-save mr-1" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}