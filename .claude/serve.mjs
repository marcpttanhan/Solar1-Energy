// Node twin of serve.py for machines without Python (e.g. the Windows VPS).
// Static files from the repo root with HTTP Range support, which the second
// <video> needs to seek into hero.mp4.
// Usage: node .claude/serve.mjs [port]
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.argv[2]) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
};

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(normalize(ROOT + sep))) { res.writeHead(403).end(); return; }
  let stat;
  try { stat = statSync(file); } catch { res.writeHead(404).end('Not found'); return; }
  if (!stat.isFile()) { res.writeHead(404).end('Not found'); return; }

  const headers = { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (!m) {
    res.writeHead(200, { ...headers, 'Content-Length': stat.size });
    if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
    return;
  }
  const size = stat.size;
  let start, end;
  if (m[1] === '') { start = Math.max(size - Number(m[2] || 0), 0); end = size - 1; }
  else { start = Number(m[1]); end = Math.min(m[2] ? Number(m[2]) : size - 1, size - 1); }
  if (start >= size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
  res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
  if (req.method === 'HEAD') res.end(); else createReadStream(file, { start, end }).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`serving ${ROOT} on http://127.0.0.1:${port}`));
