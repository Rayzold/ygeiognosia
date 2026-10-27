"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU, MENU_WIDTHS } from "@/content/site";
import { isActive } from "./nav";

const item =
  "flex h-[35px] items-center justify-center px-[5px] text-[15px] leading-[1.4] whitespace-nowrap transition-colors duration-[400ms] hover:bg-green-2 hover:text-green-5 focus-visible:bg-green-2 focus-visible:text-green-5 focus-visible:outline-offset-[-2px]";

/** Wix DropDownMenu (SolidColorMenuButtonSkin): 980×35 bar, buttons stretched to the menu width. */
export default function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Κύριο μενού" className="h-[35px] w-[980px] bg-green-4d">
      <ul className="grid h-full" style={{ gridTemplateColumns: MENU_WIDTHS.map((w) => `${w}fr`).join(" ") }}>
        {MENU.map((m) => {
          const active = isActive(pathname, m);
          return (
            <li key={m.href} className="group relative">
              <Link
                href={m.href}
                aria-current={active ? "page" : undefined}
                aria-haspopup={m.children ? "true" : undefined}
                className={`${item} ${active ? "bg-green-3 text-green-5" : "text-white"}`}
              >
                {m.label}
              </Link>
              {m.children && (
                <ul className="invisible absolute left-0 top-full z-20 min-w-full bg-green-4d opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {m.children.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        aria-current={isActive(pathname, c) ? "page" : undefined}
                        className={`${item} px-4 ${isActive(pathname, c) ? "bg-green-3 text-green-5" : "text-white"}`}
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
