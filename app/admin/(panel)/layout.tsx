import type { Metadata } from "next";
import Link from "next/link";
import { KMark } from "@/components/logo";
import { logout } from "../actions";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Krishna Admin" },
  robots: { index: false, follow: false },
};

/** Sign-in is enforced by proxy.ts and checked again in every admin page and action. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper lg:flex-row">
      <aside className="on-ink bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-signal">
              <KMark className="w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-extrabold [font-stretch:112%]">Krishna</span>
              <span className="eyebrow block !text-[0.6rem] text-signal">Shop admin</span>
            </span>
          </Link>
          <form action={logout} className="lg:hidden">
            <button type="submit" className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10">
              Sign out
            </button>
          </form>
        </div>
        <div className="px-3 pb-3 lg:flex-1 lg:pb-0">
          <AdminNav />
        </div>
        <div className="hidden space-y-1 border-t border-white/10 p-3 lg:block">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg px-3 py-2.5 text-[0.95rem] font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            View store ↗
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2.5 text-left text-[0.95rem] font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
