import Link from "next/link";
import { BLOG } from "@/content/blog";
import { ADDRESS, FOOTER, PHONE } from "@/content/site";
import { POSTS } from "@/lib/content";
import HideOnPaths from "./HideOnPaths";
import { SproutIcon } from "./Icons";
import SocialLinks from "./SocialLinks";

const bullet = "before:mr-[0.6em] before:content-['•']";

/**
 * Site footer. Desktop: the Wix 980×257 panel (green #6B8841 at 44%), elements at their measured positions.
 * Mobile: the Wix mobile footer, centred.
 */
export default function Footer() {
  const phone = (
    <a href={`tel:${PHONE.tel}`} className="whitespace-nowrap hover:underline">
      {PHONE.display}
    </a>
  );
  return (
    <footer className="text-white">
      {/* the home page shows the same posts in its own «Πρόσφατα άρθρα» section */}
      <HideOnPaths paths={["/"]}>
        <FromTheBlog />
        <hr className="mx-auto border-0 border-t border-white/30 desk:w-[980px]" />
      </HideOnPaths>
      {/* desktop */}
      <div className="relative mx-auto hidden h-[257px] w-[980px] bg-green-4/[0.44] text-[15px] leading-[1.4] desk:block">
        <div className="absolute left-[44px] top-[33px] flex items-center gap-[12px]">
          <p className="whitespace-nowrap font-script text-[25px] leading-[1.4]">{FOOTER.follow}</p>
          <SocialLinks />
        </div>
        <hr className="absolute left-[44px] top-[119px] w-[305px] border-0 border-t border-white" />
        <p className="absolute left-[44px] top-[187px] whitespace-pre text-[13px]">{FOOTER.copyright}</p>
        <SproutIcon className="absolute left-[284px] top-[186px] h-[19px] w-[25px] text-white" />

        <p className={`absolute left-[460px] top-[25px] ${bullet}`}>
          {FOOTER.phoneOrders}&nbsp; {phone}
        </p>
        <p className={`absolute left-[460px] top-[84px] ${bullet}`}>{FOOTER.pickup}</p>
        <p className="absolute left-[472px] top-[108px]">{ADDRESS.footer}</p>
        <p className={`absolute left-[460px] top-[163px] ${bullet}`}>{FOOTER.delivery}</p>
        <p className="absolute left-[472px] top-[186px] text-[11px]">{FOOTER.deliveryAreas}</p>
      </div>

      {/* mobile */}
      <div className="bg-green-4/[0.44] px-4 pb-10 pt-6 text-center text-[13px] leading-[1.5] desk:hidden">
        <p className="font-script text-[22px]">{FOOTER.follow}</p>
        <SocialLinks size={26} gap={24} className="mt-3 justify-center" />
        <p className="mt-5 flex items-center justify-center gap-2 whitespace-pre">
          <SproutIcon className="h-[19px] w-[25px] shrink-0" />
          {FOOTER.copyright}
        </p>
        <hr className="mt-3 border-0 border-t border-white" />
        <ul className="mt-4 space-y-3">
          <li>
            <span className={bullet}>{FOOTER.phoneOrders}</span>&nbsp; {phone}
          </li>
          <li>
            <span className={bullet}>{FOOTER.pickup}</span>
            <br />
            {ADDRESS.footer}
          </li>
          <li>
            <span className={bullet}>{FOOTER.delivery}</span>
            <br />
            <span className="text-[11px]">{FOOTER.deliveryAreas}</span>
          </li>
        </ul>
      </div>
    </footer>
  );
}

/**
 * «Από το blog μας»: the three newest posts on every page (owner request 2026-10-27, not on Wix).
 * A band on top of the Wix footer panel, same green.
 */
function FromTheBlog() {
  return (
    <nav aria-labelledby="footer-blog" className="mx-auto bg-green-4/[0.44] px-4 py-6 text-center desk:grid desk:w-[980px] desk:grid-cols-[190px_1fr_130px] desk:items-center desk:gap-6 desk:px-[44px] desk:py-[18px] desk:text-left">
      <h2 id="footer-blog" className="font-script text-[22px] leading-[1.3] desk:text-[25px]">
        {BLOG.fromBlog}
      </h2>
      <ul className="mt-3 space-y-2 text-[14px] leading-[1.35] desk:mt-0 desk:grid desk:grid-cols-3 desk:gap-6 desk:space-y-0">
        {POSTS.slice(0, 3).map((p) => (
          <li key={p.slug}>
            <Link href={p.path} className="hover:underline desk:line-clamp-2">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/blog" className="mt-4 inline-block whitespace-nowrap text-[14px] font-bold text-yellow-1 hover:underline desk:mt-0 desk:justify-self-end">
        {BLOG.allPosts} ›
      </Link>
    </nav>
  );
}
