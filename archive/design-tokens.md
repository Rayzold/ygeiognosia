# Design tokens (from the live Wix site, 2026-10-26)

Source: `archive/html` (theme CSS variables, rich-text spans) and `archive/screenshots`.

## Fonts

| Wix name | Real font | Licence | Where | Plan |
|---|---|---|---|---|
| `wfont_21375d_2a288b1e…` / `wfont_21375d_84b1395d…` | **PF DinText Pro Regular** (Parachute, 2005), Greek | Commercial, uploaded to Wix. No web licence known | Most body text (~980 rich-text spans) | Free Google Fonts look-alike with Greek, as in aesthlos (Roboto Condensed was chosen there). Show the owner a comparison |
| `wfont_21375d_8b43208e…` | **PF DinText Pro Bold** | same | Bold body text (13 spans) | same family, bold weight |
| `wfont_21375d_32d95d9a…` | **Black Diamond** (Set Sail Studios, 2016), script, has Greek glyphs | Commercial. Ask the owner whether they hold a webfont licence | Script headings: «Υγεία και Τέχνη», «Ακολουθήστε μας:», «Θα μας βρείτε…» (~146 spans) | If no licence: a free script font with Greek, or keep it as SVG/image for the few fixed headings. Owner decides |
| `brandon-grot-w01-light` | Brandon Grotesque Light (Wix-hosted) | Licensed for Wix only | ~430 spans, mostly store and blog widgets | Free look-alike (e.g. a light geometric sans with Greek) |
| `din-next-w01-light` | DIN Next Light (Wix-hosted) | Licensed for Wix only | Theme fonts 5–9 (store and blog widgets) | Same replacement as PF DinText |
| `josefin slab` | Josefin Slab | Google Fonts (OFL), **no Greek subset** | Theme fonts 0, 2–4 (headings in Wix widgets) | Check where it is visible; Greek text falls back to another font today |
| `open sans` | Open Sans | Google Fonts (OFL), Greek | Theme font 10 (small text) | Keep |
| `Madefor` | Wix's own UI font | Wix only | Store/blog UI controls | System sans or the body replacement |

The uploaded font files are in `archive/fonts` (local only).

## Colours

Theme palette (`--color_N`, RGB). The site uses the green and yellow ramps:

| Ramp | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Green (16–20) | `#EAF7D7` | `#C5DDA4` | `#A0CC62` | `#6B8841` | `#354421` |
| Yellow (21–25) | `#FFEEAA` | `#FFE57F` | `#FFCC00` | `#B89710` | `#544300` |
| Brown (26–30) | `#E8C8AD` | `#D1A582` | `#BA6C2D` | `#7C481E` | `#3E240F` |
| Olive (31–35) | `#E3E1AC` | `#C7C57F` | `#ABA730` | `#726F20` | `#393810` |
| Greys (11–15) | `#FFFFFF` | `#BFBFBF` | `#999797` | `#4C4C4C` | `#000000` |

- Store/blog accent (`--color_41/48/52/58–61`): `#A0CC62` (menu bar, buttons, active states).
- Rich text on pages: almost always **white** (`#FFFFFF`, 944 spans) on dark photo backgrounds. Other colours used once or twice: `#2A2A2A`, `#BADA55`, `#8B0000`, `#FFC824`, `#FFEEBC`, `#587042`.
- Blog posts: body text `#000000` on white.

## Layout notes (from screenshots)

- Fixed full-screen background photo (dark green foliage), content in a centred column ~980px wide (classic Wix layout).
- Header: round logo centred, «Καλάθι αγορών» cart link and «Υγεία και Τέχνη» script text top-right, search box, green menu bar (`#A0CC62`) with 6 items.
- Footer: dark green panel, «Ακολουθήστε μας:» + Facebook/Instagram, phone orders, store pickup address, home-delivery note, © line.
- One background video on the site (`archive/video`, 1080p, 33 MB). Find its page in Phase 2.
