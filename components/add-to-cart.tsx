"use client";

import { cart } from "@/lib/cart";
import { CartIcon, PlusIcon } from "./icons";

export function AddToCartButton({
  slug,
  name,
  qty = 1,
  compact = false,
  className = "",
}: {
  slug: string;
  name: string;
  qty?: number;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => cart.add(slug, 1)}
        aria-label={`Add ${name} to cart`}
        className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-white transition-colors hover:bg-signal hover:text-ink"
      >
        <PlusIcon size={18} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => cart.add(slug, qty)}
      className={`btn btn-signal ${className}`}
    >
      <CartIcon size={19} /> Add to cart
    </button>
  );
}
