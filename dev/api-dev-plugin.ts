import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin, ViteDevServer } from 'vite';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Dev-only stand-in for Vercel: serves `api/` handlers from the Vite dev server.
 * Not part of the feature; never copied into the company codebase.
 *
 *   /api/profile/suggest/<action>  → api/profile/suggest/_router.ts
 *   /api/dev/mock-profile?key=     → mocks/ (empty | populated)
 *
 * Source files under `api/` (the shared suggestion schema) are also imported by
 * the UI. Those requests have a file extension and must reach Vite; only
 * extensionless paths are handlers.
 */
const SOURCE_MODULE = /\.(?:[cm]?tsx?|[cm]?jsx?|css|map|svg)$/;

export function isApiHandlerRequest(url: string | undefined): url is string {
  if (!url?.startsWith('/api/')) return false;
  const pathname = url.split('?')[0] ?? '';
  return !SOURCE_MODULE.test(pathname);
}

export function apiDevPlugin(): Plugin {
  return {
    name: 'btt-api-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url;
        if (!isApiHandlerRequest(url)) return next();
        try {
          const vreq = await toVercelRequest(req);
          const vres = toVercelResponse(res);

          if (url.startsWith('/api/profile/suggest/')) {
            const mod = await server.ssrLoadModule('/api/profile/suggest/_router.ts');
            await mod.default(vreq, vres);
            return;
          }
          if (url.startsWith('/api/dev/mock-profile')) {
            const { mockProfiles } = await server.ssrLoadModule('/mocks/index.ts');
            const fixture = mockProfiles[String(vreq.query.key)];
            if (!fixture) return vres.status(404).json({ error: 'Unknown mock profile' });
            return vres.status(200).json(fixture);
          }
          vres.status(404).json({ error: 'Not found' });
        } catch (err) {
          console.error('[api-dev]', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal error' }));
          }
        }
      });
    },
  };
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

async function toVercelRequest(req: IncomingMessage): Promise<VercelRequest> {
  const url = new URL(req.url || '/', 'http://localhost');
  const query: Record<string, string | string[]> = {};
  for (const key of new Set(url.searchParams.keys())) {
    const all = url.searchParams.getAll(key);
    query[key] = all.length > 1 ? all : all[0];
  }

  const raw = req.method === 'GET' || req.method === 'HEAD' ? Buffer.alloc(0) : await readBody(req);
  let body: unknown = raw.length ? raw : undefined;
  if (raw.length && String(req.headers['content-type'] || '').includes('application/json')) {
    body = JSON.parse(raw.toString('utf8'));
  }

  return Object.assign(req, { query, body, cookies: {} }) as unknown as VercelRequest;
}

function toVercelResponse(res: ServerResponse): VercelResponse {
  const vres = res as unknown as VercelResponse;
  vres.status = (code: number) => { res.statusCode = code; return vres; };
  vres.json = (data: unknown) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return vres;
  };
  vres.send = (data: unknown) => {
    res.end(typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data));
    return vres;
  };
  return vres;
}
