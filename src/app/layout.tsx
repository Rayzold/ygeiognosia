import type { Metadata, Viewport } from "next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SiteBackground from "@/components/layout/SiteBackground";
import { GOOGLE_SITE_VERIFICATION, MEDIA, SITE_NAME, SITE_URL } from "@/content/site";
import { media } from "@/lib/media";
import { DATES_VISIBLE_DAYS, LATEST_POST } from "@/lib/blog";
import { BLOG } from "@/content/blog";
import { jsonLd, localBusinessJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: "%s | Υγειογνωσία" },
  applicationName: SITE_NAME,
  verification: { google: GOOGLE_SITE_VERIFICATION },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#354421" };

/** Blog dates are shown only while the newest post is recent (see DATES_VISIBLE_DAYS): checked at view time. */
const blogFreshScript = `try{if(Date.now()-${Date.parse(LATEST_POST.datePublished)}<${DATES_VISIBLE_DAYS}*864e5)document.documentElement.setAttribute("data-blog-fresh","")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script may add data-blog-fresh to <html> before React hydrates
    <html lang="el" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: blogFreshScript }} />
        <link rel="alternate" type="application/rss+xml" title={BLOG.rssTitle} href="/blog-feed.xml" />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-green-5 focus:px-4 focus:py-2">
          Μετάβαση στο περιεχόμενο
        </a>
        <SiteBackground />
        <Header />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(localBusinessJsonLd(media(MEDIA.logo).src)) }} />
      </body>
    </html>
  );
}
