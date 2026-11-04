import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

// In-memory sliding window rate limiter
const ipRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRateLimits.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRateLimits.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  ipRateLimits.set(ip, validTimestamps);
  return false;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // 1. Skip static assets, Next.js build files, and favicon
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. IP-based Rate Limiting Guard
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (isRateLimited(clientIp)) {
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "You have exceeded the allowed request rate. Please try again shortly.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  }

  // 3. Session Authentication Guard for Protected Routes
  const { user, response } = await createMiddlewareSupabaseClient(request);

  const isProtectedRoute =
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/websites") ||
    url.pathname.startsWith("/admin");

  const isAuthRoute =
    url.pathname === "/login" ||
    url.pathname === "/signup" ||
    url.pathname === "/forgot-password";

  // If visiting protected route without session -> redirect to /login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting auth pages -> redirect to /dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Exclude core platform application routes from tenant rewriting
  const isPlatformRoute =
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/forgot-password") ||
    url.pathname.startsWith("/reset-password") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/websites") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/site");

  if (isPlatformRoute) {
    return response;
  }

  // 5. Multi-Tenant Hostname Rewriting (PRD.md Section 8 & STACK.md)
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "securesite.io";
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const isVercel = hostname.includes("vercel.app");

  let currentHost = hostname;
  if (isLocalhost) {
    currentHost = hostname.replace(/:[0-9]+$/, ""); // strip port
  }

  // If this is a primary deployment host (localhost, Vercel app domain, or production app domain),
  // do NOT rewrite the platform routes or home page into a tenant site
  const isPrimaryAppHost =
    (isLocalhost && (currentHost === "localhost" || currentHost === "127.0.0.1")) ||
    isVercel ||
    currentHost === appDomain ||
    currentHost === `www.${appDomain}`;

  if (isPrimaryAppHost) {
    return response;
  }

  let subdomain: string | null = null;
  if (isLocalhost) {
    const parts = currentHost.split(".");
    if (parts.length > 1 && parts[0] !== "www" && parts[0] !== "localhost") {
      subdomain = parts[0];
    }
  } else {
    if (currentHost.endsWith(`.${appDomain}`)) {
      const sub = currentHost.replace(`.${appDomain}`, "");
      if (sub !== "www" && sub !== "app") {
        subdomain = sub;
      }
    } else if (currentHost !== appDomain && currentHost !== `www.${appDomain}`) {
      subdomain = currentHost;
    }
  }

  if (subdomain) {
    return NextResponse.rewrite(
      new URL(`/site/${subdomain}${url.pathname}`, request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files & images
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
