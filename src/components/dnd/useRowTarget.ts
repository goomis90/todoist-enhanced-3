import { useDroppable } from '@dnd-kit/core';
import { useStore } from '@/store/store';
import { canNest, rowTargetId } from '@/domain/dnd';

interface RowTargetOptions {
  /** Another task dropped onto this row can become its subtask. */
  nestable: boolean;
  /** This list is in its own order, so a task dropped on the row takes its place. */
  reorderable: boolean;
}

/**
 * Makes a task row somewhere another task can be dropped.
 *
 * The row answers to two gestures and says which one it is about to take: a
 * line under it for a task arriving in its place, the row itself lit up for a
 * task going inside it. Where the order is not the list's own — a week, a
 * search, anything sorted by date — only the second one is offered, and a
 * straight drag passes through to the group behind, which is still how a task
 * is given a day.
 *
 * A row that cannot take the task stays a target but never lights up, and the
 * drop onto it does nothing: falling through to the group would file the task
 * somewhere nobody aimed.
 */
export function useRowTarget(itemId: string, { nestable, reorderable }: RowTargetOptions) {
  const nesting = useStore((s) => s.nesting);
  const open = useStore((s) => (
    s.draggingTaskId !== null && s.draggingTaskId !== itemId
      && ((nestable && s.nesting) || (reorderable && !s.nesting))
  ));
  const allowed = useStore((s) => (
    nestable && s.nesting && s.draggingTaskId !== null && s.draggingTaskId !== itemId
      && canNest(s.snapshot.items, s.draggingTaskId, itemId)
  ));
  const { setNodeRef, isOver } = useDroppable({ id: rowTargetId(itemId), disabled: !open });

  return {
    setRowRef: setNodeRef,
    /** The task in flight would go inside this row. */
    nestOver: isOver && allowed,
    /** The task in flight would land in this row's place. */
    landing: isOver && !nesting && reorderable,
  };
}
