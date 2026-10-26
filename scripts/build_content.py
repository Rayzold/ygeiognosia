#!/usr/bin/env python3
"""Build the site's content source (content/) from the Wix capture (archive/) + the approved text fixes.

archive/ stays a verbatim copy of Wix. content/ is what the site is built from.
Approved fixes (CLAUDE.md "Approved fixes vs. Wix"):
  - invisible characters removed (zero-width space, backspace, soft hyphen, BOM)
  - archive/review/latinika-grammata.csv   Greek words typed with Latin look-alike letters (and the reverse)
  - archive/review/orthografia.csv         spelling fixes, rows with «ΝΑΙ» only
  - Wix dummy products (i-m-a-product-N) and the empty category /blank-11 dropped
  - immune-c: Wix placeholder sections «RETURN & REFUND POLICY» / «SHIPPING INFO» dropped
Fixes touch visible text only: never slugs, paths, URLs, hrefs or file names.

Usage: python3 scripts/build_content.py [repo_root]
Writes content/{products.json,categories.json,site.json,posts/*.json,posts-index.json,pages/**,FIXES-REPORT.md}
"""
import csv
import json
import re
import shutil
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
ARCH = ROOT / "archive"
OUT = ROOT / "content"

INVISIBLE = re.compile("[​‌‍﻿­\x08]")
DUMMY_PRODUCT = re.compile(r"^i-m-a-product-\d+$")
DROP_CATEGORY_PATHS = {"/blank-11"}
DROP_INFO = {"immune-c": {"RETURN & REFUND POLICY", "SHIPPING INFO"}}

stats = Counter()


def read_csv(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter="^"))


def build_rules():
    rules = {}
    for r in read_csv(ARCH / "review" / "latinika-grammata.csv"):
        if r["Διόρθωση"] and r["Διόρθωση"] != r["Όπως είναι"]:
            rules[r["Όπως είναι"]] = ("latin", r["Διόρθωση"])
    for r in read_csv(ARCH / "review" / "orthografia.csv"):
        if r["Έγκριση (ΝΑΙ/ΟΧΙ)"].strip().upper() in ("ΝΑΙ", "NAI", "YES"):
            rules[r["Όπως είναι"].strip()] = ("spell", r["Διόρθωση"].strip())
    # Already approved in CLAUDE.md (appears in menu/link labels, not only in body text)
    rules.setdefault("Ελιξήρια", ("spell", "Ελιξίρια"))
    return rules


RULES = build_rules()
# whole-token match; longest first so multi-word/glued tokens win
_alts = sorted(RULES, key=len, reverse=True)
TOKEN_RE = re.compile(r"(?<![\w])(" + "|".join(re.escape(w) for w in _alts) + r")(?![\w])")


def fix_text(s):
    if not s or not isinstance(s, str):
        return s
    s2, n = INVISIBLE.subn("", s)
    stats["invisible"] += n

    def rep(m):
        kind, new = RULES[m.group(1)]
        stats[kind] += 1
        return new
    return TOKEN_RE.sub(rep, s2)


TAG = re.compile(r"(<[^>]+>)")


def fix_html(s):
    """Fix text nodes only; tags (and their href/src attributes) stay untouched."""
    if not s:
        return s
    return "".join(p if TAG.fullmatch(p) else fix_text(p) for p in TAG.split(s))


META_TEXT_KEYS = ("title", "description", "og:title", "og:description")


def fix_meta(m):
    m = dict(m or {})
    for k in META_TEXT_KEYS:
        if m.get(k):
            m[k] = fix_text(m[k])
    return m


def fix_content_md(text):
    out = []
    for ln in text.splitlines():
        if ln.startswith("[LINK] ") and " -> " in ln:
            label, url = ln[7:].rsplit(" -> ", 1)
            ln = "[LINK] " + fix_text(label) + " -> " + url
        elif ln.startswith("![") and "](" in ln:
            alt, rest = ln[2:].split("](", 1)
            ln = "![" + fix_text(alt) + "](" + rest
        elif ln.startswith(("[IFRAME]", "[VIDEO]", "# /", "## [")):
            pass
        else:
            ln = fix_text(ln)
        out.append(ln)
    return "\n".join(out) + "\n"


