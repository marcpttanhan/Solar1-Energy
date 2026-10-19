// Prints the CSP script-src hashes for the inline <script> blocks in an HTML file (LF and CRLF
// variants: Vercel serves LF from git, the local server may serve a CRLF checkout).
// Usage: node .claude/csp-hash.js index.html  -> paste into script-src in vercel.json
const fs = require('fs'), crypto = require('crypto');
const s = fs.readFileSync(process.argv[2], 'utf8').replace(/\r\n/g, '\n');
const out = new Set();
for (const m of s.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  for (const body of [m[1], m[1].replace(/\n/g, '\r\n')]) out.add(`'sha256-${crypto.createHash('sha256').update(body, 'utf8').digest('base64')}'`);
}
console.log([...out].join(' '));
