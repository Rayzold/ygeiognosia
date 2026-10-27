"use client";

import { usePathname } from "next/navigation";

/** Renders its children except on the given paths (e.g. the footer's blog band on the home page, which has its own). */
export default function HideOnPaths({ paths, children }: { paths: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  return paths.includes(pathname) ? null : <>{children}</>;
}
