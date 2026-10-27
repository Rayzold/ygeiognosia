"use client";

import { useEffect, useState } from "react";

const target = (it: { anchor: string }) => (it.anchor === "PAGE_TOP_ANCHOR" ? "main" : it.anchor);

/**
 * Wix "anchor menu" (pinned to the middle right of the screen, desktop only): one dot per anchor of the page,
 * the current one filled yellow. Wix labels («Top of Page», «Anchor 1»…) are translated (approved fix 2).
 */
export default function AnchorMenu({ items }: { items: { label: string; anchor: string }[] }) {
  const [active, setActive] = useState(0);
  const targets = items.map(target);

  useEffect(() => {
    const targets = items.map(target);
    const onScroll = () => {
      let a = 0;
      targets.forEach((id, i) => {
        const el = document.getElementById(id);
        if (i > 0 && el && el.getBoundingClientRect().top <= window.innerHeight / 2) a = i;
      });
      setActive(a);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label="Ενότητες σελίδας" className="fixed left-[calc(50%+258px)] top-[calc(50%-71px)] z-30 hidden w-[120px] desk:block">
      <ul className="flex flex-col items-end gap-[4px] pr-[0px]">
        {items.map((it, i) => {
          const label = it.anchor === "PAGE_TOP_ANCHOR" ? "Αρχή σελίδας" : it.label.replace(/^Anchor\s*/i, "Ενότητα ");
          return (
            <li key={it.anchor}>
              <a href={`#${targets[i]}`} aria-current={i === active ? "true" : undefined} title={label} className="block p-[1px]">
                <span className={`block h-[12px] w-[12px] rounded-full border-2 ${i === active ? "border-[#ffcb00] bg-[#ffcb00]" : "border-white"}`} />
                <span className="sr-only">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
