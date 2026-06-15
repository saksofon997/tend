import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { allowsUnauthenticatedAccess } from "@/lib/auth/public-access";
import { getCanonicalAppHost, isVercelAppHost } from "@/lib/canonical-host";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (isVercelAppHost(request.nextUrl.hostname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    redirectUrl.host = getCanonicalAppHost();
    redirectUrl.port = "";
    return NextResponse.redirect(redirectUrl, 308);
  }

  const { pathname } = request.nextUrl;

  if (allowsUnauthenticatedAccess(pathname)) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
