import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import PageColumn from "@/components/layout/PageColumn";
import Reveal from "@/components/motion/Reveal";
import { media } from "@/lib/media";
import {
  isFileAlt,
  plainText,
  shadeOf,
  siteHref,
  type Block,
  type BoxNode,
  type ButtonNode,
  type ImageNode,
  type Layout,
  type LayoutNode,
  type Run,
  type TextNode,
} from "@/lib/wix-layout";
import AnchorMenu from "./AnchorMenu";
import AudioPlayer from "./AudioPlayer";
import ProductGallery, { type CardItem } from "@/components/shop/ProductGallery";

/**
 * Renders a Wix page from its extracted layout (content/pages/<type>/<name>/layout.json).
 *
 * Desktop (>= 1000px): the Wix layout itself. Sections are stacked strips of their Wix height inside the
 * 980px column; every element is absolutely positioned at its Wix coordinates.
 * Mobile: the same DOM in reading order (top to bottom, left to right), stacked and full width, like the
 * Wix mobile site. One DOM for both, so no text is duplicated.
 */

// Wix fonts (archive/design-tokens.md) -> our interim fonts (globals.css)
const FONT: Record<string, string> = {
  "2a288b1e": "font-body", // PF DinText Pro Regular
  "84b1395d": "font-body", // PF DinText Pro Regular
  "8b43208e": "font-body font-bold", // PF DinText Pro Bold
  "32d95d9a": "font-script", // Black Diamond
  "din-next-w01-light": "font-body font-light",
  "worksans-extralight": "font-body font-light",
  "brandon-grot-w01-light": "font-body font-light",
};
const fontClass = (f?: string) => (f && FONT[f]) ?? "font-body";

const POS = "desk:absolute desk:left-[var(--x)] desk:top-[var(--y)] desk:w-[var(--w)]";
const SIZE = "desk:h-[var(--h)]";

type Ctx = { title: string; audio?: string; gallery?: CardItem[]; hoverParents: Set<string>; first: { image: boolean } };

const box = (n: LayoutNode): CSSProperties =>
  ({ "--x": `${n.x}px`, "--y": `${n.y}px`, "--w": `${n.w}px`, "--h": `${n.h}px` }) as CSSProperties;

// rows within 8px count as one; in a row an image comes first (Wix often puts a product photo next to,
// not inside, the coloured box that holds its text)
const byReadingOrder = (a: LayoutNode, b: LayoutNode) =>
  Math.abs(a.y - b.y) >= 8 ? a.y - b.y : (a.kind === "image" ? 0 : 1) - (b.kind === "image" ? 0 : 1) || a.x - b.x;
const z = new WeakMap<LayoutNode, number>();

export default function WixLayout({ layout, title, audio, gallery }: { layout: Layout; title: string; audio?: string; gallery?: CardItem[] }) {
  const hoverParents = new Set<string>();
  const collect = (ns: LayoutNode[]) =>
    ns.forEach((n) => {
      if (n.hover) hoverParents.add(n.hover.on);
      if ("children" in n && n.children) collect(n.children);
    });
  collect(layout.nodes);
  const ctx: Ctx = { title, audio, gallery, hoverParents, first: { image: true } };

  const sections = layout.nodes.filter((n) => n.kind === "section").sort(byReadingOrder) as BoxNode[];
  const pinned = layout.nodes.filter((n) => n.kind !== "section").flatMap((n) => ("children" in n && n.children ? n.children : [n]));
  const menu = pinned.find((n) => n.kind === "anchormenu");

  return (
    <PageColumn shade={shadeOf(layout)}>
      {!hasH1(layout.nodes) && <h1 className="sr-only">{title}</h1>}
      {sections.map((s) => (
        <section
          key={s.id}
          style={{ ...box(s), backgroundColor: s.bg }}
          // a section with a product gallery grows with it (sorting / «Load More»); the others keep their Wix height
          className={`relative flex flex-col gap-4 py-5 desk:block desk:py-0 ${s.children.some((c) => c.kind === "gallery") ? "desk:min-h-[var(--h)]" : "desk:h-[var(--h)]"}`}
        >
          {children(s, ctx)}
        </section>
      ))}
      {menu && menu.kind === "anchormenu" && <AnchorMenu items={menu.items} />}
    </PageColumn>
  );
}

function hasH1(nodes: LayoutNode[]): boolean {
  return nodes.some((n) => (n.kind === "text" && n.blocks.some((b) => b.tag === "h1")) || ("children" in n && n.children ? hasH1(n.children) : false));
}

