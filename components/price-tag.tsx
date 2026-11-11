import { discountPercent, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/site";

/** Selling price, plus the struck-through MRP and % off when the admin has set a higher MRP. */
export function PriceTag({
  product,
  size = "md",
}: {
  product: Pick<Product, "price" | "mrp">;
  size?: "md" | "lg";
}) {
  const off = discountPercent(product);
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        className={`font-mono font-semibold ${size === "lg" ? "text-3xl" : "text-[1.05rem]"}`}
      >
        {formatPrice(product.price)}
      </span>
      {off > 0 && (
        <>
          <s className={`font-mono text-muted ${size === "lg" ? "text-lg" : "text-xs"}`}>
            <span className="sr-only">MRP </span>
            {formatPrice(product.mrp!)}
          </s>
          <span
            className={`font-semibold text-wa ${size === "lg" ? "text-base" : "text-xs"}`}
          >
            {off}% off
          </span>
        </>
      )}
    </span>
  );
}
