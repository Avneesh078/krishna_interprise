"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { cart, useCart } from "@/lib/cart";
import { useCatalog } from "./catalog-provider";
import { mapsUrl, site, whatsappUrl } from "@/lib/site";
import {
  CartIcon,
  CloseIcon,
  MenuIcon,
  PhoneIcon,
  PinIcon,
  SearchIcon,
  WhatsAppIcon,
} from "./icons";
import { Logo } from "./logo";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=cameras", label: "Cameras" },
  { href: "/kit-builder", label: "Kit Builder" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

function activeLabel(
  pathname: string,
  category: string | null,
  bySlug: ReturnType<typeof useCatalog>["bySlug"],
) {
  if (pathname.startsWith("/products/")) {
    const product = bySlug.get(pathname.slice("/products/".length));
    return product?.category === "cameras" ? "Cameras" : "Shop";
  }
  if (pathname === "/shop") return category === "cameras" ? "Cameras" : "Shop";
  return nav.find((item) => item.href === pathname)?.label ?? null;
}

function NavItems({
  active,
  className,
  onNavigate,
}: {
  active: string | null;
  className: string;
  onNavigate?: () => void;
}) {
  return nav.map((item) => (
    <Link
      key={item.label}
      href={item.href}
      onClick={onNavigate}
      aria-current={item.label === active ? "page" : undefined}
      className={`${className} decoration-signal decoration-[3px] underline-offset-[6px] hover:underline ${
        item.label === active ? "underline" : ""
      }`}
    >
      {item.label}
    </Link>
  ));
}

function ActiveNavItems(props: { className: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const category = useSearchParams().get("category");
  const { bySlug } = useCatalog();
  return <NavItems active={activeLabel(pathname, category, bySlug)} {...props} />;
}

/** Reading the query string needs Suspense; the fallback keeps the links in the static shell. */
function MainNav(props: { className: string; onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavItems active={null} {...props} />}>
      <ActiveNavItems {...props} />
    </Suspense>
  );
}

export function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = menu.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  return (
    <>
      <div className="on-ink hidden bg-ink text-[0.8rem] text-white/85 md:block">
        <div className="wrap flex h-9 items-center justify-between">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-signal"
          >
            <PinIcon size={14} />
            {site.address.line1}, {site.city}
          </a>
          <div className="flex items-center gap-5">
            {site.phones.map((phone) => (
              <a
                key={phone.tel}
                href={`tel:${phone.tel}`}
                className="inline-flex items-center gap-1.5 hover:text-signal"
              >
                <PhoneIcon size={14} />
                {phone.label}
              </a>
            ))}
            <a
              href={whatsappUrl("Hello Krishna Enterprises, I have a question.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-signal"
            >
              <WhatsAppIcon size={14} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="wrap flex h-[4.5rem] items-center gap-4 lg:gap-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid h-11 w-11 place-items-center rounded-lg lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon size={24} />
          </button>

          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            <MainNav className="whitespace-nowrap text-[0.95rem] font-semibold" />
          </nav>

          <Form
            action="/shop"
            role="search"
            className="ml-auto hidden max-w-xs flex-1 items-center rounded-lg border-[1.5px] border-line bg-paper pl-3 focus-within:border-ink md:flex"
          >
            <SearchIcon size={18} className="shrink-0 text-muted" />
            <input
              name="q"
              type="search"
              placeholder="Search cameras, SMPS, cable"
              aria-label="Search products"
              className="h-11 w-full bg-transparent px-2 text-[0.95rem] outline-none placeholder:text-muted"
            />
          </Form>

          <Link
            href="/shop"
            aria-label="Search products"
            className="ml-auto grid h-11 w-11 place-items-center rounded-lg md:hidden"
          >
            <SearchIcon size={22} />
          </Link>

          <button
            type="button"
            onClick={() => cart.setOpen(true)}
            className="relative -mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-lg hover:bg-paper md:mr-0"
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <CartIcon size={24} />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1 font-mono text-[0.7rem] font-bold text-ink">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      <dialog
        ref={menu}
        className="drawer from-left [--drawer-from:-2rem]"
        onClose={() => setMenuOpen(false)}
        aria-label="Menu"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[4.5rem] items-center justify-between border-b border-line px-5">
            <Logo onNavigate={() => setMenuOpen(false)} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid h-11 w-11 place-items-center"
              aria-label="Close menu"
            >
              <CloseIcon size={24} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-3">
            <MainNav
              className="display flex min-h-14 items-center border-b border-line text-xl"
              onNavigate={() => setMenuOpen(false)}
            />
          </nav>
          <div className="space-y-2 border-t border-line p-5">
            <a
              href={whatsappUrl("Hello Krishna Enterprises, I have a question.")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-wa w-full"
            >
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
            <a href={`tel:${site.phones[1].tel}`} className="btn btn-ghost w-full">
              <PhoneIcon /> Call {site.phones[1].label}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
