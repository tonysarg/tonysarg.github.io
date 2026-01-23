import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";

const VARS = [
  // Use --accent-rgb instead of --accent. --accent-rgb controls the RGB triplet
  // for the warm golden accent defined in tokens.css. The default reflects the
  // new unified accent hue.
  { key: "--accent-rgb", label: "Accent (R G B)", def: "231 140 0" },
  { key: "--card", label: "Card (R G B)", def: "17 18 20" },
  { key: "--ink", label: "Ink (R G B)", def: "11 11 12" },
  { key: "--warn", label: "Warn (R G B)", def: "216 166 87" },
  { key: "--danger", label: "Danger (R G B)", def: "214 90 90" },
];

export function ThemeFab() {
  return (
    <button
      id="theme-fab"
      className="btn btn-ghost"
      title="Colors (Alt+C)"
      onClick={() => document.dispatchEvent(new CustomEvent("open-colors"))}
    >
      <i className="bx bx-palette" />
    </button>
  );
}

export default function ColorsDialog() {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const storeColors = useStore((s) => s.colors);
  const setStoreColors = useStore((s) => s.setColors);

  // Initialize colors from store or CSS defaults
  useEffect(() => {
    const next: Record<string, string> = {};
    VARS.forEach((v) => {
      next[v.key] = storeColors[v.key] || getVar(v.key) || v.def;
    });
    setVals(next);
    apply(next);
  }, [storeColors]);

  useEffect(() => {
    const on = () => setOpen(true);
    document.addEventListener("open-colors", on);
    const key = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "c") setOpen(true);
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("open-colors", on);
      document.removeEventListener("keydown", key);
    };
  }, []);

  function getVar(k: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  }
  function setVar(k: string, v: string) {
    document.documentElement.style.setProperty(k, v);
  }
  function apply(map: Record<string, string>) {
    Object.entries(map).forEach(([k, v]) => setVar(k, v));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Color Scheme</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {VARS.map((v) => (
            <div key={v.key}>
              <Label className="text-xs text-subtle mb-1 block">{v.label}</Label>
              <Input
                className="font-mono"
                value={vals[v.key] || ""}
                onChange={(e) => {
                  const map = { ...vals, [v.key]: e.target.value };
                  setVals(map);
                  apply(map);
                }}
                placeholder={v.def}
              />
              <div className="mt-1 text-xs text-subtle">
                Example: <code>231&nbsp;140&nbsp;0</code>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              const map: Record<string, string> = {};
              VARS.forEach((v) => (map[v.key] = v.def));
              setVals(map);
              apply(map);
              setStoreColors(map);
            }}
          >
            Reset
          </Button>
          <Button onClick={() => setStoreColors(vals)}>
            <i className="bx bx-save mr-1" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
