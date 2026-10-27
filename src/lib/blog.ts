// Blog data at build time: the 81 Wix posts (content/posts/*.json, Ricos blocks) and the list helpers.
import fs from "node:fs";
import path from "node:path";
import { POSTS, htmlToText, type PostSummary, type WixImage } from "@/lib/content";
import { media, type Media } from "@/lib/media";

export type { PostSummary };

/** Wix block geometry in the 740px text column (scripts/dev/post-layout.cjs). */
export type BlockLayout = { float?: "left" | "right" | "none"; x?: number; w?: number; h?: number; align?: string };

export type Block =
  | { type: "paragraph" | "heading"; html: string; text: string; level?: number; layout?: BlockLayout }
  | { type: "empty-line"; layout?: BlockLayout }
  | { type: "list"; ordered: boolean; items: string[]; layout?: BlockLayout }
  | { type: "image"; file: string | null; alt: string; caption: string; link: string | null; layout?: BlockLayout }
  | { type: "gallery"; images: WixImage[]; layout?: BlockLayout }
  | { type: "video"; youtube: string | null; layout?: BlockLayout }
  | { type: "button"; text: string; href: string | null; newTab: boolean; background: string | null; layout?: BlockLayout };

export type Post = PostSummary & { author: string; blocks: Block[] };

/** Wix: 10 posts per page, /blog then /blog/page/2 … /blog/page/9. */
export const POSTS_PER_PAGE = 10;
export const BLOG_PAGES = Math.ceil(POSTS.length / POSTS_PER_PAGE);
export const postsOnPage = (n: number) => POSTS.slice((n - 1) * POSTS_PER_PAGE, n * POSTS_PER_PAGE);
export const blogPagePath = (n: number) => (n === 1 ? "/blog" : `/blog/page/${n}`);

/** Newest post first (posts-index.json is sorted by datePublished). */
export const LATEST_POST = POSTS[0];

/**
 * Dates are shown only while the blog is active: when the newest post is younger than this (owner,
 * 2026-10-27: «αν δεν έχει νέο άρθρο το τελευταίο δίμηνο ας μην γράφει την ημερομηνία»). Checked in the
 * browser (root layout) so it does not depend on when the site was last built.
 */
export const DATES_VISIBLE_DAYS = 61;

export function loadPost(summary: PostSummary): Post {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", summary.file), "utf8"));
}

/** «2 min read» (Wix) → 2. */
export const readingMinutes = (p: PostSummary) => Number(p.timeToRead.match(/\d+/)?.[0] ?? 1);

/** A local image, or null when Wix itself has no file (two broken post images, see OWNER-CHANGES.md). */
export function tryMedia(file: string | null | undefined): Media | null {
  if (!file) return null;
  try {
    return media(file);
  } catch {
    return null;
  }
}

export const coverOf = (p: PostSummary) => tryMedia(p.cover?.file);

/** 1200×630 social preview (scripts/og-images.mjs): posts/001.json → /og/post/001.jpg. */
export function ogImageOf(p: PostSummary): Media | null {
  if (!coverOf(p)) return null;
  return { src: `/og/post/${path.basename(p.file, ".json")}.jpg`, width: 1200, height: 630 };
}

/** Meta description: the post excerpt, cut at a word (approved fix 5). */
export function postDescription(p: PostSummary): string {
  const t = htmlToText(p.excerpt).replace(/\s+/g, " ").trim();
  if (t.length <= 160) return t;
  const cut = t.slice(0, 157);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/** Excerpt for cards: Wix shows about two lines, cut at a word with «…». */
export function shortExcerpt(p: PostSummary, max = 150): string {
  const t = htmlToText(p.excerpt).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/**
 * «Διαβάστε επίσης» under a post: its chronological neighbours (one newer, two older; at the ends the
 * nearest three), so every post links onward and older posts get read too.
 */
export function relatedPosts(slug: string, count = 3): PostSummary[] {
  const i = POSTS.findIndex((p) => p.slug === slug);
  const order = [i - 1, i + 1, i + 2, i - 2, i + 3, i - 3];
  return order
    .filter((j) => j >= 0 && j < POSTS.length && j !== i)
    .slice(0, count)
    .map((j) => POSTS[j]);
}
