"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cart, useCart } from "@/lib/cart";
import { imagePath } from "@/lib/catalog";
import { formatPrice } from "@/lib/site";
import { CartIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./icons";

export function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border-[1.5px] border-line bg-white">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="grid h-10 w-10 place-items-center"
        aria-label={`Decrease quantity of ${label}`}
      >
        <MinusIcon size={16} />
      </button>
      <span className="w-8 text-center font-mono text-sm font-medium" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid h-10 w-10 place-items-center"
        aria-label={`Increase quantity of ${label}`}
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}

export function CartDrawer() {
  const { items, open, subtotal, count } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="drawer"
      aria-label="Shopping cart"
      onClose={() => cart.setOpen(false)}
      onClick={(event) => {
        if (event.target === dialog.current) cart.setOpen(false);
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="display text-xl">
            Your cart{" "}
            {count > 0 && <span className="font-mono text-base text-muted">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={() => cart.setOpen(false)}
            className="-mr-2 grid h-11 w-11 place-items-center"
            aria-label="Close cart"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-paper text-muted">
              <CartIcon size={28} />
            </span>
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="max-w-[18rem] text-muted">
              Not sure what you need? The Kit Builder works it out from your camera count.
            </p>
            <Link
              href="/kit-builder"
              onClick={() => cart.setOpen(false)}
              className="btn btn-ink"
            >
              Build a CCTV kit
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map(({ product, qty, total }) => (
                <li key={product.slug} className="flex gap-3 py-4">
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => cart.setOpen(false)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-white"
                  >
                    <Image
                      src={imagePath(product.images[0])}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => cart.setOpen(false)}
                      className="line-clamp-2 text-sm font-semibold leading-snug"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-sm">{formatPrice(total)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper
                        value={qty}
                        label={product.name}
                        onChange={(next) => cart.setQty(product.slug, next)}
                      />
                      <button
                        type="button"
                        onClick={() => cart.setQty(product.slug, 0)}
                        className="grid h-10 w-10 place-items-center text-muted hover:text-rec"
                        aria-label={`Remove ${product.name}`}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="shrink-0 space-y-3 border-t border-line p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="font-mono text-xl font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-sm text-muted">
                We confirm stock, final price and delivery on WhatsApp before you pay.
              </p>
              <Link
                href="/checkout"
                onClick={() => cart.setOpen(false)}
                className="btn btn-signal w-full"
              >
                Continue to checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
