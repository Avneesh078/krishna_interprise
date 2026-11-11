"use client";

import Image from "next/image";
import { useState } from "react";
import { imagePath } from "@/lib/catalog";
import { PlayIcon } from "./icons";
import { VideoTile } from "./video-tile";

export function ProductGallery({
  images,
  name,
  video,
}: {
  images: string[];
  name: string;
  video?: string;
}) {
  const [active, setActive] = useState(0);
  const showingVideo = Boolean(video) && active === images.length;
  const count = images.length + (video ? 1 : 0);

  return (
    <div className="min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-white">
        {showingVideo && video ? (
          <VideoTile key={video} file={video} title={`${name} video`} className="h-full" />
        ) : (
          <Image
            key={images[active]}
            src={imagePath(images[active])}
            alt={`${name}, photo ${active + 1} of ${images.length}`}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain p-2"
          />
        )}
      </div>
      {count > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={active === index}
                className={`relative block h-[4.5rem] w-[4.5rem] overflow-hidden rounded-lg border-2 bg-white ${
                  active === index ? "border-ink" : "border-line hover:border-muted"
                }`}
              >
                <Image src={imagePath(image)} alt="" fill sizes="72px" className="object-contain" />
              </button>
            </li>
          ))}
          {video && (
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(images.length)}
                aria-label="Play product video"
                aria-current={showingVideo}
                className={`relative grid h-[4.5rem] w-[4.5rem] place-items-center overflow-hidden rounded-lg border-2 bg-ink text-signal ${
                  showingVideo ? "border-signal" : "border-line"
                }`}
              >
                <PlayIcon size={22} />
                <span className="eyebrow !text-[0.55rem]">Video</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
