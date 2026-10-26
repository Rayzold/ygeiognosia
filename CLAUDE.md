# Ygeiognosia — project rules

PROJECT: Rebuild https://www.ygeiognosia.com (currently on Wix: Wix Stores + Wix Blog + pages) as a self-owned site on Cloudflare Pages: a static Next.js export plus a small set of Cloudflare Pages Functions for checkout with Viva Smart Checkout.

Background, facts, lessons and the domain runbook: `docs/ygeiognosia-playbook.md` (read it first). Reference repo for reusable scripts/patterns: `Rayzold/aesthlos`.

## Non-negotiables
- Faithful rebuild, not a redesign: keep every page, section order, layout, image and colour combination of the current site. Changes only where forced (e.g. commercial Wix fonts) or approved by the owner, and every change goes into OWNER-CHANGES.md.
- Keep all Greek copy verbatim (pages, products, blog posts). Do not rewrite, shorten, translate or "fix" text unless the owner asks.
- Keep every existing URL path identical so Google rankings and shared links survive: `/product-page/<slug>`, `/post/<slug>`, `/blog`, and all page paths. Many slugs are Greek (e.g. `/post/τα-φρούτα-που-σε-βάζουν-για-ύπνο`, `/product-page/ψευδάργυρος`): test early (Phase 2) that a Greek-slug page builds, is served by Cloudflare Pages with status 200 for both the raw and the percent-encoded URL, and appears correctly encoded in sitemap.xml and canonical tags.
- No Wix dependencies at runtime: every image, PDF, icon and font is downloaded and served locally. No `static.wixstatic.com` (or any Wix host) URLs in the final build.
- Product prices must match the Wix Stores export exactly.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS, `output: "export"`, `trailingSlash: false` (Wix-style URLs).
- Hosting: Cloudflare Pages (account `markos.stefanou@gmail.com`), auto-deploy on every `git push` to `main`. Preview on `https://<project>.pages.dev` before the domain cutover.
- Checkout backend: Cloudflare Pages Functions in `/functions` (same origin, so no CORS). This is the only server-side code. Everything else is static.
- Images: WebP + pre-generated width variants + custom `next/image` loader (as in aesthlos: `scripts/image-variants.mjs`, `src/lib/image-loader.ts`); widths must match `next.config.ts` deviceSizes/imageSizes. Lazy-load below the fold and give every image correct `sizes` (the store and blog have hundreds of images).
- Content: typed `src/content/*.ts` for pages; products from the Wix Stores CSV export frozen into `src/content/products.json` (or `.ts`); blog posts as one Markdown/MDX file each in `src/content/posts/`.
- Templates, not hand-built pages: one product template (106 products), one post template (81 posts), templates per content-page type (38 pages). Designed pages that ship their own JS get their own route folder.
- `npm run build` = image variants + next build + `scripts/check-links.mjs` (fails the deploy on any broken link/asset/Wix URL) + a sitemap check that every URL of the Wix `sitemap.xml` exists in `out/`.
- Known technical debt goes in README "Known limitations".

## Store and checkout (owner decisions, 2026-10-26)
- Own store in the site: product list, categories, product page, client-side cart (no customer accounts).
- Payment: **Viva Smart Checkout via API**. The owner has an active Viva merchant account.
  - Cart lives in the browser (localStorage, wrapped in try/catch; the cart must still work in memory if storage is unavailable).
  - `POST /api/checkout` (Pages Function): receives product ids + quantities + customer/shipping details, **recomputes the total server-side from the product catalog** (never trust prices sent by the browser), adds shipping, creates a Viva payment order and returns the redirect to the Viva checkout page.
  - Viva webhook (Pages Function) confirms the payment; the success page alone is never proof of payment.
  - Credentials (client id/secret, source code, webhook key) only as Cloudflare Pages secrets/env vars. Never in the repo, never in client code.
  - Develop and test against the Viva **demo/sandbox** environment; switch to production only at cutover, with the owner.
  - Verify every Viva endpoint, auth flow and webhook detail against the current official docs (developer.viva.com) at Phase 5, not from memory.
