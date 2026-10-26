import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pure static HTML in /out (Cloudflare Pages). Checkout runs in /functions (Pages Functions).
  output: "export",
  // Keep Wix-style URLs: /about-us, /product-page/<slug> (no trailing slash).
  trailingSlash: false,
  // Responsive widths are pre-generated at build time (scripts/image-variants.mjs WIDTHS).
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 828, 1080, 1600, 1920],
    imageSizes: [256, 400],
  },
};

export default nextConfig;
