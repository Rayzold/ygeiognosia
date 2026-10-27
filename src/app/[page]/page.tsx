import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VideoBackground from "@/components/layout/VideoBackground";
import WixLayout from "@/components/wix/WixLayout";
import { CONTENT_PAGES } from "@/content/pages";
import { SHOP } from "@/content/shop";
import type { CardItem } from "@/components/shop/ProductGallery";
import { categoryProducts, decodeEntities, formatPrice } from "@/lib/content";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { allNodes, describe, loadLayout, type ImageNode } from "@/lib/wix-layout";

// Top-level Wix pages (/about-us, /people, /contact, …), each rendered from its Wix layout.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CONTENT_PAGES).map((page) => ({ page }));
}

type Props = { params: Promise<{ page: string }> };

function wixMeta(slug: string): Record<string, string | null> {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "pages", "pages", slug, "meta.json"), "utf8"));
}

/** og:image: the Wix one when we have the file, otherwise the page's first image. */
function ogImage(slug: string) {
  const wix = wixMeta(slug)["og:image"]?.match(/\/media\/([^/]+)/)?.[1];
  if (wix) {
    try {
      return media(decodeURIComponent(wix));
    } catch {
      /* not downloaded: fall back */
    }
  }
  const first = allNodes(loadLayout("pages", slug).nodes).find((n): n is ImageNode => n.kind === "image");
  if (first) return media(first.file);
  const product = CONTENT_PAGES[slug]?.category ? categoryProducts(CONTENT_PAGES[slug].category!)[0] : undefined;
  return product?.media[0] ? media(product.media[0].file) : undefined;
}

/** Store page description: the category and the first product names (approved fix 5). */
function describeCategory(title: string, category: string): string {
  const names = categoryProducts(category).map((p) => decodeEntities(p.name).trim());
  const t = `${title}: ${names.join(", ")}`;
  return t.length <= 160 ? t : t.slice(0, 157).replace(/,?\s+\S*$/, "") + "…";
}

function cards(category: string): CardItem[] {
  return categoryProducts(category).map((p) => {
    const img = p.media[0] ? media(p.media[0].file) : null;
    // without prices (SHOP.showPrices) the old Wix prices must not reach the page, not even in the React payload
    const price = SHOP.showPrices ? { price: Number(p.price), formatted: formatPrice(p.price) } : { price: 0, formatted: "" };
    return { path: p.path, name: decodeEntities(p.name).trim(), ...price, image: img, ribbon: p.ribbon };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const def = CONTENT_PAGES[page];
  if (!def) return {};
  const wixDescription = def.useWixDescription ? wixMeta(page)["og:description"]?.replace(/\s+/g, " ").trim() : undefined;
  const image = ogImage(page);
  return pageMetadata({
    title: def.title,
    absoluteTitle: def.absoluteTitle,
    description: def.description ?? wixDescription ?? (def.category ? describeCategory(def.title, def.category) : describe(loadLayout("pages", page))),
    path: `/${page}`,
    image: image ? { ...image, alt: def.title } : undefined,
  });
}

export default async function ContentPage({ params }: Props) {
  const { page } = await params;
  const def = CONTENT_PAGES[page];
  if (!def) notFound();
  const audio = def.audio && fs.existsSync(path.join(process.cwd(), "public", def.audio)) ? def.audio : undefined;
  return (
    <>
      {def.video && <VideoBackground src={def.video.src} poster={def.video.poster} />}
      <WixLayout layout={loadLayout("pages", page)} title={def.title.split(" | ")[0]} audio={audio} gallery={def.category ? cards(def.category) : undefined} />
    </>
  );
}
