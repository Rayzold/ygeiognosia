// Geometry of every Ricos block of every archived Wix post (same order as parse_archive.ricos_blocks):
// float / x / width of images, videos, galleries and buttons in the 740px Wix text column, and paragraph
// alignment. Writes archive/posts-layout.json (read by build_content.py).
//   node scripts/dev/post-layout.cjs <archive/html/post> <fonts dir> archive/posts-layout.json
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const [DIR, FONTS, OUT] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route('**/*', async (r) => { const u = r.request().url(); if (u.startsWith('file:')) return r.continue();
    let m = u.match(/ufonts\/([0-9a-f_]+)\/(woff2|woff|ttf)\//); if (m) return r.fulfill({ path: path.join(FONTS, `${m[1]}.${m[2]}`) }); return r.abort(); });
  const res = {};
  for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.html'))) {
    await p.goto('file://' + path.join(DIR, f), { waitUntil: 'load' }); await p.waitForTimeout(150);
    const out = await p.evaluate(() => {
      const canon = document.querySelector('link[rel=canonical]')?.href;
      const body = document.querySelector('[data-hook=post-description]'); if (!body) return { canon, blocks: [] };
      const first = [...body.querySelectorAll('[data-hook^=rcv-block]')].find((e) => /^rcv-block\d+$/.test(e.getAttribute('data-hook'))); if (!first) return { canon, blocks: [] };
      const box = body.getBoundingClientRect(); const L = box.x + 100;
      const blocks = []; let content = null;
      const rec = (el, type) => {
        const t = el.querySelector('figure,[data-hook*=gallery],iframe,a,p,h1,h2,h3,ul,ol') || el;
        const r = t.getBoundingClientRect(); let fl = 'none';
        for (let x = t; x && x !== el.parentElement; x = x.parentElement) { const c = getComputedStyle(x).float; if (c !== 'none') { fl = c; break; } }
        const cs = getComputedStyle(t);
        blocks.push({ type, tag: t.tagName.toLowerCase(), x: Math.round(r.x - L), w: Math.round(r.width), h: Math.round(r.height), float: fl,
          fs: cs.fontSize, lh: cs.lineHeight, color: cs.color, align: cs.textAlign, fw: cs.fontWeight, ff: cs.fontFamily.slice(0, 30) });
      };
      for (const ch of first.parentElement.children) {
        const hook = ch.getAttribute('data-hook') || '';
        if (/^rcv-block\d+$/.test(hook)) { if (content) rec(content, ch.getAttribute('type')); content = null; continue; }
        if (hook === 'rcv-block-first' || hook === 'rcv-block-last') continue;
        content = ch;
      }
      if (content) rec(content, null);
      return { canon, blocks };
    });
    const slug = decodeURIComponent(out.canon).split('/post/')[1];
    res[slug] = out.blocks.map((b) => ['image', 'video', 'gallery', 'button'].includes(b.type) ? { float: b.float, x: b.x, w: b.w, h: b.h }
      : ['paragraph', 'heading'].includes(b.type) && !['start', 'left'].includes(b.align) ? { align: b.align } : null);
  }
  fs.writeFileSync(OUT, JSON.stringify(res)); await b.close();
})();
