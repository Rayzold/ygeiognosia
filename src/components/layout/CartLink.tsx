import { HEADER } from "@/content/site";
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
