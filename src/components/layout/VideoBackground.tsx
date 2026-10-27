"use client";

import { useEffect, useRef } from "react";

/**
 * Wix video page background (/people): fixed, "fill", centred, muted loop, over the site's photo layer.
 * With prefers-reduced-motion the video stays on its poster frame.
 */
export default function VideoBackground({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    void v.play().catch(() => {});
  }, []);
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10">
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="auto" className="h-full w-full object-cover" />
    </div>
  );
}
