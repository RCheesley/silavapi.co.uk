#!/usr/bin/env node
/**
 * serve.mjs - a tiny, dependency-free static file server for the built `_site`.
 * Used by the a11y (pa11y-ci), link-check (linkinator) and Lighthouse (lhci)
 * test scripts, which need the site served over HTTP. Not used in production.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '_site');
// Port precedence: CLI arg (portable across shells) → $PORT → 8080 default.
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

async function resolvePath(urlPath) {
  // Malformed percent-encoding (e.g. "/%E0%") makes decodeURIComponent throw;
  // reject such requests rather than crashing the handler.
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }
  // Prevent path traversal; map "/" and "/foo/" to their index.html. Strip the
  // leading "/" so the request path is treated as relative to ROOT (explicit,
  // and avoids any platform ambiguity around joining absolute segments).
  const clean = normalize(decoded)
    .replace(/^(\.\.[/\\])+/, '')
    .replace(/^[/\\]+/, '');
  let filePath = join(ROOT, clean);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) return null;
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    if (!extname(filePath)) filePath = join(filePath, 'index.html');
  }
  return filePath;
}

const server = createServer(async (req, res) => {
  const filePath = await resolvePath(req.url ?? '/');
  if (!filePath) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': TYPES[extname(filePath)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    try {
      const body = await readFile(join(ROOT, '404.html'));
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Serving _site at http://localhost:${PORT}`);
});
