import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SHORTCUTS = [
  { keys: ["Space"], action: "Complete next set", category: "Sets" },
  { keys: ["S"], action: "Skip / Stop timer", category: "Navigation" },
  { keys: ["←", "→"], action: "Previous / Next exercise", category: "Navigation" },
  { keys: ["+", "="], action: "Add 15 seconds to rest timer", category: "Timer" },
  { keys: ["-", "_"], action: "Subtract 15 seconds from rest timer", category: "Timer" },
  { keys: ["M"], action: "Toggle mute", category: "Audio" },
  { keys: ["Ctrl", "C"], action: "Copy current exercise", category: "Editing", join: true },
  { keys: ["Ctrl", "V"], action: "Paste exercise after current", category: "Editing", join: true },
  { keys: ["Ctrl", "D"], action: "Duplicate current exercise", category: "Editing", join: true },
  { keys: ["⌘", "K"], action: "Open command palette", category: "General", join: true },
  { keys: ["Alt", "C"], action: "Open color scheme editor", category: "General", join: true },
  { keys: ["?"], action: "Show this help", category: "General" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded bg-white/10 border border-white/20 text-xs font-mono font-medium">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase() || "";
      if (["input", "textarea", "select"].includes(tag)) return;
      if (target?.isContentEditable) return;

      if (e.key === "?") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Group shortcuts by category
  const categories = SHORTCUTS.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, typeof SHORTCUTS>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn btn-ghost" title="Keyboard shortcuts (?)">
          <i className="bx bx-keyboard" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md glass rounded-card text-sand shadow-soft border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-sand flex items-center gap-2">
            <i className="bx bx-keyboard" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {Object.entries(categories).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 p-2 rounded bg-white/5"
                  >
                    <span className="text-sm">{shortcut.action}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {shortcut.keys.map((key, j) => (
                        <span key={j} className="flex items-center gap-1">
                          <Kbd>{key}</Kbd>
                          {shortcut.join && j < shortcut.keys.length - 1 && (
                            <span className="text-subtle text-xs">+</span>
                          )}
                          {!shortcut.join && j < shortcut.keys.length - 1 && (
                            <span className="text-subtle text-xs">/</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-subtle text-center mt-2 pt-2 border-t border-white/10">
          Press <Kbd>?</Kbd> anytime to show this help
        </div>
      </DialogContent>
    </Dialog>
  );
}
