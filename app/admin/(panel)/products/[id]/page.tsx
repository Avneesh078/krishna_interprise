import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-session";
import { getAdminProduct, listAdminProducts, type AdminProduct } from "@/lib/products";
import { DeleteProductButton } from "../delete-button";
import { ProductForm } from "../product-form";
import { AdminPage, DatabaseError, Loading } from "../../ui";

export const metadata: Metadata = { title: "Edit product" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default function EditProductPage(props: Props) {
  return (
    <AdminPage title="Edit product" eyebrow="Products">
      <Suspense fallback={<Loading label="Loading product…" />}>
        <EditProduct {...props} />
      </Suspense>
    </AdminPage>
  );
}

async function EditProduct({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) notFound();

  let product: AdminProduct | null;
  let brands: string[];
  try {
    const [found, all] = await Promise.all([getAdminProduct(productId), listAdminProducts()]);
    product = found;
    brands = Array.from(new Set(all.map((item) => item.brand))).sort();
  } catch (error) {
    console.error("Loading product failed", error);
    return <DatabaseError />;
  }
  if (!product) notFound();

  return (
    <>
      {created && (
        <p role="status" className="mb-5 rounded-lg bg-wa/10 px-4 py-3 font-semibold text-wa">
          Product added{product.listed ? " and live in the store" : ""}.
        </p>
      )}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-lg font-bold">{product.name}</p>
        {product.listed && (
          <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost">
            View in store ↗
          </a>
        )}
        <DeleteProductButton id={product.id} name={product.name} />
      </div>
      <ProductForm product={product} brands={brands} />
    </>
  );
}
