import Image from "next/image";
import Link from "next/link";
import { coverOf, shortExcerpt, type PostSummary } from "@/lib/blog";
import { PostStats, Writer } from "./PostMeta";

/**
 * Wix blog feed item ("side by side"): 980×237, 3px #354421 frame, square cover on the left, text panel
 * rgba(53,68,33,.86) with writer line, title (20px white), excerpt (15px, 3 lines; Wix #A0CC62 → #C5DDA4 for AA contrast), a faint rule and
 * the stats line (Wix: views/comments, which we do not have → reading time and, while active, the date).
 * Mobile: cover on top.
 */
export default function PostListItem({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  const cover = coverOf(post);
  return (
    <article className="relative mb-4 flex flex-col border-[3px] border-green-5 desk:mb-0 desk:-mt-[3px] desk:h-[237px] desk:flex-row desk:first:mt-0">
      <Link href={post.path} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/10] shrink-0 overflow-hidden bg-white desk:aspect-auto desk:h-full desk:w-[231px]">
        {cover && <Image src={cover.src} alt="" fill priority={priority} sizes="(min-width: 1000px) 231px, 100vw" className="object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col bg-[rgba(53,68,33,0.86)] px-5 pb-4 pt-4 desk:px-[45px] desk:pb-0 desk:pt-[22px]">
        <Writer className="text-[12px] text-green-2" />
        <h2 className="mt-4 text-[20px] font-bold leading-[24px] text-white desk:mt-[14px]">
          <Link href={post.path} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-[15px] leading-[18px] text-green-2 desk:mt-[12px]">{shortExcerpt(post, 220)}</p>
        <hr className="mt-4 border-0 border-t border-green-3/20 desk:mt-auto" />
        <p className="py-3 text-[12px] leading-[18px] text-green-2 desk:pb-[22px] desk:pt-[14px]">
          <PostStats post={post} />
        </p>
      </div>
    </article>
  );
}
