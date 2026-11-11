"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { placeOrder } from "@/app/actions/orders";
import { cart, useCart } from "@/lib/cart";
import { imagePath } from "@/lib/catalog";
import { formatPrice, site, whatsappUrl } from "@/lib/site";
import { CheckIcon, WhatsAppIcon } from "./icons";

const methods = [
  { id: "pickup", title: "Pick up from shop", text: site.address.line1 },
  { id: "delivery", title: "Delivery", text: "We confirm availability for your area" },
  { id: "install", title: "Delivery and installation", text: "We quote fitting before starting" },
];

/** A fresh visit to checkout starts a new order instead of showing the last "sent" screen. */
export function CheckoutForm() {
  const { bfcacheId } = useRouter();
  return <CheckoutFormFields key={bfcacheId} />;
}

function CheckoutFormFields() {
  const { items, subtotal } = useCart();
  const [method, setMethod] = useState(methods[0].id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const needsAddress = method !== "pickup";
  const digits = phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  const phoneInvalid = phone.length > 0 && !/^[6-9]\d{9}$/.test(digits);

  const buildMessage = (savedOrderNo: string | null) =>
    [
      savedOrderNo
        ? `*New order ${savedOrderNo}, Krishna Enterprises website*`
        : "*New order, Krishna Enterprises website*",
      "",
      ...items.map(
        (line) => `• ${line.qty} × ${line.product.name}: ${formatPrice(line.total)}`,
      ),
      "",
      `*Subtotal: ${formatPrice(subtotal)}*`,
      "",
      `Name: ${name}`,
      `Phone: ${digits}`,
      `Method: ${methods.find((item) => item.id === method)?.title}`,
      needsAddress && `Address: ${address}`,
      note && `Note: ${note}`,
    ]
      .filter((line) => line !== false)
      .join("\n");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (phoneInvalid || saving) return;
    setError(null);
    setSaving(true);

    // Browsers only allow a new tab during the click itself, so open it now and point it at
    // WhatsApp once the order is saved.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;

    const result = await placeOrder({
      name,
      phone,
      method,
      address,
      note,
      lines: items.map((line) => ({ slug: line.product.slug, qty: line.qty })),
    }).catch(() => ({ ok: false as const, error: "Network problem.", unsaved: true }));
    setSaving(false);

    if (!result.ok && !result.unsaved) {
      tab?.close();
      setError(result.error);
      return;
    }

    // If the database is down the order still reaches the shop on WhatsApp, just without a number.
    const savedOrderNo = result.ok ? result.orderNo : null;
    const url = whatsappUrl(buildMessage(savedOrderNo));
    if (tab) tab.location.href = url;
    if (savedOrderNo) cart.clear();
    setOrderNo(savedOrderNo);
    setSentUrl(url);
  };

  if (sentUrl) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-wa text-white">
          <CheckIcon size={28} />
        </span>
        {orderNo && (
          <p className="eyebrow mt-4 text-muted">
            Order number <span className="font-semibold text-ink">{orderNo}</span>
          </p>
        )}
        <h2 className="display mt-2 text-2xl">Press send in WhatsApp</h2>
        <p className="mt-2 text-muted">
          Your order is written out in WhatsApp. Press send there and we reply with stock,
          final price and delivery details.
        </p>
        <a href={sentUrl} target="_blank" rel="noreferrer" className="btn btn-wa mt-5 w-full">
          <WhatsAppIcon /> Open WhatsApp
        </a>
        <Link
          href="/shop"
          onClick={() => cart.clear()}
          className="btn btn-ghost mt-2.5 w-full"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Link href="/shop" className="btn btn-ink mt-4">
          Go to the shop
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
      <div className="space-y-6">
        <fieldset className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <legend className="eyebrow px-1 text-muted">Your details</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block font-semibold">Full name</span>
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="field"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-semibold">Mobile number</span>
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-invalid={phoneInvalid}
                aria-describedby={phoneInvalid ? "phone-error" : undefined}
                className="field"
              />
              {phoneInvalid && (
                <span id="phone-error" className="mt-1 block text-sm font-medium text-rec">
                  Enter a 10-digit mobile number
                </span>
              )}
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <legend className="eyebrow px-1 text-muted">How should we get it to you?</legend>
          <div className="space-y-2.5">
            {methods.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3.5 ${
                  method === item.id ? "border-ink bg-paper" : "border-line"
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  checked={method === item.id}
                  onChange={() => setMethod(item.id)}
                  className="h-5 w-5 accent-ink"
                />
                <span>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="block text-sm text-muted">{item.text}</span>
                </span>
              </label>
            ))}
          </div>
          {needsAddress && (
            <label className="mt-4 block">
              <span className="mb-1.5 block font-semibold">Full address</span>
              <textarea
                required
                rows={3}
                autoComplete="street-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="field"
              />
            </label>
          )}
          <label className="mt-4 block">
            <span className="mb-1.5 block font-semibold">
              Note <span className="font-normal text-muted">(optional)</span>
            </span>
            <input value={note} onChange={(event) => setNote(event.target.value)} className="field" />
          </label>
        </fieldset>
      </div>

      <aside className="rounded-xl border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 className="display text-xl">Order summary</h2>
        <ul className="mt-3 divide-y divide-line">
          {items.map(({ product, qty, total }) => (
            <li key={product.slug} className="flex items-center gap-3 py-2.5">
              <span className="relative h-12 w-12 shrink-0 rounded border border-line bg-white">
                <Image
                  src={imagePath(product.images[0])}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </span>
              <span className="min-w-0 flex-1 text-sm leading-snug">
                <span className="line-clamp-2 font-semibold">{product.name}</span>
                <span className="font-mono text-xs text-muted">Qty {qty}</span>
              </span>
              <span className="font-mono text-sm">{formatPrice(total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink pt-3">
          <span className="font-bold">Subtotal</span>
          <span className="font-mono text-2xl font-semibold">{formatPrice(subtotal)}</span>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rec/10 px-3 py-2 text-sm font-medium text-rec">
            {error}
          </p>
        )}
        <button type="submit" disabled={saving} className="btn btn-wa mt-4 w-full">
          <WhatsAppIcon /> {saving ? "Placing order…" : "Send order on WhatsApp"}
        </button>
        <p className="mt-3 text-sm leading-snug text-muted">
          No payment now. We confirm stock, final price and delivery on WhatsApp first.
        </p>
      </aside>
    </form>
  );
}
