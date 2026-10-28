import type { VercelRequest, VercelResponse } from '@vercel/node';
import extractText from './_extract-text.js';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

/**
 * Profile auto-populate actions, keyed by the path after `/api/profile/suggest/`.
 * At integration these can be registered on the profile router as `suggest/<action>`,
 * behind its existing session guard.
 */
export const suggestRoutes: Record<string, Handler> = {
  'extract-text': extractText,
};

const PREFIX = '/api/profile/suggest/';

/** The suggest action a request targets, from `?path=suggest/<action>` or the URL itself. */
export function resolveSuggestAction(req: VercelRequest): string {
  const fromQuery = req.query?.path;
  const raw = Array.isArray(fromQuery) ? fromQuery.join('/') : fromQuery;
  if (typeof raw === 'string' && raw) return trimSlashes(raw).replace(/^suggest\//, '');

  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  return pathname.startsWith(PREFIX) ? trimSlashes(pathname.slice(PREFIX.length)) : '';
}

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = resolveSuggestAction(req);
  const route = suggestRoutes[action];
  if (!route) return res.status(404).json({ error: `Unknown route: suggest/${action}` });
  return route(req, res);
}
