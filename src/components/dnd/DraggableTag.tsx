import type { ReactNode } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useStore } from '@/store/store';

/** The id a tag row registers under while it is being dragged. */
export const TAG_DRAG_PREFIX = 'tag-row:';

/** And the id it answers to as a place another tag can be dropped. */
export const TAG_DROP_PREFIX = 'tag-slot:';

/**
 * A tag row that can be picked up.
 *
 * A tag was only ever a destination in this app — somewhere to drop a task —
 * and never a thing you could pick up yourself, which made Favourites the one
 * list you could not put a tag into by dragging. It has exactly one place to
 * go, so this is deliberately not a sortable: a tag has no position of its
 * own to be moved to, and the only drop that means anything is the Favourites
 * heading.
 *
 * The row stays a droppable for tasks — that is the wrapper around this one —
 * so a tag is now both, the same way a sidebar project row already was.
 */
export function DraggableTag({ name, children }: { name: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${TAG_DRAG_PREFIX}${name}`,
  });
  /* While a task is in flight this row is a place to file it, not a thing to
     pick up — the same rule the project rows follow, and for the same reason:
     both readings of one row cannot be live at once. */
  const taskDragging = useStore((s) => s.draggingTaskId !== null);

  if (taskDragging) return <div className="navrow">{children}</div>;

  return (
    <div
      ref={setNodeRef}
      className={`navrow sortable${isDragging ? ' lifting' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

/**
 * The order the tags are drawn in, for a drop to splice into.
 *
 * A tag row is both ends of a drag: something to pick up, and somewhere to
 * put another one down. The page hands each row the whole order rather than
 * the provider going back to the store for it, because the order on the
 * screen is the one the drop is about — the same rule the task lists follow.
 */
const tagOrder = new Map<string, string[]>();

export const tagOrderFor = (name: string): string[] => tagOrder.get(name) ?? [];

export function useTagDrag(name: string, order: string[]) {
  tagOrder.set(name, order);

  const id = `${TAG_DRAG_PREFIX}${name}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `${TAG_DROP_PREFIX}${name}` });

  return {
    grip: { ...attributes, ...listeners },
    row: (node: HTMLElement | null) => { setNodeRef(node); setDropRef(node); },
    isDragging,
    isOver: isOver && !isDragging,
  };
}
