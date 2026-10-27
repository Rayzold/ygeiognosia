"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Wix entrance animations ("FadeIn", "SlideIn" from the left, "FloatIn" from the right), as on the live site.
 * Pattern from aesthlos (src/components/motion/Reveal.tsx): IntersectionObserver + CSS transitions, no library.
 *
 * The static HTML is always visible. Only elements that are below the fold when the page hydrates are hidden
 * and then animated in on scroll, so nothing above the fold waits for JavaScript (fast LCP), and the page
 * reads fine without JS. With prefers-reduced-motion nothing is animated.
 */
export type RevealEffect = "fade" | "slide" | "float";

type Props = {
  children?: ReactNode;
  effect?: RevealEffect;
  /** ms, as in the Wix settings */
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

// Wix easings: fadeIn/floatIn "easeInOutSine", slideIn "easeInOutCubic".
const EASE: Record<RevealEffect, string> = {
  fade: "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
  float: "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
  slide: "cubic-bezier(0.645, 0.045, 0.355, 1)",
};

const HIDDEN: Record<RevealEffect, Partial<CSSStyleDeclaration>> = {
  fade: { opacity: "0" },
  float: { opacity: "0", transform: "translateX(60px)" },
  // slides out from behind its own left edge: moved left by its width, clipped to its own box
  slide: { transform: "translateX(-100%)", clipPath: "inset(0 0 0 100%)" },
};

export default function Reveal({ children, effect = "fade", duration = 1200, delay = 0, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The outer box is observed and never moves; the inner box is animated (a clip-path or transform on
    // the observed element itself would keep IntersectionObserver from ever reporting it as visible).
    const box = ref.current;
    const el = inner.current;
    if (!box || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = box.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // on screen at load: never hide it

    Object.assign(el.style, HIDDEN[effect]);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t = `${duration}ms ${EASE[effect]} ${delay}ms`;
        el.style.transition = `opacity ${t}, transform ${t}, clip-path ${t}`;
        el.style.opacity = "";
        el.style.transform = "";
        el.style.clipPath = "";
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(box);
    return () => io.disconnect();
  }, [effect, duration, delay]);

  return (
    <div ref={ref} className={className} style={style}>
      <div ref={inner} className="relative h-full">
        {children}
      </div>
    </div>
  );
}
