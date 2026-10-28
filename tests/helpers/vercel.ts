import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Minimal Vercel-style request for handler tests. */
export function fakeRequest(init: { url?: string; method?: string; query?: Record<string, string | string[]>; body?: unknown } = {}) {
  return { url: '/', method: 'GET', query: {}, headers: {}, ...init } as unknown as VercelRequest;
}

/** Captures the status and JSON body a handler sends. */
export function fakeResponse() {
  const captured: { status: number; body: unknown } = { status: 200, body: undefined };
  const res = {
    status(code: number) { captured.status = code; return res; },
    json(body: unknown) { captured.body = body; return res; },
    send(body: unknown) { captured.body = body; return res; },
    setHeader() { return res; },
  };
  return { res: res as unknown as VercelResponse, captured };
}
