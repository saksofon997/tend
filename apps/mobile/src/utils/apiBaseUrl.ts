const DEV_API_URL_PATTERN =
  /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d{1,3}\.\d{1,3})(?::3000)?\/?$/;

export function isDevApiUrl(url: string): boolean {
  return DEV_API_URL_PATTERN.test(url.replace(/\/$/, ""));
}

export function shouldRefreshDevApiBaseUrl(stored: string | null, currentDefault: string): boolean {
  if (!stored || stored === currentDefault) {
    return false;
  }

  return isDevApiUrl(stored);
}

export function resolveStoredApiBaseUrl(stored: string | null, currentDefault: string): string {
  if (!stored) {
    return currentDefault;
  }

  if (shouldRefreshDevApiBaseUrl(stored, currentDefault)) {
    return currentDefault;
  }

  return stored;
}
