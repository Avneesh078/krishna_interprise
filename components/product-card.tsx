import Image from "next/image";
import Link from "next/link";
import { discountPercent, imagePath, type Product } from "@/lib/catalog";
import { AddToCartButton } from "./add-to-cart";
import { PriceTag } from "./price-tag";

export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  product: Product;
  sizes?: string;
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-ink">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={imagePath(product.images[0])}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
        {product.connection && (
          <span className="eyebrow absolute left-2.5 top-2.5 rounded bg-ink px-1.5 py-1 !text-[0.62rem] text-signal">
            {product.connection}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-1.5 text-center text-sm font-semibold text-white">
            Out of stock
          </span>
        )}
        {product.inStock && discountPercent(product) > 0 && (
          <span className="absolute right-2.5 top-2.5 rounded bg-wa px-1.5 py-0.5 text-xs font-bold text-white">
            {discountPercent(product)}% off
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-line p-3.5">
        <p className="eyebrow text-muted">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-[2.6em] font-semibold leading-[1.3]">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <PriceTag product={product} />
          {product.inStock && <AddToCartButton slug={product.slug} name={product.name} compact />}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
