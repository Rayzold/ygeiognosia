"use client";

import { useRef, useState } from "react";

/**
 * Wix music player in its "play button only" layout (/people): a yellow round button that plays/pauses
 * one track. The track is only downloaded when the visitor presses play.
 */
export default function AudioPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };
  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Παύση μουσικής" : "Αναπαραγωγή μουσικής"}
        aria-pressed={playing}
        className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#ffc824] text-[#ffeebc] transition-opacity hover:opacity-90"
      >
        {playing ? (
          <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true" fill="currentColor">
            <rect x="2" y="1" width="5" height="18" rx="1" />
            <rect x="11" y="1" width="5" height="18" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true" fill="currentColor" className="translate-x-[2px]">
            <path d="M17.29,9.02 C18.25,9.56 18.25,10.44 17.29,10.98 L1.74,19.78 C0.78,20.33 0,19.87 0,18.76 L0,1.24 C0,0.13 0.78,-0.32 1.74,0.22 L17.29,9.02 Z" />
          </svg>
        )}
      </button>
      <audio ref={ref} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </>
  );
}
