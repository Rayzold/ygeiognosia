// PHASE 2 STUB — proves Greek-slug routes build and deploy. The real post template comes in Phase 5β.
import Image from "next/image";
import { notFound } from "next/navigation";
import { POSTS, decodeSlug, greekDate, postBySlug } from "@/lib/content";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = postBySlug(decodeSlug((await params).slug));
  if (!p) return {};
  return pageMetadata({ title: p.title, path: p.path });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = postBySlug(decodeSlug((await params).slug));
  if (!p) notFound();
  const cover = p.cover ? media(p.cover.file) : null;
  return (
    <article className="mx-auto max-w-[980px] bg-white px-6 py-10 text-black">
      <p className="text-[14px]">
        <time dateTime={p.datePublished}>{greekDate(p.datePublished)}</time>
      </p>
      <h1 className="mt-2 text-[28px]">{p.title}</h1>
      {cover && <Image src={cover.src} width={cover.width} height={cover.height} alt={p.title} sizes="(min-width: 1000px) 740px, 100vw" className="mt-6 h-auto w-full max-w-[740px]" />}
    </article>
  );
}
