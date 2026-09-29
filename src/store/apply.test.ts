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

import * as idb from '@/db/idb';
import { sendCommands, updateItem, type CommandResult } from '@/api/commands';
import { emptySnapshot } from '@/domain/types';
import { item } from '@/test/items';
import { useStore } from './store';

const sent = vi.mocked(sendCommands);

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('navigator', { onLine: true });
  vi.clearAllMocks();
  const snapshot = emptySnapshot();
  snapshot.items.a = item({ id: 'a', content: 'Before' });
  snapshot.items.b = item({ id: 'b', content: 'Before too' });
  useStore.setState({ demo: false, snapshot, toasts: [], pendingCount: 0, syncState: 'idle' });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** What the screen is told: the two edits, shown at once. */
const edits = () => [
  updateItem('a', { content: 'After' }),
  updateItem('b', { content: 'After too' }),
];
const show = (snapshot: ReturnType<typeof emptySnapshot>) => ({
  ...snapshot,
  items: {
    ...snapshot.items,
    a: { ...snapshot.items.a, content: 'After' },
    b: { ...snapshot.items.b, content: 'After too' },
  },
});

describe('a change Todoist refuses (#134)', () => {
  it('is taken back on screen, taken off the queue and reported once', async () => {
    const commands = edits();
    const result: CommandResult = {
      responses: [],
      failures: commands.map((cmd) => ({ uuid: cmd.uuid, error: 'Invalid argument' })),
      mapping: {},
      delivered: commands.map((cmd) => cmd.uuid),
      undelivered: [],
    };
    sent.mockResolvedValue(result);

    await useStore.getState().apply(commands, show);

    const { items } = useStore.getState().snapshot;
    expect(items.a.content).toBe('Before');
    expect(items.b.content).toBe('Before too');
    expect(idb.dequeue).toHaveBeenCalledWith(commands.map((cmd) => cmd.uuid));
    expect(useStore.getState().toasts).toHaveLength(1);
    expect(useStore.getState().pendingCount).toBe(0);
  });

  it('keeps what Todoist accepted, and takes back only what it refused', async () => {
    const [first, second] = edits();
    sent.mockResolvedValue({
      responses: [],
      failures: [{ uuid: second.uuid, error: 'Invalid argument' }],
      mapping: {},
      delivered: [first.uuid, second.uuid],
      undelivered: [],
    });

    await useStore.getState().apply([first, second], show);

    const { items } = useStore.getState().snapshot;
    expect(items.a.content).toBe('After');
    expect(items.b.content).toBe('Before too');
    expect(useStore.getState().toasts).toHaveLength(1);
  });

  it('leaves the change queued, and the screen as it is, when the network is lost', async () => {
    const commands = edits();
    sent.mockRejectedValue(new TypeError('Failed to fetch'));

    await useStore.getState().apply(commands, show);

    expect(useStore.getState().snapshot.items.a.content).toBe('After');
    expect(idb.dequeue).not.toHaveBeenCalled();
    expect(useStore.getState().syncState).toBe('offline');
    expect(useStore.getState().toasts).toHaveLength(0);
  });
});
