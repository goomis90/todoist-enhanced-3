import { createContext, useContext } from 'react';
import type { DropTarget, RowOrder } from '@/domain/dnd';

/**
 * The list a row is drawn in, for the rows themselves to read.
 *
 * A row on its own cannot answer what dropping a task onto it should do: the
 * order it would take a place in belongs to the list, and so does what the
 * list itself means — a day, a tag, a section. The group hands both down, and
 * a row without a list around it simply does not take that drop.
 */
export interface RowList {
  /** Which of Todoist's two numbers this list is kept in. */
  order: RowOrder;
  /** The tasks in it, in the order they are drawn. */
  ids: string[];
  /** What the list is, so a task arriving from another one takes it on. */
  target?: DropTarget;
  /**
   * The page this list is drawn on.
   *
   * Putting a task in a place by hand is how you ask a view for an order of
   * your own, so the drop has to be able to say which view was asked.
   */
  viewKey?: string;
}

export const RowListContext = createContext<RowList | null>(null);

export const useRowList = (): RowList | null => useContext(RowListContext);
