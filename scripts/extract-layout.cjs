// Extract the desktop layout of archived Wix pages into archive/pages/<type>/<name>/layout.json.
// The site renders content pages from these files (src/components/wix/WixLayout.tsx).
//
// Usage: node scripts/extract-layout.cjs <htmlDir> <assetsDir> <type> <name> [<name> …]
//   htmlDir   = the local archive of raw Wix HTML (archive/html/<type>/<name>.html)
//   assetsDir = the local Wix originals (media/, fonts/), so fonts and images load and the layout is exact
// The page is rendered offline at 1440px with Wix's own fonts, entrance animations finished.
// Coordinates: px, relative to the parent node; top-level nodes relative to the 980px page column.
//
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs"); const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require("playwright");

const [htmlDir, assetsDir, type, ...names] = process.argv.slice(2);
const MEDIA = path.join(assetsDir, "media"), FONTS = path.join(assetsDir, "fonts");
const mediaFiles = fs.readdirSync(MEDIA);

/** Wix entrance animations from the page CSS: comp id -> { effect, duration, delay } */
function animations(html) {
  const out = {};
  const re = /#(comp-[\w-]+):not\(\[data-motion-enter="done"\]\)\{animation:motion-(\w+) (\d+)ms (\d+)ms[^}]*?(?:--motion-translate-x:([-\d.%px]+))?[;}]/g;
  let m;
  while ((m = re.exec(html))) {
    const kind = { fadeIn: "fade", slideIn: "slide", floatIn: "float" }[m[2]] ?? "fade";
    out[m[1]] = { effect: kind, duration: +m[3], delay: +m[4] - 1 > 0 ? +m[4] : 0 };
  }
  return out;
}

/** Wix hover interactions: "#box:hover #child{transform:…}" and button hover colours. */
function hovers(html) {
  const out = {};
  const add = (id, k, v) => ((out[id] ??= {})[k] = v);
  let m;
  const t = /#([\w-]+):hover #([\w-]+)\{transform:([^;}]+)/g;
  while ((m = t.exec(html))) add(m[2], "transform", { on: m[1], value: m[3].replace(/\)(?=[a-z])/g, ") ") });
  const d = /#([\w-]+):not\(\.is-animating\)\{transition:all ([\d.]+)s/g;
  while ((m = d.exec(html))) add(m[1], "duration", Math.round(+m[2] * 1000));
  const bg = /#([\w-]+) \.[\w-]+__root:hover\{\s*background:\s*([^;}]+)/g;
  while ((m = bg.exec(html))) add(m[1], "bg", m[2].trim());
  const c = /#([\w-]+) \.[\w-]+__root:hover \.[\w-]+__label \{\s*color:\s*([^;}]+)/g;
  while ((m = c.exec(html))) add(m[1], "color", m[2].trim());
  return out;
}

