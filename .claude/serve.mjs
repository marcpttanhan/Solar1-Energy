// Node twin of serve.py for machines without Python (e.g. the Windows VPS).
// Static files from the repo root with HTTP Range support, which the second
// <video> needs to seek into hero.mp4. Mirrors the Vercel deploy: the "headers"
// rules in vercel.json (so the CSP is exercised locally), folder routes such as
// /residential -> residential/index.html, and trailingSlash: false redirects.
// Usage: node .claude/serve.mjs [port]
import { createServer } from 'node:http';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.argv[2]) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.ico': 'image/vnd.microsoft.icon',
};

// vercel.json is re-read per request, so header edits apply without a restart.
// Supports the source patterns used there: "/(.*)", "/dir/:name(regex)", plain paths.
function vercelConfig() {
  try { return JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')); } catch { return {}; }
}
function sourceRegex(src) {
  const re = src.replace(/:\w+(\((?:[^()]|\([^()]*\))*\))?/g, (_, group) => group || '([^/]+)');
  return new RegExp(`^${re}$`);
}
function configHeaders(cfg, path) {
  const out = {};
  for (const rule of cfg.headers || []) {
    if (sourceRegex(rule.source).test(path)) rule.headers.forEach(({ key, value }) => { out[key] = value; });
  }
  return out;
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let path = decodeURIComponent(url.pathname);
  const cfg = vercelConfig();
  if (cfg.trailingSlash === false && path.length > 1 && path.endsWith('/')) {
    res.writeHead(308, { Location: path.replace(/\/+$/, '') + url.search }).end();
    return;
  }
  const extra = configHeaders(cfg, path);
  if (path.endsWith('/')) path += 'index.html';
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(normalize(ROOT + sep))) { res.writeHead(403).end(); return; }
  // Like Vercel: a path with no file gets /404.html with status 404.
  const notFound = () => {
    try { res.writeHead(404, { ...extra, 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache' }).end(readFileSync(join(ROOT, '404.html'))); }
    catch { res.writeHead(404).end('Not found'); }
  };
  let stat;
  try {
    stat = statSync(file);
    if (stat.isDirectory()) { file = join(file, 'index.html'); stat = statSync(file); }
  } catch { notFound(); return; }
  if (!stat.isFile()) { notFound(); return; }

  const headers = { 'Cache-Control': 'no-cache', ...extra, 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
  headers['Cache-Control'] = 'no-cache'; // local edits should always show
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