function children(parent: BoxNode, ctx: Ctx): ReactNode {
  // reading order for the DOM (mobile flow, screen readers); Wix stacking order kept with z-index (--z)
  parent.children.forEach((k, i) => (z.set(k, i + 1)));
  const kids = [...parent.children].sort(byReadingOrder);
  // alt text for images whose Wix alt is a file name: the nearest text in the same container (e.g. a product name)
  const firstText = kids.find((k): k is TextNode => k.kind === "text");
  const label = firstText ? plainText(firstText).split(/(?<=[.!;])\s|\s\|\s|\s{2,}/)[0].slice(0, 120) : ctx.title;
  return kids.map((k) => <Node key={k.id} n={k} ctx={ctx} label={label} />);
}

function Node({ n, ctx, label }: { n: LayoutNode; ctx: Ctx; label: string }) {
  let el: ReactNode;
  let cls = "";
  switch (n.kind) {
    case "text":
      cls = `px-4 desk:px-0 ${POS}`;
      el = n.blocks.map((b, i) => <TextBlock key={i} b={b} width={n.w} />);
      break;
    case "image":
      return wrap(n, `relative mx-auto aspect-[var(--ar)] w-full max-w-[var(--w)] overflow-hidden desk:mx-0 desk:aspect-auto desk:max-w-none ${POS} ${SIZE}`, <WixImage n={n} ctx={ctx} label={label} />, { "--ar": `${n.w} / ${n.h}` } as CSSProperties);
    case "button":
      return wrap(n, `mx-auto h-[var(--h)] w-fit min-w-[var(--w)] max-w-[calc(100%-2rem)] desk:max-w-none ${POS} ${SIZE}`, <WixButton n={n} />);
    case "box":
    case "unknown": {
      const deco: CSSProperties = { backgroundColor: n.bg, border: n.border, borderRadius: n.radius, boxShadow: n.shadow };
      const group = ctx.hoverParents.has(n.id) ? "group" : "";
      // an empty coloured box is only a backdrop for siblings on desktop: not shown on mobile
      const empty = !n.children.length ? "hidden" : "flex";
      // a block of many link buttons (the store category menu): two compact columns on mobile
      const menu = n.children.filter((c) => c.kind === "button").length >= 6 ? "max-desk:grid max-desk:grid-cols-2 max-desk:gap-x-2 max-desk:gap-y-1 max-desk:px-2 max-desk:[&>*]:!h-[34px] max-desk:[&>*]:!w-full max-desk:[&>*]:!min-w-0" : "";
      return wrap(n, `relative ${empty} flex-col gap-4 ${n.bg ? "py-4" : ""} ${menu} desk:block desk:py-0 ${group} ${POS} ${SIZE}`, children(n, ctx), deco);
    }
    case "line":
      return wrap(n, `mx-auto w-[min(var(--w),calc(100%-2rem))] ${POS}`, null, { borderTop: `${n.weight}px solid ${n.color}` });
    case "svg":
      // decorative Wix shapes; on mobile they would only add noise between stacked elements
      return wrap(n, `hidden desk:block ${POS} ${SIZE} [&_svg]:h-full [&_svg]:w-full`, <span aria-hidden="true" className="block h-full w-full" dangerouslySetInnerHTML={{ __html: n.svg }} />, { opacity: n.opacity });
    case "anchor":
      return <span id={n.id} aria-hidden="true" className="block scroll-mt-4 desk:absolute desk:top-[var(--y)]" style={box(n)} />;
    case "map":
      return wrap(n, `mx-4 h-[260px] desk:mx-0 ${POS} ${SIZE}`, <MapFrame />);
    case "form":
      return wrap(n, `mx-4 desk:mx-0 ${POS} ${SIZE}`, <FormPlaceholder />);
    case "gallery":
      // in flow (not absolute) so the section grows with it
      return (
        <div key={n.id} style={box(n)} className="desk:relative desk:ml-[var(--x)] desk:w-[var(--w)] desk:pt-[var(--y)]">
          <ProductGallery items={ctx.gallery ?? []} sort={n.sort} pageSize={n.loadMore ? n.shown : undefined} />
        </div>
      );
    case "audio":
      // the Wix music player; shown once the track is in public/audio (see src/content/pages.ts)
      return ctx.audio ? wrap(n, `mx-auto ${POS} ${SIZE}`, <AudioPlayer src={ctx.audio} />) : null;
    case "anchormenu":
      return null; // rendered once by WixLayout (pinned)
  }
  return wrap(n, cls, el);
}

