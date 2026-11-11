"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { categories, type Product } from "@/lib/catalog";
import { CloseIcon, SearchIcon } from "./icons";
import { ProductGrid } from "./product-card";

const sorts = [
  { id: "featured", label: "Recommended" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
  { id: "name", label: "Name: A to Z" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 shrink-0 rounded-lg border-[1.5px] px-3.5 text-sm font-semibold transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function ShopBrowser({ products }: { products: Product[] }) {
  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.brand))), [products]);
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const brand = params.get("brand") ?? "";
  const type = params.get("type") ?? "";
  const connection = params.get("connection") ?? "";
  const sort = params.get("sort") ?? "featured";

  // Filters live in the URL so they can be shared, and survive back and refresh.
  const setParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    window.history.replaceState(null, "", query ? `/shop?${query}` : "/shop");
  };

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = products.filter((product) => {
      const text = `${product.name} ${product.brand} ${product.summary} ${product.category}`.toLowerCase();
      return (
        words.every((word) => text.includes(word)) &&
        (!category || product.category === category) &&
        (!brand || product.brand === brand) &&
        (!type || product.cameraType === type) &&
        (!connection || product.connection === connection)
      );
    });
    if (sort === "low") return [...matched].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...matched].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...matched].sort((a, b) => a.name.localeCompare(b.name));
    return matched;
  }, [products, q, category, brand, type, connection, sort]);

  const activeBrands = useMemo(
    () =>
      brands.filter((name) =>
        products.some(
          (product) => product.brand === name && (!category || product.category === category),
        ),
      ),
    [brands, products, category],
  );

  const hasFilters = Boolean(q || category || brand || type || connection);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="flex flex-1 items-center rounded-lg border-[1.5px] border-line bg-white pl-3 focus-within:border-ink">
          <SearchIcon size={18} className="shrink-0 text-muted" />
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={q}
            onChange={(event) => setParams({ q: event.target.value })}
            placeholder="Search by product, brand or use"
            className="h-12 w-full bg-transparent px-2 outline-none placeholder:text-muted"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold md:w-72">
          <span className="shrink-0">Sort by</span>
          <select
            value={sort}
            onChange={(event) =>
              setParams({ sort: event.target.value === "featured" ? "" : event.target.value })
            }
            className="field"
          >
            {sorts.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <Chip
          active={!category}
          onClick={() => setParams({ category: "", brand: "", type: "", connection: "" })}
        >
          All products
        </Chip>
        {categories.map((item) => (
          <Chip
            key={item.id}
            active={category === item.id}
            onClick={() =>
              setParams({ category: item.id, brand: "", type: "", connection: "" })
            }
          >
            {item.label}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-5">
        <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0 md:pb-0">
          <span className="eyebrow text-muted">Brand</span>
          {activeBrands.map((name) => (
            <Chip
              key={name}
              active={brand === name}
              onClick={() => setParams({ brand: brand === name ? "" : name })}
            >
              {name}
            </Chip>
          ))}
        </div>
        {category === "cameras" && (
          <>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-muted">Type</span>
              {["Bullet", "Dome"].map((name) => (
                <Chip
                  key={name}
                  active={type === name}
                  onClick={() => setParams({ type: type === name ? "" : name })}
                >
                  {name}
                </Chip>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-muted">Signal</span>
              {["HD", "IP"].map((name) => (
                <Chip
                  key={name}
                  active={connection === name}
                  onClick={() => setParams({ connection: connection === name ? "" : name })}
                >
                  {name}
                </Chip>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mb-4 mt-6 flex min-h-8 items-center justify-between">
        <p className="font-mono text-sm text-muted" aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              setParams({ q: "", category: "", brand: "", type: "", connection: "" })
            }
            className="inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
          >
            <CloseIcon size={14} /> Clear filters
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-lg font-semibold">No products match that search</p>
          <p className="mt-1 text-muted">
            Try fewer words, or message us. We may have it in the shop.
          </p>
        </div>
      )}
    </div>
  );
}
