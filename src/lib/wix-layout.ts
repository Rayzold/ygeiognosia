import fs from "node:fs";
import path from "node:path";
import { SITE_URL } from "@/content/site";

// Desktop layout of a Wix page, extracted by scripts/extract-layout.cjs and text-fixed by
// scripts/build_content.py (content/pages/<type>/<name>/layout.json). Coordinates in px, relative to the
// parent node; top-level nodes relative to the 980px page column.

export type Run = {
  t?: string;
  br?: 1;
  f?: string; // font key: Wix upload id (e.g. "2a288b1e") or family name
  s?: number; // font size px
  c?: string; // colour
  b?: 1;
  i?: 1;
  u?: 1;
  ls?: number;
  bg?: string;
  href?: string;
  blank?: 1;
};
export type Block = { tag: string; align: string; fs: number; lh: number | null; mt?: number; mb?: number; list?: "ul" | "ol"; indent?: number; runs: Run[] };
type Base = { id: string; x: number; y: number; w: number; h: number; transform?: string; anim?: { effect: "fade" | "slide" | "float"; duration: number; delay: number }; hover?: { on: string; transform: string; duration: number }; pinned?: { top: number; right: number; vw: number; vh: number } };
export type TextNode = Base & { kind: "text"; blocks: Block[] };
export type ImageNode = Base & {
  kind: "image";
  file: string;
  alt: string;
  crop?: { x: number; y: number; w: number; h: number };
  nat?: { w: number; h: number };
  mode: "fill" | "fit";
  align?: string;
  fit?: string;
  pos?: string;
  href?: string;
  blank?: 1;
};
export type ButtonNode = Base & { kind: "button"; label: string; href: string | null; blank?: 1; f: string; s: number; c: string; ls?: number; b?: 1; bg?: string; border?: string; radius?: number; hoverBg?: string; hoverColor?: string; duration?: number };
export type BoxNode = Base & { kind: "box" | "section" | "unknown"; bg?: string; border?: string; radius?: number; shadow?: string; children: LayoutNode[] };
export type LayoutNode =
  | TextNode
  | ImageNode
  | ButtonNode
  | BoxNode
  | (Base & { kind: "svg"; svg: string; opacity?: number; href?: string })
  | (Base & { kind: "line"; color: string; weight: number })
  | (Base & { kind: "anchor"; name: string })
  | (Base & { kind: "anchormenu"; items: { label: string; anchor: string }[] })
  | (Base & { kind: "audio" | "map" })
  | (Base & { kind: "gallery"; shown: number; sort: boolean; loadMore: boolean })
  | (Base & { kind: "form"; fields: { tag: string; name: string; placeholder: string; required: boolean }[]; submit?: string });

export type Layout = { height: number; shade: string; nodes: LayoutNode[] };

export function loadLayout(type: string, name: string): Layout {
  const file = path.join(process.cwd(), "content", "pages", type, name, "layout.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as Layout;
}

/** Opacity of the Wix page column colour, e.g. "rgba(0, 0, 0, 0.77)" -> 0.77 */
export function shadeOf(layout: Layout): number {
  const m = layout.shade.match(/rgba\([^)]*,\s*([\d.]+)\)/);
  return m ? +m[1] : layout.shade.startsWith("rgb(") ? 1 : 0;
}

/** Wix links to its own pages are absolute (https://www.ygeiognosia.com/…): make them site-relative. */
export function siteHref(href: string): { href: string; internal: boolean } {
  const m = href.match(/^https?:\/\/(?:www\.)?ygeiognosia\.com(\/[^?#]*)?([?#].*)?$/i);
  if (m) return { href: (m[1] || "/") + (m[2] || ""), internal: true };
  return { href, internal: href.startsWith("/") };
}

/** Wix alts that are just file names / camera names: replaced by a meaningful text (approved fix 7). */
export function isFileAlt(alt: string | undefined): boolean {
  if (!alt || !alt.trim()) return true;
  return /\.(jpe?g|png|webp|gif|heic|tiff?)$/i.test(alt.trim()) || /^(img|image|dsc|screenshot|thumb)[\s_-]?\w*/i.test(alt.trim()) || /^[\d_\s-]+$/.test(alt.trim());
}

/** Plain text of a text node (for alts, descriptions). */
export function plainText(n: TextNode): string {
  return n.blocks
    .map((b) => b.runs.map((r) => r.t ?? " ").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function allNodes(nodes: LayoutNode[]): LayoutNode[] {
  return nodes.flatMap((n) => ("children" in n && n.children ? [n, ...allNodes(n.children)] : [n]));
}

/** Meta description from the page's own text (approved fix 5): first ~155 characters of body text. */
export function describe(layout: Layout, skip = 0): string {
  const texts = allNodes(layout.nodes)
    .filter((n): n is TextNode => n.kind === "text")
    .sort((a, b) => a.y - b.y)
    .map(plainText)
    .filter((t) => t.length > 40)
    .slice(skip);
  const t = texts.join(" ");
  if (t.length <= 160) return t;
  const cut = t.slice(0, 157);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

export function absolute(href: string): string {
  return href.startsWith("/") ? SITE_URL + href : href;
}
