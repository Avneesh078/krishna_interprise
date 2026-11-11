import "server-only";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getPool } from "./db";

export const ORDER_METHODS = ["pickup", "delivery", "install"] as const;
export const ORDER_STATUSES = ["new", "confirmed", "delivered", "cancelled"] as const;

export type OrderMethod = (typeof ORDER_METHODS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type NewOrder = {
  name: string;
  phone: string;
  method: OrderMethod;
  address: string | null;
  note: string | null;
  items: OrderItem[];
};

export type OrderItem = { slug: string; name: string; unitPrice: number; qty: number };

export type Order = {
  id: number;
  name: string;
  phone: string;
  method: OrderMethod;
  address: string | null;
  note: string | null;
  subtotal: number;
  status: OrderStatus;
  createdAt: Date;
  items: OrderItem[];
};

export function orderNumber(id: number) {
  return `KE${String(id).padStart(4, "0")}`;
}

/** Items arrive already priced from the database by the caller, never from the browser. */
export async function createOrder(order: NewOrder) {
  const { items } = order;
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const now = new Date();

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO orders (customer_name, phone, method, address, note, subtotal, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
      [order.name, order.phone, order.method, order.address, order.note, subtotal, now, now],
    );
    const orderId = result.insertId;
    await connection.query(
      "INSERT INTO order_items (order_id, product_slug, product_name, unit_price, qty) VALUES ?",
      [items.map((item) => [orderId, item.slug, item.name, item.unitPrice, item.qty])],
    );
    await connection.commit();
    return { id: orderId, subtotal };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

type OrderRow = RowDataPacket & {
  id: number;
  customer_name: string;
  phone: string;
  method: OrderMethod;
  address: string | null;
  note: string | null;
  subtotal: number;
  status: OrderStatus;
  created_at: Date;
};

type ItemRow = RowDataPacket & {
  order_id: number;
  product_slug: string;
  product_name: string;
  unit_price: number;
  qty: number;
};

export async function listOrders(
  { status = null, search = "" }: { status?: OrderStatus | null; search?: string } = {},
  limit = 100,
): Promise<Order[]> {
  const pool = getPool();
  const where: string[] = [];
  const values: unknown[] = [];
  if (status) {
    where.push("status = ?");
    values.push(status);
  }
  const term = search.trim();
  if (term) {
    // Matches an order number (KE0012 or 12), a phone number, or part of a name.
    const id = term.match(/^(?:KE)?0*(\d+)$/i)?.[1];
    const digits = term.replace(/\D/g, "");
    where.push("(id = ? OR phone LIKE ? OR customer_name LIKE ?)");
    // "~" never appears in a phone number, so a search with no digits skips the phone match.
    values.push(id ? Number(id) : 0, `%${digits || "~"}%`, `%${term}%`);
  }
  const [rows] = await pool.query<OrderRow[]>(
    `SELECT * FROM orders ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY created_at DESC, id DESC LIMIT ?`,
    [...values, limit],
  );
  if (rows.length === 0) return [];

  const [itemRows] = await pool.query<ItemRow[]>(
    "SELECT order_id, product_slug, product_name, unit_price, qty FROM order_items WHERE order_id IN (?) ORDER BY id",
    [rows.map((row) => row.id)],
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.customer_name,
    phone: row.phone,
    method: row.method,
    address: row.address,
    note: row.note,
    subtotal: row.subtotal,
    status: row.status,
    createdAt: row.created_at,
    items: itemRows
      .filter((item) => item.order_id === row.id)
      .map((item) => ({
        slug: item.product_slug,
        name: item.product_name,
        unitPrice: item.unit_price,
        qty: item.qty,
      })),
  }));
}

export async function countOrdersByStatus() {
  const [rows] = await getPool().query<(RowDataPacket & { status: OrderStatus; total: number })[]>(
    "SELECT status, COUNT(*) AS total FROM orders GROUP BY status",
  );
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >;
  for (const row of rows) counts[row.status] = Number(row.total);
  return counts;
}

export async function setOrderStatus(id: number, status: OrderStatus) {
  await getPool().execute("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    new Date(),
    id,
  ]);
}
