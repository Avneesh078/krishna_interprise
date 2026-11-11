import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-session";
import { categories, categoryLabel, imagePath } from "@/lib/catalog";
import { listAdminProducts, type AdminProduct } from "@/lib/products";
import { formatPrice } from "@/lib/site";
import { quickUpdate } from "../../product-actions";
import { AdminPage, DatabaseError, Loading } from "../ui";

export const metadata: Metadata = { title: "Products" };

type Props = {
  searchParams: Promise<{ q?: string; category?: string; show?: string; deleted?: string }>;
};

const views = [
  { id: "", label: "All" },
  { id: "listed", label: "In store" },
  { id: "hidden", label: "Hidden" },
  { id: "out", label: "Out of stock" },
  { id: "featured", label: "Popular picks" },
];

export default function ProductsPage({ searchParams }: Props) {
  return (
    <AdminPage
      title="Products"
      eyebrow="Shop admin"
      actions={
        <Link href="/admin/products/new" className="btn btn-signal">
          + Add product
        </Link>
      }
    >
      <Suspense fallback={<Loading label="Loading products…" />}>
        <ProductList searchParams={searchParams} />
      </Suspense>
    </AdminPage>
  );
}

async function ProductList({ searchParams }: Props) {
  await requireAdmin();
  const { q = "", category = "", show = "", deleted } = await searchParams;

  let all: AdminProduct[];
  try {
    all = await listAdminProducts();
  } catch (error) {
    console.error("Loading products failed", error);
    return <DatabaseError />;
  }

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const products = all.filter((product) => {
    const haystack = `${product.name} ${product.brand} ${product.slug}`.toLowerCase();
    if (!words.every((word) => haystack.includes(word))) return false;
    if (category && product.category !== category) return false;
    if (show === "listed") return product.listed;
    if (show === "hidden") return !product.listed;
    if (show === "out") return product.listed && !product.inStock;
    if (show === "featured") return product.featured;
    return true;
  });

  const viewHref = (id: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (id) params.set("show", id);
    const query = params.toString();
    return query ? `/admin/products?${query}` : "/admin/products";
  };

  return (
    <>
      {deleted && (
        <p role="status" className="mb-5 rounded-lg bg-ink/5 px-4 py-3 font-semibold">
          Deleted {deleted}.
        </p>
      )}

      <form action="/admin/products" role="search" className="flex flex-col gap-2 sm:flex-row">
        {show && <input type="hidden" name="show" value={show} />}
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search name, brand or web address"
          className="field sm:max-w-sm"
        />
        <label htmlFor="product-category" className="sr-only">
          Category
        </label>
        <select id="product-category" name="category" defaultValue={category} className="field sm:max-w-56">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-ink shrink-0">
          Filter
        </button>
      </form>

      <nav aria-label="Show" className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {views.map((view) => (
          <Link
            key={view.id}
            href={viewHref(view.id)}
            aria-current={show === view.id ? "page" : undefined}
            className={`min-h-10 shrink-0 rounded-lg border-[1.5px] px-3.5 py-2 text-sm font-semibold ${
              show === view.id ? "border-ink bg-ink text-white" : "border-line bg-white"
            }`}
          >
            {view.label}
          </Link>
        ))}
      </nav>

      <p className="mb-3 mt-5 font-mono text-sm text-muted">
        {products.length} of {all.length} products
      </p>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-muted">
          No products match these filters.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {products.map((product) => (
            <li key={product.id}>
              <ProductRow product={product} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ToggleButton({
  product,
  field,
  on,
  onLabel,
  offLabel,
  onStyle,
}: {
  product: AdminProduct;
  field: "inStock" | "listed" | "featured";
  on: boolean;
  onLabel: string;
  offLabel: string;
  onStyle: string;
}) {
  return (
    <form action={quickUpdate}>
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={on ? "0" : "1"} />
      <button
        type="submit"
        title={`Click to switch to "${on ? offLabel : onLabel}"`}
        aria-label={`${product.name}: ${on ? onLabel : offLabel}. Switch to ${on ? offLabel : onLabel}`}
        className={`min-h-9 rounded-md px-2.5 text-xs font-bold whitespace-nowrap transition-opacity hover:opacity-80 ${
          on ? onStyle : "bg-line text-muted"
        }`}
      >
        {on ? onLabel : offLabel}
      </button>
    </form>
  );
}

function ProductRow({ product }: { product: AdminProduct }) {
  return (
    <div
      className={`grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-3 p-3 sm:p-4 lg:grid-cols-[3.5rem_minmax(0,1fr)_auto_auto] lg:items-center ${
        product.listed ? "" : "bg-paper/70"
      }`}
    >
      <Link
        href={`/admin/products/${product.id}`}
        className="relative block h-14 w-14 overflow-hidden rounded-lg border border-line bg-white"
      >
        <Image src={imagePath(product.images[0])} alt="" fill sizes="56px" className="object-contain" />
      </Link>

      <div className="min-w-0">
        <Link href={`/admin/products/${product.id}`} className="font-semibold leading-snug hover:underline">
          {product.name}
        </Link>
        <p className="mt-0.5 truncate text-sm text-muted">
          {product.brand} · {categoryLabel(product.category)}
        </p>
      </div>

      <form
        action={quickUpdate}
        className="col-span-2 flex items-center gap-2 lg:col-span-1"
      >
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="field" value="price" />
        <label htmlFor={`price-${product.id}`} className="text-sm font-semibold text-muted">
          ₹
        </label>
        <input
          id={`price-${product.id}`}
          name="value"
          inputMode="numeric"
          required
          pattern="[0-9,]+"
          defaultValue={product.price}
          aria-label={`Price of ${product.name}`}
          className="field !min-h-9 !w-28 !py-1 font-mono"
        />
        <button type="submit" className="btn btn-ghost !min-h-9 !px-3 !py-1 text-sm">
          Save
        </button>
        {product.mrp && product.mrp > product.price && (
          <s className="font-mono text-xs text-muted" title="MRP">
            {formatPrice(product.mrp)}
          </s>
        )}
      </form>

      <div className="col-span-2 flex flex-wrap items-center gap-2 lg:col-span-1 lg:justify-end">
        <ToggleButton product={product} field="listed" on={product.listed} onLabel="In store" offLabel="Hidden" onStyle="bg-ink text-white" />
        <ToggleButton product={product} field="inStock" on={product.inStock} onLabel="In stock" offLabel="Out of stock" onStyle="bg-wa text-white" />
        <ToggleButton product={product} field="featured" on={product.featured} onLabel="★ Popular" offLabel="☆ Popular" onStyle="bg-signal text-ink" />
        <Link href={`/admin/products/${product.id}`} className="btn btn-ink !min-h-9 !px-3 !py-1 text-sm">
          Edit
        </Link>
      </div>
    </div>
  );
}