async function extract(page, file) {
  const html = fs.readFileSync(file, "utf8");
  const anims = animations(html);
  const hov = hovers(html);
  await page.goto("file://" + path.resolve(file), { waitUntil: "load" });
  await page.evaluate(() => {
    document.querySelectorAll("[id^=comp-]").forEach((e) => e.setAttribute("data-motion-enter", "done"));
  });
  await page.waitForTimeout(800);

  return page.evaluate(([anims, hov]) => {
    const px = (v) => Math.round(parseFloat(v) * 100) / 100 || 0;
    const transparent = (c) => !c || c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c);
    const fam = (f) => {
      const m = f.match(/wfont_[0-9a-f]+_([0-9a-f]{8})/);
      return m ? m[1] : f.split(",")[0].replace(/["']/g, "").trim().toLowerCase();
    };
    const colRoot = document.querySelector("#SITE_PAGES");
    const col = colRoot.getBoundingClientRect();
    const ox = (innerWidth - 980) / 2, oy = col.top;
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x - ox, y: r.y - oy, w: r.width, h: r.height }; };
    const rel = (r, p) => ({ x: Math.round(r.x - p.x), y: Math.round(r.y - p.y), w: Math.round(r.w), h: Math.round(r.h) });
    const cls = (el) => el.className && typeof el.className === "string" ? el.className : "";
    // Wix components carry their id as a class too (ids are "comp-…" or short ones like "WRchTxti")
    const isComp = (el) => !!el.id && el.classList?.contains(el.id) && !el.id.endsWith("-pinned-layer") && !el.id.startsWith("SITE_")
      && !el.id.startsWith("Container") && !document.getElementById("Container" + el.id); // the page wrapper itself
    const parentComp = (el) => { let p = el.parentElement; while (p && p !== colRoot && !isComp(p)) p = p.parentElement; return p === colRoot ? null : p; };

    // Box decoration of a component: its own style or that of a non-component descendant covering it.
    function deco(el) {
      const own = el.getBoundingClientRect();
      const cand = [el, ...el.querySelectorAll(":scope > div, :scope > div > div")].filter((d) => d === el || !isComp(d));
      for (const d of cand) {
        if (d !== el && (isComp(d) || parentComp(d) !== el)) continue;
        const r = d.getBoundingClientRect();
        if (Math.abs(r.width - own.width) > 2 || Math.abs(r.height - own.height) > 2) continue;
        const cs = getComputedStyle(d);
        const o = {};
        if (!transparent(cs.backgroundColor)) o.bg = cs.backgroundColor;
        if (px(cs.borderTopWidth) > 0 && !transparent(cs.borderTopColor) && cs.borderTopStyle !== "none") o.border = `${px(cs.borderTopWidth)}px solid ${cs.borderTopColor}`;
        if (px(cs.borderTopLeftRadius) > 0) o.radius = px(cs.borderTopLeftRadius);
        if (cs.boxShadow !== "none") o.shadow = cs.boxShadow;
        if (Object.keys(o).length) return o;
      }
      return null;
    }

    function runsOf(block) {
      const runs = [];
      const walk = (n) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3) {
            if (!c.textContent) continue;
            const e = c.parentElement, cs = getComputedStyle(e), a = e.closest("a");
            const r = { t: c.textContent, f: fam(cs.fontFamily), s: px(cs.fontSize), c: cs.color };
            if (+cs.fontWeight >= 600) r.b = 1;
            if (cs.fontStyle === "italic") r.i = 1;
            if (cs.textDecorationLine.includes("underline")) r.u = 1;
            if (cs.letterSpacing !== "normal" && px(cs.letterSpacing)) r.ls = px(cs.letterSpacing);
            const hl = e.closest("[style*=background]");
            if (hl && block.contains(hl) && !transparent(getComputedStyle(hl).backgroundColor)) r.bg = getComputedStyle(hl).backgroundColor;
            if (a) { r.href = a.getAttribute("href"); if (a.target === "_blank") r.blank = 1; }
            const last = runs[runs.length - 1];
            const same = last && !last.br && ["f", "s", "c", "b", "i", "u", "ls", "bg", "href", "blank"].every((k) => last[k] === r[k]);
            if (same) last.t += r.t; else runs.push(r);
          } else if (c.nodeName === "BR") runs.push({ br: 1 });
          else if (c.nodeType === 1) walk(c);
        }
      };
      walk(block);
      return runs;
    }

    function textBlocks(el) {
      const blocks = [];
      const visit = (n, list) => {
        for (const c of n.children) {
          if (/^(P|H[1-6])$/.test(c.tagName)) {
            const cs = getComputedStyle(c);
            const b = { tag: c.tagName.toLowerCase(), align: cs.textAlign === "start" ? "left" : cs.textAlign, fs: px(cs.fontSize), lh: px(cs.lineHeight) || null, runs: runsOf(c) };
            if (cs.whiteSpace !== "normal") b.ws = cs.whiteSpace;
            if (px(cs.marginTop)) b.mt = px(cs.marginTop);
            if (px(cs.marginBottom)) b.mb = px(cs.marginBottom);
            if (list) { b.list = list; const li = c.closest("li"); b.indent = Math.round(li.getBoundingClientRect().x - el.getBoundingClientRect().x); }
            blocks.push(b);
          } else if (c.tagName === "UL" || c.tagName === "OL") visit(c, c.tagName === "UL" ? "ul" : "ol");
          else if (c.tagName === "LI") {
            if (![...c.children].some((x) => /^(P|H[1-6])$/.test(x.tagName))) {
              const cs = getComputedStyle(c);
              blocks.push({ tag: "p", list, align: cs.textAlign === "start" ? "left" : cs.textAlign, fs: px(cs.fontSize), lh: px(cs.lineHeight) || null, runs: runsOf(c) });
            } else visit(c, list);
          } else visit(c, list);
        }
      };
      visit(el, null);
      return blocks;
    }

    function image(el) {
      const img = el.querySelector("img");
      if (!img) return null;
      const src = img.getAttribute("src") || "";
      const m = src.match(/\/media\/([^/]+)/);
      const o = { file: m ? decodeURIComponent(m[1]) : null, alt: img.getAttribute("alt") || "" };
      const crop = src.match(/\/crop\/x_(\d+),y_(\d+),w_(\d+),h_(\d+)/);
      if (crop) o.crop = { x: +crop[1], y: +crop[2], w: +crop[3], h: +crop[4] };
      const mode = src.match(/\/v1\/(?:crop\/[^/]+\/)?(fill|fit)\//);
      o.mode = mode ? mode[1] : "fill";
      const al = src.match(/al_([a-z]+)/);
      if (al) o.align = al[1];
      const cs = getComputedStyle(img);
      if (cs.objectFit && cs.objectFit !== "fill") o.fit = cs.objectFit;
      if (cs.objectPosition && cs.objectPosition !== "50% 50%") o.pos = cs.objectPosition;
      const a = img.closest("a");
      if (a) { o.href = a.getAttribute("href"); if (a.target === "_blank") o.blank = 1; }
      return o;
    }

    function node(el, parentRect) {
      let r = rect(el);
      const tf = getComputedStyle(el).transform;
      let rotate;
      if (tf && tf !== "none" && tf !== "matrix(1, 0, 0, 1, 0, 0)") {
        // rotated/flipped component: keep its own (unrotated) box, centred where Wix draws it
        const w = el.offsetWidth, h = el.offsetHeight;
        r = { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h };
        rotate = tf;
      }
      const c = cls(el);
      const n = { id: el.id, ...rel(r, parentRect) };
      if (rotate) n.transform = rotate;
      if (anims[el.id]) n.anim = anims[el.id];
      if (hov[el.id]?.transform) n.hover = { on: hov[el.id].transform.on, transform: hov[el.id].transform.value, duration: hov[el.id].duration ?? 400 };
      const pinned = el.closest(".QED8q1, [id$=-pinned-layer]");
      if (pinned) n.pinned = { top: Math.round(el.getBoundingClientRect().top), right: Math.round(innerWidth - el.getBoundingClientRect().right), vw: innerWidth, vh: innerHeight };
      const kids = () => [...el.querySelectorAll("[id]")].filter((k) => isComp(k) && parentComp(k) === el);

      if (c.includes("wixui-rich-text")) return { ...n, kind: "text", blocks: textBlocks(el) };
      if (c.includes("wixui-vector-image")) {
        const svg = el.querySelector("svg");
        let markup = "";
        if (svg) {
          // Wix colours its shapes from CSS: inline the computed paint so the SVG stands alone
          const clone = svg.cloneNode(true);
          const src = [svg, ...svg.querySelectorAll("*")], dst = [clone, ...clone.querySelectorAll("*")];
          src.forEach((s, i) => {
            const cs = getComputedStyle(s), d = dst[i];
            if (s !== svg && /^(path|circle|ellipse|rect|polygon|polyline|line|g|use)$/i.test(s.tagName)) {
              d.setAttribute("fill", cs.fill); if (cs.stroke !== "none") d.setAttribute("stroke", cs.stroke);
              if (cs.fillOpacity !== "1") d.setAttribute("fill-opacity", cs.fillOpacity);
              if (cs.opacity !== "1") d.setAttribute("opacity", cs.opacity);
            }
            ["class", "data-color", "data-type", "data-bbox", "id"].forEach((a) => d.removeAttribute(a));
          });
          clone.removeAttribute("width"); clone.removeAttribute("height");
          clone.setAttribute("preserveAspectRatio", svg.getAttribute("preserveAspectRatio") || "none");
          markup = clone.outerHTML;
        }
        return { ...n, kind: "svg", svg: markup, opacity: +getComputedStyle(el).opacity < 1 ? +getComputedStyle(el).opacity : undefined, href: el.querySelector("a")?.getAttribute("href") || undefined };
      }
      if (c.includes("wixui-image")) return { ...n, kind: "image", ...image(el) };
      if (c.includes("wixui-horizontal-line")) {
        const d = [el, ...el.querySelectorAll("*")].map(getComputedStyle).find((s) => px(s.borderTopWidth) > 0 || !transparent(s.backgroundColor));
        return { ...n, kind: "line", color: d ? (px(d.borderTopWidth) > 0 ? d.borderTopColor : d.backgroundColor) : "#fff", weight: d ? px(d.borderTopWidth) || Math.round(r.h) : 1 };
      }
      if (c.includes("wixui-audio-player")) return { ...n, kind: "audio" };
      if (c.includes("wixui-google-map")) return { ...n, kind: "map" };
      if (c.includes("wixui-anchor-menu")) {
        return { ...n, kind: "anchormenu", items: [...el.querySelectorAll("a")].map((a) => ({ label: a.textContent.trim(), anchor: a.getAttribute("data-anchor-comp-id") })) };
      }
      if (c.includes("wixui-form")) return { ...n, kind: "form", fields: [...el.querySelectorAll("input, textarea")].map((f) => ({ tag: f.tagName.toLowerCase(), name: f.name, placeholder: f.placeholder, required: f.required, ...rel(rect(f), r) })), submit: el.querySelector("button")?.textContent.trim() };
      if (el.getAttribute("role") === "region" && el.querySelector(":scope > div[id^=anchor]")) {
        // Wix anchor (target of the anchor menu): keep only its vertical position
        return { ...n, x: 0, w: 0, h: 0, kind: "anchor", name: el.getAttribute("aria-label") || "" };
      }

      // button: a component that is (or wraps) a single link/button with a text label and no child components
      const k = kids();
      const btn = el.matches("a, button") ? el : el.querySelector(":scope a, :scope button");
      if (!k.length && btn && btn.textContent.trim() && !c.includes("wixui-section")) {
        const label = btn.querySelector(".wixui-button__label") || btn.querySelector("span") || btn;
        const cs = getComputedStyle(label), bs = getComputedStyle(btn);
        const d = deco(el) || {};
        return { ...n, kind: "button", label: btn.textContent.trim(), href: btn.getAttribute("href") || null, blank: btn.target === "_blank" ? 1 : undefined, f: fam(cs.fontFamily), s: px(cs.fontSize), c: cs.color, ls: px(cs.letterSpacing) || undefined, b: +cs.fontWeight >= 600 ? 1 : undefined, bg: d.bg ?? (!transparent(bs.backgroundColor) ? bs.backgroundColor : undefined), border: d.border, radius: d.radius ?? (px(bs.borderTopLeftRadius) || undefined), align: getComputedStyle(btn).justifyContent, hoverBg: hov[el.id]?.bg, hoverColor: hov[el.id]?.color, duration: hov[el.id]?.duration };
      }

      const section = c.includes("wixui-section");
      const out = { ...n, kind: section ? "section" : "box" };
      let inner = r;
      if (section) {
        // Wix sections are full-width strips; keep them in column coordinates (x 0, 980 wide)
        out.x = 0; out.w = 980; inner = { ...r, x: 0 };
        const u = el.querySelector("[data-testid=colorUnderlay]"), bm = el.querySelector("[id^=bgMedia_] img");
        if (u && !transparent(getComputedStyle(u).backgroundColor)) out.bg = getComputedStyle(u).backgroundColor;
        if (bm) out.bgImage = decodeURIComponent((bm.getAttribute("src") || "").match(/\/media\/([^/]+)/)?.[1] ?? "");
      }
      const d = section ? null : deco(el);
      if (d) Object.assign(out, d);
      out.children = k.map((x) => node(x, inner)).filter(Boolean);
      if (!section && !out.children.length && !d && !k.length) {
        out.kind = "unknown";
        out.html = el.outerHTML.slice(0, 300);
      }
      return out;
    }

    const page = getComputedStyle(document.querySelector(".wixui-page") || colRoot);
    const top = [...colRoot.querySelectorAll("[id]")].filter((e) => isComp(e) && !parentComp(e));
    return {
      height: Math.round(col.height),
      shade: page.backgroundColor,
      nodes: top.map((e) => node(e, { x: 0, y: 0 })),
    };
  }, [anims, hov]);
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require("sharp");
async function addNaturalSizes(nodes) {
  for (const n of nodes) {
    if (n.kind === "image" && n.file) {
      const stem = n.file.replace(/~/g, "_").replace(/\.[^.]+$/, "");
      const f = mediaFiles.find((x) => x.startsWith(stem));
      if (f) { const m = await sharp(path.join(MEDIA, f)).metadata(); n.nat = { w: m.width, h: m.height }; }
    }
    if (n.children) await addNaturalSizes(n.children);
  }
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route("**/*", async (r) => {
    const u = r.request().url();
    if (u.startsWith("file:")) return r.continue();
    let m = u.match(/static\.wixstatic\.com\/media\/([^/]+)/);
    if (m) {
      const stem = decodeURIComponent(m[1]).replace(/~/g, "_").replace(/\.[^.]+$/, "");
      const f = mediaFiles.find((x) => x.startsWith(stem));
      if (f) return r.fulfill({ path: path.join(MEDIA, f) });
    }
    m = u.match(/ufonts\/([0-9a-f_]+)\/(woff2|woff|ttf)\//);
    if (m) return r.fulfill({ path: path.join(FONTS, `${m[1]}.${m[2]}`) });
    return r.abort();
  });
  for (const name of names) {
    const data = await extract(p, path.join(htmlDir, type, `${name}.html`));
    await addNaturalSizes(data.nodes);
    const out = path.join("archive", "pages", type, name, "layout.json");
    fs.writeFileSync(out, JSON.stringify(data, null, 1) + "\n");
    const count = (ns) => ns.reduce((a, n) => a + 1 + (n.children ? count(n.children) : 0), 0);
    const unknown = JSON.stringify(data).match(/"kind":"unknown"/g)?.length ?? 0;
    console.log(`${name}: ${count(data.nodes)} nodes, column ${data.height}px, shade ${data.shade}${unknown ? `, ${unknown} unknown` : ""}`);
  }
  await b.close();
})();
