import Image from "next/image";
import { MEDIA } from "@/content/site";
import { media } from "@/lib/media";

const bg = media(MEDIA.background);

/**
 * Wix page background: one photo, fixed, "fill", aligned left (same on every page except /people,
 * which has a background video). A fixed layer instead of background-attachment so it also works on iOS.
 *
 * It is decoration under a dark column, so it must not compete with the page's main image: no preload,
 * low fetch priority, and half resolution on phones (a blurred photo). Until it arrives the layer shows
 * the photo's dark green instead of white.
 */
export default function SiteBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[#10140a]">
      <Image src={bg.src} alt="" fill sizes="(max-width: 999px) 50vw, 100vw" loading="eager" fetchPriority="low" className="object-cover object-[0%_50%]" />
    </div>
  );
}
