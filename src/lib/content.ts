// Build-time access to the generated content (content/*.json, see scripts/build_content.py).
import categories from "../../content/categories.json";
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

export type Category = { path: string; categoryId: string; name: string; products: string[] };

export const PRODUCTS = products as unknown as Product[];
/** Wix Stores categories (and "All Products" = /shop), product slugs in Wix order. */
export const CATEGORIES = categories as unknown as Category[];
export const categoryByPath = (path: string) => CATEGORIES.find((c) => c.path === path);
export const POSTS = postsIndex as unknown as PostSummary[];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);

/**
 * Products of a store page in Wix order. /shop ("All Products") lists every product: the 20 Wix showed
 * first, then the rest in catalogue order (Wix loads them with «Load More»).
 */
export function categoryProducts(path: string): Product[] {
  const c = categoryByPath(path);
  if (!c) return [];
  const first = c.products.map(productBySlug).filter((p): p is Product => !!p);
  if (path !== "/shop") return first;
  return [...first, ...PRODUCTS.filter((p) => !c.products.includes(p.slug))];
}

const EUR = new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" });
/** Price as Wix shows it in the store widgets, e.g. «16,00 €». */
export const formatPrice = (n: number | string) => EUR.format(Number(n));

/** Plain text of a Wix product description (for meta descriptions and search). */
export function htmlToText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>|<\/p>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

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
