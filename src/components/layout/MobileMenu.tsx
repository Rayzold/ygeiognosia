"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MENU } from "@/content/site";
import { CloseIcon, MenuIcon } from "./Icons";
import { isActive } from "./nav";

/** Wix mobile menu: hamburger button opening a full-screen menu. */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const opener = openRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  const link = (active: boolean) =>
    `block py-2 transition-colors hover:text-green-2 ${active ? "text-green-3" : "text-white"}`;

  return (
    <>
      <button
        ref={openRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Άνοιγμα μενού"
        className="p-2 text-white"
      >
        <MenuIcon className="h-8 w-8" />
      </button>
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Μενού"
        hidden={!open}
        className="fixed inset-0 z-50 overflow-y-auto bg-green-5 px-6 py-16 text-center"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Κλείσιμο μενού"
          className="absolute right-4 top-4 p-2 text-white"
        >
          <CloseIcon className="h-8 w-8" />
        </button>
        <nav aria-label="Κύριο μενού">
          <ul className="space-y-2 text-[20px]">
            {MENU.map((m) => (
              <li key={m.href}>
                <Link href={m.href} aria-current={isActive(pathname, m) ? "page" : undefined} className={link(isActive(pathname, m))}>
                  {m.label}
                </Link>
                {m.children && (
                  <ul className="text-[17px]">
                    {m.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} aria-current={isActive(pathname, c) ? "page" : undefined} className={link(isActive(pathname, c))}>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
