import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-session";
import { listAdminProducts } from "@/lib/products";
import { ProductForm } from "../product-form";
import { AdminPage, DatabaseError, Loading } from "../../ui";

export const metadata: Metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <AdminPage title="Add product" eyebrow="Products">
      <Suspense fallback={<Loading label="Loading…" />}>
        <NewProduct />
      </Suspense>
    </AdminPage>
  );
}

async function NewProduct() {
  await requireAdmin();
  let brands: string[];
  try {
    brands = Array.from(new Set((await listAdminProducts()).map((product) => product.brand))).sort();
  } catch (error) {
    console.error("Loading brands failed", error);
    return <DatabaseError />;
  }
  return <ProductForm brands={brands} />;
}
