import Image from "next/image";
import { MEDIA } from "@/content/site";
import { media } from "@/lib/media";

const bg = media(MEDIA.background);

/**
 * Wix page background: one photo, fixed, "fill", aligned left (same on every page except /people,
 * which has a background video). A fixed layer instead of background-attachment so it also works on iOS.
 */
export default function SiteBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-white">
      <Image src={bg.src} alt="" fill sizes="100vw" priority className="object-cover object-[0%_50%]" />
    </div>
  );
}
