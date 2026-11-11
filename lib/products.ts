import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { CATEGORY_IDS, type CategoryId, type Product } from "./catalog";
import { getPool } from "./db";

export const PRODUCTS_TAG = "products";

export type AdminProduct = Product & { listed: boolean; sortOrder: number; updatedAt: Date };

export type ProductInput = {
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  price: number;
  mrp: number | null;
  summary: string;
  images: string[];
  highlights: string[];
  specs: [string, string][];
  cameraType: Product["cameraType"];
  connection: Product["connection"];
  featured: boolean;
  inStock: boolean;
  listed: boolean;
  sortOrder: number;
};

type ProductRow = RowDataPacket & {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number | null;
  summary: string;
  images: unknown;
  highlights: unknown;
  specs: unknown;
  video: string | null;
  camera_type: Product["cameraType"];
  connection_type: Product["connection"];
  featured: number;
  in_stock: number;
  listed: number;
  sort_order: number;
  updated_at: Date;
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return (value as T) ?? fallback;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: (CATEGORY_IDS as readonly string[]).includes(row.category)
      ? (row.category as CategoryId)
      : "computer",
    price: row.price,
    mrp: row.mrp,
    summary: row.summary,
    images: parseJson<string[]>(row.images, []),
    highlights: parseJson<string[]>(row.highlights, []),
    specs: parseJson<[string, string][]>(row.specs, []),
    video: row.video,
    cameraType: row.camera_type,
    connection: row.connection_type,
    featured: Boolean(row.featured),
    inStock: Boolean(row.in_stock),
  };
}

function toAdminProduct(row: ProductRow): AdminProduct {
  return {
    ...toProduct(row),
    listed: Boolean(row.listed),
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

/**
 * Everything the store shows. Cached and shared by all pages; admin changes call
 * updateTag(PRODUCTS_TAG) so the store refreshes straight away.
 */
export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("max");
  const [rows] = await getPool().query<ProductRow[]>(
    "SELECT * FROM products WHERE listed = 1 ORDER BY sort_order, id",
  );
  return rows.map(toProduct);
}

export async function getCatalogProduct(slug: string) {
  const catalog = await getCatalog();
  return catalog.find((product) => product.slug === slug) ?? null;
}

/** Fresh (uncached) read used when pricing an order, so it always uses the current price. */
export async function getOrderableProducts(slugs: string[]) {
  if (slugs.length === 0) return new Map<string, Product>();
  const [rows] = await getPool().query<ProductRow[]>(
    "SELECT * FROM products WHERE listed = 1 AND slug IN (?)",
    [slugs],
  );
  return new Map(rows.map((row) => [row.slug, toProduct(row)]));
}

// ---------- Admin ----------

export async function listAdminProducts(): Promise<AdminProduct[]> {
  const [rows] = await getPool().query<ProductRow[]>(
    "SELECT * FROM products ORDER BY sort_order, id",
  );
  return rows.map(toAdminProduct);
}

export async function getAdminProduct(id: number): Promise<AdminProduct | null> {
  const [rows] = await getPool().query<ProductRow[]>("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0] ? toAdminProduct(rows[0]) : null;
}

export async function slugTaken(slug: string, exceptId?: number) {
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT id FROM products WHERE slug = ? AND id <> ?",
    [slug, exceptId ?? 0],
  );
  return rows.length > 0;
}

export async function nextSortOrder() {
  const [rows] = await getPool().query<(RowDataPacket & { next: number | null })[]>(
    "SELECT MAX(sort_order) + 10 AS next FROM products",
  );
  return Number(rows[0]?.next ?? 10);
}

function writeValues(input: ProductInput) {
  return [
    input.slug,
    input.name,
    input.brand,
    input.category,
    input.price,
    input.mrp,
    input.summary,
    JSON.stringify(input.images),
    JSON.stringify(input.highlights),
    JSON.stringify(input.specs),
    input.cameraType,
    input.connection,
    input.featured ? 1 : 0,
    input.inStock ? 1 : 0,
    input.listed ? 1 : 0,
    input.sortOrder,
  ];
}

export async function insertProduct(input: ProductInput) {
  const now = new Date();
  const [result] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO products
      (slug, name, brand, category, price, mrp, summary, images, highlights, specs,
       camera_type, connection_type, featured, in_stock, listed, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...writeValues(input), now, now],
  );
  return result.insertId;
}

export async function updateProduct(id: number, input: ProductInput) {
  await getPool().execute(
    `UPDATE products SET
       slug = ?, name = ?, brand = ?, category = ?, price = ?, mrp = ?, summary = ?, images = ?,
       highlights = ?, specs = ?, camera_type = ?, connection_type = ?, featured = ?, in_stock = ?,
       listed = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`,
    [...writeValues(input), new Date(), id],
  );
}

const QUICK_FIELDS = {
  price: "price",
  mrp: "mrp",
  inStock: "in_stock",
  listed: "listed",
  featured: "featured",
} as const;

export type QuickField = keyof typeof QUICK_FIELDS;

/** One-field updates from the products table (price, stock, visibility, featured). */
export async function quickUpdateProduct(id: number, field: QuickField, value: number | null) {
  const column = QUICK_FIELDS[field];
  await getPool().execute(`UPDATE products SET ${column} = ?, updated_at = ? WHERE id = ?`, [
    value,
    new Date(),
    id,
  ]);
}

export async function deleteProduct(id: number) {
  await getPool().execute("DELETE FROM products WHERE id = ?", [id]);
}

export async function productStats() {
  const [rows] = await getPool().query<
    (RowDataPacket & { total: number; hidden: number; out_of_stock: number })[]
  >(
    `SELECT COUNT(*) AS total,
            SUM(listed = 0) AS hidden,
            SUM(listed = 1 AND in_stock = 0) AS out_of_stock
     FROM products`,
  );
  const row = rows[0];
  return {
    total: Number(row?.total ?? 0),
    hidden: Number(row?.hidden ?? 0),
    outOfStock: Number(row?.out_of_stock ?? 0),
  };
}
