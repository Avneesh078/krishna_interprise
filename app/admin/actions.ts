"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import {
  createSessionToken,
  isAdminConfigured,
  passwordMatches,
  SESSION_COOKIE,
  SESSION_DAYS,
} from "@/lib/auth";
import { ORDER_STATUSES, setOrderStatus, type OrderStatus } from "@/lib/orders";

export type LoginState = { error: string } | null;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "Admin login is not set up yet. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET to .env.local." };
  }
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    // Slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "Wrong password." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  if (!Number.isInteger(id) || id < 1 || !ORDER_STATUSES.includes(status)) return;
  await setOrderStatus(id, status);
  refresh();
}