/** Positioned wrapper; with the node's Wix entrance animation and hover effect, if any. */
function wrap(n: LayoutNode, className: string, content: ReactNode, extra: CSSProperties = {}) {
  const style: CSSProperties = { ...box(n), ...extra, ["--z" as string]: z.get(n) ?? 0 };
  let cls = `${className} desk:z-[var(--z)]`;
  if (n.transform) {
    Object.assign(style, { "--tf": n.transform });
    cls += " desk:[transform:var(--tf)]";
  }
  if (n.hover) {
    Object.assign(style, { "--ht": n.hover.transform, transitionDuration: `${n.hover.duration}ms` });
    cls += " transition-transform ease-in-out desk:group-hover:[transform:var(--ht)]";
  }
  if (n.anim) {
    return (
      <Reveal effect={n.anim.effect} duration={n.anim.duration} delay={n.anim.delay} className={cls} style={style}>
        {content}
      </Reveal>
    );
  }
  return (
    <div className={cls} style={style}>
      {content}
    </div>
  );
}

// Average glyph width of the interim script font (Mynerve) per px of font size, measured on Greek text.
const SCRIPT_EM = 0.53;

/**
 * Script-font lines (Black Diamond on Wix) are much wider in the interim font: on desktop such a block is
 * kept on one line and scaled down (--k) until it fits the Wix text box, so it never wraps into what follows.
 */
function scriptFit(b: Block, width: number): number {
  const text = b.runs.filter((r) => r.t && r.t.trim());
  if (!text.length || !text.every((r) => r.f === "32d95d9a")) return 1;
  // widest line (lines are separated by <br>)
  let est = 0;
  let line = 0;
  for (const r of b.runs) {
    if (r.br) line = 0;
    else line += (r.t ?? "").length * SCRIPT_EM * (r.s ?? b.fs);
    est = Math.max(est, line);
  }
  return est > width ? Math.max(0.6, +((width - 2) / est).toFixed(3)) : 1;
}

function TextBlock({ b, width }: { b: Block; width: number }) {
  const Tag = (/^h[1-6]$/.test(b.tag) ? b.tag : "p") as "p";
  const k = scriptFit(b, width);
  const empty = b.runs.every((r) => !r.br && !(r.t ?? "").replace(/[\s ]/g, ""));
  const style: CSSProperties = {
    textAlign: b.align as CSSProperties["textAlign"],
    // Wix line heights are em-based on the paragraph, so runs inherit an absolute value (see .wix-lh)
    ...(b.lh ? { ["--lh" as string]: b.lh } : { lineHeight: "normal" }),
    marginTop: b.mt,
    marginBottom: b.mb,
    ["--s" as string]: b.fs,
    ...(k < 1 ? { ["--k" as string]: k } : {}),
  };
  return (
    <Tag className={`wix-run ${b.lh ? "wix-lh" : ""} ${k < 1 ? "desk:whitespace-nowrap" : ""}`} style={style}>
      {empty ? " " : groupLinks(b.runs).map((g, i) => (g.href ? <TextLink key={i} href={g.href} blank={g.blank} runs={g.runs} /> : g.runs.map((r, j) => <RunSpan key={`${i}-${j}`} r={r} />)))}
    </Tag>
  );
}

function groupLinks(runs: Run[]) {
  const groups: { href?: string; blank?: 1; runs: Run[] }[] = [];
  for (const r of runs) {
    const last = groups[groups.length - 1];
    if (last && last.href === r.href) last.runs.push(r);
    else groups.push({ href: r.href, blank: r.blank, runs: [r] });
  }
  return groups;
}

function RunSpan({ r }: { r: Run }) {
  if (r.br) return <br />;
  const style: CSSProperties = {
    color: r.c,
    letterSpacing: r.ls ? `${r.ls}px` : undefined,
    backgroundColor: r.bg,
    ["--s" as string]: r.s,
  };
  const cls = `wix-run ${fontClass(r.f)} ${r.b ? "font-bold" : ""} ${r.i ? "italic" : ""} ${r.u ? "underline" : ""}`;
  return (
    <span className={cls} style={style}>
      {r.t}
    </span>
  );
}

function TextLink({ href, blank, runs }: { href: string; blank?: 1; runs: Run[] }) {
  const { href: h, internal } = siteHref(href);
  const content = runs.map((r, i) => <RunSpan key={i} r={r} />);
  if (internal && !blank) return <Link href={h}>{content}</Link>;
  return (
    <a href={h} {...(blank ? { target: "_blank", rel: "noopener" } : {})}>
      {content}
    </a>
  );
}

const ALIGN: Record<string, string> = { c: "50% 50%", t: "50% 0%", b: "50% 100%", l: "0% 50%", r: "100% 50%", tl: "0% 0%", tr: "100% 0%", bl: "0% 100%", br: "100% 100%" };

