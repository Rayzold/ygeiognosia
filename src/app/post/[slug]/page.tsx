import Link from "next/link";
import { notFound } from "next/navigation";
import PageColumn from "@/components/layout/PageColumn";
import PostBody from "@/components/blog/PostBody";
import PostCards from "@/components/blog/PostCards";
import { PostStats, Writer } from "@/components/blog/PostMeta";
import ShareBar from "@/components/share/ShareBar";
import { BLOG } from "@/content/blog";
import { MEDIA, SITE_NAME, SITE_URL } from "@/content/site";
import { coverOf, loadPost, ogImageOf, postDescription, readingMinutes, relatedPosts } from "@/lib/blog";
import { POSTS, decodeSlug, postBySlug } from "@/lib/content";
import { media } from "@/lib/media";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

// Wix blog post (one template, 81 posts): white column, «Όλα τα άρθρα» bar, Wix «Πίσω» button, 740px text
// column with the Ricos blocks in Wix geometry, share buttons (top and bottom), «Διαβάστε επίσης».
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = postBySlug(decodeSlug((await params).slug));
  if (!p) return {};
  const og = ogImageOf(p);
  return pageMetadata({
    title: p.title,
    description: postDescription(p),
    path: p.path,
    image: og ? { ...og, alt: p.title } : undefined,
    article: { publishedTime: p.datePublished, modifiedTime: p.dateModified },
  });
}

function postJsonLd(p: ReturnType<typeof loadPost>) {
  const url = absoluteUrl(p.path);
  const og = ogImageOf(p);
  const cover = coverOf(p);
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title.length > 110 ? p.title.slice(0, 109) + "…" : p.title,
      description: postDescription(p),
      image: [og && SITE_URL + og.src, cover && SITE_URL + cover.src].filter(Boolean),
      datePublished: p.datePublished,
      dateModified: p.dateModified,
      inLanguage: "el",
      timeRequired: `PT${readingMinutes(p)}M`,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: SITE_URL + media(MEDIA.logo).src } },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: BLOG.title, item: absoluteUrl("/blog") },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    },
  ];
}

export default async function PostPage({ params }: Props) {
  const summary = postBySlug(decodeSlug((await params).slug));
  if (!summary) notFound();
  const p = loadPost(summary);
  const url = absoluteUrl(p.path);
  const og = ogImageOf(p);
  const shareImage = og ? SITE_URL + og.src : undefined;

  return (
    <PageColumn shade={0}>
      <div className="relative bg-white text-black">
        {/* Wix blog header: «All Posts» + search; the site's «Πίσω» button (→ /blog) sits under it on the right */}
        <div className="flex h-[64px] items-center gap-4 px-4 desk:h-[80px] desk:px-[20px]">
          <Link href="/blog" className="text-[16px] leading-[20px] hover:underline">
            {BLOG.allPosts}
          </Link>
          <Link href="/search" aria-label={BLOG.search} className="ml-auto flex h-[32px] w-[32px] items-center justify-center hover:text-green-4 desk:mr-[3px]">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 21 21" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            href="/blog"
            className="flex h-[30px] w-[96px] items-center justify-center gap-[6px] bg-green-4 text-white transition-colors hover:bg-green-5 desk:absolute desk:right-[35px] desk:top-[94px] desk:z-10"
          >
            <svg viewBox="0 0 200 200" aria-hidden="true" className="h-[22px] w-[22px]" fill="currentColor">
              <path d="M57.654 179.5c-.482 0-.964-.161-1.366-.402-1.125-.723-1.527-2.088-1.045-3.292L84.895 105.3h-27.24a2.664 2.664 0 0 1-2.25-1.285c-.482-.803-.562-1.767-.08-2.57l39.696-79.5c.402-.883 1.366-1.445 2.33-1.445h42.347c.964 0 1.848.562 2.33 1.365.482.883.402 1.847-.08 2.73L111.01 73.5h31.339c1.045 0 1.929.562 2.411 1.526.402.964.321 2.008-.402 2.811l-84.695 100.7c-.482.642-1.286.963-2.009.963" />
            </svg>
            <span className="font-script text-[19px] leading-none">{BLOG.back}</span>
          </Link>
        </div>

        <article className="px-4 pb-10 pt-4 desk:mx-auto desk:w-[740px] desk:box-content desk:px-[120px] desk:pb-0 desk:pt-[36px]">
          <header>
            <Writer className="text-[14px] text-grey-4">
              <span aria-hidden="true"> · </span>
              <PostStats post={p} />
            </Writer>
            <h1 className="mt-6 text-[28px] font-bold leading-[1.25] desk:mt-[30px] desk:text-[40px] desk:leading-[50px]">{p.title}</h1>
            <div className="mt-5">
              <ShareBar url={url} title={p.title} image={shareImage} />
            </div>
          </header>

          <div className="mt-4 desk:mt-[12px]">
            <PostBody blocks={p.blocks} title={p.title} />
          </div>

          <footer className="mt-10 border-y border-black/20 py-8">
            <ShareBar url={url} title={p.title} image={shareImage} variant="full" />
          </footer>
        </article>

        <section aria-labelledby="read-also" className="px-4 pb-12 pt-10 desk:px-[20px] desk:pb-[45px] desk:pt-[60px]">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 id="read-also" className="text-[18px] leading-[27px]">
              {BLOG.readAlso}
            </h2>
            <Link href="/blog" className="text-[14px] hover:underline">
              {BLOG.allPosts}
            </Link>
          </div>
          <PostCards posts={relatedPosts(p.slug)} />
          <p className="mt-8 text-center">
            <Link href="/blog" className="inline-flex h-[44px] items-center justify-center rounded-[22px] bg-green-5 px-8 text-[16px] text-white transition-colors hover:bg-green-4">
              {BLOG.allPosts}
            </Link>
          </p>
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(postJsonLd(p)) }} />
    </PageColumn>
  );
}
