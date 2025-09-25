import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogOverlay,
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
  exId,             // NEW
}: {
  dayIdx: number;
  exIdx: number;
  exId?: string | number; // NEW
}) {
  const plan = useStore((s) => s.plan);
  const setPlan = useStore((s) => s.setPlan);

  // --- resolve index from id (stable across reorders) ---
  function resolveIdxFromId(id: string | number | undefined) {
    if (id == null) return -1;
    const blocks = plan[dayIdx]?.blocks || [];
    return blocks.findIndex((b: any) => b.id === id);
  }

  // Keep a local idx that tracks whichever source is most reliable.
  const [idx, setIdx] = useState(() => {
    const byId = resolveIdxFromId(exId);
    return byId >= 0 ? byId : exIdx;
  });

  const [open, setOpen] = useState(false);

  // When parent props change (e.g., user changes selection), re-resolve.
  useEffect(() => {
    const byId = resolveIdxFromId(exId);
    setIdx(byId >= 0 ? byId : exIdx);
  }, [dayIdx, exIdx, exId, plan]);

  // Handle list “Edit” button (custom event)
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail.dayIdx !== dayIdx) return;
      const incomingId = e.detail.exId as string | number | undefined;
      const byId = resolveIdxFromId(incomingId);
      setIdx(byId >= 0 ? byId : e.detail.exIdx);
      setOpen(true);
    };
    document.addEventListener("open-ex-editor", handler as any);
    return () => document.removeEventListener("open-ex-editor", handler as any);
  }, [dayIdx, plan]);

  // Also ensure clicking the dialog trigger uses the latest mapping
  function openFromHeaderButton() {
    const byId = resolveIdxFromId(exId);
    setIdx(byId >= 0 ? byId : exIdx);
    setOpen(true);
  }

  const d = plan[dayIdx];
  if (!d) return null;
  const ex = d.blocks[idx];

  // Local fields
  const [name, setName]   = useState(ex?.name ?? "");
  const [sets, setSets]   = useState(ex?.sets ?? "");
  const [tempo, setTempo] = useState(ex?.tempo ?? "");
  const [cue, setCue]     = useState(ex?.cue ?? "");
  const [focus, setFocus] = useState(ex?.focus ?? "Hypertrophy");

  // Refresh form when dialog opens or idx changes
  useEffect(() => {
    if (!open) return;
    const fresh = plan[dayIdx].blocks[idx];
    setName(fresh?.name || "");
    setSets(fresh?.sets || "");
    setTempo(fresh?.tempo || "");
    setCue(fresh?.cue || "");
    setFocus(fresh?.focus || "Hypertrophy");
  }, [open, dayIdx, idx, plan]);

  function save() {
    const clone = structuredClone(plan);
    const e = clone[dayIdx].blocks[idx];
    e.name = name.trim();
    e.sets = sets.trim();
    e.tempo = tempo.trim();
    e.cue = cue.trim();
    e.focus = focus.trim();
    setPlan(clone);
    setOpen(false);
  }
  function reallyRemove() {
    const clone = structuredClone(plan);
    clone[dayIdx].blocks.splice(idx, 1);
    setPlan(clone);
    setOpen(false);
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
            <Label htmlFor="name" className="text-sand/90">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-soil/80 text-sand border-white/10 placeholder:text-slate-400"
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
                className="bg-soil/80 text-sand border-white/10 placeholder:text-slate-400"
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
              className="bg-soil/80 text-sand border-white/10 placeholder:text-slate-400"
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
              className="bg-soil/80 text-sand border-white/10 placeholder:text-slate-400"
            />
          </div>
        <div className="text-xs text-slate-400">
          {plan[dayIdx].title} · #{idx + 1}
        </div>
        </div>

        <DialogFooter className="justify-between">
          <Confirm>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <i className="bx bx-trash mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass rounded-card text-sand border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-sand">
                  Delete “{ex?.name}”?
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
 <Button onClick={save}>
            <i className="bx bx-save mr-1" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}