import Link from "next/link";
import { site } from "@/lib/site";

export function KMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block aspect-[526/472] bg-current ${className}`}
      style={{
        WebkitMaskImage: "url(/brand/k-mark.png)",
        maskImage: "url(/brand/k-mark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    />
  );
}

export function Logo({
  tone = "ink",
  onNavigate,
}: {
  tone?: "ink" | "light";
  onNavigate?: () => void;
}) {
  const light = tone === "light";
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex shrink-0 items-center gap-2.5"
      aria-label={`${site.fullName} home`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-signal">
        <KMark className="w-6" />
      </span>
      <span className="leading-none">
        <span
          className={`block text-[1.05rem] font-extrabold tracking-tight [font-stretch:112%] ${light ? "text-white" : "text-ink"}`}
        >
          {site.name}
        </span>
        <span
          className={`eyebrow mt-1 block !text-[0.62rem] ${light ? "text-signal" : "text-muted"}`}
        >
          CCTV · IT · {site.city}
        </span>
      </span>
    </Link>
  );
}
