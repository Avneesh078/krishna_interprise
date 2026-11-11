import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-session";
import { countOrdersByStatus, listOrders, orderNumber } from "@/lib/orders";
import { productStats } from "@/lib/products";
import { formatPrice } from "@/lib/site";
import { AdminPage, DatabaseError, Loading } from "./ui";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <AdminPage
      title="Dashboard"
      eyebrow="Shop admin"
      actions={
        <Link href="/admin/products/new" className="btn btn-signal">
          + Add product
        </Link>
      }
    >
      <Suspense fallback={<Loading label="Loading…" />}>
        <Dashboard />
      </Suspense>
    </AdminPage>
  );
}

async function Dashboard() {
  await requireAdmin();
  let data;
  try {
    const [counts, products, recent] = await Promise.all([
      countOrdersByStatus(),
      productStats(),
      listOrders({}, 6),
    ]);
    data = { counts, products, recent };
  } catch (error) {
    console.error("Dashboard failed", error);
    return <DatabaseError />;
  }
  const { counts, products, recent } = data;

  const cards = [
    { label: "New orders", value: counts.new, href: "/admin/orders?status=new", urgent: counts.new > 0 },
    { label: "Confirmed, to deliver", value: counts.confirmed, href: "/admin/orders?status=confirmed" },
    { label: "Products in store", value: products.total - products.hidden, href: "/admin/products" },
    { label: "Out of stock", value: products.outOfStock, href: "/admin/products?show=out", urgent: products.outOfStock > 0 },
    { label: "Hidden products", value: products.hidden, href: "/admin/products?show=hidden" },
    { label: "Delivered orders", value: counts.delivered, href: "/admin/orders?status=delivered" },
  ];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label}>
            <Link
              href={card.href}
              className={`block h-full rounded-xl border bg-white p-4 transition-colors hover:border-ink ${
                card.urgent ? "border-signal-deep" : "border-line"
              }`}
            >
              <span className="block font-mono text-3xl font-semibold">{card.value}</span>
              <span className="mt-1 block text-sm font-medium text-muted">{card.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2 className="display text-2xl">Latest orders</h2>
          <Link href="/admin/orders" className="font-semibold underline decoration-signal decoration-[3px] underline-offset-4">
            All orders
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white p-8 text-center text-muted">
            No orders yet. They appear here as soon as a customer checks out.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders?q=${orderNumber(order.id)}`}
                        className="font-mono font-semibold hover:underline"
                      >
                        {orderNumber(order.id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{order.name}</td>
                    <td className="px-4 py-3">{order.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                    <td className="px-4 py-3 capitalize">{order.status}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatPrice(order.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
