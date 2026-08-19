export const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/api/v1/health",
  "/api/v1/auth/register",
  "/api/v1/auth/login",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/v1/jobs/notifications",
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isStaticAssetPath(pathname: string): boolean {
  return /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname);
}

export function allowsUnauthenticatedAccess(pathname: string): boolean {
  return isPublicPath(pathname) || isStaticAssetPath(pathname);
}
