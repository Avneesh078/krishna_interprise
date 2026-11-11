import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/products";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3006";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/shop", "/kit-builder", "/services", "/contact"];
  const products = await getCatalog();
  return [
    ...pages.map((path) => ({ url: `${base}${path}` })),
    ...products.map((product) => ({ url: `${base}/products/${product.slug}` })),
  ];
}
