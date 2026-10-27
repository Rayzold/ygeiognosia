// Render an archived Wix page offline: Wix media URLs are served from the local originals.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs'); const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright');

// Usage: node scripts/dev/wix-render.cjs <archive/html/...html> <out.png> <width> <height> [archiveDir]
// FULL=1 for a full-page screenshot. Wix entrance animations are shown in their final state.
// Reference screenshots of the Wix design at any viewport (fonts and images from the local archive).
const ARCH = path.resolve(process.argv[6] ?? 'archive');
const MEDIA = path.join(ARCH, 'media'), FONTS = path.join(ARCH, 'fonts');
const files = fs.readdirSync(MEDIA);
(async () => {
  const [file, out, w, h] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.route('**/*', async (r) => {
    const u = r.request().url();
    if (u.startsWith('file:')) return r.continue();
    let m = u.match(/static\.wixstatic\.com\/media\/([^/]+)/);
    if (m) {
      const id = decodeURIComponent(m[1]).replace(/~/g, '_'); const stem = id.replace(/\.[^.]+$/, '');
      const f = files.find((x) => x.startsWith(stem));
      if (f) return r.fulfill({ path: path.join(MEDIA, f) });
    }
    m = u.match(/ufonts\/([0-9a-f_]+)\/(woff2|woff|ttf)\//);
    if (m) return r.fulfill({ path: path.join(FONTS, `${m[1]}.${m[2]}`) });
    return r.abort();
  });
  await p.goto('file://' + path.resolve(file), { waitUntil: 'load' });
  // finish Wix entrance animations; swap LQIP images for the full ones
  await p.evaluate(() => {
    document.querySelectorAll('[id^=comp-]').forEach((e) => e.setAttribute('data-motion-enter', 'done'));
    document.querySelectorAll('wow-image img').forEach((i) => { i.src = i.src.replace(/\/v1\/.*$/, ''); });
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out, fullPage: process.env.FULL === '1' });
  await b.close();
})();
