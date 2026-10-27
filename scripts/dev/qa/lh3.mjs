// QA (Phase 7). Needs: npm i --no-save lighthouse@12 chrome-launcher@1 (and playwright). Serve out/ first: npx serve out -l 3123
// Lighthouse locally scores Performance lower than on Cloudflare (the page paints after hydration on a
// zero-latency server); check real numbers on https://pagespeed.web.dev against the deployed site.
// Usage: node lh3.mjs <outdir> <url>...   Lighthouse mobile x3 per URL, prints median scores
import lighthouse from 'lighthouse'; import * as cl from 'chrome-launcher'; import fs from 'fs';
const [out, ...urls] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const chromePath = process.env.CHROME_PATH ?? (await import('playwright')).chromium.executablePath();
const med = (a) => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
for (const url of urls) {
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const c = await cl.launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] });
    const r = await lighthouse(url, { port: c.port, output: 'json', logLevel: 'error', ...(process.env.DEVTOOLS ? { throttlingMethod: 'devtools' } : {}) });
    await c.kill(); runs.push(r.lhr);
  }
  const cats = ['performance', 'accessibility', 'best-practices', 'seo'];
  const scores = Object.fromEntries(cats.map((k) => [k, med(runs.map((l) => Math.round(l.categories[k].score * 100)))]));
  const best = runs.sort((a, b) => a.categories.performance.score - b.categories.performance.score)[1];
  const name = decodeURIComponent(new URL(url).pathname).replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 40) || 'home';
  fs.writeFileSync(`${out}/${name}.json`, JSON.stringify(best));
  const fails = Object.values(best.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'manual').map((a) => `${a.id}(${a.displayValue ?? a.score})`);
  const m = best.audits;
  console.log(`${decodeURIComponent(url)}\n  P${scores.performance} A${scores.accessibility} BP${scores['best-practices']} SEO${scores.seo} | LCP ${m['largest-contentful-paint'].displayValue} TBT ${m['total-blocking-time'].displayValue} CLS ${m['cumulative-layout-shift'].displayValue}\n  <0.9: ${fails.join(', ')}`);
}
