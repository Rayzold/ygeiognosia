import Image from "next/image";
import { notFound } from "next/navigation";
import PageColumn from "@/components/layout/PageColumn";
import ShareLinks from "@/components/shop/ShareLinks";
import { SHOP } from "@/content/shop";
import { PHONE } from "@/content/site";
import { PRODUCTS, decodeEntities, decodeSlug, formatPrice, htmlToText, productBySlug, type Product } from "@/lib/content";
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

export default async function ProductPage({ params }: Props) {
  const p = productBySlug(decodeSlug((await params).slug));
  if (!p) notFound();
  const img = p.media[0] ? media(p.media[0].file) : null;
  const imageUrl = img ? absoluteUrl(img.src) : undefined;

  return (
    <PageColumn shade={0.6}>
      <article className="grid grid-cols-1 gap-y-6 px-4 py-6 desk:min-h-[843px] desk:grid-cols-[500px_355px] desk:content-start desk:gap-x-[35px] desk:gap-y-[20px] desk:px-[45px] desk:pb-[45px] desk:pt-[25px]">
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
              <a href={`tel:${PHONE.tel}`} className="mt-3 flex h-[40px] max-w-[307px] items-center justify-center bg-green-3 text-[16px] font-light text-white transition-colors hover:bg-green-2 hover:text-green-5">
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
    </PageColumn>
  );
}
