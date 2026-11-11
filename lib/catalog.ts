// Shared product types and fixed lists. Safe to import from client components.
// Product data itself lives in MySQL: see lib/products.ts (server) and components/catalog-provider.tsx (client).

export const CATEGORY_IDS = ["cameras", "power", "network", "cables", "computer"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  /** Selling price in rupees. */
  price: number;
  /** Optional "was" price in rupees, shown struck through when higher than price. */
  mrp: number | null;
  summary: string;
  /** Image URLs in display order: "/catalog/x.jpg" (built in) or "/media/y.webp" (uploaded). */
  images: string[];
  highlights: string[];
  specs: [string, string][];
  /** File name in public/videos, without the extension. */
  video: string | null;
  cameraType: "Bullet" | "Dome" | null;
  connection: "IP" | "HD" | null;
  featured: boolean;
  inStock: boolean;
};

export const categories: {
  id: CategoryId;
  label: string;
  blurb: string;
  image: string;
}[] = [
  { id: "cameras", label: "CCTV Cameras", blurb: "Bullet and dome, HD and IP", image: "eyesera-5mp-bullet" },
  { id: "power", label: "Power Supplies", blurb: "SMPS for 4 and 8 cameras", image: "dynexa-smps4" },
  { id: "network", label: "PoE & Networking", blurb: "Switches and Wi-Fi adapters", image: "eyesera-poe4" },
  { id: "cables", label: "Cables & Fittings", blurb: "DC leads and junction boxes", image: "dc-extension" },
  { id: "computer", label: "Computer Accessories", blurb: "Mice, drives, toner and more", image: "zebronics-scoot-box" },
];

/** Accepts a full image URL, or a built-in image name from public/catalog. */
export function imagePath(image: string | undefined) {
  if (!image) return "/catalog/placeholder.jpg";
  return image.startsWith("/") ? image : `/catalog/${image}.jpg`;
}

export function categoryLabel(id: string) {
  return categories.find((category) => category.id === id)?.label ?? id;
}

export function relatedProducts(product: Product, all: Product[], count = 4) {
  return all
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .sort((a, b) => Number(b.brand === product.brand) - Number(a.brand === product.brand))
    .slice(0, count);
}

export function discountPercent(product: Pick<Product, "price" | "mrp">) {
  if (!product.mrp || product.mrp <= product.price) return 0;
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
}

export const productVideos = [
  { file: "dynexa-bullet", title: "Dynexa bullet camera", slug: "dynexa-cctv-bullet-hd-camera" },
  { file: "8ch-power-supply", title: "8 channel power supply", slug: "multy-byte-8-channel-power-supply" },
  { file: "zebronics-scoot", title: "Zebronics Scoot mouse", slug: "zebronics-scoot-wired-mouse" },
  { file: "usb-nano-adapter", title: "USB nano adapter", slug: "usb-nano-wifi-adapter" },
  { file: "hp-m10-mouse", title: "HP M10 mouse", slug: "hp-m10-wired-mouse" },
  { file: "dynexa-smps-4ch", title: "Dynexa SMPS 4CH", slug: "dynexa-cctv-smps-4ch" },
];
