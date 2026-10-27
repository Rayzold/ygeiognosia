"use client";

import { useEffect, useRef, useState } from "react";

const SRC =
  "https://maps.google.com/maps?q=%CE%92%CF%85%CE%B6%CE%B1%CE%BD%CF%84%CE%AF%CE%BF%CF%85%2023%2C%20%CE%9D%CE%AD%CE%B1%20%CE%A3%CE%BC%CF%8D%CF%81%CE%BD%CE%B7%2017121&z=16&hl=el&output=embed";

/**
 * The Wix Google map on /contact (Βυζαντίου 23). The iframe (about 1 MB of Google scripts) is created only
 * when the map scrolls into view: native loading="lazy" starts far ahead of the viewport and slowed the
 * first paint of the page on phones. Until then the box shows the address as a link to Google Maps.
 */
export default function MapFrame() {
  const box = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setShow(true);
      io.disconnect();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="h-full w-full bg-[#e5e3df]">
      {show ? (
        <iframe
          title="Χάρτης: Βυζαντίου 23, Νέα Σμύρνη"
          src={SRC}
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-3"
        />
      ) : (
        <a href={SRC.replace("&output=embed", "")} target="_blank" rel="noopener" className="flex h-full w-full items-center justify-center p-4 text-center text-[15px] text-black underline underline-offset-4">
          Βυζαντίου 23, Νέα Σμύρνη 17121 (Google Maps)
        </a>
      )}
    </div>
  );
}
