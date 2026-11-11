"use client";

import { useSyncExternalStore } from "react";
import { useCatalog } from "@/components/catalog-provider";
import type { Product } from "./catalog";

const STORAGE_KEY = "krishna-cart-v1";

export type CartLine = { slug: string; qty: number };
type CartState = { lines: CartLine[]; open: boolean };

const EMPTY: CartState = { lines: [], open: false };
let state: CartState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function readSaved(): CartLine[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CartLine[];
    return saved.filter((line) => typeof line?.slug === "string" && line.qty > 0);
  } catch {
    return [];
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = { ...state, lines: readSaved() };
}

function commit(next: CartState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.lines));
  } catch {
    // Storage can be blocked in private mode; the cart still works this session.
  }
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      state = { ...state, lines: readSaved() };
      notify();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  hydrate();
  return state;
}

export const cart = {
  add(slug: string, qty = 1, open = true) {
    hydrate();
    const exists = state.lines.some((line) => line.slug === slug);
    const lines = exists
      ? state.lines.map((line) =>
          line.slug === slug ? { ...line, qty: line.qty + qty } : line,
        )
      : [...state.lines, { slug, qty }];
    commit({ lines, open: open || state.open });
  },
  addMany(items: CartLine[]) {
    items.forEach((item) => cart.add(item.slug, item.qty, false));
    cart.setOpen(true);
  },
  setQty(slug: string, qty: number) {
    const lines =
      qty <= 0
        ? state.lines.filter((line) => line.slug !== slug)
        : state.lines.map((line) => (line.slug === slug ? { ...line, qty } : line));
    commit({ ...state, lines });
  },
  clear() {
    commit({ ...state, lines: [] });
  },
  setOpen(open: boolean) {
    commit({ ...state, open });
  },
};

export type DetailedLine = { product: Product; qty: number; total: number };

/** Lines whose product was removed, hidden or sold out are left out. */
export function detailLines(lines: CartLine[], bySlug: Map<string, Product>): DetailedLine[] {
  return lines.flatMap((line) => {
    const product = bySlug.get(line.slug);
    return product && product.inStock
      ? [{ product, qty: line.qty, total: product.price * line.qty }]
      : [];
  });
}

export function useCart() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const { bySlug } = useCatalog();
  const items = detailLines(snapshot.lines, bySlug);
  return {
    ...snapshot,
    items,
    count: items.reduce((sum, line) => sum + line.qty, 0),
    subtotal: items.reduce((sum, line) => sum + line.total, 0),
  };
}
