import { CONTENT_PAGES } from "@/content/pages";
import { POSTS, PRODUCTS, decodeEntities, formatPrice, htmlToText } from "@/lib/content";
import { media } from "@/lib/media";
import { describe, loadLayout } from "@/lib/wix-layout";

// Static search index for /search (built once, fetched by the browser only when someone searches).
export const dynamic = "force-static";

export type SearchItem = { type: "product" | "post" | "page"; title: string; path: string; text: string; image?: string; price?: string };

function safeMedia(file?: string) {
  try {
    return file ? media(file).src : undefined;
  } catch {
    return undefined;
  }
}

export function GET() {
  const items: SearchItem[] = [
    ...PRODUCTS.map((p) => ({
      type: "product" as const,
      title: decodeEntities(p.name).trim(),
      path: p.path,
      text: htmlToText(p.descriptionHtml).slice(0, 600),
      image: safeMedia(p.media[0]?.file),
      price: formatPrice(p.price),
    })),
    ...POSTS.map((p) => ({ type: "post" as const, title: p.title, path: p.path, text: (p.excerpt ?? "").slice(0, 400), image: safeMedia(p.cover?.file) })),
    ...Object.entries(CONTENT_PAGES)
      .filter(([, d]) => !d.category)
      .map(([slug, d]) => ({ type: "page" as const, title: d.title.split(" | ")[0], path: `/${slug}`, text: describe(loadLayout("pages", slug)) })),
    { type: "page", title: "Αρχική", path: "/", text: "Υγειογνωσία, κατάστημα βιολογικών προϊόντων, Βυζαντίου 23, Νέα Σμύρνη" },
  ];
  return Response.json(items);
}
