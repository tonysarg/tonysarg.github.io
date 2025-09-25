import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VARS = [
  { key: "--accent", label: "Accent (R G B)", def: "185 179 154" },
  { key: "--card", label: "Card (R G B)", def: "17 18 20" },
  { key: "--ink", label: "Ink (R G B)", def: "11 11 12" },
  { key: "--warn", label: "Warn (R G B)", def: "216 166 87" },
  { key: "--danger", label: "Danger (R G B)", def: "214 90 90" },
];

export function ThemeFab(){
  return (
    <button id="theme-fab" className="btn btn-ghost" title="Colors (Alt+C)"
      onClick={()=>document.dispatchEvent(new CustomEvent("open-colors"))}>
      <i className="bx bx-palette" />
    </button>
  );
}

export default function ColorsDialog(){
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string,string>>({});

  useEffect(()=>{
    const saved = JSON.parse(localStorage.getItem("hyper-colors") || "{}");
    const next: Record<string,string> = {};
    VARS.forEach(v=>{ next[v.key] = saved[v.key] || getVar(v.key) || v.def; });
    setVals(next); apply(next);
  }, []);

  useEffect(()=>{
    const on = ()=>setOpen(true);
    document.addEventListener("open-colors", on);
    const key = (e:KeyboardEvent)=>{ if (e.altKey && e.key.toLowerCase()==="c") setOpen(true); };
    document.addEventListener("keydown", key);
    return ()=>{ document.removeEventListener("open-colors", on); document.removeEventListener("keydown", key); };
  }, []);

  function getVar(k:string){ return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); }
  function setVar(k:string, v:string){ document.documentElement.style.setProperty(k, v); }
  function apply(map:Record<string,string>){ Object.entries(map).forEach(([k,v])=>setVar(k, v)); }
  function persist(map:Record<string,string>){ localStorage.setItem("hyper-colors", JSON.stringify(map)); }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Color Scheme</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {VARS.map(v=>(
            <div key={v.key}>
              <Label className="text-xs text-slate-300/80 mb-1 block">{v.label}</Label>
              <Input className="font-mono" value={vals[v.key]||""}
                onChange={(e)=>{
                  const map = { ...vals, [v.key]: e.target.value };
                  setVals(map); apply(map);
                }} placeholder={v.def}/>
              <div className="mt-1 text-xs text-slate-400">Example: <code>185 179 154</code></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 justify-end">
          <Button variant="secondary" onClick={()=>{
            const map: Record<string,string> = {}; VARS.forEach(v=> map[v.key] = v.def);
            setVals(map); apply(map); persist(map);
          }}>Reset</Button>
          <Button onClick={()=>persist(vals)}><i className="bx bx-save mr-1" />Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
