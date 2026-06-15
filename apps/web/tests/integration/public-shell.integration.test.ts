import { describe, expect, it } from "bun:test";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

function requestFor(path: string, host = "localhost", cookie?: string): NextRequest {
  const headers: Record<string, string> = { host };
  if (cookie) {
    headers.cookie = cookie;
  }

  return new NextRequest(`http://${host}${path}`, { headers });
}

describe("middleware public shell", () => {
  it("allows unauthenticated GET / without redirect", async () => {
    const response = await middleware(requestFor("/"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated GET /privacy and /terms without redirect", async () => {
    for (const path of ["/privacy", "/terms"]) {
      const response = await middleware(requestFor(path));
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("redirects unauthenticated GET /activity to login", async () => {
    const response = await middleware(requestFor("/activity"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });

  it("returns 401 for unauthenticated API requests", async () => {
    const response = await middleware(requestFor("/api/v1/items"));
    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("Unauthorized");
  });
});

describe("middleware host split", () => {
  it("allows marketing host landing and legal pages", async () => {
    for (const path of ["/", "/privacy", "/terms"]) {
      const response = await middleware(requestFor(path, "tend.qzz.io"));
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("redirects marketing host auth and app routes to the app domain", async () => {
    for (const path of ["/login", "/register", "/activity", "/api/v1/health"]) {
      const response = await middleware(requestFor(path, "tend.qzz.io"));
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(`https://app.tend.qzz.io${path}`);
    }
  });

  it("redirects app host legal pages to the marketing domain", async () => {
    for (const path of ["/privacy", "/terms"]) {
      const response = await middleware(requestFor(path, "app.tend.qzz.io"));
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(`https://tend.qzz.io${path}`);
    }
  });

  it("keeps app host auth routes on the app domain", async () => {
    const response = await middleware(requestFor("/login", "app.tend.qzz.io"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects vercel.app traffic to the app domain", async () => {
    const response = await middleware(requestFor("/login", "tend.vercel.app"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://app.tend.qzz.io/login");
  });
});
