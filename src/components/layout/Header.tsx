import Image from "next/image";
import Link from "next/link";
import { HEADER, MEDIA } from "@/content/site";
import { media } from "@/lib/media";
import { CartBadge, cartLabel } from "./CartLink";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import SearchBox from "./SearchBox";
import SocialLinks from "./SocialLinks";

const logo = media(MEDIA.logo);

/**
 * Site header. Desktop (>=1000px): the Wix 980×375 header, every element at its measured Wix position.
 * Mobile: the Wix mobile header (logo + menu button, cart, search, tagline), stacked and centred.
 */
export default function Header() {
  return (
    <header>
      {/* desktop */}
      <div className="relative mx-auto hidden h-[375px] w-[980px] desk:block">
        <Link href="/" aria-label="Υγειογνωσία, αρχική σελίδα" className="absolute left-[392px] top-[78px] block h-[184px] w-[184px]">
          <Image src={logo.src} width={logo.width} height={logo.height} alt="Υγειογνωσία" sizes="184px" priority className="h-full w-full object-cover" />
        </Link>

        <p className="absolute right-[58px] top-[40px] whitespace-nowrap text-right text-[15px] leading-[1.4] text-white" aria-label={cartLabel}>
          {HEADER.cart}
        </p>
        <CartBadge className="absolute left-[932px] top-[26px] h-[35px] w-[29px]" />

        <Link href="/" className="absolute right-[4px] top-[189px] whitespace-nowrap text-right font-script text-[25px] leading-[1.4] text-white">
          {HEADER.tagline}
        </Link>
        <p className="absolute right-[44px] top-[230px] whitespace-nowrap font-script text-[14px] leading-[1.4] tracking-[0.05em] text-white">
          {HEADER.follow}
        </p>
        <SocialLinks className="absolute left-[940px] top-[232px]" />

        <SearchBox className="absolute left-[744px] top-[290px] h-[40px] w-[235px]" />

        <div className="absolute left-0 top-[340px]">
          <DesktopNav />
        </div>
      </div>

      {/* mobile */}
      <div className="relative flex flex-col items-center px-[10px] pb-3 pt-4 desk:hidden">
        <Link href="/" aria-label="Υγειογνωσία, αρχική σελίδα" className="block h-[120px] w-[120px]">
          <Image src={logo.src} width={logo.width} height={logo.height} alt="Υγειογνωσία" sizes="120px" priority className="h-full w-full object-cover" />
        </Link>
        <div className="absolute right-2 top-10">
          <MobileMenu />
        </div>
        <p className="mt-4 text-[14px] text-white" aria-label={cartLabel}>
          {HEADER.cart}
        </p>
        <CartBadge className="mt-1 h-[34px] w-[29px]" />
        <SearchBox className="mt-3 h-[52px] w-full" />
        <Link href="/" className="mt-3 font-script text-[24px] leading-[1.4] text-white">
          {HEADER.tagline}
        </Link>
      </div>
    </header>
  );
}
