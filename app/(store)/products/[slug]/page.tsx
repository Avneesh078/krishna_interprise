import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BuyBox } from "@/components/buy-box";
import { CheckIcon, HeadsetIcon, StoreIcon, WrenchIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { PriceTag } from "@/components/price-tag";
import { categoryLabel, imagePath, relatedProducts } from "@/lib/catalog";
import { getCatalog, getCatalogProduct } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

// Products added later from the admin panel render on their first visit and are then cached.
export async function generateStaticParams() {
  const products = await getCatalog();
  // Cache Components needs at least one entry; an unknown slug simply 404s.
  return products.length ? products.map((product) => ({ slug: product.slug })) : [{ slug: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) return { title: "Product not available", robots: { index: false } };
  return {
    title: product.name,
    description: product.summary,
    openGraph: { images: [imagePath(product.images[0])] },
  };
}

const assurances = [
  { icon: StoreIcon, text: "Pick up from our shop in Rewa, or ask about delivery" },
  { icon: WrenchIcon, text: "Need it fitted? Add installation at checkout" },
  { icon: HeadsetIcon, text: "Not sure it suits your setup? Ask us before you buy" },
];

/**
 * The product is read inside <Suspense> so that a product added or changed in the admin panel
 * can be rendered on demand: the page shell is served at once and the details stream in, then
 * the finished page is cached until the next admin change.
 */
export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="wrap py-6 lg:py-10" aria-busy="true" aria-label="Loading product">
      <div className="mb-5 h-4 w-40 rounded bg-line" />
      <div className="grid gap-7 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square rounded-xl bg-white" />
        <div className="space-y-4">
          <div className="h-3 w-20 rounded bg-line" />
          <div className="h-10 w-4/5 rounded bg-line" />
          <div className="h-5 w-full rounded bg-line" />
          <div className="h-8 w-32 rounded bg-line" />
        </div>
      </div>
    </div>
  );
}

function ProductUnavailable() {
  return (
    <div className="wrap grid min-h-[50vh] place-content-center py-16 text-center">
      <p className="eyebrow text-muted">Not available</p>
      <h1 className="display mt-3 text-3xl">This product is no longer in our store</h1>
      <p className="mt-2 text-muted">It may be out of range now. Browse the shop or ask us for an alternative.</p>
      <Link href="/shop" className="btn btn-ink mx-auto mt-6">
        Go to the shop
      </Link>
    </div>
  );
}

async function ProductDetails({ params }: Props) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  // A message rather than notFound(): the page may already be cached, and a hidden or deleted
  // product must replace that cached page instead of leaving the old one in place.
  if (!product) return <ProductUnavailable />;

  const related = relatedProducts(product, await getCatalog());
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.summary,
    image: product.images.map(imagePath),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="pb-20 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="wrap py-6 lg:py-10">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
          <Link href="/shop" className="hover:text-ink hover:underline">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/shop?category=${product.category}`}
            className="hover:text-ink hover:underline"
          >
            {categoryLabel(product.category)}
          </Link>
        </nav>

        <div className="grid gap-7 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images} name={product.name} video={product.video ?? undefined} />

          <div>
            <p className="eyebrow text-muted">{product.brand}</p>
            <h1 className="display mt-2 text-3xl sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-lg leading-relaxed text-muted">{product.summary}</p>
            <p className="mt-5">
              <PriceTag product={product} size="lg" />
            </p>
            <p className={`mt-1 text-sm ${product.inStock ? "text-muted" : "font-semibold text-rec"}`}>
              {product.inStock
                ? "Final price and stock confirmed on WhatsApp before you pay."
                : "Out of stock right now. Message us and we will tell you when it is back."}
            </p>

            <ul className="my-6 space-y-2">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2.5">
                  <CheckIcon size={20} className="mt-0.5 shrink-0 text-wa" />
                  {highlight}
                </li>
              ))}
            </ul>

            <BuyBox product={product} />

            <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-white">
              {assurances.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 px-4 py-3 text-[0.95rem]">
                  <Icon size={20} className="shrink-0 text-ink-3" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {product.specs.length > 0 && (
        <section className="mt-12 lg:mt-16">
          <h2 className="display text-2xl sm:text-3xl">Specifications</h2>
          <table className="mt-5 w-full max-w-3xl overflow-hidden rounded-xl bg-white text-left">
            <tbody>
              {product.specs.map(([label, value]) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <th scope="row" className="w-2/5 px-4 py-3 font-medium text-muted">
                    {label}
                  </th>
                  <td className="px-4 py-3 font-semibold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        )}

        {related.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <h2 className="display text-2xl sm:text-3xl">You may also need</h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.slug}>
                  <ProductCard product={item} sizes="(min-width: 1024px) 25vw, 50vw" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
