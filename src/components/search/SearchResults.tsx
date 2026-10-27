"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { SearchItem } from "@/app/search-index.json/route";

/** Greek-aware matching: lower case, no accents, final sigma = sigma. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ς/g, "σ");

const LABEL: Record<SearchItem["type"], string> = { product: "Προϊόντα", post: "Άρθρα", page: "Σελίδες" };

export default function SearchResults() {
  const q = useSearchParams().get("q")?.trim() ?? "";
  const [items, setItems] = useState<SearchItem[] | null>(null);

  useEffect(() => {
    if (!q || items) return;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [q, items]);

  const words = norm(q).split(/\s+/).filter(Boolean);
  const hits = (items ?? [])
    .map((it) => {
      const title = norm(it.title);
      const all = `${title} ${norm(it.text)}`;
      if (!words.every((w) => all.includes(w))) return null;
      return { it, score: words.filter((w) => title.includes(w)).length };
    })
    .filter((x): x is { it: SearchItem; score: number } => !!x)
    .sort((a, b) => b.score - a.score);

  return (
    <div>
      <form action="/search" role="search" className="flex max-w-[600px]">
        <label htmlFor="search-q" className="sr-only">
          Αναζήτηση
        </label>
        <input id="search-q" name="q" defaultValue={q} type="search" placeholder="Τι ψάχνετε...;" className="h-[46px] flex-1 border border-white bg-black/50 px-4 text-[16px] text-white placeholder:text-white/70" />
        <button type="submit" className="h-[46px] bg-green-3 px-5 text-[16px] text-white hover:bg-green-2 hover:text-green-5">
          Αναζήτηση
        </button>
      </form>

      {q && (
        <p className="mt-6 text-[15px] text-white/90" aria-live="polite">
          {items === null ? "Αναζήτηση…" : hits.length ? `${hits.length} αποτελέσματα για «${q}»` : `Δεν βρέθηκαν αποτελέσματα για «${q}».`}
        </p>
      )}

      {(["product", "post", "page"] as const).map((type) => {
        const group = hits.filter((h) => h.it.type === type);
        if (!group.length) return null;
        return (
          <section key={type} className="mt-8">
            <h2 className="font-script text-[24px] text-[#ffc824]">{LABEL[type]}</h2>
            <ul className="mt-3 divide-y divide-white/20">
              {group.map(({ it }) => (
                <li key={it.path}>
                  <Link href={it.path} className="flex gap-4 py-3 hover:bg-white/5">
                    {it.image && (
                      <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-white">
                        <Image src={it.image} alt="" fill sizes="72px" className="object-cover" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block text-[16px] font-bold text-white">{it.title}</span>
                      {it.price && <span className="block text-[15px] text-[#bada55]">{it.price}</span>}
                      <span className="mt-1 line-clamp-2 text-[14px] text-white/80">{it.text}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
