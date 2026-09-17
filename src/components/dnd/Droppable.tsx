import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import { encodeTarget, type DropTarget } from '@/domain/dnd';
import { useStore } from '@/store/store';

interface DroppableProps {
  target: DropTarget;
  /**
   * Distinguishes two places that offer the same destination — the sidebar's
   * "My week" and the page's "Anytime this week" are both `anytime`, and a
   * droppable registry keyed by id would keep only one of them.
   */
  scope?: string;
  /**
   * Turns the destination off for the duration of a drag it has no answer
   * for. A sidebar project row is both a destination and a position in a
   * list, and only one of those readings applies to what is in flight.
   */
  disabled?: boolean;
  children: (props: { isOver: boolean }) => ReactNode;
}

/**
 * What each kind of thing in flight can actually land on.
 *
 * A destination that lights up under something it cannot take is a promise
 * the drop then breaks — a tag carried over a project row offered to file
 * itself there, and there is no such thing as a tag on a project. Deciding it
 * here rather than at each destination means a new kind of drag cannot forget
 * one: everything is refused until it is listed.
 *
 * A task is left out on purpose. Its destinations are the whole of this table
 * everywhere else in the app, which is to say all of them.
 */
const LANDS_ON: Record<'project' | 'tag', ReadonlyArray<DropTarget['kind']>> = {
  /* A project goes into a folder, onto another project to be nested, or into
     Favourites. */
  project: ['project', 'favourites'],
  // A tag goes one place only.
  tag: ['favourites'],
};

/** Marks a region as a destination, and tells its child when a task is over it. */
export function Droppable({ target, scope, disabled = false, children }: DroppableProps) {
  const draggingProject = useStore((s) => s.draggingProjectId !== null);
  const draggingTag = useStore((s) => s.draggingTag !== null);

  const carrying = draggingProject ? 'project' : draggingTag ? 'tag' : null;
  const refuses = carrying !== null && !LANDS_ON[carrying].includes(target.kind);

  const off = disabled || refuses;
  const { setNodeRef, isOver } = useDroppable({ id: encodeTarget(target, scope), disabled: off });
  return <div ref={setNodeRef}>{children({ isOver: isOver && !off })}</div>;
}
