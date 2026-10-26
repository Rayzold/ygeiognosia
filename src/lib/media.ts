import mediaIndex from "@/content/media-index.json";

export type Media = { src: string; width: number; height: number };

const index = mediaIndex as Record<string, Media>;

/**
 * Local web version of a Wix image, by its archive file name
 * (e.g. "21375d_<hash>_mv2.jpg"; a Wix id with "~mv2" works too).
 * Throws at build time when an image is missing, so a broken image never ships.
 */
export function media(file: string): Media {
  const key = file.replace(/~/g, "_");
  const hit = index[key] ?? index[Object.keys(index).find((k) => k.replace(/__w\d+h\d+(?=\.)/, "") === key) ?? ""];
  if (!hit) throw new Error(`media: no local image for "${file}" (run npm run images)`);
  return hit;
}