- Shipping: **fixed cost** (amount and any free-shipping threshold taken from the current Wix Stores settings in Phase 1; confirm with the owner). **No inventory management**; availability is a manual flag per product (e.g. "εξαντλήθηκε").
- JSON-LD `Product` + `Offer` (price, currency EUR, availability) on every product page.
- CSP in `public/_headers` must allow the Viva checkout redirect/navigation and nothing more than needed.

## Other decisions
- Email: **no** professional email @ygeiognosia.com. The domain has no MX/SPF/DKIM/DMARC today, so the DNS move cannot break email. Use the no-email runbook (playbook section 6).
- Contact form: Jotform (EU servers), notification to the owner's email, as in aesthlos.
- Blog: same URLs `/post/<slug>`, original dates, cover image, categories if Wix has them, JSON-LD `BlogPosting`.
- Fonts: commercial Wix fonts → free Google Fonts look-alikes with Greek support; show the owner a comparison before deciding.
- Motion: only the restrained aesthlos patterns (Reveal, PageFade) and only where they do not change the faithful look. Respect `prefers-reduced-motion` everywhere.
- Lighthouse targets (mobile, median of 3 runs): Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO 100.

## Phase 1 findings (2026-10-26)
- Archive: 226 URLs = 38 pages + `/blog` + 81 posts + 106 products. Parsed data: `archive/products.json`, `archive/categories.json`, `archive/posts/*.json` (typed Ricos blocks), `archive/posts-index.json`, `archive/site.json` (menu/footer), `archive/pages/<type>/<name>/` (meta, outline, images), `archive/sitemap.md`, `archive/design-tokens.md`. Raw HTML, media, video, fonts and screenshots stay local (gitignored). Re-generate with `python3 scripts/parse_archive.py archive`.
- `/blank`, `/blank-1` … `/blank-15` and `/a` are **real store category pages** (16 categories, product order in `categories.json`); `/shop2` is the category hub; `/shop` is "All Products". Keep their URLs.
- `/product-page/i-m-a-product-1…11` are Wix template dummies («I'm a product»), visible and in the sitemap but in no category. Real products: **95**.
- **The e-shop is hidden on the live site**: no menu/home/blog link reaches `/shop`, `/shop2`, the categories or products (they only link to each other; menu «το κατάστημα» → `/about-us`, the physical shop). `/shop2` says «Το ηλεκτρονικό μας κατάστημα θα παραμείνει για λίγες ημέρες κλειστό.» Footer offers phone orders, store pickup and home delivery over 20€. **Confirm with the owner that the online store should be (re)opened before building checkout (Phase 5).**
- `/orders`, `/orders-*` (6 pages): an older hand-made catalogue with prices in the text and an «Παραγγελία» Jotform link (form 203123241675346); also unlinked. Ask whether to keep.
- `/blank-11` (Ερωτική Επιθυμία) is an empty category page.
- Contact page uses a Wix form (Name, Email, Subject, Message, English placeholders); contact email `ygeiognosia@hotmail.com`. Background video is on `/people`.
- Wix serves `<html lang="en">` on Greek pages: the rebuild uses `lang="el"` (list in OWNER-CHANGES.md).
- Blog posts contain buttons and links to aesthlos.com, 14 YouTube embeds, 3 single-image galleries.

## Approved fixes vs. Wix (Markos, 2026-10-26) — exceptions to "verbatim"
1. `<html lang="el">` everywhere.
2. All UI in Greek: store (Προσθήκη στο καλάθι, Γρήγορη προβολή, Τιμή, Ποσότητα…), blog (Όλα τα άρθρα, Πρόσφατα άρθρα, «N λεπτά ανάγνωσης», Greek dates e.g. «15 Φεβ 2025»), contact form labels/placeholders/button, pagination, aria-labels. Drop the Wix «More» menu item.
3. Greek page titles; home title + description in Greek (current English: «Health food store | Ygeiognosia | Greece», «Ygeiognosia offers natural…»).
4. Unique title per page (6 wild-olive pages, 6 `/orders-*` pages share one title today) from each page's own heading.
5. Meta description on every page, generated from content (product description, post excerpt, first paragraph); og:image on every page.
6. LocalBusiness JSON-LD (health food store: Βυζαντίου 23, Νέα Σμύρνη 17121, +30 213 014 4422, opening hours from `/contact`).
7. Alt text for every image: product name / post title / page heading when Wix alt is empty or a file name.
8. Greek words typed with Latin look-alike letters (79 words, 370 places, e.g. `Kαλλυντικά`, `Aυτοφαγία`) → Greek letters, **in visible text only; URLs/slugs never change**.
9. Typos: «Κυταρρική» → «Κυτταρική», «Ελιξήρια» → «Ελιξίρια». A full spell-check list goes to Markos for approval; only approved items change.
10. Phone shown as «+30 213 014 4422» with `tel:+302130144422`.
11. `i-m-a-product-1…11` (Wix dummies) are not migrated: 301 → `/shop`, not in sitemap.
12. `/blank-11` (empty category) is not migrated: 301 → `/shop2`.
13. `/product-page/immune-c`: drop the Wix placeholder sections «RETURN & REFUND POLICY» and «SHIPPING INFO» (keep «ΠΛΗΡΟΦΟΡΙΕΣ»).
Every item is listed in OWNER-CHANGES.md.

## Content pipeline
- `archive/` = verbatim Wix capture (never edited by hand). `content/` = what the site is built from, generated by `python3 scripts/build_content.py` from `archive/` + the approved fix lists `archive/review/latinika-grammata.csv` (78 words, per-word direction, Markos' overrides: nεανικό→νεανικό, OΤΑΝ→ΌΤΑΝ, βio→bio) and `archive/review/orthografia.csv` (140 spelling fixes, all approved 2026-10-26). It also strips invisible characters, drops the dummy products, `/blank-11` and the immune-c placeholder sections. Fixes apply to visible text only (HTML text nodes, link labels, alts, meta titles/descriptions), never to slugs/paths/URLs/hrefs. `content/FIXES-REPORT.md` has the counts. Re-run after any re-parse of the archive.
- Product names can contain HTML entities (e.g. `&amp;`): decode when rendering.

## Open questions (resolve in or after Phase 1)
- Two post images are broken on Wix itself (403 even for resized variants): `21375d_4482fcf3…~mv2.jpg` in `/post/mumijo-ή-αλλιώς-το-δάκρυ-του-γίγαντα` and `21375d_8ef7168d…~mv2.jpg` in `/post/η-αιτία-των-ασθενειών-μέρος-β-αυτοάνοσα-νοσήματα-και-φλεγμονές`. Ask the owner for the originals; otherwise omit them (OWNER-CHANGES.md).
- Fonts: PF DinText Pro and Black Diamond are commercial uploads (see `archive/design-tokens.md`); ask whether the owner holds web licences.
- Languages: Greek only (no `hreflang`/`?lang=` found).
- Wix members/login pages: not migrated (static site, no accounts). Confirm none are in use.
- Order notification: where the owner receives new orders (email via which provider, or the Viva dashboard only) and whether orders need to be stored (e.g. Cloudflare D1/KV).
- Invoices/receipts and myDATA: how the owner issues them today; the checkout must not break that process.
- E-shop legal pages (terms, returns, privacy/cookies): carry over verbatim from Wix; flag to the owner if any are missing.
- Domain expires **15/12/2026**: Markos renews it at papaki before the cutover.
- Before cancelling Wix: export orders, customers, products CSV, blog/newsletter subscribers, form messages, invoices.

## Owner changelog
- `OWNER-CHANGES.md` (Greek) records every change/fix vs. the live Wix site for the owner. Update it whenever something differs from Wix.

## Workflow
- Communicate with Markos in Greek; keep technical terms, names, commands and code in English.
- Work phase by phase (playbook section 4) and stop after each phase for review.
- `/archive` holds the capture of the live Wix site (HTML, text, meta, image lists, screenshots, design tokens). It is the source of truth for layout and copy.
- CSV files: UTF-8 with BOM, delimiter `^`, quote any field that contains `^`, `"` or a newline (double the inner quotes).
- Claude's safety checks may block some DNS/domain changes (e.g. nameservers at papaki): give Markos exact click-by-click instructions instead of insisting.
- Run a code review before the release (`/engineering:code-review`), with extra attention to the checkout functions.
