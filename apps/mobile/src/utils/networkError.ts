import { ApiError } from "@api/apiError";

const NETWORK_ERROR_PATTERN =
  /java\.io\.|IOException|ECONNREFUSED|ENETUNREACH|Failed to connect|Failed to fetch|Network request failed|timed out/i;

export function isNetworkFailureMessage(message: string): boolean {
  return NETWORK_ERROR_PATTERN.test(message);
}

export function formatNetworkErrorMessage(baseUrl: string): string {
  return `Could not reach ${baseUrl}. Check the API URL and server.`;
}

export function toNetworkApiError(error: unknown, baseUrl: string): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new ApiError(formatNetworkErrorMessage(baseUrl), 0);
  }

  const rawMessage = error instanceof Error ? error.message : "Network request failed";
  if (isNetworkFailureMessage(rawMessage)) {
    return new ApiError(formatNetworkErrorMessage(baseUrl), 0);
  }

  return new ApiError(rawMessage, 0);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return isNetworkFailureMessage(error.message) ? fallback : error.message;
  }

  return fallback;
}
