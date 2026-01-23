import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";

interface CommandPaletteProps {
  onOpenPlanJson: () => void;
  onOpenColors: () => void;
  onNextExercise: () => void;
  onPrevExercise: () => void;
  onSwitchMode?: (mode: "workout" | "timer") => void;
}

export default function CommandPalette({
  onOpenPlanJson,
  onOpenColors,
  onNextExercise,
  onPrevExercise,
  onSwitchMode,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const muted = useStore((s) => s.muted);
  const setMuted = useStore((s) => s.setMuted);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              document.dispatchEvent(new CustomEvent("ec-complete-next"));
              setOpen(false);
            }}
          >
            <i className="bx bx-check-double mr-2" />
            Complete next set
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setMuted(!muted);
              setOpen(false);
            }}
          >
            <i className={`bx ${muted ? "bx-volume-full" : "bx-volume-mute"} mr-2`} />
            {muted ? "Unmute audio" : "Mute audio"}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => {
              onNextExercise();
              setOpen(false);
            }}
          >
            <i className="bx bx-right-arrow-alt mr-2" />
            Next exercise
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onPrevExercise();
              setOpen(false);
            }}
          >
            <i className="bx bx-left-arrow-alt mr-2" />
            Previous exercise
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Mode">
          <CommandItem
            onSelect={() => {
              onSwitchMode?.("workout");
              setOpen(false);
            }}
          >
            <i className="bx bx-list-check mr-2" />
            Workout tracker
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onSwitchMode?.("timer");
              setOpen(false);
            }}
          >
            <i className="bx bx-timer mr-2" />
            Quick timer
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => {
              onOpenPlanJson();
              setOpen(false);
            }}
          >
            <i className="bx bx-data mr-2" />
            Plan / State JSON
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenColors();
              setOpen(false);
            }}
          >
            <i className="bx bx-palette mr-2" />
            Color scheme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
