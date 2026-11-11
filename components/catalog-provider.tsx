"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";

type Catalog = { products: Product[]; bySlug: Map<string, Product> };

const CatalogContext = createContext<Catalog>({ products: [], bySlug: new Map() });

/** Gives client components (cart, kit builder, header) the store's product list from MySQL. */
export function CatalogProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const value = useMemo(
    () => ({ products, bySlug: new Map(products.map((product) => [product.slug, product])) }),
    [products],
  );
  return <CatalogContext value={value}>{children}</CatalogContext>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
