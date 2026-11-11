"use server";

import { createOrder, ORDER_METHODS, orderNumber, type OrderMethod } from "@/lib/orders";
import { getOrderableProducts } from "@/lib/products";

export type PlaceOrderInput = {
  name: string;
  phone: string;
  method: string;
  address: string;
  note: string;
  lines: { slug: string; qty: number }[];
};

export type PlaceOrderResult =
  | { ok: true; orderNo: string }
  | {
      ok: false;
      error: string;
      /** True when the details were fine but the database was unavailable. */
      unsaved?: boolean;
    };

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** Called from the checkout page. Anyone can call it, so every field is checked here. */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const name = clean(input?.name, 100);
  const phone = clean(input?.phone, 20).replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  const method = input?.method as OrderMethod;
  const address = clean(input?.address, 500);
  const note = clean(input?.note, 500);
  const lines = Array.isArray(input?.lines) ? input.lines : [];

  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, error: "Please enter a valid mobile number." };
  if (!ORDER_METHODS.includes(method)) return { ok: false, error: "Please choose pickup or delivery." };
  if (method !== "pickup" && address.length < 5) {
    return { ok: false, error: "Please enter your full address." };
  }
  if (lines.length === 0 || lines.length > 50) return { ok: false, error: "Your cart is empty." };

  const merged = new Map<string, number>();
  for (const line of lines) {
    const qty = Number(line?.qty);
    if (typeof line?.slug !== "string" || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return { ok: false, error: "Your cart has an item we could not recognise. Please refresh." };
    }
    merged.set(line.slug, (merged.get(line.slug) ?? 0) + qty);
  }

  try {
    // Current prices and stock straight from the database.
    const products = await getOrderableProducts([...merged.keys()]);
    const items = [];
    for (const [slug, qty] of merged) {
      const product = products.get(slug);
      if (!product) {
        return { ok: false, error: "An item in your cart is no longer sold. Please refresh the page." };
      }
      if (!product.inStock) {
        return { ok: false, error: `${product.name} just went out of stock. Please remove it and try again.` };
      }
      items.push({ slug, name: product.name, unitPrice: product.price, qty });
    }

    const order = await createOrder({
      name,
      phone,
      method,
      address: method === "pickup" ? null : address,
      note: note || null,
      items,
    });
    return { ok: true, orderNo: orderNumber(order.id) };
  } catch (error) {
    console.error("placeOrder failed", error);
    return { ok: false, error: "We could not save the order right now.", unsaved: true };
  }
}
