// Checks every internal link/asset referenced by the static build (out/) resolves to a file,
// that no Wix URL is left, and that no "pdf:" placeholder survived. Greek slugs are matched decoded and encoded. Exits 1 on any problem,
// so `npm run build` (and the Cloudflare deploy) fails instead of publishing a broken site.
// Usage: node scripts/check-links.mjs [out_dir]
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] ?? 'out');
const SITE = 'https://www.ygeiognosia.com';
// Pages not built yet (phase by phase) are listed in scripts/pending-links.txt and only reported.
// The list must be empty before the release (Phase 7).
const pendingFile = path.join(path.dirname(new URL(import.meta.url).pathname), 'pending-links.txt');
const pending = new Set(fs.existsSync(pendingFile) ? fs.readFileSync(pendingFile, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : []);
const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile();
const exists = (u) => {
  const clean = decodeURIComponent(u.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/') return isFile(path.join(OUT, 'index.html'));
  const p = path.join(OUT, clean.replace(/^\//, ''));
  return isFile(p) || isFile(p + '.html') || isFile(path.join(p, 'index.html'));
};
const pages = fs.readdirSync(OUT, { recursive: true }).filter((f) => f.endsWith('.html')).sort();
const bad = [];
const checked = new Set();
const pendingHits = [];
for (const rel of pages) {
  const html = fs.readFileSync(path.join(OUT, rel), 'utf8');
  for (const [, attr, value] of html.matchAll(/\b(href|src|content|srcSet|srcset)="([^"]+)"/g)) {
    const urls = attr.toLowerCase() === 'srcset' ? value.split(',').map((x) => x.trim().split(' ')[0]) : [value];
    for (let u of urls) {
      if (u.startsWith(SITE)) u = u.slice(SITE.length) || '/';
      if (!u.startsWith('/') || u.startsWith('//') || u.startsWith('/_next/')) continue;
      const key = u.split('#')[0];
      if (checked.has(key)) continue;
      checked.add(key);
      if (!exists(u)) (pending.has(decodeURIComponent(key)) ? pendingHits : bad).push([rel, u]);
    }
  }
  if (/wixstatic|parastorage|wixsite/.test(html)) bad.push([rel, 'WIX REFERENCE']);
  for (const [, u] of html.matchAll(/href="(pdf:[^"]*)"/g)) bad.push([rel, 'UNRESOLVED ' + u]);
}
console.log(`check-links: ${pages.length} pages, ${checked.size} unique internal URLs checked`);
if (pendingHits.length) console.log(`pending (not built yet): ${[...new Set(pendingHits.map(([, u]) => u))].join(' ')}`);
for (const [f, u] of bad) console.log('BROKEN', f, u);
process.exit(bad.length ? 1 : 0);
