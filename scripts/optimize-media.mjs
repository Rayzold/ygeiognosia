// Converts the original Wix downloads into web-ready assets under public/.
//   node scripts/optimize-media.mjs [archiveDir]
// archiveDir defaults to ./archive (the local folder created by scripts/download-wix.ps1:
// archive/media, archive/files). Originals stay local; only the web versions are committed.
//
// Images keep their Wix file id as the name (shared by many pages, never renamed):
//   archive/media/21375d_<hash>_mv2.jpg  ->  public/images/21375d_<hash>_mv2.webp
// A "__wWhH" suffix marks a resized fallback (original not downloadable) and is dropped from the name.
// Writes src/content/media-index.json: { "<local file name>": { src, width, height } }.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = path.resolve(process.argv[2] ?? path.join(root, 'archive'));
const pub = path.join(root, 'public');
const MAX = 1920; // longest side; the content column is 980px, so 1920 covers 2x screens

const outName = (f) => f.replace(/__w\d+h\d+(?=\.)/, '').replace(/\.[^.]+$/, '.webp');
const manifest = {};
let bytes = 0;
const files = fs.readdirSync(path.join(src, 'media')).filter((f) => !f.startsWith('.')).sort();
for (const f of files) {
  const input = path.join(src, 'media', f);
  const dest = path.join(pub, 'images', outName(f));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const img = sharp(input, { limitInputPixels: false, animated: false }).rotate();
  const meta = await img.metadata();
  const maxW = MAX;
  const scale = Math.min(1, maxW / Math.max(meta.width, meta.height));
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  if (!fs.existsSync(dest) || fs.statSync(dest).mtimeMs < fs.statSync(input).mtimeMs) {
    await img.resize(w, h).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toFile(dest);
  }
  bytes += fs.statSync(dest).size;
  manifest[f] = { src: '/images/' + outName(f), width: w, height: h };
}

// Video is re-encoded by hand (Cloudflare Pages limit: 25 MB per file), see README "Media":
//   ffmpeg -i archive/video/21375d_42e6506a0506417d9a8b4a236fd24e84-1080p.mp4 -an -vf scale=1280:-2 \
//     -c:v libx264 -preset veryfast -crf 30 -pix_fmt yuv420p -movflags +faststart public/video/people.mp4
for (const [dir, out] of [['files', 'files']]) {
  const d = path.join(src, dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    fs.mkdirSync(path.join(pub, out), { recursive: true });
    fs.copyFileSync(path.join(d, f), path.join(pub, out, f));
  }
}

fs.mkdirSync(path.join(root, 'src', 'content'), { recursive: true });
fs.writeFileSync(path.join(root, 'src', 'content', 'media-index.json'), JSON.stringify(manifest, null, 1));
console.log(`${Object.keys(manifest).length} images, ${(bytes / 1048576).toFixed(1)} MB webp`);
