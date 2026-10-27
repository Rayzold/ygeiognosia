import type { Metadata } from "next";
import Image from "next/image";
import PageColumn from "@/components/layout/PageColumn";
import Link from "next/link";
import PostCards from "@/components/blog/PostCards";
import Reveal from "@/components/motion/Reveal";
import { BLOG } from "@/content/blog";
import { HOME } from "@/content/home";
import { POSTS } from "@/lib/content";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

const card = media(HOME.card.image);
const honey = media(HOME.aesthlos.image);
const air = media(HOME.air.image);
const og = media(HOME.ogImage);

export const metadata: Metadata = pageMetadata({
  title: HOME.title,
  absoluteTitle: true,
  description: HOME.description,
  path: "/",
  image: { ...og, alt: "Υγειογνωσία" },
});

const COLUMN_SIZES = "(min-width: 1000px) 980px, 100vw";

/**
 * Home page, as on Wix. Desktop (>=1000px): 980px column, two sections, elements at their measured Wix
 * positions (Wix: SITE_PAGES 980×1035). Mobile: the Wix mobile order, stacked and centred.
 * One DOM for both layouts (no duplicated text): mobile flow, `desk:` absolute positions.
 */
export default function Home() {
  const a = HOME.aesthlos;
  return (
    <PageColumn shade={0.6}>
      <h1 className="sr-only">Υγειογνωσία, κατάστημα βιολογικών προϊόντων</h1>

      {/* Section 1: new address + card */}
      <section>
        <h2 className="px-3 pb-3 pt-4 text-center font-script text-[17px] leading-[1.3] text-white desk:px-0 desk:pb-0 desk:pt-[38px] desk:text-[25px] desk:leading-[27px] desk:whitespace-nowrap">
          {HOME.address.lead} <span className="text-[#bada55]">{HOME.address.highlight}</span>
        </h2>
        <Reveal effect="fade" className="relative mx-[10px] aspect-[980/511] desk:mx-0 desk:mt-[32px] desk:aspect-auto desk:h-[511px]">
          <Image src={card.src} alt={HOME.card.alt} fill sizes={COLUMN_SIZES} priority className="object-cover" />
        </Reveal>
      </section>

      {/* Section 2: Aesthlos honey banner (black box 980×427, image 980×412) */}
      <section className="bg-black pb-10 text-center text-white desk:relative desk:h-[427px] desk:pb-0">
        <Reveal
          effect="slide"
          className="py-3 text-[12px] leading-[1.3] desk:pointer-events-none desk:absolute desk:left-[605px] desk:top-[99px] desk:z-10 desk:w-[300px] desk:py-0 desk:text-[14px] desk:leading-[18px]"
        >
          <p>
            <strong className="font-bold text-[#ffc824]">{a.newLead}</strong> {a.newText}
          </p>
        </Reveal>

        <a href={a.href} target="_blank" rel="noopener" aria-label={`${a.alt} (aesthlos.com)`} className="relative mx-[10px] block aspect-[290/236] desk:mx-0 desk:aspect-auto desk:h-[412px]">
          <Image src={honey.src} alt={a.alt} fill sizes={COLUMN_SIZES} className="object-cover object-[0%_50%] desk:object-center" />
        </a>

        <Reveal
          effect="float"
          className="mt-3 text-[17px] leading-[1.3] desk:pointer-events-none desk:absolute desk:left-[557px] desk:top-[133px] desk:z-10 desk:mt-0 desk:w-[395px] desk:text-[27px] desk:leading-[34px]"
        >
          <p>
            {a.lines[0]}
            <br />
            {a.lines[1]}
            <br />
            <strong className="font-bold">{a.brand}</strong>
          </p>
        </Reveal>

        {/* Wix: 27px Black Diamond, centred at x≈755. The interim script font is much wider, so 22px (centred at 750) keeps it inside the banner. */}
        <Reveal
          effect="slide"
          className="mt-3 px-3 desk:pointer-events-none desk:absolute desk:left-[520px] desk:top-[238px] desk:z-10 desk:mt-0 desk:w-[460px] desk:px-0"
        >
          <h2 className="font-script text-[18px] leading-[1.3] tracking-[0.01em] text-[#ffeebc] desk:whitespace-nowrap desk:text-[22px] desk:leading-[40px]">
            {a.slogan}
          </h2>
        </Reveal>

        <Reveal effect="fade" duration={2000} delay={3000} className="mt-5 desk:absolute desk:left-[907px] desk:top-[342px] desk:z-10 desk:mt-0">
          <a href={HOME.air.href} target="_blank" rel="noopener" aria-label={HOME.air.label} className="mx-auto block h-[36px] w-[31px] desk:h-[55px] desk:w-[47px]">
            <Image src={air.src} alt="" width={47} height={55} sizes="47px" className="h-full w-full object-cover" />
          </a>
        </Reveal>
      </section>

      {/* Section 3 (not on Wix, owner request 2026-10-27): the three newest blog posts */}
      <section aria-labelledby="home-recent-posts" className="px-4 pb-10 pt-8 desk:px-[20px] desk:pb-[40px] desk:pt-[36px]">
        <h2 id="home-recent-posts" className="mb-5 text-center font-script text-[24px] leading-[1.3] text-[#ffc824] desk:mb-[26px] desk:text-[30px]">
          {BLOG.recent}
        </h2>
        <Reveal effect="fade">
          <PostCards posts={POSTS.slice(0, 3)} tone="dark" />
        </Reveal>
        <p className="mt-8 text-center">
          <Link href="/blog" className="inline-flex h-[44px] items-center justify-center rounded-[22px] bg-green-3 px-8 text-[16px] font-bold text-green-5 transition-colors hover:bg-green-2">
            {BLOG.allPosts}
          </Link>
        </p>
      </section>
    </PageColumn>
  );
}
