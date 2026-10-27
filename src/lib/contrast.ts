/**
 * WCAG contrast helpers. Several Wix colour pairs are below AA (4.5:1 for normal text), e.g. white on the
 * menu green #6B8841 (4.0) or on #A0CC62 (1.9). The fix keeps each colour's hue and moves it only as far as
 * needed: light buttons get dark text, otherwise the background (or, on white, the text) is darkened just
 * enough. Every change is listed in OWNER-CHANGES.md.
 */
export type RGB = [number, number, number];

const AA = 4.5;
/** Dark text used on light buttons (site green-5 family). */
export const DARK_TEXT = "#1d2512";

export function parseColor(c: string | undefined): { rgb: RGB; a: number } | null {
  if (!c) return null;
  const s = c.trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) {
    const h = m[1].length === 3 ? [...m[1]].map((x) => x + x).join("") : m[1];
    return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB, a: 1 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { rgb: [+m[1], +m[2], +m[3]], a };
  }
  return null;
}

export const hex = ([r, g, b]: RGB) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

export function luminance([r, g, b]: RGB): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function ratio(a: RGB, b: RGB): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Mix towards black in small steps until `fixed` reaches AA against `other`. */
function darkenUntil(c: RGB, other: RGB): RGB {
  for (let k = 0; k <= 1; k += 0.01) {
    const d = c.map((v) => v * (1 - k)) as RGB;
    if (ratio(d, other) >= AA) return d;
  }
  return [0, 0, 0];
}

/**
 * A readable text/background pair for a button with Wix colours `fg` on `bg`. Pairs that already pass, and
 * colours we cannot judge (transparent or unknown backgrounds), are returned unchanged.
 */
export function readablePair(fg: string | undefined, bg: string | undefined): { fg?: string; bg?: string } {
  const f = parseColor(fg);
  const b = parseColor(bg);
  if (!f || !b || b.a < 1 || f.a < 1 || ratio(f.rgb, b.rgb) >= AA) return { fg, bg };
  const lightText = luminance(f.rgb) > luminance(b.rgb);
  if (lightText) {
    // light background: dark text instead (as on the blog buttons); otherwise a slightly darker background
    if (luminance(b.rgb) > 0.3 && ratio(parseColor(DARK_TEXT)!.rgb, b.rgb) >= AA) return { fg: DARK_TEXT, bg };
    return { fg, bg: hex(darkenUntil(b.rgb, f.rgb)) };
  }
  return { fg: hex(darkenUntil(f.rgb, b.rgb)), bg };
}

/** Text colour readable on white (inline colours in post text): darkened only if below AA. */
export function readableOnWhite(fg: string): string {
  const f = parseColor(fg);
  if (!f || f.a < 1) return fg;
  return ratio(f.rgb, [255, 255, 255]) >= AA ? fg : hex(darkenUntil(f.rgb, [255, 255, 255]));
}
