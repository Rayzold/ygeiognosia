import type { MetadataRoute } from "next";
import { POSTS, PRODUCTS } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** All public URLs, percent-encoded. Grows with each phase; dummy products and /blank-11 are not listed (301). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/") },
    ...PRODUCTS.map((p) => ({ url: absoluteUrl(p.path) })),
    ...POSTS.map((p) => ({ url: absoluteUrl(p.path), lastModified: p.dateModified })),
  ];
}
