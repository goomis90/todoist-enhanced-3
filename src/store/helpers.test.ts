import { describe, expect, it } from 'vitest';
import { branchOf, deletionRoots, restoreOrder } from './helpers';
import type { Item } from '@/domain/types';
import { item } from '@/test/items';

const tree = (...items: Item[]): Record<string, Item> =>
  Object.fromEntries(items.map((entry) => [entry.id, entry]));

const items = tree(
  item({ id: 'grand' }),
  item({ id: 'parent', parent_id: 'grand' }),
  item({ id: 'child', parent_id: 'parent' }),
  item({ id: 'other-child', parent_id: 'parent' }),
  item({ id: 'lone' }),
  item({ id: 'gone', parent_id: 'lone', is_deleted: true }),
);

describe('deletionRoots (#126)', () => {
  it('drops a subtask picked together with its parent', () => {
    expect(deletionRoots(['child', 'parent'], items)).toEqual(['parent']);
  });

  it('keeps unrelated tasks, in the order they were given', () => {
    expect(deletionRoots(['lone', 'parent'], items)).toEqual(['lone', 'parent']);
  });

  it('keeps only the grandparent when a grandchild is picked with it', () => {
    expect(deletionRoots(['child', 'grand'], items)).toEqual(['grand']);
    expect(deletionRoots(['child', 'parent', 'grand'], items)).toEqual(['grand']);
  });

  it('keeps a subtask whose parent was not picked', () => {
    expect(deletionRoots(['child', 'lone'], items)).toEqual(['child', 'lone']);
  });

  it('counts an id given twice once, and drops one it does not know', () => {
    expect(deletionRoots(['lone', 'lone', 'ghost'], items)).toEqual(['lone']);
  });

  it('does not hang on a cycle', () => {
    const loop = tree(item({ id: 'a', parent_id: 'b' }), item({ id: 'b', parent_id: 'a' }));
    expect(deletionRoots(['a'], loop)).toEqual(['a']);
  });
});

describe('branchOf (#126)', () => {
  it('lists a branch parent first, each task once', () => {
    const ids = branchOf(['grand'], items).map((entry) => entry.id);
    expect(ids).toEqual(['grand', 'parent', 'child', 'other-child']);
  });

  it('does not repeat a task that is both a root and a descendant', () => {
    const ids = branchOf(['grand', 'child'], items).map((entry) => entry.id);
    expect(ids).toEqual(['grand', 'parent', 'child', 'other-child']);
  });

  it('skips tasks that are already deleted', () => {
    expect(branchOf(['lone'], items).map((entry) => entry.id)).toEqual(['lone']);
  });

  it('gives back nothing for an id that does not exist', () => {
    expect(branchOf(['ghost'], items)).toEqual([]);
  });
});

describe('restoreOrder (#126)', () => {
  it('lists each task once and leaves the order alone', () => {
    const branch = branchOf(['grand'], items);
    const doubled = [...branch, items.child, items.parent];
    expect(restoreOrder(doubled).map((entry) => entry.id))
      .toEqual(['grand', 'parent', 'child', 'other-child']);
  });
});
