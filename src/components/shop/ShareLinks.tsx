import { SHOP } from "@/content/shop";

/** Wix product page share buttons (Facebook, Pinterest, WhatsApp, X) as plain links: no third-party scripts. */
export default function ShareLinks({ url, image, text }: { url: string; image?: string; text: string }) {
  const u = encodeURIComponent(url);
  const links = [
    { label: SHOP.share.facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <Facebook /> },
    {
      label: SHOP.share.pinterest,
      href: `https://pinterest.com/pin/create/button/?url=${u}${image ? `&media=${encodeURIComponent(image)}` : ""}&description=${encodeURIComponent(text)}`,
      icon: <Pinterest />,
    },
    { label: SHOP.share.whatsapp, href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`, icon: <WhatsApp /> },
    { label: SHOP.share.x, href: `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(text)}`, icon: <X /> },
  ];
  return (
    <ul className="flex gap-[14px]">
      {links.map((l) => (
        <li key={l.label}>
          <a href={l.href} target="_blank" rel="noopener" aria-label={l.label} className="block h-[24px] w-[24px] transition-opacity hover:opacity-80">
            {l.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

const Facebook = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path fill="#fff" d="M13.4 24v-8.4h2.8l.4-3.3h-3.2v-2.1c0-.9.3-1.6 1.6-1.6h1.7V5.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.3H10V24h3.4z" />
  </svg>
);
const Pinterest = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
    <circle cx="12" cy="12" r="12" fill="#E60023" />
    <path fill="#fff" d="M12.3 4.5c-4.3 0-6.5 3.1-6.5 5.7 0 1.6.6 3 1.9 3.5.2.1.4 0 .5-.2l.2-.8c.1-.2 0-.3-.1-.5-.4-.5-.6-1.1-.6-1.9 0-2.4 1.8-4.6 4.7-4.6 2.6 0 4 1.6 4 3.7 0 2.8-1.2 5.1-3.1 5.1-1 0-1.8-.9-1.6-1.9.3-1.3.9-2.6.9-3.5 0-.8-.4-1.4-1.3-1.4-1 0-1.9 1.1-1.9 2.5 0 .9.3 1.5.3 1.5l-1.3 5.4c-.3 1.3 0 3 0 3.2 0 .1.1.1.2.1.1-.1 1.2-1.5 1.5-2.9l.6-2.3c.3.6 1.2 1.1 2.2 1.1 2.9 0 4.8-2.6 4.8-6.1.1-2.6-2.2-5.1-5.4-5.1z" />
  </svg>
);
const WhatsApp = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path fill="none" stroke="#fff" strokeWidth="1.6" d="M6.4 17.6l.8-2.8a6 6 0 1 1 2.3 2.1z" />
    <path fill="#fff" d="M10 8.6c.2-.3.6-.3.8 0l.6 1.2c.1.2 0 .4-.1.6l-.3.4c.3.7 1 1.4 1.8 1.8l.4-.3c.2-.1.4-.2.6-.1l1.2.6c.3.2.3.6 0 .8-.5.6-1.2.9-2 .6-1.7-.6-3-1.9-3.6-3.6-.3-.8 0-1.5.6-2z" />
  </svg>
);
const X = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
    <circle cx="12" cy="12" r="12" fill="#000" />
    <path fill="#fff" d="M15.6 6.5h1.7l-3.7 4.2 4.4 5.8h-3.4l-2.7-3.5-3.1 3.5H7.1l4-4.5-4.2-5.5h3.5l2.4 3.2zm-.6 9h.9L10 7.4h-1z" />
  </svg>
);