def dump(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()

    # products
    products = []
    for p in json.loads((ARCH / "products.json").read_text(encoding="utf-8")):
        if DUMMY_PRODUCT.match(p["slug"]):
            stats["dropped dummy products"] += 1
            continue
        p = dict(p)
        p["name"] = fix_text(p["name"])
        p["descriptionHtml"] = fix_html(p["descriptionHtml"])
        p["ribbon"] = fix_text(p["ribbon"])
        info = []
        for a in p.get("additionalInfo") or []:
            if a.get("title") in DROP_INFO.get(p["slug"], set()):
                stats["dropped placeholder info sections"] += 1
                continue
            info.append(dict(a, title=fix_text(a.get("title")), description=fix_html(a.get("description"))))
        p["additionalInfo"] = info
        p["media"] = [dict(m, alt=fix_text(m.get("alt"))) for m in p["media"]]
        p["meta"] = fix_meta(p.get("meta"))
        products.append(p)
    dump(OUT / "products.json", products)
    slugs = {p["slug"] for p in products}

    # categories
    cats = []
    for c in json.loads((ARCH / "categories.json").read_text(encoding="utf-8")):
        if c["path"] in DROP_CATEGORY_PATHS:
            stats["dropped empty categories"] += 1
            continue
        c = dict(c, name=fix_text(c.get("name")), products=[s for s in c["products"] if s in slugs])
        cats.append(c)
    dump(OUT / "categories.json", cats)

    # posts
    index = []
    for f in sorted((ARCH / "posts").glob("*.json")):
        p = json.loads(f.read_text(encoding="utf-8"))
        for k in ("title", "headline", "excerpt"):
            p[k] = fix_text(p.get(k))
        blocks = []
        for b in p["blocks"]:
            b = dict(b)
            for k in ("text", "caption", "alt"):
                if b.get(k):
                    b[k] = fix_text(b[k])
            if b.get("html"):
                b["html"] = fix_html(b["html"])
            if b.get("items"):
                b["items"] = [fix_html(x) for x in b["items"]]
            if b.get("images"):
                b["images"] = [dict(i, alt=fix_text(i.get("alt"))) for i in b["images"]]
            blocks.append(b)
        p["blocks"] = blocks
        p["meta"] = fix_meta(p.get("meta"))
        dump(OUT / "posts" / f.name, p)
        index.append({k: p[k] for k in ("slug", "path", "title", "datePublished", "dateModified", "excerpt", "timeToRead", "cover", "categories", "blockTypes", "file")})
    dump(OUT / "posts-index.json", sorted(index, key=lambda x: x["datePublished"] or "", reverse=True))

    # pages (outline + meta + images), skipping dummies / dropped pages
    for d in sorted((ARCH / "pages").glob("*/*")):
        typ, name = d.parent.name, d.name
        if typ == "product-page" and DUMMY_PRODUCT.match(name):
            continue
        meta = json.loads((d / "meta.json").read_text(encoding="utf-8"))
        if meta.get("path") in DROP_CATEGORY_PATHS:
            continue
        o = OUT / "pages" / typ / name
        dump(o / "meta.json", fix_meta(meta))
        (o / "content.md").write_text(fix_content_md((d / "content.md").read_text(encoding="utf-8")), encoding="utf-8")
        imgs = json.loads((d / "images.json").read_text(encoding="utf-8"))
        dump(o / "images.json", [dict(i, alt=fix_text(i.get("alt"))) for i in imgs])

    # site chrome
    site = json.loads((ARCH / "site.json").read_text(encoding="utf-8"))
    for k in ("menu", "headerLinks", "footerLinks"):
        site[k] = [dict(x, text=fix_text(x.get("text"))) for x in site.get(k, [])]
    for k in ("headerTexts", "footerTexts"):
        site[k] = [fix_text(x) for x in site.get(k, [])]
    dump(OUT / "site.json", site)

    report = ["# Text fixes applied (generated by scripts/build_content.py)", "",
              "| fix | count |", "|---|---|"] + [f"| {k} | {v} |" for k, v in sorted(stats.items())]
    (OUT / "FIXES-REPORT.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print(dict(stats))


if __name__ == "__main__":
    main()
