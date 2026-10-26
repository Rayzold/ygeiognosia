import type { MenuItem } from "@/content/site";

/** True when the menu item (or one of its sub-items) is the current page, as Wix highlights it. */
export function isActive(pathname: string | null, item: MenuItem): boolean {
  const p = decodeURI(pathname ?? "/").replace(/\/$/, "") || "/";
  if (item.href === "/") return p === "/";
  return p === item.href || !!item.children?.some((c) => isActive(p, c));
}
