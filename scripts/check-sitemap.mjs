// Checks that every URL of the live Wix sitemap (archive/wix-urls.txt) still works on the new site:
// either a page exists in out/ or public/_redirects sends it somewhere that exists.
// Usage: node scripts/check-sitemap.mjs [out_dir] [--strict]
// Without --strict it only reports. Since Phase 7 the build runs --strict: a missing Wix URL fails the deploy.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const OUT = path.resolve(args.find((a) => !a.startsWith('--')) ?? 'out');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile();
const page = (p) => (p === '/' ? isFile(path.join(OUT, 'index.html')) : isFile(path.join(OUT, p.slice(1) + '.html')) || isFile(path.join(OUT, p.slice(1), 'index.html')));

const redirects = new Map();
const rf = path.join(OUT, '_redirects');
if (isFile(rf)) {
  for (const line of fs.readFileSync(rf, 'utf8').split('\n')) {
    const [from, to] = line.trim().split(/\s+/);
    if (from && !from.startsWith('#') && to) redirects.set(decodeURI(from), decodeURI(to));
  }
}

const wix = fs.readFileSync(path.join(root, 'archive', 'wix-urls.txt'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const missing = [];
let viaRedirect = 0;
for (const p of wix) {
  if (page(p)) continue;
  const to = redirects.get(p);
  if (to && page(to)) { viaRedirect++; continue; }
  missing.push(to ? `${p} -> ${to} (target missing)` : p);
}
console.log(`check-sitemap: ${wix.length} Wix URLs, ${wix.length - missing.length} ok (${viaRedirect} via redirect), ${missing.length} missing`);
if (missing.length) console.log((strict ? 'MISSING ' : 'todo ') + missing.join(strict ? '\nMISSING ' : ', '));
process.exit(strict && missing.length ? 1 : 0);
