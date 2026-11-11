import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/auth";

/**
 * First line of defence for /admin: send signed-out visitors to the login page.
 * Admin pages and Server Actions check the session again themselves.
 */
export function proxy(request: NextRequest) {
  const signedIn = isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const onLogin = request.nextUrl.pathname === "/admin/login";

  if (!signedIn && !onLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (signedIn && onLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
