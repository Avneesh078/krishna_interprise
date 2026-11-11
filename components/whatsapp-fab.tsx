"use client";

import { usePathname } from "next/navigation";
import { whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

/** Product pages have their own sticky buy bar, and checkout already ends in WhatsApp. */
export function WhatsAppFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/products/") || pathname === "/checkout" || pathname.startsWith("/admin")) return null;

  return (
    <a
      href={whatsappUrl("Hello Krishna Enterprises, I need help with CCTV.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-lg shadow-ink/25 transition-transform hover:scale-105"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
