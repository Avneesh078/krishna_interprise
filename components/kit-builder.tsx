"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cart, detailLines } from "@/lib/cart";
import { imagePath } from "@/lib/catalog";
import { buildKit, type KitQuality } from "@/lib/kit";
import { formatPrice, whatsappUrl } from "@/lib/site";
import { useCatalog } from "./catalog-provider";
import { QtyStepper } from "./cart-drawer";
import { CartIcon, CheckIcon, WhatsAppIcon } from "./icons";

const MAX_CAMERAS = 16;

const qualities: { id: KitQuality; title: string; text: string }[] = [
  {
    id: "HD",
    title: "HD kit",
    text: "Budget-friendly. Runs on a 12V power supply with separate power wiring.",
  },
  {
    id: "IP",
    title: "IP 5MP kit",
    text: "Sharper picture. One network cable per camera through a PoE switch.",
  },
];

export function KitBuilder() {
  const [outdoor, setOutdoor] = useState(2);
  const [indoor, setIndoor] = useState(2);
  const [quality, setQuality] = useState<KitQuality>("HD");

  const total = outdoor + indoor;
  const lines = useMemo(() => buildKit(outdoor, indoor, quality), [outdoor, indoor, quality]);
  const { bySlug } = useCatalog();
  // Parts that are hidden or out of stock drop out; the note below says so.
  const items = useMemo(() => detailLines(lines, bySlug), [lines, bySlug]);
  const missingParts = lines.length - items.length;
  const subtotal = items.reduce((sum, line) => sum + line.total, 0);

  const clamp = (next: number, other: number) =>
    Math.min(Math.max(0, next), MAX_CAMERAS - other);

  const message = [
    "Hello Krishna Enterprises, I used the Kit Builder.",
    `Cameras: ${outdoor} outdoor, ${indoor} indoor (${quality}).`,
    ...items.map((line) => `• ${line.qty} × ${line.product.name}`),
    `Parts estimate: ${formatPrice(subtotal)}`,
    "Please quote the recorder, hard disk, wiring and installation too.",
  ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-8">
      <div className="space-y-5">
        <fieldset className="rounded-xl border border-line bg-white p-5">
          <legend className="eyebrow px-1 text-muted">Step 1: How many cameras?</legend>
          <div className="flex items-center justify-between gap-4 border-b border-line py-3">
            <div>
              <p className="font-bold">Outdoor</p>
              <p className="text-sm text-muted">Gate, parking, outer walls</p>
            </div>
            <QtyStepper
              value={outdoor}
              label="outdoor cameras"
              onChange={(next) => setOutdoor(clamp(next, indoor))}
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-3">
            <div>
              <p className="font-bold">Indoor</p>
              <p className="text-sm text-muted">Rooms, counter, corridor</p>
            </div>
            <QtyStepper
              value={indoor}
              label="indoor cameras"
              onChange={(next) => setIndoor(clamp(next, outdoor))}
            />
          </div>
          {total >= MAX_CAMERAS && (
            <p className="mt-3 text-sm text-muted">
              For more than {MAX_CAMERAS} cameras, message us for a site plan.
            </p>
          )}
        </fieldset>

        <fieldset className="rounded-xl border border-line bg-white p-5">
          <legend className="eyebrow px-1 text-muted">Step 2: Choose the system</legend>
          <div className="mt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {qualities.map((option) => (
              <label
                key={option.id}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink-3 ${
                  quality === option.id ? "border-ink bg-paper" : "border-line hover:border-muted"
                }`}
              >
                <input
                  type="radio"
                  name="quality"
                  value={option.id}
                  checked={quality === option.id}
                  onChange={() => setQuality(option.id)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between font-bold">
                  {option.title}
                  {quality === option.id && <CheckIcon size={20} className="text-wa" />}
                </span>
                <span className="mt-1 block text-sm leading-snug text-muted">{option.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <section
        aria-label="Your kit"
        className="finder h-fit rounded-xl bg-white p-5 shadow-sm ring-1 ring-line [--finder:var(--color-ink)] sm:p-6"
      >
        <div className="flex items-baseline justify-between gap-3 px-2">
          <h2 className="display text-2xl">Your kit</h2>
          <p className="font-mono text-sm text-muted">
            {total} {total === 1 ? "camera" : "cameras"}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="px-2 py-12 text-center text-muted">Add at least one camera to see your kit.</p>
        ) : (
          <>
            <ul className="mt-3 divide-y divide-line px-2">
              {items.map(({ product, qty, total: lineTotal }) => (
                <li key={product.slug} className="flex items-center gap-3 py-3">
                  <span className="relative h-14 w-14 shrink-0 rounded-lg border border-line bg-white">
                    <Image
                      src={imagePath(product.images[0])}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 text-sm font-semibold leading-snug hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="font-mono text-xs text-muted">Qty {qty}</span>
                  </span>
                  <span className="font-mono text-sm font-medium">{formatPrice(lineTotal)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink px-2 pt-3">
              <span className="font-bold">Parts estimate</span>
              <span className="font-mono text-2xl font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-2 px-2 text-sm leading-snug text-muted">
              Not included: DVR or NVR, hard disk, wiring and installation. We quote these
              after hearing about your site.
            </p>
            {missingParts > 0 && (
              <p className="mt-2 px-2 text-sm font-medium leading-snug text-rec">
                {missingParts} matching {missingParts === 1 ? "part is" : "parts are"} out of stock
                right now. Ask us for an alternative in your quote.
              </p>
            )}

            <div className="mt-4 grid gap-2.5 px-2 pb-2 sm:grid-cols-2">
              <button type="button" onClick={() => cart.addMany(items.map((line) => ({ slug: line.product.slug, qty: line.qty })))} className="btn btn-signal">
                <CartIcon size={19} /> Add kit to cart
              </button>
              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-wa"
              >
                <WhatsAppIcon /> Get full quote
              </a>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
