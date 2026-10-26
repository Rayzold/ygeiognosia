#!/usr/bin/env python3
"""Parse the downloaded Wix HTML (archive/html/<type>/*.html, manifest archive/urls.json) into a readable archive.

Writes (all UTF-8 JSON / Markdown, verbatim Greek text):
  archive/pages/<type>/<name>/meta.json     title, description, og tags, canonical, lang, robots
  archive/pages/<type>/<name>/content.md    document-order outline of the page body (sections, text, images, links)
  archive/pages/<type>/<name>/images.json   every image: wix id, size, alt, order, local file, downloaded?
  archive/products.json                     every Wix Stores product (from wix-warmup-data + ld+json)
  archive/posts/<n>.json                    every blog post: meta, dates, hero image, typed Ricos blocks
  archive/posts-index.json                  post list (slug, title, dates, excerpt, hero)
  archive/site.json                         header menu, footer texts/links, Wix page-id map
  archive/images-index.json                 image ids per page
  archive/sitemap.md                        overview table of every URL

Usage: python3 scripts/parse_archive.py [archive_dir] [media_list.txt]
  media_list.txt (optional): file names present in archive/media (when media is not on this machine).
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

from bs4 import BeautifulSoup, NavigableString, Tag

ARCH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "archive"
MEDIA_LIST = Path(sys.argv[2]) if len(sys.argv) > 2 else None
HTML_DIR = ARCH / "html"
MEDIA_DIR = ARCH / "media"

STORES_APP = "1380b703-ce81-ff05-f115-39571d94dfcd"
WIX_ID = re.compile(r"(?:[0-9a-f]{6}_[0-9a-f]{32}(?:f000|~mv2(?:_d_\d+_\d+_s(?:_\d+)+)?)?|nsplsh_[0-9A-Za-z]+~mv2(?:_d_\d+_\d+_s(?:_\d+)+)?)\.(?:png|jpe?g|gif|webp|svg|avif)", re.I)

if MEDIA_LIST and MEDIA_LIST.exists():
    MEDIA_FILES = {ln.strip() for ln in MEDIA_LIST.read_text(encoding="utf-8").splitlines() if ln.strip()}
elif MEDIA_DIR.exists():
    MEDIA_FILES = {p.name for p in MEDIA_DIR.iterdir()}
else:
    MEDIA_FILES = set()
MEDIA_BY_STEM = {}
for fn in MEDIA_FILES:
    stem = re.sub(r"__w\d+h\d+(\.[^.]+)$", r"\1", fn)
    MEDIA_BY_STEM[re.sub(r"\.[^.]+$", "", stem)] = fn


def local_file(wix_id: str):
    """Local file name for a Wix media id (any extension, incl. fallback variants), or None."""
    if not wix_id:
        return None
    wix_id = unquote(wix_id.split("/")[0])
    return MEDIA_BY_STEM.get(re.sub(r"\.[^.]+$", "", wix_id.replace("~", "_")))


def dump(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def script_json(html: str, script_id: str):
    m = re.search(r'<script[^>]*id="%s"[^>]*>(.*?)</script>' % re.escape(script_id), html, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return None


def ld_json(html: str):
    out = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            out.append(json.loads(m.group(1)))
        except json.JSONDecodeError:
            pass
    return out


def block_text(el: Tag) -> str:
    """Text of a block element, keeping <br> as line breaks, collapsing other whitespace."""
    parts = []
    for node in el.descendants:
        if isinstance(node, NavigableString):
            parts.append(str(node))
        elif isinstance(node, Tag) and node.name == "br":
            parts.append("\n")
    text = "".join(parts).replace("​", "")
    lines = [re.sub(r"[ \t ]+", " ", ln).strip() for ln in text.split("\n")]
    return "\n".join(lines).strip()


def meta(soup: BeautifulSoup) -> dict:
    def m(key):
        tag = soup.find("meta", attrs={"name": key}) or soup.find("meta", attrs={"property": key})
        return tag.get("content") if tag else None

    canon = soup.find("link", rel="canonical")
    return {
        "title": soup.title.get_text(strip=True) if soup.title else None,
        "description": m("description"),
        "og:title": m("og:title"),
        "og:description": m("og:description"),
        "og:image": m("og:image"),
        "og:url": m("og:url"),
        "og:type": m("og:type"),
        "twitter:card": m("twitter:card"),
        "google-site-verification": m("google-site-verification"),
        "facebook-domain-verification": m("facebook-domain-verification"),
        "robots": m("robots"),
        "canonical": canon.get("href") if canon else None,
        "lang": soup.html.get("lang") if soup.html else None,
        "hreflang": [{"lang": l.get("hreflang"), "href": l.get("href")} for l in soup.find_all("link", rel="alternate") if l.get("hreflang")],
    }


def image_from(el: Tag):
    info = el.get("data-image-info")
    if info:
        try:
            d = json.loads(info).get("imageData", {})
            return {"id": d.get("uri"), "w": d.get("width"), "h": d.get("height"), "alt": d.get("alt") or ""}
        except json.JSONDecodeError:
            pass
    if el.name == "img":
        src = el.get("src") or el.get("data-src") or ""
        m = WIX_ID.search(src)
        if m:
            return {"id": m.group(0), "w": None, "h": None, "alt": el.get("alt") or ""}
    return None


def walk(page_root: Tag):
    """Yield outline items in document order."""
    seen_imgs = set()
    for el in page_root.descendants:
        if not isinstance(el, Tag):
            continue
        if el.name in ("section", "header", "footer") and el.get("id"):
            yield {"type": "section", "id": el["id"], "tag": el.name}
        elif el.get("data-testid") == "richTextElement":
            for blk in el.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li"]):
                if blk.name == "p" and blk.find_parent(["p", "li"]) is not None:
                    continue
                txt = block_text(blk)
                if txt:
                    yield {"type": "text", "tag": blk.name, "text": txt}
        elif el.name in ("wow-image", "img") or el.get("data-image-info"):
            img = image_from(el)
            if img and img["id"] and img["id"] not in seen_imgs:
                seen_imgs.add(img["id"])
                yield {"type": "image", **img}
        elif el.get("data-video-info"):
            try:
                d = json.loads(el["data-video-info"])
                yield {"type": "video", "id": d.get("videoId"), "w": d.get("videoWidth"), "h": d.get("videoHeight")}
            except json.JSONDecodeError:
                pass
        elif el.name == "a" and el.get("href"):
            label = block_text(el) or el.get("aria-label") or ""
            yield {"type": "link", "text": label.replace("\n", " "), "href": el["href"]}
        elif el.get("data-testid") == "linkElement" and el.name != "a":
            pass
        elif el.name == "iframe" and el.get("src"):
            yield {"type": "iframe", "src": el["src"], "title": el.get("title") or ""}


# ------------------------------------------------------------------ Ricos (blog post body) -> clean blocks
INLINE_KEEP = {"strong", "b", "em", "i", "u", "s", "a", "br", "sup", "sub", "code"}
STYLE_KEEP = re.compile(r"(?:^|;)\s*((?:color|background-color|font-weight|font-style|text-decoration)\s*:[^;]+)")


def clean_inline(el: Tag) -> str:
    """Inline HTML with only semantic tags (+ colour styles on spans) kept; everything else unwrapped."""
    out = []
    for node in el.children:
        if isinstance(node, NavigableString):
            out.append(str(node).replace("​", "").replace("<", "&lt;").replace(">", "&gt;"))
        elif isinstance(node, Tag):
            inner = clean_inline(node)
            if node.name == "br":
                out.append("<br>")
            elif node.name == "a":
                href = node.get("href", "")
                tgt = ' target="_blank"' if node.get("target") == "_blank" else ""
                out.append(f'<a href="{href}"{tgt}>{inner}</a>')
            elif node.name in INLINE_KEEP:
                out.append(f"<{node.name}>{inner}</{node.name}>")
            elif node.name == "span" and node.get("style"):
                styles = [s.strip() for s in STYLE_KEEP.findall(node["style"])]
                out.append(f'<span style="{"; ".join(styles)}">{inner}</span>' if styles else inner)
            else:
                out.append(inner)
    return "".join(out)


def ricos_blocks(soup: BeautifulSoup):
    body = soup.find(attrs={"data-hook": "post-description"})
    if not body:
        return []
    first = body.find(attrs={"data-hook": re.compile(r"^rcv-block\d+$")})
    if not first:
        return []
    container = first.parent
    blocks = []
    content = None
    for child in container.find_all(recursive=False):
        hook = child.get("data-hook") or ""
        if re.match(r"^rcv-block\d+$", hook):
            # the marker follows its content and carries the Ricos node type
            if content is not None:
                b = parse_block(content, child.get("type"))
                if b:
                    b["ricos"] = child.get("type")
                    blocks.append(b)
            content = None
            continue
        content = child
    if content is not None:
        b = parse_block(content, None)
        if b:
            blocks.append(b)
    return blocks


def gallery_images(el: Tag):
    out = []
    for img in el.find_all("img"):
        m = WIX_ID.search(img.get("src") or "")
        if m:
            out.append({"id": m.group(0), "w": int(img["width"]) if (img.get("width") or "").isdigit() else None,
                        "h": int(img["height"]) if (img.get("height") or "").isdigit() else None,
                        "alt": img.get("alt") or "", "file": local_file(m.group(0))})
    return out


def parse_block(el: Tag, rtype=None):
    if rtype == "video" or el.find(attrs={"data-hook": "figure-VIDEO"}):
        s = str(el)
        yt = re.search(r"(?:i\.ytimg\.com/vi/|youtube\.com/embed/|youtu\.be/)([A-Za-z0-9_-]{6,})", s)
        vm = re.search(r"vimeo\.com/(?:video/)?(\d+)", s)
        wixv = re.search(r"video/([0-9a-f]{6}_[0-9a-f]{32})/", s)
        return {"type": "video", "youtube": yt.group(1) if yt else None, "vimeo": vm.group(1) if vm else None,
                "wixVideo": wixv.group(1) if wixv else None}
    if rtype == "button" or el.find(attrs={"data-hook": re.compile(r"button-viewer")}):
        a = el.find("a", href=True)
        st = a.get("style", "") if a else ""
        bg = re.search(r"--ricos-internal-button-background:([^;]+)", st)
        tc = re.search(r"--ricos-internal-button-color:([^;]+)", st)
        return {"type": "button", "text": block_text(a) if a else block_text(el), "href": a["href"] if a else None,
                "newTab": bool(a and a.get("target") == "_blank"), "background": bg.group(1) if bg else None,
                "color": tc.group(1) if tc else None}
    if rtype == "gallery" or el.find(attrs={"data-hook": "gallery-viewer"}):
        g = el.find(attrs={"data-layout": True})
        return {"type": "gallery", "layout": g.get("data-layout") if g else None, "images": gallery_images(el)}
    return parse_plain(el)


def parse_plain(el: Tag):
    # first meaningful element inside the data-breakout wrapper
    node = el
    for cand in el.find_all(True):
        if cand.name in ("p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "blockquote", "figure", "hr", "iframe", "pre", "table") \
                or cand.get("data-ricos-paragraph") is not None:
            node = cand
            break
    style = node.get("style", "") if isinstance(node, Tag) else ""
    align = None
    m = re.search(r"text-align:\s*(\w+)", style)
    if m:
        align = m.group(1)
    if node.name == "figure" or el.find("wow-image") or el.find(attrs={"data-image-info": True}):
        img = None
        for cand in el.find_all(attrs={"data-image-info": True}):
            img = image_from(cand)
            break
        if not img:
            src = el.find("img")
            img = image_from(src) if src else None
        cap = el.find("figcaption")
        link = el.find("a", href=True)
        return {"type": "image", "id": img and img["id"], "w": img and img["w"], "h": img and img["h"],
                "alt": img and img["alt"], "file": local_file(img and img["id"]),
                "caption": block_text(cap) if cap else "", "link": link["href"] if link else None}
    if node.name in ("ul", "ol"):
        return {"type": "list", "ordered": node.name == "ol",
                "items": [clean_inline(li) for li in node.find_all("li", recursive=False)],
                "text": "\n".join(block_text(li) for li in node.find_all("li", recursive=False))}
    if node.name == "hr" or el.find(attrs={"data-hook": "divider-single"}) or "divider" in " ".join(el.get("class", [])):
        return {"type": "divider"}
    if node.name == "iframe" or el.find("iframe"):
        f = node if node.name == "iframe" else el.find("iframe")
        return {"type": "embed", "src": f.get("src"), "title": f.get("title") or ""}
    if el.find("video") or el.find(attrs={"data-hook": re.compile("video", re.I)}):
        v = el.find("video")
        return {"type": "video", "src": v.get("src") if v else None, "html": str(el)[:2000]}
    txt = block_text(node)
    if node.name in ("h1", "h2", "h3", "h4", "h5", "h6"):
        return {"type": "heading", "level": int(node.name[1]), "html": clean_inline(node), "text": txt, "align": align}
    if node.name == "blockquote":
        return {"type": "quote", "html": clean_inline(node), "text": txt, "align": align}
    if not txt:
        return {"type": "empty-line"}
    return {"type": "paragraph", "html": clean_inline(node), "text": txt, "align": align}


# ------------------------------------------------------------------ products
def product_from(html: str, soup: BeautifulSoup, entry: dict):
    w = script_json(html, "wix-warmup-data") or {}
    app = (w.get("appsWarmupData") or {}).get(STORES_APP) or {}
    p = None
    for v in app.values():
        if isinstance(v, dict) and (v.get("catalog") or {}).get("product"):
            p = v["catalog"]["product"]
            break
    ld = next((x for x in ld_json(html) if x.get("@type") == "Product"), {})
    if not p:
        return {"slug": entry["path"].split("/", 2)[-1], "url": entry["url"], "error": "no product data", "ld": ld}
    media = [{"id": m.get("id"), "w": m.get("width"), "h": m.get("height"), "alt": m.get("altText") or "",
              "title": m.get("title"), "type": m.get("mediaType"), "file": local_file(m.get("id"))}
             for m in sorted(p.get("media") or [], key=lambda m: m.get("index", 0))]
    return {
        "slug": p.get("urlPart"),
        "path": entry["path"],
        "url": entry["url"],
        "wixId": p.get("id"),
        "name": p.get("name"),
        "descriptionHtml": p.get("description") or "",
        "price": p.get("price"),
        "comparePrice": p.get("comparePrice"),
        "discountedPrice": p.get("discountedPrice"),
        "formattedPrice": p.get("formattedPrice"),
        "formattedDiscountedPrice": p.get("formattedDiscountedPrice"),
        "discount": p.get("discount"),
        "currency": p.get("currency"),
        "ribbon": p.get("ribbon") or "",
        "isVisible": p.get("isVisible"),
        "isInStock": p.get("isInStock"),
        "inventoryStatus": (p.get("inventory") or {}).get("status"),
        "isTrackingInventory": p.get("isTrackingInventory"),
        "sku": p.get("sku") or "",
        "weight": p.get("weight"),
        "productType": p.get("productType"),
        "categoryIds": p.get("categoryIds") or [],
        "options": p.get("options") or [],
        "productItems": [{"price": i.get("price"), "optionsSelections": i.get("optionsSelections"), "sku": i.get("sku"),
                          "isVisible": i.get("isVisible"), "inventory": i.get("inventory")} for i in (p.get("productItems") or [])
                         if i.get("optionsSelections")],
        "customTextFields": p.get("customTextFields") or [],
        "additionalInfo": p.get("additionalInfo") or [],
        "seoTitle": p.get("seoTitle"),
        "seoDescription": p.get("seoDescription"),
        "media": media,
        "ldAvailability": ((ld.get("offers") or {}).get("availability") or "").rsplit("/", 1)[-1],
        "ldPrice": (ld.get("offers") or {}).get("price"),
        "meta": meta(soup),
    }


def category_from(html: str, entry: dict):
    """Wix Stores gallery widget on a page: category id/name and the products in display order (SSR: first page only)."""
    w = script_json(html, "wix-warmup-data") or {}
    app = (w.get("appsWarmupData") or {}).get(STORES_APP) or {}
    for key, v in app.items():
        if not key.startswith("initialData_") or not isinstance(v, dict):
            continue
        cat = (v.get("catalog") or {}).get("category") or {}
        pw = cat.get("productsWithMetaData") or {}
        lst = pw.get("list") or []
        return {"path": entry["path"], "widget": key, "categoryId": cat.get("id"), "name": cat.get("name"),
                "visible": cat.get("visible"), "totalCount": pw.get("totalCount"),
                "products": [p.get("urlPart") for p in lst],
                "complete": pw.get("totalCount") is not None and len(lst) >= pw.get("totalCount", 0),
                "filters": ((v.get("appSettings") or {}).get("widgetSettings") or {}).get("FILTERS")}
    return None


# ------------------------------------------------------------------ posts
def post_from(html: str, soup: BeautifulSoup, entry: dict):
    ld = next((x for x in ld_json(html) if x.get("@type") == "BlogPosting"), {})
    title = soup.find(attrs={"data-hook": "post-title"})
    ttr = soup.find(attrs={"data-hook": "time-to-read"})
    hero = soup.find(attrs={"data-hook": "post-hero-image"})
    hero_img = None
    if hero:
        for cand in hero.find_all(attrs={"data-image-info": True}):
            hero_img = image_from(cand)
            break
    ld_img = ld.get("image") or {}
    if isinstance(ld_img, list):
        ld_img = ld_img[0] if ld_img else {}
    cover_id = None
    if ld_img.get("url"):
        m = WIX_ID.search(ld_img["url"])
        cover_id = m.group(0) if m else None
    cats = [{"text": block_text(a), "href": a["href"]} for a in soup.find_all("a", href=re.compile(r"/blog/categories/"))]
    tags = [{"text": block_text(a), "href": a["href"]} for a in soup.find_all("a", href=re.compile(r"/blog/hashtags/|/blog/tags/"))]
    blocks = ricos_blocks(soup)
    return {
        "slug": entry["path"].split("/", 2)[-1],
        "path": entry["path"],
        "url": entry["url"],
        "title": title.get_text(strip=True) if title else ld.get("headline"),
        "headline": ld.get("headline"),
        "author": (ld.get("author") or {}).get("name"),
        "datePublished": ld.get("datePublished"),
        "dateModified": ld.get("dateModified"),
        "excerpt": ld.get("description"),
        "timeToRead": ttr.get_text(strip=True) if ttr else None,
        "cover": {"id": cover_id, "w": ld_img.get("width"), "h": ld_img.get("height"), "file": local_file(cover_id)},
        "heroImage": dict(hero_img, file=local_file(hero_img["id"])) if hero_img else None,
        "categories": cats,
        "tags": tags,
        "blocks": blocks,
        "blockTypes": dict(Counter(b["type"] for b in blocks)),
        "meta": meta(soup),
    }


# ------------------------------------------------------------------ site chrome
def site_chrome(home_html: str, soup: BeautifulSoup):
    def links(el):
        return [{"text": block_text(a).replace("\n", " ") or a.get("aria-label") or "", "href": a["href"]}
                for a in el.find_all("a", href=True)] if el else []

    header = soup.find(id="SITE_HEADER")
    footer = soup.find(id="SITE_FOOTER")
    menu = []
    nav = soup.find(id=re.compile(r"^DrpDwnMn")) or (header.find("nav") if header else None)
    if nav:
        for li in nav.find_all("li"):
            a = li.find("a", href=True)
            label = block_text(li).split("\n")[0]
            menu.append({"text": label, "href": a["href"] if a else None, "submenu": bool(li.find("ul"))})
    page_ids = {}
    for m in re.finditer(r'"pageId":"([a-z0-9]{5})","title":"([^"]*)","pageUriSEO":"([^"]*)"', home_html):
        page_ids[m.group(1)] = {"title": m.group(2), "path": "/" + m.group(3)}
    return {
        "menu": menu,
        "headerLinks": links(header),
        "headerTexts": [block_text(t) for t in header.find_all(attrs={"data-testid": "richTextElement"})] if header else [],
        "footerLinks": links(footer),
        "footerTexts": [block_text(t) for t in footer.find_all(attrs={"data-testid": "richTextElement"})] if footer else [],
        "pageIds": page_ids,
    }


def main():
    manifest = json.loads((ARCH / "urls.json").read_text(encoding="utf-8-sig"))
    products, posts, rows, index, categories = [], [], [], {}, []
    site = None
    done = set()
    for e in manifest:
        f = ARCH / e["file"]
        if e["file"] in done or not f.exists():
            continue
        done.add(e["file"])
        raw = f.read_text(encoding="utf-8")
        soup = BeautifulSoup(raw, "lxml")
        name = Path(e["file"]).stem
        out = ARCH / "pages" / e["type"] / name
        m = meta(soup)
        dump(out / "meta.json", dict(m, url=e["url"], path=e["path"]))

        root = soup.find(id="PAGES_CONTAINER") or soup.find(id="SITE_CONTAINER") or soup.body
        items = list(walk(root))
        images, lines, order = [], [f"# {e['path']}", "", f"title: {m['title']}", ""], 0
        for it in items:
            t = it["type"]
            if t == "section":
                lines += ["", f"## [{it['tag']} {it['id']}]", ""]
            elif t == "text":
                prefix = "#" * min(int(it["tag"][1]) + 2, 6) + " " if it["tag"].startswith("h") else ""
                lines += [f"{prefix}{it['text']}", ""] if prefix else [f"<{it['tag']}> {it['text']}", ""]
            elif t == "image":
                order += 1
                fn = local_file(it["id"])
                images.append({"order": order, "id": it["id"], "file": fn, "downloaded": bool(fn),
                               "width": it["w"], "height": it["h"], "alt": it["alt"]})
                lines += [f"![{it['alt']}](media/{fn or it['id']}) _#{order} {it['w']}x{it['h']}_", ""]
            elif t == "video":
                lines += [f"[VIDEO {it['id']} {it['w']}x{it['h']}]", ""]
            elif t == "link":
                lines += [f"[LINK] {it['text'] or '(no text)'} -> {it['href']}", ""]
            elif t == "iframe":
                lines += [f"[IFRAME] {it['title']} -> {it['src'][:200]}", ""]
        (out / "content.md").write_text("\n".join(lines), encoding="utf-8")
        dump(out / "images.json", images)
        index[e["path"]] = [i["id"] for i in images]

        extra = ""
        if e["type"] == "product-page":
            p = product_from(raw, soup, e)
            products.append(p)
            extra = f"{p.get('formattedPrice')} {'hidden' if p.get('isVisible') is False else ''} {p.get('ribbon') or ''}".strip()
        elif e["type"] == "post":
            p = post_from(raw, soup, e)
            n = len(posts) + 1
            p["file"] = f"posts/{n:03d}.json"
            dump(ARCH / p["file"], p)
            posts.append({k: p[k] for k in ("slug", "path", "title", "datePublished", "dateModified", "excerpt", "timeToRead", "cover", "categories", "blockTypes", "file")})
            extra = f"{(p['datePublished'] or '')[:10]} blocks={len(p['blocks'])}"
        cat = category_from(raw, e)
        if cat:
            categories.append(cat)
        if e["path"] == "/" and site is None:
            site = site_chrome(raw, soup)
        rows.append((e["type"], e["path"], m["title"] or "", len([i for i in items if i["type"] == "text"]), len(images),
                     sum(1 for i in images if not i["downloaded"]), extra))

    products.sort(key=lambda p: p.get("slug") or "")
    dump(ARCH / "products.json", products)
    dump(ARCH / "posts-index.json", sorted(posts, key=lambda p: p["datePublished"] or "", reverse=True))
    dump(ARCH / "site.json", site or {})
    dump(ARCH / "categories.json", categories)
    dump(ARCH / "images-index.json", index)

    md = ["# Wix sitemap overview", "", f"{len(rows)} URLs. texts = rich-text blocks in the page body, images = body images, missing = not downloaded.", "",
          "| type | path | title | texts | images | missing | notes |", "|---|---|---|---|---|---|---|"]
    for r in sorted(rows):
        md.append("| " + " | ".join(str(c).replace("|", "\\|") for c in r) + " |")
    (ARCH / "sitemap.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(Counter(r[0] for r in rows))
    print("products:", len(products), "with errors:", sum(1 for p in products if p.get("error")))
    print("posts:", len(posts), "block types:", sum((Counter(p["blockTypes"]) for p in posts), Counter()))
    print("images missing locally:", sum(r[5] for r in rows))


if __name__ == "__main__":
    main()
