"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const feeds = [
  { cam: "CAM 01 · Bullet camera", place: "Bullet camera", image: "dynexa-bullet-desk-b", className: "col-span-2 aspect-[16/9]" },
  { cam: "CAM 02", place: "Night view", image: "dome-night-vision", className: "aspect-[4/3]" },
  { cam: "CAM 03", place: "Wide angle", image: "dome-wide-angle", className: "aspect-[4/3]" },
];

function useClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setTime(format.format(new Date()).replace(",", ""));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

export function MonitorWall() {
  const time = useClock();

  return (
    <div className="rounded-2xl border border-white/15 bg-black/30 p-2.5 shadow-2xl shadow-black/40">
      <div className="mb-2.5 flex items-center justify-between px-1.5 font-mono text-[0.7rem] text-white/70">
        <span className="flex items-center gap-2">
          <span className="rec-dot" /> REC
        </span>
        <span className="min-h-[1.1em] tabular-nums" aria-hidden="true">
          {time}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {feeds.map((feed, index) => (
          <figure
            key={feed.cam}
            className={`${index === 0 ? "finder " : ""}scan relative overflow-hidden rounded-lg bg-ink-2 ${feed.className}`}
          >
            <Image
              src={`/catalog/${feed.image}.jpg`}
              alt={`${feed.place} example`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover object-bottom"
            />
            <figcaption
              className={`absolute z-[3] rounded bg-ink/80 px-1.5 py-0.5 font-mono text-[0.68rem] text-white ${index === 0 ? "bottom-2 left-2.5" : "right-2 top-2"}`}
            >
              {feed.cam}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
