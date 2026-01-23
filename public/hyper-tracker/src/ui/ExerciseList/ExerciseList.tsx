import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

import { useStore, Exercise } from "@/store/useStore";
import { parseSets } from "@/utils/sets";

// ------------------ main list ------------------

export default function ExerciseList({
  dayIdx,
  activeIdx,
  onSelect,
}: {
  dayIdx: number;
  activeIdx: number;
  onSelect: (i: number) => void;
}) {
  const plan = useStore((s) => s.plan);
  const reorder = useStore((s) => s.reorderBlock);
  const [filter, setFilter] = useState("");

  const blocks = plan[dayIdx]?.blocks ?? [];
  const ids = useMemo(
    () => blocks.map((_, i) => i),
    [blocks]
  );

  // Filter exercises by name
  const filteredIds = useMemo(() => {
    if (!filter.trim()) return ids;
    const q = filter.toLowerCase();
    return ids.filter((i) => {
      const ex = blocks[i];
      return ex?.name?.toLowerCase().includes(q) ||
             ex?.focus?.toLowerCase().includes(q);
    });
  }, [ids, filter, blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {/* Search/filter input */}
      {blocks.length > 3 && (
        <div className="relative">
          <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            type="text"
            placeholder="Filter exercises..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input pl-9 pr-8 py-2 text-sm w-full"
          />
          {filter && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-subtle hover:text-sand"
              onClick={() => setFilter("")}
            >
              <i className="bx bx-x" />
            </button>
          )}
        </div>
      )}

      {filteredIds.length === 0 && filter ? (
        <div className="text-sm text-subtle text-center py-4">
          No exercises matching "{filter}"
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(e) => {
            setActiveId(e.active.id as number);
            document.body.setAttribute("data-dnd-dragging", "true");
          }}
          onDragEnd={({ active, over }) => {
            setActiveId(null);
            document.body.removeAttribute("data-dnd-dragging");
            if (!over) return;
            const from = active.id as number,
              to = over.id as number;
            if (from !== to) reorder(dayIdx, from, to);
          }}
          onDragCancel={() => {
            setActiveId(null);
            document.body.removeAttribute("data-dnd-dragging");
          }}
        >
          <SortableContext items={filteredIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filteredIds.map((i) => (
                <Row
                  key={i}
                  id={i}
                  dayIdx={dayIdx}
                  active={i === activeIdx}
                  onClick={() => onSelect(i)}
                />
              ))}
            </div>
          </SortableContext>

          {createPortal(
            <DragOverlay dropAnimation={null}>
              {activeId != null ? (
                <RowGhost id={activeId} dayIdx={dayIdx} />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      )}
    </div>
  );
}

// ------------------ sortable row ------------------

function Row({
  id,
  dayIdx,
  active,
  onClick,
}: {
  id: number;
  dayIdx: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const d = useStore((s) => s.plan[dayIdx]);
  const prog = useStore((s) => s.progress);
  const ex = d.blocks[id];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = { transform: CSS.Translate.toString(transform), transition };

  const setsObj = prog[d.dayKey]?.[ex.id]?.sets || {};
  const doneCount = Object.values(setsObj).filter(Boolean).length;
  const total = parseSets(ex.sets);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full glass rounded-md p-3 ${
        active
          ? "ring-2 ring-[rgb(var(--accent-rgb))]"
          : "hover:bg-white/5"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <RowInner
        ex={ex}
        doneCount={doneCount}
        total={total}
        dayIdx={dayIdx}
        exIdx={id}
      />
    </div>
  );
}

// ------------------ ghost row ------------------

function RowGhost({ id, dayIdx }: { id: number; dayIdx: number }) {
  const d = useStore((s) => s.plan[dayIdx]);
  const prog = useStore((s) => s.progress);
  const ex = d.blocks[id];
  const setsObj = prog[d.dayKey]?.[ex.id]?.sets || {};
  const doneCount = Object.values(setsObj).filter(Boolean).length;
  const total = parseSets(ex.sets);

  return (
    <div className="fixed top-0 left-0 w-[300px] z-[9999] cursor-grabbing pointer-events-none">
      <RowInner
        ex={ex}
        doneCount={doneCount}
        total={total}
        dayIdx={dayIdx}
        exIdx={id}
        ghost
      />
    </div>
  );
}

// ------------------ shared inner row ------------------

function RowInner({
  ex,
  doneCount,
  total,
  dayIdx,
  exIdx,
  ghost,
}: {
  ex: Exercise;
  doneCount: number;
  total: number;
  dayIdx: number;
  exIdx: number;
  ghost?: boolean;
}) {
  return (
    <div
      className={`w-full rounded-md p-3 ${
        ghost ? "shadow-xl bg-soil text-sand" : ""
      }`}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-start gap-2">
          <button
            className="drag-handle btn"
            title="Drag"
            disabled={ghost}
          >
            <i className="bx bx-grid-vertical" />
          </button>
          <div>
            <div className="font-medium">{ex.name}</div>
            <div className="text-xs text-subtle">
              {ex.sets || ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`pill ${
              doneCount === total && total > 0
                ? "bg-[rgb(var(--accent-rgb))] text-[rgb(var(--ink))]"
                : "bg-[rgb(var(--card-rgb))]"
            }`}
          >
            {total ? `${doneCount}/${total}` : "—"}
          </span>
          {!ghost && (
            <button
              className="btn btn-ghost"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                document.dispatchEvent(
                  new CustomEvent("open-ex-editor", {
                    detail: { dayIdx, exIdx, exId: ex.id },
                  })
                );
              }}
            >
              <i className="bx bx-edit-alt" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
