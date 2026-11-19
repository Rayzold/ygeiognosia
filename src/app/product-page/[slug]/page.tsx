import Image from "next/image";
import { notFound } from "next/navigation";
import PageColumn from "@/components/layout/PageColumn";
import ShareLinks from "@/components/shop/ShareLinks";
import { PhoneIcon } from "@/components/layout/Icons";
import { SHOP } from "@/content/shop";
import { PHONE } from "@/content/site";
import Link from "next/link";
import { CONTENT_PAGES } from "@/content/pages";
import { CATEGORIES, PRODUCTS, decodeEntities, decodeSlug, formatPrice, htmlToText, productBySlug, type Product } from "@/lib/content";
import { media } from "@/lib/media";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

// Wix Stores product page (one template, 95 products). Desktop: Wix positions (photo 500×500 at x45/y25,
// details column 355px at x580, description under the photo). Mobile: photo, details, description.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const name = (p: Product) => decodeEntities(p.name).trim();

function description(p: Product): string {
  const t = htmlToText(p.descriptionHtml);
  if (t.length <= 160) return t;
  const cut = t.slice(0, 157);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

export async function generateMetadata({ params }: Props) {
  const p = productBySlug(decodeSlug((await params).slug));
  if (!p) return {};
  const img = p.media[0] ? media(p.media[0].file) : undefined;
  return pageMetadata({ title: name(p), description: description(p) || undefined, path: p.path, image: img ? { ...img, alt: name(p) } : undefined });
}

/** JSON-LD Product + Offer (price, EUR, availability); without prices, Product only. */
function productJsonLd(p: Product, image?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name(p),
    description: htmlToText(p.descriptionHtml) || undefined,
    image: image ? [image] : undefined,
    url: absoluteUrl(p.path),
    offers: !SHOP.showPrices ? undefined : {
      "@type": "Offer",
      url: absoluteUrl(p.path),
      price: Number(p.price).toFixed(2),
      priceCurrency: "EUR",
      availability: p.isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

/** Way back to the catalogue: «Όλα τα προϊόντα» and the product's first store category (page titles as shown on the site). */
function trail(p: Product): { name: string; path: string }[] {
  const all = { name: CONTENT_PAGES.shop.title, path: "/shop" };
  const c = CATEGORIES.find((c) => c.path !== "/shop" && c.products.includes(p.slug));
  const title = c && CONTENT_PAGES[c.path.slice(1)]?.title;
  return c && title ? [all, { name: title, path: c.path }] : [all];
}

function breadcrumbJsonLd(p: Product, crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [...crumbs, { name: name(p), path: p.path }].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

export default async function ProductPage({ params }: Props) {
  const p = productBySlug(decodeSlug((await params).slug));
  if (!p) notFound();
  const img = p.media[0] ? media(p.media[0].file) : null;
  const imageUrl = img ? absoluteUrl(img.src) : undefined;
  const crumbs = trail(p);

  return (
    <PageColumn shade={0.6}>
      {/* not on Wix: a product page had no way back to its category or to the catalogue */}
      <nav aria-label={SHOP.breadcrumb} className="px-4 pt-3 text-[14px] leading-[20px] text-white desk:px-[45px] desk:pt-[14px]">
        <ol className="flex flex-wrap items-center gap-x-2">
          {crumbs.map((c, i) => (
            <li key={c.path} className="flex items-center gap-x-2">
              {i > 0 && (
                <span aria-hidden="true" className="text-white/60">
                  ›
                </span>
              )}
              <Link href={c.path} className="inline-block py-[10px] underline decoration-white/40 underline-offset-4 hover:text-green-2 hover:decoration-green-2">
                {c.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <article className="grid grid-cols-1 gap-y-6 px-4 pb-6 pt-2 desk:min-h-[843px] desk:grid-cols-[500px_355px] desk:content-start desk:gap-x-[35px] desk:gap-y-[20px] desk:px-[45px] desk:pb-[45px] desk:pt-[6px]">
        <div className="relative mx-auto aspect-square w-full max-w-[500px] border border-grey-2 bg-white desk:col-start-1 desk:row-start-1">
          {img && <Image src={img.src} alt={name(p)} fill priority sizes="(min-width: 1000px) 500px, 100vw" className="object-cover" />}
        </div>

        <div className="desk:col-start-2 desk:row-span-2 desk:row-start-1">
          <h1 className="font-body text-[28px] font-bold leading-[1.2] text-white desk:text-[32px]">{name(p)}</h1>
          {SHOP.showPrices ? (
            <p className="mt-[23px] text-[26px] leading-[32px] text-green-3">
              <span className="sr-only">{SHOP.price}: </span>
              {formatPrice(p.price)}
            </p>
          ) : (
            <p className="mt-[23px] text-[20px] leading-[32px] text-green-3">{SHOP.pricePlaceholder}</p>
          )}

          {!SHOP.open && (
            <div className="mt-[20px] border-l-4 border-green-3 bg-green-4/30 px-4 py-3">
              <p className="text-[17px] font-bold leading-[1.3] text-[#ffc824]">{SHOP.soon.title}</p>
              <p className="mt-2 text-[14px] leading-[1.45] text-white">{SHOP.soon.text}</p>
              {!SHOP.showPrices && <p className="mt-2 text-[14px] leading-[1.45] text-white">{SHOP.soon.priceText}</p>}
              {/* the page's main action: full width on phones, 48px tap target, bold label with a handset */}
              <a href={`tel:${PHONE.tel}`} className="mt-3 flex min-h-[48px] items-center justify-center gap-2 bg-green-3 px-3 text-[17px] font-bold text-green-5 transition-colors hover:bg-green-2 hover:text-green-5 desk:max-w-[307px]">
                <PhoneIcon className="h-[18px] w-[18px] shrink-0" />
                {SHOP.soon.call}
              </a>
            </div>
          )}

          {p.additionalInfo.map((a) => (
            <details key={a.title} className="mt-6 border-t border-white/40 pt-3 text-white">
              <summary className="cursor-pointer text-[15px] font-bold">{a.title}</summary>
              <div className="wix-desc mt-2 text-[14px] leading-[1.5]" dangerouslySetInnerHTML={{ __html: a.description }} />
            </details>
          ))}

          <div className="mt-[20px]">
            <ShareLinks url={absoluteUrl(p.path)} image={imageUrl} text={name(p)} />
          </div>
        </div>

        <div className="wix-desc text-[15px] leading-[23px] text-white desk:col-start-1 desk:row-start-2" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd(p, imageUrl)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(p, crumbs)) }} />
    </PageColumn>
  );
}
