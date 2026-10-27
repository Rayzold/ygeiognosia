import Link from "next/link";
import { SHOP } from "@/content/shop";
import { HEADER, PHONE } from "@/content/site";
import { CartIcon } from "./Icons";

/**
 * Wix Stores cart icon: green bag with the item count.
 * TODO Phase 5γ: live count from the browser cart, link to the cart page.
 */
export function CartBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} aria-hidden="true">
      <CartIcon className="h-full w-full fill-green-3" />
      <span className="absolute inset-x-0 bottom-[12%] text-center text-[13px] leading-none text-white">0</span>
    </span>
  );
}

export const cartLabel = `${HEADER.cart}, 0 προϊόντα`;

/**
 * Header corner while the online shop is closed (owner decision 2026-10-27), in place of the Wix cart:
 * a link to the products, «Online shop σύντομα!» and the phone number for orders.
 */
export function ShopTeaser({ layout }: { layout: "desktop" | "mobile" }) {
  const desk = layout === "desktop";
  return (
    <div className={desk ? "flex items-start gap-3 text-right" : "flex flex-col items-center text-center"}>
      <div className={desk ? "" : "order-2"}>
        <Link href="/shop" className="text-[15px] leading-[1.4] text-white hover:underline">
          {SHOP.header.products}
        </Link>
        <p className="text-[12px] leading-[1.5] text-[#ffc824]">{SHOP.header.note}</p>
        <p className="text-[12px] leading-[1.5] text-white">
          {SHOP.header.phone}{" "}
          <a href={`tel:${PHONE.tel}`} className="whitespace-nowrap hover:underline">
            {PHONE.display}
          </a>
        </p>
      </div>
      <Link href="/shop" aria-label={SHOP.header.products} className={desk ? "block h-[35px] w-[29px] shrink-0" : "order-1 mb-1 block h-[34px] w-[29px]"}>
        <CartIcon className="h-full w-full fill-green-3" />
      </Link>
    </div>
  );
}
