import { describe, it, expect, vi, beforeEach } from "vitest";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

// Mock middleware supabase client helper
vi.mock("@/lib/supabase/middleware", () => ({
  createMiddlewareSupabaseClient: vi.fn(),
}));

import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

describe("Middleware Session Guard & Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect unauthenticated users trying to access /dashboard to /login", async () => {
    (createMiddlewareSupabaseClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: null,
      response: { headers: new Headers() },
    });

    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: { host: "localhost:3000" },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?redirect=%2Fdashboard");
  });

  it("should redirect unauthenticated users trying to access /websites/my-site-1/forms to /login", async () => {
    (createMiddlewareSupabaseClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: null,
      response: { headers: new Headers() },
    });

    const req = new NextRequest("http://localhost:3000/websites/my-site-1/forms", {
      headers: { host: "localhost:3000" },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?redirect=%2Fwebsites%2Fmy-site-1%2Fforms");
  });

  it("should allow authenticated users to access /dashboard", async () => {
    (createMiddlewareSupabaseClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_123", email: "paneer@securesite.io" },
      response: new Response(),
    });

    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: { host: "localhost:3000" },
    });

    const res = await middleware(req);
    expect(res.status).not.toBe(307);
  });

  it("should redirect authenticated user away from /login to /dashboard", async () => {
    (createMiddlewareSupabaseClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_123", email: "paneer@securesite.io" },
      response: new Response(),
    });

    const req = new NextRequest("http://localhost:3000/login", {
      headers: { host: "localhost:3000" },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });
});

