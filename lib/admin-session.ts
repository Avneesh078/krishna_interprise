import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { isValidSessionToken, SESSION_COOKIE } from "./auth";

export async function isAdmin() {
  // The session check reads the clock, so it must run per request, never during prerendering.
  await connection();
  const store = await cookies();
  return isValidSessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Use at the top of every admin page section and admin Server Action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
