function queryValue(query: string, name: string): string | null {
  for (const part of query.split("&")) {
    if (!part) {
      continue;
    }

    const separator = part.indexOf("=");
    const key = decodeURIComponent(separator === -1 ? part : part.slice(0, separator));
    if (key !== name) {
      continue;
    }

    const value = decodeURIComponent(separator === -1 ? "" : part.slice(separator + 1)).trim();
    return value || null;
  }

  return null;
}

export function parsePasswordResetTokenFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const [withoutHash] = trimmed.split("#");
  const queryIndex = withoutHash.indexOf("?");
  const base = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : withoutHash.slice(queryIndex + 1);
  const path = base.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").replace(/\/+$/, "");
  const isResetPath = path === "reset-password" || path.endsWith("/reset-password");

  if (!isResetPath) {
    return null;
  }

  return queryValue(query, "token");
}
