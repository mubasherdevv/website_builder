import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Multi-Tenant Hostname Middleware
 * PRD.md Section 8 & STACK.md:
 * Rewrites requests to /site/[domainOrSlug] based on subdomain or custom domain.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Prevent rewriting for internal Next.js assets, API routes, or standard dashboard routes
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Define root/base domains that serve the SaaS dashboard & builder
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "securesite.io";
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");

  // Localhost test patterns: subdomain.localhost:3000
  let currentHost = hostname;
  if (isLocalhost) {
    currentHost = hostname.replace(/:[0-9]+$/, ""); // strip port
  }

  // Check if request is visiting a subdomain
  // e.g. "austin-plumbing.securesite.io" or "austin-plumbing.localhost"
  let subdomain: string | null = null;

  if (isLocalhost) {
    const parts = currentHost.split(".");
    if (parts.length > 1 && parts[0] !== "www" && parts[0] !== "localhost") {
      subdomain = parts[0];
    }
  } else {
    // Production wildcard subdomain
    if (currentHost.endsWith(`.${appDomain}`)) {
      const sub = currentHost.replace(`.${appDomain}`, "");
      if (sub !== "www" && sub !== "app") {
        subdomain = sub;
      }
    } else if (currentHost !== appDomain && currentHost !== `www.${appDomain}`) {
      // Custom custom domain (e.g., austineliteplumbing.com)
      subdomain = currentHost;
    }
  }

  // If a tenant subdomain or custom domain is detected, rewrite to tenant public route
  if (subdomain) {
    return NextResponse.rewrite(
      new URL(`/site/${subdomain}${url.pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

