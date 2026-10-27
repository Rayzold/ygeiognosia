// Social preview images for the blog: one 1200×630 JPEG per post from its cover (Facebook, WhatsApp, Viber,
// X and LinkedIn all show 1.91:1 large cards; JPEG because some apps still do not preview WebP).
// Generated on every build into public/og/ (gitignored), like the width variants.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const index = JSON.parse(fs.readFileSync(path.join(root, 'src/content/media-index.json'), 'utf8'));
const posts = JSON.parse(fs.readFileSync(path.join(root, 'content/posts-index.json'), 'utf8'));
const outDir = path.join(root, 'public/og/post');
fs.mkdirSync(outDir, { recursive: true });

/** og image file for a post: posts/001.json -> /og/post/001.jpg (kept in sync with src/lib/blog.ts). */
const ogName = (file) => path.basename(file, '.json') + '.jpg';

let n = 0;
for (const p of posts) {
  const m = p.cover && index[p.cover.file.replace(/~/g, '_')];
  if (!m) continue;
  const src = path.join(root, 'public', m.src);
  const out = path.join(outDir, ogName(p.file));
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(src).mtimeMs) continue;
  await sharp(src).resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  n++;
}
console.log(`${posts.length} posts, ${n} og images written`);
