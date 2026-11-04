/**
 * Shared URL and Domain Utilities
 * Follows improve-backend-code guidelines: clean, reusable, well-tested pure functions.
 */

/**
 * Returns the base application domain from environment or fallback default
 */
export function getAppBaseDomain(): string {
  return process.env.NEXT_PUBLIC_APP_DOMAIN || "securesite.io";
}

/**
 * Strips leading/trailing slashes and normalizes a route slug
 */
export function normalizeSlug(slug: string): string {
  if (!slug || slug === "/" || slug.trim() === "") {
    return "/";
  }
  const trimmed = slug.trim().replace(/^\/+|\/+$/g, "");
  return `/${trimmed}`;
}

/**
 * Strips trailing slash from a URL string
 */
export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Converts a raw name into a DNS-compliant, URL-safe subdomain slug
 */
export function sanitizeSubdomain(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Builds the canonical public URL for a published tenant page
 */
export function buildPublishedUrl(subdomain: string, slug = "/"): string {
  const baseDomain = getAppBaseDomain();
  const cleanSub = sanitizeSubdomain(subdomain);
  const normSlug = normalizeSlug(slug);
  const path = normSlug === "/" ? "" : normSlug;
  return `https://${cleanSub}.${baseDomain}${path}`;
}

