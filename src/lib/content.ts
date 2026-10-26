// Build-time access to the generated content (content/*.json, see scripts/build_content.py).
import postsIndex from "../../content/posts-index.json";
import products from "../../content/products.json";

export type WixImage = { id: string; w?: number | string; h?: number | string; alt?: string; title?: string; type?: string; file: string };

export type Product = {
  slug: string;
  path: string;
  wixId: string;
  name: string;
  descriptionHtml: string;
  price: number;
  comparePrice: number;
  discountedPrice: number;
  formattedPrice: string;
  formattedDiscountedPrice: string;
  currency: string;
  ribbon: string;
  isVisible: boolean;
  isInStock: boolean;
  categoryIds: string[];
  additionalInfo: { title: string; description: string }[];
  media: WixImage[];
  meta: Record<string, string | null>;
};

export type PostSummary = {
  slug: string;
  path: string;
  title: string;
  datePublished: string;
  dateModified: string;
  excerpt: string;
  timeToRead: string;
  cover: WixImage | null;
  categories: string[];
  file: string;
};

export const PRODUCTS = products as unknown as Product[];
export const POSTS = postsIndex as unknown as PostSummary[];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);

/** Route params arrive percent-encoded for non-ASCII slugs; content uses the decoded form. */
export const decodeSlug = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** HTML entities in Wix names (e.g. "&amp;") → plain text. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const GREEK_MONTHS = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαΐ", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];

/** Wix blog date in Greek, e.g. «15 Φεβ 2025» (approved fix 2). Athens time. */
export function greekDate(iso: string): string {
  const d = new Date(new Date(iso).toLocaleString("en-US", { timeZone: "Europe/Athens" }));
  return `${d.getDate()} ${GREEK_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
