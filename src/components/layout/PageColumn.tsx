import type { ReactNode } from "react";

/**
 * The Wix page column: 980px wide on desktop, full width on mobile, black at the page's own opacity
 * over the fixed background photo (Wix "page" background: 0.6 on most pages, 0.77 on some, e.g. /about-us).
 * overflow-x-clip: entrance animations (Reveal) start off to the side and must not widen the page.
 */
export default function PageColumn({ shade = 0.6, className = "", children }: { shade?: number; className?: string; children: ReactNode }) {
  return (
    <div className={`mx-auto w-full overflow-x-clip desk:w-[980px] ${className}`} style={{ backgroundColor: `rgba(0, 0, 0, ${shade})` }}>
      {children}
    </div>
  );
}