function WixImage({ n, ctx, label }: { n: ImageNode; ctx: Ctx; label: string }) {
  const m = media(n.file);
  const alt = isFileAlt(n.alt) ? label : n.alt;
  const priority = ctx.first.image && n.y < 700;
  ctx.first.image = false;
  const desk = Math.round(n.w);
  let img: ReactNode;
  if (n.crop && n.nat) {
    // Wix crop: the crop rectangle fills the frame (cover), centred; the rest of the photo is hidden
    const c = n.crop;
    const s = Math.max(n.w / c.w, n.h / c.h);
    const frame: CSSProperties = {
      position: "absolute",
      left: `${(((n.w - c.w * s) / 2 - c.x * s) / n.w) * 100}%`,
      top: `${(((n.h - c.h * s) / 2 - c.y * s) / n.h) * 100}%`,
      width: `${((n.nat.w * s) / n.w) * 100}%`,
      height: `${((n.nat.h * s) / n.h) * 100}%`,
    };
    const full = Math.round(n.nat.w * s);
    img = (
      <span style={frame}>
        <Image src={m.src} alt={alt} fill sizes={`(min-width: 1000px) ${full}px, ${Math.round((full / n.w) * 100)}vw`} priority={priority} />
      </span>
    );
  } else {
    img = (
      <Image
        src={m.src}
        alt={alt}
        fill
        sizes={`(min-width: 1000px) ${desk}px, (max-width: ${desk}px) 100vw, ${desk}px`}
        priority={priority}
        className={n.mode === "fit" ? "object-contain" : "object-cover"}
        style={{ objectPosition: n.pos ?? ALIGN[n.align ?? "c"] }}
      />
    );
  }
  if (!n.href) return img;
  const { href, internal } = siteHref(n.href);
  if (internal && !n.blank)
    return (
      <Link href={href} className="block h-full w-full">
        {img}
      </Link>
    );
  return (
    <a href={href} className="block h-full w-full" {...(n.blank ? { target: "_blank", rel: "noopener" } : {})}>
      {img}
    </a>
  );
}

function WixButton({ n }: { n: ButtonNode }) {
  // script labels: one line, scaled down to fit the Wix button (see scriptFit)
  const est = n.f === "32d95d9a" ? n.label.length * SCRIPT_EM * n.s : 0;
  const k = est > n.w - 16 ? Math.max(0.6, +((n.w - 16) / est).toFixed(3)) : 1;
  const style = {
    ...(k < 1 ? { "--k": k } : {}),
    "--bg": n.bg ?? "transparent",
    "--hbg": n.hoverBg ?? n.bg ?? "transparent",
    "--c": n.c,
    "--hc": n.hoverColor ?? n.c,
    "--s": n.s,
    border: n.border,
    borderRadius: n.radius,
    letterSpacing: n.ls ? `${n.ls}px` : undefined,
    transitionDuration: `${Math.min(n.duration ?? 200, 300)}ms`,
  } as CSSProperties;
  const cls = `wix-run flex h-full w-full items-center justify-center bg-[color:var(--bg)] px-4 desk:whitespace-nowrap desk:px-2 text-center text-[color:var(--c)] transition-colors hover:bg-[color:var(--hbg)] hover:text-[color:var(--hc)] ${fontClass(n.f)} ${n.b ? "font-bold" : ""}`;
  if (!n.href) return <span className={cls} style={style}>{n.label}</span>;
  const { href, internal } = siteHref(n.href);
  if (internal && !n.blank)
    return (
      <Link href={href} className={cls} style={style}>
        {n.label}
      </Link>
    );
  return (
    <a href={href} className={cls} style={style} {...(n.blank ? { target: "_blank", rel: "noopener" } : {})}>
      {n.label}
    </a>
  );
}

function MapFrame() {
  return (
    <iframe
      title="Χάρτης: Βυζαντίου 23, Νέα Σμύρνη"
      src="https://maps.google.com/maps?q=%CE%92%CF%85%CE%B6%CE%B1%CE%BD%CF%84%CE%AF%CE%BF%CF%85%2023%2C%20%CE%9D%CE%AD%CE%B1%20%CE%A3%CE%BC%CF%8D%CF%81%CE%BD%CE%B7%2017121&z=16&hl=el&output=embed"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="h-full w-full border-0"
    />
  );
}

/** Phase 6 replaces this with the Jotform contact form. */
function FormPlaceholder() {
  return <div className="flex h-full min-h-[200px] items-center justify-center border border-white/40 p-6 text-center text-[15px] text-white/80">Η φόρμα επικοινωνίας προστίθεται στο επόμενο βήμα.</div>;
}
