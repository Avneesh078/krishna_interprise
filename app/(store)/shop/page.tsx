import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product-card";
import { ShopBrowser } from "@/components/shop-browser";
import { getCatalog } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop CCTV Cameras & Accessories",
  description:
    "Eyesera and Dynexa CCTV cameras, SMPS power supplies, PoE switches, cables and computer accessories from Krishna Enterprises, Rewa.",
};

export default async function ShopPage() {
  const products = await getCatalog();
  return (
    <div className="wrap py-9 lg:py-12">
      <h1 className="display text-4xl sm:text-5xl">Shop</h1>
      <p className="mb-7 mt-2 text-lg text-muted">
        Cameras, power, networking and accessories, all in one place.
      </p>
      {/* Filters read the URL, so the static shell shows the whole catalog until they load. */}
      <Suspense fallback={<ProductGrid products={products} />}>
        <ShopBrowser products={products} />
      </Suspense>
    </div>
  );
}
