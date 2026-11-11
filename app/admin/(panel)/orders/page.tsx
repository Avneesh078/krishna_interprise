import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/admin-session";
import {
  countOrdersByStatus,
  listOrders,
  ORDER_STATUSES,
  orderNumber,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import { updateOrderStatus } from "../../actions";
import { AdminPage, DatabaseError, Loading } from "../ui";

export const metadata: Metadata = { title: "Orders" };

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

const methodLabels = {
  pickup: "Pick up from shop",
  delivery: "Delivery",
  install: "Delivery and installation",
};

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-signal text-ink",
  confirmed: "bg-ink-3 text-white",
  delivered: "bg-wa text-white",
  cancelled: "bg-line text-muted",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export default function OrdersPage({ searchParams }: Props) {
  return (
    <AdminPage title="Orders" eyebrow="Shop admin">
      {/* Orders are read per request, so they stream in after the page shell. */}
      <Suspense fallback={<Loading label="Loading orders…" />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </AdminPage>
  );
}

async function Orders({ searchParams }: Props) {
  await requireAdmin();
  const { status: rawStatus, q = "" } = await searchParams;
  const status = ORDER_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : null;

  let orders: Order[];
  let counts: Record<OrderStatus, number>;
  try {
    [orders, counts] = await Promise.all([
      listOrders({ status, search: q }),
      countOrdersByStatus(),
    ]);
  } catch (error) {
    console.error("Loading orders failed", error);
    return <DatabaseError />;
  }

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const tabs = [
    { label: "All", value: null, count: total },
    ...ORDER_STATUSES.map((value) => ({ label: value, value, count: counts[value] })),
  ];

  return (
    <>
      <form action="/admin/orders" role="search" className="flex max-w-md gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="sr-only" htmlFor="order-search">
          Search orders
        </label>
        <input
          id="order-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Order no., phone or name"
          className="field"
        />
        <button type="submit" className="btn btn-ink shrink-0">
          Search
        </button>
      </form>

      <nav aria-label="Filter by status" className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders"}
            aria-current={tab.value === status ? "page" : undefined}
            className={`min-h-10 shrink-0 rounded-lg border-[1.5px] px-3.5 py-2 text-sm font-semibold capitalize ${
              tab.value === status ? "border-ink bg-ink text-white" : "border-line bg-white"
            }`}
          >
            {tab.label} <span className="font-mono opacity-70">{tab.count}</span>
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-white p-10 text-center text-muted">
          {q ? `No orders match "${q}".` : "No orders here yet."}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function OrderCard({ order }: { order: Order }) {
  const number = orderNumber(order.id);
  return (
    <article className="rounded-xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-semibold">{number}</span>
            <span
              className={`eyebrow rounded px-1.5 py-0.5 !text-[0.65rem] ${statusStyles[order.status]}`}
            >
              {order.status}
            </span>
          </p>
          <p className="mt-1 text-sm text-muted">{dateFormat.format(order.createdAt)}</p>
        </div>
        <p className="font-mono text-xl font-semibold">{formatPrice(order.subtotal)}</p>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div className="space-y-1">
          <p className="font-bold">{order.name}</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={`tel:+91${order.phone}`} className="inline-flex items-center gap-1.5 font-mono hover:underline">
              <PhoneIcon size={15} /> {order.phone}
            </a>
            <a
              href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(`Hello ${order.name}, about your order ${number} from Krishna Enterprises:`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-wa hover:underline"
            >
              <WhatsAppIcon size={15} /> WhatsApp
            </a>
          </p>
          <p className="text-sm">{methodLabels[order.method]}</p>
          {order.address && <p className="text-sm text-muted">{order.address}</p>}
          {order.note && <p className="text-sm text-muted">Note: {order.note}</p>}
        </div>
        <ul className="divide-y divide-line rounded-lg border border-line text-sm">
          {order.items.map((item) => (
            <li key={item.slug} className="flex justify-between gap-3 px-3 py-2">
              <span>
                {item.qty} × {item.name}
              </span>
              <span className="shrink-0 font-mono">{formatPrice(item.unitPrice * item.qty)}</span>
            </li>
          ))}
        </ul>
      </div>

      <form action={updateOrderStatus} className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <input type="hidden" name="id" value={order.id} />
        <label htmlFor={`status-${order.id}`} className="text-sm font-semibold">
          Status
        </label>
        <select
          id={`status-${order.id}`}
          name="status"
          defaultValue={order.status}
          className="field !min-h-10 !w-auto capitalize"
        >
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-ink !min-h-10 !py-1.5">
          Update
        </button>
      </form>
    </article>
  );
}
