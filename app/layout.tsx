import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3006"),
  title: {
    default: `${site.fullName} | CCTV Cameras, Installation & IT Accessories`,
    template: `%s | ${site.fullName}`,
  },
  description:
    "CCTV cameras, power supplies, PoE switches and computer accessories in Rewa, with installation and service. Order online or on WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#071b3f",
};

/** Shared by the store and the admin panel; each adds its own chrome in its group layout. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
