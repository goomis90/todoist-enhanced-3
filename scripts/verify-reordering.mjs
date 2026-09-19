import assert from 'node:assert/strict';
import {
  patchParent, relativePositionFromCenters, reorderAtSlot, reorderRelative,
} from '../src/domain/order.ts';

assert.deepEqual(
  reorderRelative(['vermilion', 'slate'], 'slate', 'vermilion', 'before'),
  ['slate', 'vermilion'],
);
assert.deepEqual(
  reorderRelative(['a', 'b', 'c'], 'a', 'c', 'after'),
  ['b', 'c', 'a'],
);
assert.deepEqual(reorderAtSlot(['todo', 'doing', 'review'], 'todo', 3), [
  'doing', 'review', 'todo',
]);
assert.deepEqual(reorderAtSlot(['todo', 'doing', 'review'], 'review', 0), [
  'review', 'todo', 'doing',
]);

assert.equal(relativePositionFromCenters(1, 0, 100, 100), 'before');
assert.equal(relativePositionFromCenters(0, 1, 100, 100), 'after');
assert.equal(relativePositionFromCenters(1, 0, 80, 100), 'before');
assert.equal(relativePositionFromCenters(0, 1, 120, 100), 'after');

const project = (id, child_order, parent_id = null) => ({
  id, name: id, color: 'grey', parent_id, child_order,
  is_archived: false, is_deleted: false, is_favorite: false,
  workspace_id: null,
});
const snapshot = {
  projects: {
    missions: { ...project('missions', 1), is_folder: true },
    vermilion: project('vermilion', 1, 'missions'),
    slate: project('slate', 2, 'missions'),
  },
};
const childrenOf = (projects, parentId) => Object.values(projects)
  .filter((entry) => entry.parent_id === parentId)
  .sort((a, b) => a.child_order - b.child_order)
  .map((entry) => entry.id);
assert.deepEqual(
  childrenOf(snapshot.projects, 'missions'),
  ['vermilion', 'slate'],
);
snapshot.projects.slate = { ...snapshot.projects.slate, child_order: 1 };
snapshot.projects.vermilion = { ...snapshot.projects.vermilion, child_order: 2 };
assert.deepEqual(
  childrenOf(snapshot.projects, 'missions'),
  ['slate', 'vermilion'],
);
snapshot.projects = patchParent(snapshot.projects, 'slate', 'vermilion');
assert.deepEqual(childrenOf(snapshot.projects, 'vermilion'), ['slate']);
snapshot.projects = patchParent(snapshot.projects, 'slate', 'missions');
assert.deepEqual(childrenOf(snapshot.projects, 'missions'), ['slate', 'vermilion']);

console.log('Project reorder, nesting, outdent, and section reorder scenarios passed.');
