import { useState } from "react";
import { useStore } from "@/store/useStore";
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
import { toast } from "sonner";
import ExerciseLookup from "@/ui/components/ExerciseLookup";
import { ExerciseSuggestion } from "@/data/exerciseDatabase";

export default function AddExerciseDialog({ dayIdx }: { dayIdx: number }) {
  const plan = useStore((s) => s.plan);
  const addExercise = useStore((s) => s.addExercise);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sets, setSets] = useState("3×8–12");
  const [tempo, setTempo] = useState("");
  const [cue, setCue] = useState("");
  const [focus, setFocus] = useState("Hypertrophy");

  const d = plan[dayIdx];
  if (!d) return null;

  function resetForm() {
    setName("");
    setSets("3×8–12");
    setTempo("");
    setCue("");
    setFocus("Hypertrophy");
  }

  function handleExerciseSelect(exercise: ExerciseSuggestion) {
    // Auto-fill defaults from the database
    if (exercise.defaultSets) setSets(exercise.defaultSets);
    if (exercise.defaultFocus) setFocus(exercise.defaultFocus);
  }

  function handleAdd() {
    if (!name.trim()) {
      toast.error("Exercise name is required");
      return;
    }

    const newId = `${d.dayKey}-${Date.now()}`;
    addExercise(dayIdx, {
      id: newId,
      name: name.trim(),
      sets: sets.trim(),
      tempo: tempo.trim(),
      cue: cue.trim(),
      focus: focus.trim(),
    });

    toast.success(`Added "${name.trim()}"`);
    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <button className="btn btn-ghost">
          <i className="bx bx-plus mr-1" />
          Add Exercise
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl glass rounded-card text-sand shadow-soft border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-sand">Add New Exercise</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label htmlFor="add-name" className="text-sand/90">
              Name *
            </Label>
            <ExerciseLookup
              id="add-name"
              value={name}
              onChange={setName}
              onSelect={handleExerciseSelect}
              placeholder="Search exercises... (e.g., Bench Press)"
              className="input bg-soil/80 text-sand border-white/10 placeholder:text-[rgb(var(--ink)/0.5)]"
            />
            <div className="text-xs text-subtle mt-1">
              Type to search 100+ exercises or enter custom name
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="add-sets" className="text-sand/90">
                Sets × Reps
              </Label>
              <Input
                id="add-sets"
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
            <Label htmlFor="add-tempo" className="text-sand/90">
              Tempo
            </Label>
            <Input
              id="add-tempo"
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
              placeholder="Lower 2s, pause 1s, lift 1s"
              className="bg-soil/80 text-sand border-white/10 placeholder:text-[rgb(var(--ink)/0.5)]"
            />
          </div>

          <div>
            <Label htmlFor="add-cue" className="text-sand/90">
              Key Cue
            </Label>
            <Textarea
              id="add-cue"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="Elbows tucked, squeeze at top"
              className="bg-soil/80 text-sand border-white/10 placeholder:text-[rgb(var(--ink)/0.5)]"
            />
          </div>

          <div className="text-xs text-subtle">
            Adding to: {d.title}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>
            <i className="bx bx-plus mr-1" />
            Add Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
