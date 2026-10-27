"use client";

import { useState } from "react";
import { BLOG } from "@/content/blog";

/**
 * YouTube video in a post. Nothing loads from Google until the visitor presses play (privacy, speed):
 * then the youtube-nocookie.com player replaces the placeholder (CSP frame-src allows only that host).
 */
export default function YouTube({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  if (play) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={`${BLOG.video.title}: ${title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_40%,#3d4f27_0%,#10140a_75%)] px-4 text-center text-white"
    >
      <svg viewBox="0 0 68 48" aria-hidden="true" className="h-[48px] w-[68px] transition-transform group-hover:scale-110">
        <path fill="#f00" d="M66.5 7.7a8.6 8.6 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.6 8.6 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.6 8.6 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.6 8.6 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" />
        <path fill="#fff" d="M45 24 27 14v20z" />
      </svg>
      <span className="text-[16px] font-bold">{BLOG.video.play}</span>
      <span className="text-[13px] text-white/80">{BLOG.video.note}</span>
    </button>
  );
}
