"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatPrice, whatsappUrl } from "@/lib/site";
import { AddToCartButton } from "./add-to-cart";
import { QtyStepper } from "./cart-drawer";
import { WhatsAppIcon } from "./icons";

export function BuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const message = product.inStock
    ? `Hello Krishna Enterprises, I want ${qty} × ${product.name}. Please confirm price and availability.`
    : `Hello Krishna Enterprises, please tell me when ${product.name} is back in stock.`;

  return (
    <>
      {product.inStock && (
        <div className="flex flex-wrap items-center gap-3">
          <QtyStepper
            value={qty}
            label={product.name}
            onChange={(next) => setQty(Math.max(1, next))}
          />
          <AddToCartButton
            slug={product.slug}
            name={product.name}
            qty={qty}
            className="min-w-44 flex-1"
          />
        </div>
      )}
      <a
        href={whatsappUrl(message)}
        target="_blank"
        rel="noreferrer"
        className={`btn btn-wa w-full ${product.inStock ? "mt-3" : ""}`}
      >
        <WhatsAppIcon /> {product.inStock ? "Buy on WhatsApp" : "Ask when it is back"}
      </a>

      {/* Keeps the price and action in reach on phones once the main button scrolls away. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-white px-4 py-2.5 lg:hidden">
        <span className="font-mono text-lg font-semibold">{formatPrice(product.price)}</span>
        {product.inStock ? (
          <AddToCartButton slug={product.slug} name={product.name} qty={qty} className="flex-1" />
        ) : (
          <span className="font-semibold text-rec">Out of stock</span>
        )}
      </div>
    </>
  );
}
