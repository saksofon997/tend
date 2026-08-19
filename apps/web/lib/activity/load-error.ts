export function isAbortError(error: unknown): boolean {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name === "AbortError";
  }

  return error instanceof Error && (error.name === "AbortError" || /aborted/i.test(error.message));
}

/** Activity reloads should stay calm — never surface raw platform fetch text. */
export function activityLoadErrorMessage(error: unknown, fallback: string): string {
  if (isAbortError(error)) {
    return "";
  }

  return fallback;
}
