import { isStaticAssetPath } from "@/lib/auth/public-access";

export const DEFAULT_CANONICAL_APP_HOST = "app.tend.qzz.io";
export const DEFAULT_MARKETING_HOST = "tend.qzz.io";

export function getCanonicalAppHost(): string {
  return process.env.CANONICAL_APP_HOST ?? DEFAULT_CANONICAL_APP_HOST;
}

export function getMarketingHost(): string {
  return process.env.MARKETING_HOST ?? DEFAULT_MARKETING_HOST;
}

export function isVercelAppHost(hostname: string): boolean {
  return hostname.endsWith(".vercel.app");
}

export function isLocalDevHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1";
}

export function isMarketingHost(hostname: string): boolean {
  return hostname.toLowerCase() === getMarketingHost().toLowerCase();
}

export function isAppProductionHost(hostname: string): boolean {
  return hostname.toLowerCase() === getCanonicalAppHost().toLowerCase();
}

export function shouldEnforceHostSplit(hostname: string): boolean {
  if (isLocalDevHost(hostname)) {
    return false;
  }

  return isMarketingHost(hostname) || isAppProductionHost(hostname) || isVercelAppHost(hostname);
}

export function isMarketingPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/privacy" || pathname === "/terms") {
    return true;
  }

  if (pathname.startsWith("/privacy/") || pathname.startsWith("/terms/")) {
    return true;
  }

  return isStaticAssetPath(pathname);
}

export function isMarketingLegalPath(pathname: string): boolean {
  return (
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/privacy/") ||
    pathname.startsWith("/terms/")
  );
}

function getProductionOrigin(host: string): string {
  return `https://${host}`;
}

export function getAppOrigin(): string {
  if (process.env.NODE_ENV !== "production") {
    return "";
  }

  return getProductionOrigin(getCanonicalAppHost());
}

export function getMarketingOrigin(): string {
  if (process.env.NODE_ENV !== "production") {
    return "";
  }

  return getProductionOrigin(getMarketingHost());
}

export function appUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin = getAppOrigin();
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}

export function getAbsoluteAppOrigin(): string {
  if (process.env.NODE_ENV === "production") {
    return `https://${getCanonicalAppHost()}`;
  }

  return process.env.APP_ORIGIN?.replace(/\/$/, "") || "http://localhost:3000";
}

export function absoluteAppUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getAbsoluteAppOrigin()}${normalizedPath}`;
}

export function marketingUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin = getMarketingOrigin();
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}

export function buildHostRedirectUrl(request: Request, host: string): URL {
  const redirectUrl = new URL(request.url);
  redirectUrl.protocol = "https:";
  redirectUrl.host = host;
  redirectUrl.port = "";
  return redirectUrl;
}
