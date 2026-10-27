import Image from "next/image";
import Link from "next/link";
import { coverOf, type PostSummary } from "@/lib/blog";
import { PostStats } from "./PostMeta";

/**
 * Three post cards in a row. "light" = Wix «Recent Posts» under a post (291px cards, 16:9 cover, 18px bold
 * title, a rule and the stats line). "dark" = the same card on the dark home column.
 */
export default function PostCards({ posts, tone = "light", headingLevel = 3 }: { posts: PostSummary[]; tone?: "light" | "dark"; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const dark = tone === "dark";
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3 desk:gap-[33px]">
      {posts.map((p) => {
        const cover = coverOf(p);
        return (
          <li key={p.slug}>
            <article className={`group flex h-full flex-col ${dark ? "bg-[rgba(53,68,33,0.86)]" : "border border-black/10 bg-white"}`}>
              <Link href={p.path} tabIndex={-1} aria-hidden="true" className="relative block aspect-[291/163] overflow-hidden bg-green-1">
                {cover && <Image src={cover.src} alt="" fill sizes="(min-width: 1000px) 291px, (min-width: 640px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />}
              </Link>
              <div className="flex flex-1 flex-col px-6 pb-4 pt-5">
                <H className={`text-[18px] font-bold leading-[22px] ${dark ? "text-white" : "text-black"}`}>
                  <Link href={p.path} className="hover:underline">
                    {p.title}
                  </Link>
                </H>
                <div className="min-h-5 flex-1" />
                <p className={`border-t pt-3 text-[12px] leading-[18px] ${dark ? "border-white/20 text-green-2" : "border-black/20 text-grey-4"}`}>
                  <PostStats post={p} />
                </p>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
