import type { CSSProperties } from "react";
import Image from "next/image";
import { SITE_URL } from "@/content/site";
import { tryMedia, type Block, type BlockLayout } from "@/lib/blog";
import YouTube from "./YouTube";

/** Wix post text column: 740px. Block widths and offsets are kept as fractions of it. */
const COLUMN = 740;

/** Internal links written as absolute Wix URLs become site paths. */
const localLinks = (html: string) => html.replaceAll(`href="${SITE_URL}"`, 'href="/"').replaceAll(`href="${SITE_URL}`, 'href="');
const localHref = (href: string) => (href === SITE_URL ? "/" : href.startsWith(SITE_URL + "/") ? href.slice(SITE_URL.length) : href);

/**
 * Desktop geometry of a media block as measured on Wix: floated left/right with the text wrapping around
 * it (20px gap), or on its own line at its Wix offset. Mobile: full width, no float.
 */
function geometry(l: BlockLayout | undefined): { className: string; style: CSSProperties } {
  const w = Math.min(l?.w ?? COLUMN, COLUMN);
  const style = { "--pw": `${((w / COLUMN) * 100).toFixed(3)}%`, "--pl": `${(((l?.x ?? 0) / COLUMN) * 100).toFixed(3)}%` } as CSSProperties;
  const base = "clear-both my-4 w-full desk:w-[var(--pw)]";
  if (l?.float === "left") return { className: `${base} desk:float-left desk:mb-2 desk:mr-[20px] desk:mt-1`, style };
  if (l?.float === "right") return { className: `${base} desk:float-right desk:mb-2 desk:ml-[20px] desk:mt-1`, style };
  return { className: `${base} desk:ml-[var(--pl)]`, style };
}

/** Relative luminance (WCAG) of a #rrggbb colour. */
function luminance(hex: string): number {
  const v = hex.replace("#", "").match(/../g)?.map((c) => parseInt(c, 16) / 255) ?? [0, 0, 0];
  const [r, g, b] = v.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

type ButtonBlock = Extract<Block, { type: "button" }>;

/** Wix Ricos button (45px, 14px label, the post's own colour, opens aesthlos.com in a new tab). */
function PostButton({ b, gap }: { b: ButtonBlock; gap: number }) {
  const bg = b.background ?? "#A0CC62";
  // Wix shows white text on every button colour; light colours get dark text so it stays readable (WCAG AA)
  const color = luminance(bg) > 0.3 ? "#1d2512" : "#ffffff";
  const style = { backgroundColor: bg, color, minWidth: `${b.layout?.w ?? 0}px`, "--gap": `${gap}px` } as CSSProperties;
  return (
    <a href={localHref(b.href!)} target={b.newTab ? "_blank" : undefined} rel={b.newTab ? "noopener" : undefined} style={style} className="post-button desk:ml-[var(--gap)]">
      {b.text}
    </a>
  );
}

/** Ricos blocks of a Wix post, in Wix order and geometry. */
export default function PostBody({ blocks, title }: { blocks: Block[]; title: string }) {
  return (
    <div className="post-body">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "paragraph":
            return <p key={i} style={b.layout?.align ? { textAlign: b.layout.align as CSSProperties["textAlign"] } : undefined} dangerouslySetInnerHTML={{ __html: localLinks(b.html) }} />;
          case "heading":
            return b.text.trim() ? <h2 key={i} dangerouslySetInnerHTML={{ __html: localLinks(b.html) }} /> : <div key={i} className="h-[24px]" aria-hidden="true" />;
          case "empty-line":
            return <div key={i} className="h-[24px]" aria-hidden="true" />;
          case "list": {
            const List = b.ordered ? "ol" : "ul";
            return (
              <List key={i} className={b.ordered ? "list-decimal pl-7" : "list-disc pl-7"}>
                {b.items.map((it, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: localLinks(it) }} />
                ))}
              </List>
            );
          }
          case "image":
          case "gallery": {
            const img = b.type === "image" ? { file: b.file, alt: b.alt, caption: b.caption, link: b.link } : { file: b.images[0]?.file, alt: b.images[0]?.alt ?? "", caption: "", link: null };
            const m = tryMedia(img.file);
            if (!m) return null; // the file is broken on Wix too (OWNER-CHANGES.md)
            const g = geometry(b.layout);
            const w = Math.round(Math.min(b.layout?.w ?? COLUMN, COLUMN));
            const pic = <Image src={m.src} width={m.width} height={m.height} alt={img.alt || title} sizes={`(min-width: 1000px) ${w}px, calc(100vw - 32px)`} className="h-auto w-full" />;
            return (
              <figure key={i} className={g.className} style={g.style}>
                {img.link ? (
                  <a href={localHref(img.link)} target={img.link.startsWith(SITE_URL) ? undefined : "_blank"} rel="noopener">
                    {pic}
                  </a>
                ) : (
                  pic
                )}
                {img.caption && <figcaption className="mt-2 text-center text-[14px] leading-[1.4] text-grey-4">{img.caption}</figcaption>}
              </figure>
            );
          }
          case "video": {
            if (!b.youtube) return null;
            const g = geometry(b.layout);
            return (
              <div key={i} className={g.className} style={g.style}>
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <YouTube id={b.youtube} title={title} />
                </div>
              </div>
            );
          }
          case "button": {
            // Wix lays consecutive buttons side by side (each floated left at its x): one row per run of buttons
            if (blocks[i - 1]?.type === "button") return null;
            const run: ButtonBlock[] = [];
            for (let j = i; blocks[j]?.type === "button"; j++) run.push(blocks[j] as ButtonBlock);
            let end = 0;
            return (
              <p key={i} className="my-2 flex flex-col items-start gap-2 desk:flex-row desk:flex-wrap desk:gap-0">
                {run.map((btn, k) => {
                  const x = btn.layout?.x ?? 0;
                  const gap = Math.max(0, x - end);
                  end = x + (btn.layout?.w ?? 0);
                  return btn.href ? <PostButton key={k} b={btn} gap={gap} /> : null;
                })}
              </p>
            );
          }
          default:
            return null;
        }
      })}
      <div className="clear-both" />
    </div>
  );
}
