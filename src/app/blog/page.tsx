import BlogFeed from "@/components/blog/BlogFeed";
import { BLOG } from "@/content/blog";
import { ogImageOf, LATEST_POST } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

// Wix blog feed, page 1 (/blog). Pages 2… are /blog/page/N, as on Wix.
export function generateMetadata() {
  const image = ogImageOf(LATEST_POST);
  return pageMetadata({ title: BLOG.title, description: BLOG.description, path: "/blog", image: image ? { ...image, alt: BLOG.title } : undefined });
}

export default function BlogPage() {
  return <BlogFeed page={1} />;
}
