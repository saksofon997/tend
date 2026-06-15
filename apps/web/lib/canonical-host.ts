export const DEFAULT_CANONICAL_APP_HOST = "app.tend.qzz.io";

export function getCanonicalAppHost(): string {
  return process.env.CANONICAL_APP_HOST ?? DEFAULT_CANONICAL_APP_HOST;
}

export function isVercelAppHost(hostname: string): boolean {
  return hostname.endsWith(".vercel.app");
}
