// Generates responsive width variants for every image in public/images (used by src/lib/image-loader.ts).
// Widths must match images.deviceSizes + images.imageSizes in next.config.ts. Never upscales.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export const WIDTHS = [256, 400, 640, 828, 1080, 1600, 1920];
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'public/images');
const files = fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.webp') && !/-w\d+\.webp$/.test(f));
let n = 0;
for (const f of files) {
  const src = path.join(dir, f);
  const { width } = await sharp(src).metadata();
  for (const w of WIDTHS) {
    const out = src.replace(/\.webp$/, `-w${w}.webp`);
    // Locally: regenerate when the source is newer (an image replaced under the same name).
    // In CI (Cloudflare sets CF_PAGES, others CI) file times come from the git checkout, so only
    // create what is missing — committed variants are kept as they are.
    if (fs.existsSync(out) && (process.env.CF_PAGES || process.env.CI || fs.statSync(out).mtimeMs > fs.statSync(src).mtimeMs)) continue;
    if (w >= width) fs.copyFileSync(src, out);
    else await sharp(src).resize(w).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toFile(out);
    n++;
  }
}
console.log(`${files.length} images, ${n} variants written`);
