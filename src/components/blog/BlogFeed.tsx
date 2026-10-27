import Link from "next/link";
import PageColumn from "@/components/layout/PageColumn";
import { BLOG } from "@/content/blog";
import { BLOG_PAGES, blogPagePath, postsOnPage } from "@/lib/blog";
import PostListItem from "./PostListItem";

/**
 * /blog and /blog/page/N: the Wix blog feed (white column, 10 posts per page, «« ‹ 1 2 3 4 5 › »» pagination
 * with a window of five pages). Every page is static HTML, so all 81 posts are reachable by crawlers.
 */
export default function BlogFeed({ page }: { page: number }) {
  return (
    <PageColumn shade={0}>
      <div className="bg-white px-0 pb-10 desk:pb-[30px]">
        <h1 className="sr-only">
          {BLOG.title}
          {page > 1 ? ` — ${BLOG.page(page)}` : ""}
        </h1>
        <div>
          {postsOnPage(page).map((p, i) => (
            <PostListItem key={p.slug} post={p} priority={i === 0} />
          ))}
        </div>
        <Pagination page={page} />
        <p className="mt-2 text-center text-[13px] text-grey-4">
          <a href="/blog-feed.xml" className="inline-flex items-center gap-1 hover:underline">
            <RssIcon /> {BLOG.rss}
          </a>
        </p>
      </div>
    </PageColumn>
  );
}

function Pagination({ page }: { page: number }) {
  const start = Math.max(1, Math.min(page - 2, BLOG_PAGES - 4));
  const pages = Array.from({ length: Math.min(5, BLOG_PAGES) }, (_, i) => start + i);
  const box = "flex h-[36px] min-w-[36px] items-center justify-center px-1 text-[15px]";
  const arrow = (target: number, label: string, glyph: React.ReactNode, disabled: boolean) =>
    disabled ? (
      <span className={`${box} text-black/25`} aria-hidden="true">
        {glyph}
      </span>
    ) : (
      <Link href={blogPagePath(target)} aria-label={label} className={`${box} text-green-5 hover:text-green-4`}>
        {glyph}
      </Link>
    );
  return (
    <nav aria-label={BLOG.pagination.label} className="mt-8 flex flex-wrap items-center justify-center gap-[6px] desk:mt-[16px]">
      {arrow(1, BLOG.pagination.first, "«", page === 1)}
      {arrow(page - 1, BLOG.pagination.previous, "‹", page === 1)}
      {pages.map((n) =>
        n === page ? (
          <span key={n} aria-current="page" className={`${box} rounded-full bg-green-3 font-bold text-green-5`}>
            {n}
          </span>
        ) : (
          <Link key={n} href={blogPagePath(n)} aria-label={BLOG.page(n)} className={`${box} text-green-5 hover:underline`}>
            {n}
          </Link>
        ),
      )}
      {arrow(page + 1, BLOG.pagination.next, "›", page === BLOG_PAGES)}
      {arrow(BLOG_PAGES, BLOG.pagination.last, "»", page === BLOG_PAGES)}
    </nav>
  );
}

const RssIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[14px] w-[14px]" fill="#ee802f">
    <circle cx="5" cy="19" r="2.5" />
    <path d="M2.5 9.5v3.2A8.8 8.8 0 0 1 11.3 21.5h3.2A12 12 0 0 0 2.5 9.5zm0-6.5v3.2a15.3 15.3 0 0 1 15.3 15.3H21A18.5 18.5 0 0 0 2.5 3z" />
  </svg>
);
