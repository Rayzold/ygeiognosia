import { notFound } from "next/navigation";
import BlogFeed from "@/components/blog/BlogFeed";
import { BLOG } from "@/content/blog";
import { BLOG_PAGES, LATEST_POST, blogPagePath, ogImageOf } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

// /blog/page/2 … /blog/page/9 (Wix pagination URLs).
export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: BLOG_PAGES - 1 }, (_, i) => ({ n: String(i + 2) }));
}

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props) {
  const n = Number((await params).n);
  const image = ogImageOf(LATEST_POST);
  return pageMetadata({
    title: `${BLOG.title} — ${BLOG.page(n)}`,
    description: `${BLOG.description} ${BLOG.page(n)}.`,
    path: blogPagePath(n),
    image: image ? { ...image, alt: BLOG.title } : undefined,
  });
}

export default async function BlogPageN({ params }: Props) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 2 || n > BLOG_PAGES) notFound();
  return <BlogFeed page={n} />;
}
