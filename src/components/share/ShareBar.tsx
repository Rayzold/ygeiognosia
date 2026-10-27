"use client";

import { useEffect, useState } from "react";
import { BLOG } from "@/content/blog";
import { BRANDS, BrandIcon, type Brand } from "./BrandIcons";

type Props = {
  /** absolute URL of the page */
  url: string;
  title: string;
  /** absolute URL of the cover image (Pinterest) */
  image?: string;
  /** "compact": small icons under the title; "full": the bar at the end of the post */
  variant?: "compact" | "full";
};

/**
 * Share buttons as plain links (no third-party scripts, nothing loads before a click): Facebook, WhatsApp,
 * Viber, X, Pinterest, email, copy link, and the phone's own share sheet (Web Share API) where available.
 */
export default function ShareBar({ url, title, image, variant = "compact" }: Props) {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links: { brand: Brand; label: string; href: string }[] = [
    { brand: "facebook", label: BLOG.share.facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { brand: "whatsapp", label: BLOG.share.whatsapp, href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}` },
    { brand: "viber", label: BLOG.share.viber, href: `viber://forward?text=${encodeURIComponent(`${title} ${url}`)}` },
    { brand: "x", label: BLOG.share.x, href: `https://x.com/intent/post?url=${u}&text=${t}` },
    {
      brand: "pinterest",
      label: BLOG.share.pinterest,
      href: `https://pinterest.com/pin/create/button/?url=${u}${image ? `&media=${encodeURIComponent(image)}` : ""}&description=${t}`,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // older browsers / no permission: select-and-copy fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing else to try */
      }
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      /* cancelled */
    }
  }

  const full = variant === "full";
  const size = full ? "h-[44px] w-[44px]" : "h-[34px] w-[34px]";
  const icon = full ? "h-[22px] w-[22px]" : "h-[17px] w-[17px]";
  const round = `flex ${size} shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-110 focus-visible:scale-110`;

  return (
    <div className={full ? "text-center" : ""}>
      {full && <p className="mb-4 text-[20px] font-bold leading-[1.3] text-green-5">{BLOG.share.title}</p>}
      <ul className={`flex flex-wrap items-center gap-[10px] ${full ? "justify-center" : ""}`} aria-label={BLOG.share.short}>
        {canShare && (
          <li>
            <button type="button" onClick={nativeShare} className={full ? "flex h-[44px] items-center gap-2 rounded-[22px] bg-green-5 px-5 text-white transition-transform hover:scale-105 focus-visible:scale-105" : `${round} bg-green-5`} aria-label={BLOG.share.native}>
              <ShareIcon className={icon} />
              {full && <span className="text-[16px]">{BLOG.share.short}</span>}
            </button>
          </li>
        )}
        {links.map((l) => (
          <li key={l.brand}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label} className={round} style={{ backgroundColor: BRANDS[l.brand].color }}>
              <BrandIcon brand={l.brand} className={icon} />
            </a>
          </li>
        ))}
        <li>
          <a
            href={`mailto:?subject=${t}&body=${encodeURIComponent(BLOG.share.emailBody(title, url))}`}
            aria-label={BLOG.share.email}
            title={BLOG.share.email}
            className={`${round} bg-[#5f6368]`}
          >
            <MailIcon className={icon} />
          </a>
        </li>
        <li>
          <button type="button" onClick={copy} aria-label={BLOG.share.copy} title={BLOG.share.copy} className={`${round} bg-green-4`}>
            {copied ? <CheckIcon className={icon} /> : <LinkIcon className={icon} />}
          </button>
        </li>
      </ul>
      <p role="status" aria-live="polite" className={`mt-2 min-h-[1.4em] text-[14px] text-green-5 ${full ? "" : "sr-only"}`}>
        {copied ? BLOG.share.copied : ""}
      </p>
    </div>
  );
}

const ShareIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);
const MailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
const LinkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
