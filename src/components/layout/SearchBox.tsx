import { HEADER } from "@/content/site";
import { SearchIcon } from "./Icons";

/** Wix SearchBox: dark translucent field with white border, green search button. Submits to /search?q=. */
export default function SearchBox({ className = "" }: { className?: string }) {
  return (
    <form role="search" action="/search" method="get" className={`flex overflow-hidden rounded-[6px] border border-white bg-black/[0.56] ${className}`}>
      <input
        type="search"
        name="q"
        maxLength={100}
        autoComplete="off"
        placeholder={HEADER.searchPlaceholder}
        aria-label={HEADER.searchPlaceholder}
        className="min-w-0 flex-1 bg-transparent px-3 text-[16px] text-white placeholder:text-white focus:outline-none"
      />
      <button type="submit" aria-label="Αναζήτηση" className="flex w-10 shrink-0 items-center justify-center bg-green-3 text-white hover:bg-green-3 focus-visible:bg-green-4">
        <SearchIcon className="h-[18px] w-[18px]" />
      </button>
    </form>
  );
}
