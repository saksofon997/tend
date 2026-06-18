import type {
  ActivityEntryResponse,
  AvailabilityWindowResponse,
  ItemResponse,
  OnboardingStatusResponse,
  RemindersResponse,
  UserResponse,
  UserSettingsResponse,
} from "@/types";
import { ApiError } from "@api/apiError";
import type { AvailabilityWindow } from "@tend/domain";
import { resolveStoredApiBaseUrl } from "@utils/apiBaseUrl";
import { isDevMode } from "@utils/devMode";
import { toNetworkApiError } from "@utils/networkError";
import { storage } from "@utils/storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

declare const process: { env: { EXPO_PUBLIC_TEND_API_URL?: string } };

const API_BASE_STORAGE_KEY = "tend.apiBaseUrl";
const SESSION_COOKIE_STORAGE_KEY = "tend.sessionCookie";
export const PRODUCTION_API_BASE_URL = "https://app.tend.qzz.io";

function resolveDevApiBaseUrl() {
  if (Platform.OS === "android" && !Constants.isDevice) {
    // Android emulator alias for the host machine's localhost
    return "http://10.0.2.2:3000";
  }

  if (Platform.OS === "ios" && !Constants.isDevice) {
    return "http://localhost:3000";
  }

  // Physical device: reuse the same LAN IP Metro uses (see `expo start` output)
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri?.split("/")[0] ?? null;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    return `http://${host}:3000`;
  }

  return "http://localhost:3000";
}

function resolveConfiguredApiBaseUrl() {
  return process.env.EXPO_PUBLIC_TEND_API_URL?.replace(/\/$/, "") ?? null;
}

export function resolveDefaultApiBaseUrl() {
  return (
    resolveConfiguredApiBaseUrl() ??
    (isDevMode() ? resolveDevApiBaseUrl() : PRODUCTION_API_BASE_URL)
  );
}

export const defaultApiBaseUrl = resolveDefaultApiBaseUrl();

type JsonRecord = Record<string, unknown>;

export { ApiError } from "@api/apiError";

const REQUEST_TIMEOUT_MS = 10_000;

export class TendApi {
  baseUrl: string;
  private sessionCookie: string | null;

  private constructor(baseUrl: string, sessionCookie: string | null) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.sessionCookie = sessionCookie;
  }

  get hasSession() {
    return this.sessionCookie !== null;
  }

  static async load() {
    const [storedBaseUrl, storedCookie] = await Promise.all([
      storage.getString(API_BASE_STORAGE_KEY),
      storage.getString(SESSION_COOKIE_STORAGE_KEY),
    ]);

    const baseUrl = resolveStoredApiBaseUrl(storedBaseUrl, defaultApiBaseUrl);
    if (baseUrl !== storedBaseUrl) {
      await storage.setString(API_BASE_STORAGE_KEY, baseUrl);
    }

    return new TendApi(baseUrl, storedCookie);
  }

  async setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    await storage.setString(API_BASE_STORAGE_KEY, this.baseUrl);
  }

  async clearSession() {
    this.sessionCookie = null;
    await storage.remove(SESSION_COOKIE_STORAGE_KEY);
  }

  async me() {
    return this.request<{ user: UserResponse }>("/api/v1/me");
  }

  async login(email: string, password: string) {
    return this.request<{ user: UserResponse }>("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    });
  }

  async register(displayName: string, email: string, password: string) {
    return this.request<{ user: UserResponse }>("/api/v1/auth/register", {
      method: "POST",
      body: { displayName, email, password },
    });
  }

  async getOnboardingStatus() {
    return this.request<OnboardingStatusResponse>("/api/v1/onboarding");
  }

  async completeOnboarding() {
    return this.request<OnboardingStatusResponse>("/api/v1/onboarding", {
      method: "PUT",
      body: { completed: true },
    });
  }

  async logout() {
    await this.request<{ ok: true }>("/api/v1/auth/logout", { method: "POST" }).catch(() => null);
    await this.clearSession();
  }

  async listItems() {
    return this.request<{ items: ItemResponse[] }>("/api/v1/items");
  }

  async createItem(body: JsonRecord) {
    return this.request<{ item: ItemResponse }>("/api/v1/items", { method: "POST", body });
  }

  async tendItem(itemId: string) {
    return this.request<{ item: ItemResponse }>(`/api/v1/items/${itemId}/tend`, {
      method: "POST",
      body: {},
    });
  }

  async listActivity() {
    return this.request<{ events: ActivityEntryResponse[] }>("/api/v1/activity");
  }

  async deleteActivity(eventId: string) {
    return this.request<{ ok: true }>(`/api/v1/activity/${eventId}`, { method: "DELETE" });
  }

  async listAvailability() {
    return this.request<{ windows: AvailabilityWindowResponse[] }>("/api/v1/availability");
  }

  async saveAvailability(windows: AvailabilityWindow[]) {
    return this.request<{ windows: AvailabilityWindowResponse[] }>("/api/v1/availability", {
      method: "PUT",
      body: { windows },
    });
  }

  async getSettings() {
    return this.request<{ settings: UserSettingsResponse }>("/api/v1/settings");
  }

  async saveSettings(body: { timezone: string }) {
    return this.request<{ settings: UserSettingsResponse }>("/api/v1/settings", {
      method: "PUT",
      body,
    });
  }

  async listReminders() {
    return this.request<RemindersResponse>("/api/v1/reminders");
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: JsonRecord } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    if (this.sessionCookie) {
      headers.Cookie = this.sessionCookie;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      throw toNetworkApiError(error, this.baseUrl);
    } finally {
      clearTimeout(timeoutId);
    }

    await this.captureCookie(response);

    if (!response.ok) {
      throw new ApiError(await readApiError(response), response.status);
    }

    return response.json() as Promise<T>;
  }

  private async captureCookie(response: Response) {
    const rawCookie = response.headers.get("set-cookie");
    if (!rawCookie) {
      return;
    }

    const sessionCookie = rawCookie.split(";")[0];
    this.sessionCookie = sessionCookie;
    await storage.setString(SESSION_COOKIE_STORAGE_KEY, sessionCookie);
  }
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}
