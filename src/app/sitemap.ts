import type { MetadataRoute } from "next";
import { CONTENT_PAGES } from "@/content/pages";
import { POSTS, PRODUCTS } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** All public URLs, percent-encoded. Grows with each phase; dummy products and /blank-11 are not listed (301). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/") },
    ...Object.keys(CONTENT_PAGES).map((p) => ({ url: absoluteUrl(`/${p}`) })),
    ...PRODUCTS.map((p) => ({ url: absoluteUrl(p.path) })),
    ...POSTS.map((p) => ({ url: absoluteUrl(p.path), lastModified: p.dateModified })),
  ];
}
