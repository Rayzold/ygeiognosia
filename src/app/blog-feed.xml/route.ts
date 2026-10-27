import fs from "node:fs";
import path from "node:path";
import { BLOG } from "@/content/blog";
import { SITE_URL } from "@/content/site";
import { POSTS } from "@/lib/content";
import { ogImageOf, postDescription } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

// RSS 2.0 feed of all posts, at Wix's own feed URL (/blog-feed.xml) so existing subscribers keep working.
// Also usable for automatic posting to social media (e.g. Facebook/Instagram schedulers, IFTTT).
export const dynamic = "force-static";

/** Byte size of a generated social image (public/og, written by scripts/og-images.mjs before next build). */
const sizeOf = (src: string) => {
  try {
    return fs.statSync(path.join(process.cwd(), "public", src)).size;
  } catch {
    return 0;
  }
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = POSTS.map((p) => {
    const url = absoluteUrl(p.path);
    const image = ogImageOf(p);
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.datePublished).toUTCString()}</pubDate>
      <dc:creator>${esc(BLOG.author)}</dc:creator>
      <description>${esc(postDescription(p))}</description>${image ? `\n      <enclosure url="${SITE_URL}${image.src}" type="image/jpeg" length="${sizeOf(image.src)}"/>` : ""}
    </item>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(BLOG.rssTitle)}</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${esc(BLOG.description)}</description>
    <language>el</language>
    <lastBuildDate>${new Date(POSTS[0].dateModified).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog-feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
