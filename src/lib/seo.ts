import type { Metadata } from "next";
import { ADDRESS, EMAIL, OPENING_HOURS, PHONE, SITE_NAME, SITE_URL, SOCIAL } from "@/content/site";

/**
 * Absolute URL for a site path. Greek slugs are percent-encoded (RFC 3986), as Google recommends for
 * sitemaps; browsers show them decoded and both forms are the same URL.
 */
export function absoluteUrl(path: string): string {
  const p = path === "/" ? "" : path;
  return SITE_URL + encodeURI(decodeURI(p));
}

type PageMeta = {
  title: string;
  /** true: use the title as is, without the " | Υγειογνωσία" suffix (home page) */
  absoluteTitle?: boolean;
  description?: string;
  path: string;
  image?: { src: string; width: number; height: number; alt?: string };
  /** blog posts: og:type article with its dates */
  article?: { publishedTime: string; modifiedTime?: string; author?: string };
};

/** Title, description, canonical and Open Graph for one page. */
export function pageMetadata({ title, absoluteTitle, description, path, image, article }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : undefined;
  const common = { locale: "el_GR", siteName: SITE_NAME, url, title, description, images };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: article
      ? { ...common, type: "article", publishedTime: article.publishedTime, modifiedTime: article.modifiedTime, authors: article.author ? [article.author] : undefined }
      : { ...common, type: "website" },
    twitter: { card: "summary_large_image", title, description, images: image ? [image.src] : undefined },
  };
}

/** LocalBusiness (health food store) for the physical shop — approved fix 6. */
export function localBusinessJsonLd(logoSrc: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    alternateName: "Ygeiognosia",
    description: "Κατάστημα υγιεινής διατροφής και φυσικών προϊόντων στη Νέα Σμύρνη.",
    url: SITE_URL,
    logo: SITE_URL + logoSrc,
    image: SITE_URL + logoSrc,
    telephone: PHONE.tel,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.locality,
      postalCode: ADDRESS.postalCode,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.country,
    },
    openingHoursSpecification: OPENING_HOURS.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${h.day}`,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: [SOCIAL.facebook, SOCIAL.instagram],
  };
}

/** <script type="application/ld+json"> payload, safe against "</script>" in strings. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
