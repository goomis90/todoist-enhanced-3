export type RelativePosition = 'before' | 'after';

/** Move one id immediately before or after another without losing siblings. */
export function reorderRelative(
  ids: string[],
  from: string,
  target: string,
  position: RelativePosition,
): string[] {
  if (from === target || !ids.includes(from) || !ids.includes(target)) return ids;
  const next = ids.filter((id) => id !== from);
  const targetIndex = next.indexOf(target);
  next.splice(targetIndex + (position === 'after' ? 1 : 0), 0, from);
  return next;
}

/** Move an id into a seam numbered against the list before the id is removed. */
export function reorderAtSlot(ids: string[], from: string, slot: number): string[] {
  const source = ids.indexOf(from);
  if (source < 0 || !Number.isFinite(slot)) return ids;
  const next = ids.filter((id) => id !== from);
  const adjusted = slot > source ? slot - 1 : slot;
  next.splice(Math.max(0, Math.min(adjusted, next.length)), 0, from);
  return next;
}

/**
 * Read a Todoist-style row drop: upper half is before, lower half is after.
 * At the exact centre, movement direction breaks the tie so dragging a lower
 * row onto an upper one and the reverse can never both resolve to a no-op.
 */
export function relativePositionFromCenters(
  sourceIndex: number,
  targetIndex: number,
  activeCenter: number | null,
  targetCenter: number,
): RelativePosition {
  if (activeCenter === null || Math.abs(activeCenter - targetCenter) < 1) {
    return sourceIndex < targetIndex ? 'after' : 'before';
  }
  return activeCenter > targetCenter ? 'after' : 'before';
}

/** Immutable parent change shared by optimistic project nesting and tests. */
export function patchParent<T extends { id: string; parent_id: string | null }>(
  records: Record<string, T>,
  id: string,
  parentId: string | null,
): Record<string, T> {
  const current = records[id];
  return current
    ? { ...records, [id]: { ...current, parent_id: parentId } }
    : records;
}
