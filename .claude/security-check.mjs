// Security probe for the live site and its Supabase project. Read-only: every
// write it tries is shaped to fail or match no row, so nothing can change.
//   node .claude/security-check.mjs [site-url]
// Checks: response headers, files that must not be deployed, what the public
// anon key can reach in Supabase (RLS/grants), and the Auth sign-up settings.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { devNull } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = (process.argv[2] || 'https://solar1-energy.vercel.app').replace(/\/+$/, '');
const cfgSrc = readFileSync(join(ROOT, 'supabase-config.js'), 'utf8');
const pick = (name) => (cfgSrc.match(new RegExp(`${name}:\\s*'([^']*)'`)) || [])[1] || '';
const URL_ = pick('url');
const KEY = pick('anonKey');

let failures = 0;
const ok = (msg) => console.log(`  ok    ${msg}`);
const bad = (msg) => { failures++; console.log(`  FAIL  ${msg}`); };
const note = (msg) => console.log(`  note  ${msg}`);
const get = (url, init = {}) => fetch(url, { redirect: 'manual', ...init, signal: AbortSignal.timeout(10000) });
// The site goes through curl: Vercel's bot protection challenges Node's own fetch.
function curl(url) {
  const out = execFileSync('curl', ['-s', '-o', devNull, '-D', '-', '--max-time', '15', url], { encoding: 'utf8' });
  const blocks = out.trim().split(/\r?\n\r?\n/);
  const lines = blocks[blocks.length - 1].split(/\r?\n/);
  const status = Number((lines.shift().match(/\s(\d{3})/) || [])[1]);
  const map = new Map(lines.map((l) => { const i = l.indexOf(':'); return [l.slice(0, i).trim().toLowerCase(), l.slice(i + 1).trim()]; }));
  return { status, headers: { get: (n) => map.get(n) } };
}

console.log(`\nSite: ${SITE}`);
try {
  const res = curl(`${SITE}/`);
  const h = res.headers;
  const want = {
    'strict-transport-security': /max-age=\d{7,}/,
    'content-security-policy': /frame-ancestors 'none'/,
    'x-content-type-options': /nosniff/,
    'x-frame-options': /DENY/,
    'referrer-policy': /strict-origin-when-cross-origin/,
    'cross-origin-opener-policy': /same-origin/,
  };
  for (const [name, re] of Object.entries(want)) (re.test(h.get(name) || '') ? ok : bad)(`header ${name}`);
  const csp = h.get('content-security-policy') || '';
  (/script-src[^;]*'unsafe-(inline|eval)'/.test(csp) ? bad : ok)('CSP script-src has no unsafe-inline / unsafe-eval');
  const admin = curl(`${SITE}/admin.html`);
  (/no-store/.test(admin.headers.get('cache-control') || '') ? ok : bad)('admin.html is Cache-Control: no-store');
  (/noindex/.test(admin.headers.get('x-robots-tag') || '') ? ok : bad)('admin.html is X-Robots-Tag: noindex');
  for (const p of ['CLAUDE.md', 'supabase_schema.sql', 'supabase_hardening.sql', '.claude/serve.mjs', 'deploy/README.md', '.git/config', '.env', 'vercel.json']) {
    const r = curl(`${SITE}/${p}`);
    (r.status >= 400 ? ok : bad)(`/${p} not served (${r.status})`);
  }
} catch (e) { bad(`site unreachable: ${e.message}`); }

console.log(`\nSupabase: ${URL_}`);
const api = (path, init = {}) => get(`${URL_}${path}`, { ...init, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, ...(init.headers || {}) } });
try {
  const role = JSON.parse(Buffer.from(KEY.split('.')[1] || '', 'base64url').toString() || '{}').role;
  (role === 'anon' || KEY.startsWith('sb_publishable_') ? ok : bad)(`supabase-config.js key is public (role: ${role || 'publishable'})`);

  const read = await api('/rest/v1/site_content?select=key');
  (read.status === 200 ? ok : bad)(`anon can read site_content (${read.status})`);

  // Denied by grants -> 401/403 (42501). A 400/409/2xx means anon got past the grant.
  const denied = (r) => r.status === 401 || r.status === 403;
  const ins = await api('/rest/v1/site_content', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ key: '__probe_invalid__', data: {} }) });
  (denied(ins) ? ok : bad)(`anon INSERT on site_content refused (${ins.status})`);
  const upd = await api('/rest/v1/site_content?key=eq.__probe_none__', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{"data":{}}' });
  (denied(upd) ? ok : bad)(`anon UPDATE on site_content refused (${upd.status})`);
  const del = await api('/rest/v1/site_content?key=eq.__probe_none__', { method: 'DELETE' });
  (denied(del) ? ok : bad)(`anon DELETE on site_content refused (${del.status})`);

  // Everything the anon key can see through the API, from PostgREST's schema listing.
  const root = await api('/rest/v1/', { headers: { Accept: 'application/openapi+json' } });
  if (root.ok) {
    const paths = Object.keys((await root.json()).paths || {}).filter((p) => p !== '/');
    const extra = paths.filter((p) => p !== '/site_content');
    (extra.length ? bad : ok)(`anon sees only /site_content${extra.length ? `; also: ${extra.join(', ')}` : ''}`);
  } else note(`schema listing not available to anon (${root.status}), which is fine`);
  for (const t of ['admin_users']) {
    const r = await api(`/rest/v1/${t}?select=*&limit=1`);
    (r.status !== 200 ? ok : bad)(`anon cannot read ${t} (${r.status})`);
  }

  const settings = await api('/auth/v1/settings');
  if (settings.ok) {
    const s = await settings.json();
    (s.disable_signup === true ? ok : bad)('Auth: public sign-ups are off');
    (s.anonymous_users ? bad : ok)('Auth: anonymous sign-ins are off');
  } else note(`auth settings not readable (${settings.status})`);
} catch (e) { bad(`Supabase unreachable: ${e.message}`); }

console.log(failures ? `\n${failures} check(s) failed.\n` : '\nAll checks passed.\n');
process.exitCode = failures ? 1 : 0;
