import { useEffect, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";

export default function CommandPalette({
  onOpenPlanJson, onOpenColors, onNextExercise, onPrevExercise,
}:{ onOpenPlanJson:()=>void; onOpenColors:()=>void; onNextExercise:()=>void; onPrevExercise:()=>void; }){
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    const down = (e:KeyboardEvent)=>{
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="k"){ e.preventDefault(); setOpen(v=>!v); }
    };
    document.addEventListener("keydown", down);
    return ()=>document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={()=>{ onNextExercise(); setOpen(false); }}>
            Next exercise
          </CommandItem>
          <CommandItem onSelect={()=>{ onPrevExercise(); setOpen(false); }}>
            Previous exercise
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tools">
          <CommandItem onSelect={()=>{ onOpenPlanJson(); setOpen(false); }}>
            Open Plan JSON
          </CommandItem>
          <CommandItem onSelect={()=>{ onOpenColors(); setOpen(false); }}>
            Color scheme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
