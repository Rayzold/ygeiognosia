import type { Metadata } from "next";
import { Suspense } from "react";
import PageColumn from "@/components/layout/PageColumn";
import SearchResults from "@/components/search/SearchResults";

// Wix had a search results page behind the header search box; this is its static replacement:
// the browser searches a prebuilt index (/search-index.json) of products, articles and pages.
export const metadata: Metadata = { title: "Αναζήτηση", robots: { index: false } };

export default function SearchPage() {
  return (
    <PageColumn shade={0.77}>
      <div className="min-h-[500px] px-4 py-8 desk:px-[45px]">
        <h1 className="font-script text-[30px] text-[#ffc824]">Αναζήτηση</h1>
        <div className="mt-4">
          <Suspense>
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </PageColumn>
  );
}
