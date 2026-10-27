import Image from "next/image";
import { BLOG } from "@/content/blog";
import { MEDIA } from "@/content/site";
import { readingMinutes, type PostSummary } from "@/lib/blog";
import { greekDate } from "@/lib/content";
import { media } from "@/lib/media";

/**
 * The date, shown only while the blog is active (html[data-blog-fresh], set in the root layout).
 * Hidden dates stay in the HTML as <time datetime> and in the BlogPosting JSON-LD.
 */
export function PostDate({ post, separator = true }: { post: PostSummary; separator?: boolean }) {
  return (
    <span className="blog-date">
      {separator && <span aria-hidden="true"> · </span>}
      <time dateTime={post.datePublished}>{greekDate(post.datePublished)}</time>
    </span>
  );
}

/** Reading time («2 λεπτά ανάγνωσης») and, while the blog is active, the date. */
export function PostStats({ post }: { post: PostSummary }) {
  return (
    <>
      <span>{BLOG.minutes(readingMinutes(post))}</span>
      <PostDate post={post} />
    </>
  );
}

/** Wix writer line: avatar (the logo, 32px round) and «Υγειογνωσία». */
export function Writer({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  const logo = media(MEDIA.logo);
  return (
    <p className={`flex items-center gap-[10px] ${className}`}>
      <Image src={logo.src} width={32} height={32} alt="" sizes="32px" className="h-[32px] w-[32px] rounded-full bg-white object-cover" />
      <span>
        {BLOG.author}
        {children}
      </span>
    </p>
  );
}
