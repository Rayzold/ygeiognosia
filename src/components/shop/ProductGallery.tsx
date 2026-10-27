"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SHOP } from "@/content/shop";

export type CardItem = { path: string; name: string; price: number; formatted: string; image: { src: string; width: number; height: number } | null; ribbon: string };

/**
 * Wix Stores product gallery: 4 columns of 245px on desktop (2 on mobile), square photo, name, price,
 * button. /shop also has Wix's sort menu and «Load More» (20 at a time). All products are in the static
 * HTML (crawlable); «Load More» only reveals them.
 */
export default function ProductGallery({ items, sort = false, pageSize }: { items: CardItem[]; sort?: boolean; pageSize?: number }) {
  const [order, setOrder] = useState("");
  const [shown, setShown] = useState(pageSize ?? items.length);
  const sorted = [...items];
  const collator = new Intl.Collator("el");
  if (order === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (order === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (order === "name-asc") sorted.sort((a, b) => collator.compare(a.name, b.name));
  if (order === "name-desc") sorted.sort((a, b) => collator.compare(b.name, a.name));

  return (
    <div>
      {sort && (
        <div className="flex justify-end px-[10px] pt-4 desk:h-[85px] desk:px-[10px] desk:pt-[24px]">
          <label className="sr-only" htmlFor="shop-sort">
            {SHOP.sort.label}
          </label>
          <select
            id="shop-sort"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="h-[40px] w-[200px] border border-white/60 bg-white px-3 text-[16px] text-black"
          >
            {SHOP.sort.options.filter((o) => SHOP.showPrices || !("price" in o)).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <ul className="grid grid-cols-2 desk:grid-cols-4">
        {sorted.map((p, i) => (
          <li key={p.path} className={`p-[6px] desk:p-[10px] ${i >= shown ? "hidden" : ""}`}>
            <ProductCard p={p} first={i < 2} />
          </li>
        ))}
      </ul>
      {shown < items.length && (
        <div className="flex justify-center pb-10 pt-6">
          <button
            type="button"
            onClick={() => setShown((n) => n + (pageSize ?? items.length))}
            className="h-[44px] min-w-[211px] border border-white px-5 text-[16px] font-light text-white transition-colors hover:bg-white hover:text-black"
          >
            {SHOP.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({ p, first }: { p: CardItem; first: boolean }) {
  return (
    <div className="flex h-full flex-col text-left">
      <Link href={p.path} className="relative block aspect-square overflow-hidden bg-white" tabIndex={-1} aria-hidden="true">
        {p.image && <Image src={p.image.src} alt="" fill priority={first} sizes="(min-width: 1000px) 225px, 50vw" className="object-cover" />}
        {p.ribbon && <span className="absolute left-0 top-0 bg-green-3 px-3 py-[2px] text-[14px] font-light text-green-5">{p.ribbon}</span>}
      </Link>
      <Link href={p.path} className="mt-4 block text-[15px] leading-[20px] text-white hover:underline desk:text-[16px]">
        {p.name}
      </Link>
      <p className="mb-auto mt-1 text-[16px] leading-[24px] text-[#bada55]">
        {SHOP.showPrices ? (
          <>
            <span className="sr-only">{SHOP.price}: </span>
            {p.formatted}
          </>
        ) : (
          <span className="text-[14px]">{SHOP.pricePlaceholder}</span>
        )}
      </p>
      <Link
        href={p.path}
        aria-label={`${SHOP.viewProduct}: ${p.name}`}
        className="mt-3 flex h-[40px] shrink-0 items-center justify-center rounded-[20px] bg-black text-[15px] text-white transition-colors hover:bg-green-3 hover:text-green-5 desk:text-[16px]"
      >
        {SHOP.viewProduct}
      </Link>
    </div>
  );
}
