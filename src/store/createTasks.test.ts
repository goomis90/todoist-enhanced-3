import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/db/idb', () => ({
  saveSnapshot: vi.fn(async () => {}),
  enqueue: vi.fn(async () => {}),
  dequeue: vi.fn(async () => {}),
  updateQueued: vi.fn(async () => {}),
  readQueue: vi.fn(async () => []),
}));
vi.mock('@/api/commands', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/commands')>()),
  sendCommands: vi.fn(),
}));

import { sendCommands, type Command, type CommandResult } from '@/api/commands';
import { emptySnapshot } from '@/domain/types';
import { useStore } from './store';

const sent = vi.mocked(sendCommands);
const ok = (commands: Command[]): CommandResult => ({
  responses: [], failures: [], mapping: {},
  delivered: commands.map((cmd) => cmd.uuid), undelivered: [],
});

beforeEach(() => {
  vi.stubGlobal('navigator', { onLine: true });
  vi.clearAllMocks();
  sent.mockImplementation(async (_token, commands) => ok(commands));
  useStore.setState({ demo: false, snapshot: emptySnapshot(), toasts: [], undoStack: [], pendingCount: 0, syncState: 'idle' });
});
afterEach(() => vi.unstubAllGlobals());

const lines = ['Buy milk', 'Call the garage', 'Book a dentist appointment'];
const list = lines.map((content) => ({ content, project_id: 'inbox', priority: 1, labels: [] }));

describe('several tasks at once (#152)', () => {
  it('are independent tasks, in the order given, sent in one request', async () => {
    await useStore.getState().createTasks(list);

    expect(sent).toHaveBeenCalledTimes(1);
    const commands = sent.mock.calls[0][1];
    expect(commands.map((cmd) => cmd.type)).toEqual(['item_add', 'item_add', 'item_add']);
    expect(commands.map((cmd) => cmd.args.content)).toEqual(lines);
    // No parent: they are not subtasks of one another or of a new task.
    expect(commands.every((cmd) => cmd.args.parent_id === undefined)).toBe(true);
  });

  it('are all on screen at once, one row each, ordered as pasted', async () => {
    await useStore.getState().createTasks(list);
    const items = Object.values(useStore.getState().snapshot.items)
      .sort((a, b) => a.child_order - b.child_order);
    expect(items.map((task) => task.content)).toEqual(lines);
    expect(items.every((task) => task.parent_id === null)).toBe(true);
  });

  it('sends nothing for an empty list', async () => {
    await useStore.getState().createTasks([]);
    expect(sent).not.toHaveBeenCalled();
  });
});
