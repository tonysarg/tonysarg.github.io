import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FullState = {
  plan: any;
  progress?: any;
  restOverrides?: any;
  muted?: boolean;
  _schema?: "full-state-v1";
};

export default function PlanJsonDialog() {
  const getState = useStore.getState;
  const setPlan = useStore((s) => s.setPlan);
  const replaceProgress = useStore((s) => s.replaceProgress);
  const replaceRestOverrides = useStore((s) => s.replaceRestOverrides);
  const setMuted = useStore((s) => s.setMuted);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function exportFull(): string {
    const snap: FullState = {
      plan: getState().plan,
      progress: getState().progress,
      restOverrides: getState().restOverrides,
      muted: getState().muted,
      _schema: "full-state-v1",
    };
    return JSON.stringify(snap, null, 2);
  }

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function reloadFromPlanJson() {
    try {
      const url = new URL("plan.json", import.meta.env.BASE_URL).toString();
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setText(JSON.stringify(j, null, 2));
      toast.success("Reloaded plan.json");
    } catch (e) {
      toast.error("Failed to load plan.json");
    }
  }

  function applyFromText() {
    try {
      const parsed = JSON.parse(text) as FullState | { plan: any[] };

      // Accept both full-state and legacy { plan } only
      if (!parsed || !("plan" in parsed)) throw new Error("Invalid JSON shape");

      setPlan((parsed as any).plan);

      if ("progress" in parsed && (parsed as any).progress) {
        replaceProgress((parsed as any).progress);
      }
      if ("restOverrides" in parsed && (parsed as any).restOverrides) {
        replaceRestOverrides((parsed as any).restOverrides);
      }
      if ("muted" in parsed && typeof (parsed as any).muted === "boolean") {
        setMuted((parsed as any).muted);
      }

      setOpen(false);
      toast.success(
        "Applied " +
          (parsed && (parsed as FullState)._schema === "full-state-v1"
            ? "full state"
            : "plan")
      );
    } catch {
      toast.error(
        "Invalid JSON. Expecting `{ plan, progress, restOverrides, muted }` or legacy `{ plan }`."
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setText(exportFull());
      }}
    >
      <DialogTrigger asChild>
        <button className="btn btn-ghost" data-planjson-trigger>
          <i className="bx bx-data mr-1" />
          Plan JSON
        </button>
      </DialogTrigger>

      <DialogOverlay className="bg-ink/98" />

      <DialogContent className="sm:max-w-3xl glass rounded-card text-sand shadow-soft border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-sand">Plan / State JSON</DialogTitle>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-72 font-mono bg-soil/80 text-sand border-white/10 placeholder:text-slate-400"
          spellCheck={false}
        />

        <DialogFooter className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="bg-soil text-sand border border-white/10 hover:bg-soil/80"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text);
                  toast.success("Copied to clipboard");
                } catch {
                  toast.error("Copy failed");
                }
              }}
            >
              <i className="bx bx-copy mr-1" />
              Copy
            </Button>

            <Button
              variant="secondary"
              className="bg-soil text-sand border border-white/10 hover:bg-soil/80"
              onClick={() => {
                download("plan-state-export.json", text);
                toast.success("Downloaded");
              }}
            >
              <i className="bx bx-download mr-1" />
              Download
            </Button>

            <label className="btn btn-ghost cursor-pointer">
              <i className="bx bx-upload mr-1" />
              Load File
              <input
                type="file"
                accept="application/json"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const fr = new FileReader();
                  fr.onload = () => {
                    setText(String(fr.result || ""));
                    toast.success("Loaded file");
                  };
                  fr.readAsText(f);
                }}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="bg-soil text-sand border border-white/10 hover:bg-soil/80"
              onClick={reloadFromPlanJson}
            >
              <i className="bx bx-reset mr-1" />
              Reload plan.json
            </Button>

            <Button className="btn btn-solid" onClick={applyFromText}>
              <i className="bx bx-check mr-1" />
              Apply (Replace)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
