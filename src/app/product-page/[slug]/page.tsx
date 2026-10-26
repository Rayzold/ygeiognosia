// PHASE 2 STUB — proves Greek-slug routes build and deploy. The real product template comes in Phase 5.
import Image from "next/image";
import { notFound } from "next/navigation";
import { PRODUCTS, decodeEntities, decodeSlug, productBySlug } from "@/lib/content";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = productBySlug(decodeSlug((await params).slug));
  if (!p) return {};
  return pageMetadata({ title: decodeEntities(p.name), path: p.path });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = productBySlug(decodeSlug((await params).slug));
  if (!p) notFound();
  const img = p.media[0] ? media(p.media[0].file) : null;
  return (
    <section className="mx-auto max-w-[980px] bg-white px-6 py-10 text-black">
      <h1 className="text-[28px]">{decodeEntities(p.name)}</h1>
      <p className="mt-2 text-[20px]">{p.formattedDiscountedPrice}</p>
      {img && <Image src={img.src} width={img.width} height={img.height} alt={decodeEntities(p.name)} sizes="(min-width: 1000px) 400px, 100vw" className="mt-6 h-auto w-full max-w-[400px]" />}
    </section>
  );
}
