import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./auth', () => ({
  auth: {
    getToken: vi.fn(async () => 'token'),
    renewAfterRefusal: vi.fn(async () => null as string | null),
  },
}));

import { auth } from './auth';
import { ApiError, REQUEST_TIMEOUT_MS, TimeoutError, request } from './client';

const fetchMock = vi.fn();

/** A response whose body never finishes: it waits for the request to be aborted. */
function stalledBody(signal: AbortSignal): Response {
  return {
    ok: true,
    status: 200,
    headers: new Headers(),
    text: () => new Promise<string>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }),
  } as unknown as Response;
}

const answer = (status: number, body = '', headers: Record<string, string> = {}): Response =>
  new Response(status === 204 ? null : body, { status, headers });

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.mocked(auth.getToken).mockClear();
  vi.mocked(auth.renewAfterRefusal).mockReset();
  vi.mocked(auth.renewAfterRefusal).mockResolvedValue(null);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('a call that starts answering and then stalls (#127)', () => {
  it('is a timeout, not an empty success', async () => {
    fetchMock.mockImplementation(async (_url, init) => stalledBody((init as RequestInit).signal!));
    const pending = request('/sync');
    const settled = pending.then(() => 'resolved', (error: unknown) => error);

    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 1);
    expect(await settled).toBeInstanceOf(TimeoutError);
  });
});

describe('what a successful answer can be (#127)', () => {
  it('reads JSON', async () => {
    fetchMock.mockResolvedValue(answer(200, '{"ok":true}'));
    await expect(request('/x')).resolves.toEqual({ ok: true });
  });

  it('is undefined when the body is empty, or the status is 204', async () => {
    fetchMock.mockResolvedValueOnce(answer(200, ''));
    await expect(request('/x')).resolves.toBeUndefined();
    fetchMock.mockResolvedValueOnce(answer(204));
    await expect(request('/x')).resolves.toBeUndefined();
  });

  it('is a plain error, not a refusal, when a 200 carries something that is not JSON', async () => {
    fetchMock.mockResolvedValue(answer(200, '<html>oops</html>'));
    const error = await request('/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(ApiError);
    expect((error as Error).message).toMatch(/could not be read/);
  });
});

describe('the token', () => {
  it('is renewed once after a 401, and the second call uses the new one', async () => {
    vi.mocked(auth.renewAfterRefusal).mockResolvedValue('renewed');
    fetchMock
      .mockResolvedValueOnce(answer(401))
      .mockResolvedValueOnce(answer(200, '{"ok":1}'));

    await expect(request('/x')).resolves.toEqual({ ok: 1 });
    expect(auth.renewAfterRefusal).toHaveBeenCalledTimes(1);
    const bearer = (call: number) =>
      (fetchMock.mock.calls[call][1] as RequestInit & { headers: Record<string, string> }).headers.Authorization;
    expect(bearer(0)).toBe('Bearer token');
    expect(bearer(1)).toBe('Bearer renewed');
  });
});

describe('a refusal', () => {
  it('is an auth failure on a 403 with an empty body', async () => {
    fetchMock.mockResolvedValue(answer(403));
    const error = await request('/x').catch((e: unknown) => e) as ApiError;
    expect(error.isAuthError).toBe(true);
    expect(error.isRefusal).toBe(false);
  });

  it('is a refusal on a 403 that names the plan, not the token', async () => {
    fetchMock.mockResolvedValue(answer(403, JSON.stringify({ error_tag: 'MAX_PROJECTS_LIMIT_REACHED' })));
    const error = await request('/x').catch((e: unknown) => e) as ApiError;
    expect(error.isRefusal).toBe(true);
    expect(error.isAuthError).toBe(false);
  });
});
