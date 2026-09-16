import { useDroppable } from '@dnd-kit/core';
import { useStore } from '@/store/store';
import { canNest, rowTargetId } from '@/domain/dnd';
import { useRowList } from './RowList';

/**
 * Makes a task row somewhere another task can be dropped.
 *
 * The row answers to two gestures and says which one it is about to take: a
 * line at the seam for a task arriving in its place, the same line pushed in
 * to where a subtask starts for a task going inside it. Reordering is offered
 * wherever the list around the row keeps an order it can write — which is
 * every list but a board column — and a straight drag anywhere else passes
 * through to the group behind, which is still how a task is given a day.
 *
 * A row that cannot take the task stays a target but never lights up, and the
 * drop onto it does nothing: falling through to the group would file the task
 * somewhere nobody aimed.
 */
export function useRowTarget(itemId: string, { nestable }: { nestable: boolean }) {
  const list = useRowList();
  const nesting = useStore((s) => s.nesting);
  const open = useStore((s) => (
    s.draggingTaskId !== null && s.draggingTaskId !== itemId
      && ((nestable && s.nesting) || (list !== null && !s.nesting))
  ));
  const allowed = useStore((s) => (
    nestable && s.nesting && s.draggingTaskId !== null && s.draggingTaskId !== itemId
      && canNest(s.snapshot.items, s.draggingTaskId, itemId)
  ));
  const { setNodeRef, isOver } = useDroppable({
    id: rowTargetId(itemId),
    disabled: !open,
    /* Read back when the drop lands: the provider is given a row, and the row
       has to be able to say which list it was a row of. */
    data: { list },
  });

  return {
    setRowRef: setNodeRef,
    /** The task in flight would go inside this row. */
    nestOver: isOver && allowed,
    /** The task in flight would land in this row's place. */
    landing: isOver && !nesting && list !== null,
  };
}
