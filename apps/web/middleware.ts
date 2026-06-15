import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { allowsUnauthenticatedAccess } from "@/lib/auth/public-access";
import {
  buildHostRedirectUrl,
  getCanonicalAppHost,
  getMarketingHost,
  isAppProductionHost,
  isMarketingHost,
  isMarketingLegalPath,
  isMarketingPath,
  isVercelAppHost,
  shouldEnforceHostSplit,
} from "@/lib/canonical-host";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;

  if (isVercelAppHost(hostname)) {
    return NextResponse.redirect(buildHostRedirectUrl(request, getCanonicalAppHost()), 308);
  }

  if (shouldEnforceHostSplit(hostname)) {
    const { pathname } = request.nextUrl;

    if (isMarketingHost(hostname) && !isMarketingPath(pathname)) {
      return NextResponse.redirect(buildHostRedirectUrl(request, getCanonicalAppHost()), 308);
    }

    if (isAppProductionHost(hostname) && isMarketingLegalPath(pathname)) {
      return NextResponse.redirect(buildHostRedirectUrl(request, getMarketingHost()), 308);
    }
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
