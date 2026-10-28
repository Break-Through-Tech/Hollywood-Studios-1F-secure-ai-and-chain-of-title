import { afterEach, describe, expect, it } from 'vitest';
import handler, { resolveSuggestAction, suggestRoutes } from '../../../../api/profile/suggest/_router.js';
import { fakeRequest, fakeResponse } from '../../../helpers/vercel.js';

describe('resolveSuggestAction', () => {
  it('reads the action from the URL path', () => {
    expect(resolveSuggestAction(fakeRequest({ url: '/api/profile/suggest/extract?x=1' }))).toBe('extract');
  });

  it('reads the action from ?path= as the company rewrites do', () => {
    expect(resolveSuggestAction(fakeRequest({ query: { path: 'suggest/extract-text' } }))).toBe('extract-text');
  });

  it('returns empty for URLs outside the suggest prefix', () => {
    expect(resolveSuggestAction(fakeRequest({ url: '/api/profile/get' }))).toBe('');
  });
});

describe('suggest router', () => {
  afterEach(() => { delete suggestRoutes['echo']; });

  it('404s on an unknown action', async () => {
    const { res, captured } = fakeResponse();
    await handler(fakeRequest({ url: '/api/profile/suggest/nope' }), res);
    expect(captured.status).toBe(404);
  });

  it('dispatches to the registered handler', async () => {
    suggestRoutes['echo'] = async (_req, res) => res.status(200).json({ ok: true });
    const { res, captured } = fakeResponse();
    await handler(fakeRequest({ url: '/api/profile/suggest/echo' }), res);
    expect(captured).toEqual({ status: 200, body: { ok: true } });
  });
});
