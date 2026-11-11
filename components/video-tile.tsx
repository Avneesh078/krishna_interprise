"use client";

import { useRef, useState } from "react";
import { PlayIcon } from "./icons";

export function VideoTile({
  file,
  title,
  className = "",
}: {
  file: string;
  title: string;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <video
        ref={video}
        src={`/videos/${file}.mp4`}
        poster={`/videos/${file}.jpg`}
        preload="none"
        playsInline
        controls={playing}
        aria-label={title}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        className="h-full w-full object-contain"
      />
      {!playing && (
        <button
          type="button"
          onClick={() => video.current?.play()}
          aria-label={`Play video: ${title}`}
          className="absolute inset-0 grid place-items-center bg-ink/10 transition-colors hover:bg-ink/30"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-signal text-ink shadow-lg">
            <PlayIcon size={24} />
          </span>
        </button>
      )}
    </div>
  );
}
