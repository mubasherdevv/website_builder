/**
 * SSRF & Domain Boundary Guard for SEO Audit Crawler
 * Strictly confines crawls to the website's authorized domain,
 * blocking private networks, loopbacks, and cloud metadata.
 */

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  normalizedUrl?: string;
}

export function validateCrawlUrl(rawUrl: string, allowedHostnames: string[]): ValidationResult {
  try {
    const url = new URL(rawUrl);

    // 1. Enforce HTTP or HTTPS
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { allowed: false, reason: `Unsupported protocol: ${url.protocol}` };
    }

    const host = url.hostname.toLowerCase();
    const cleanAllowed = allowedHostnames.map((h) => h.toLowerCase().trim());

    // 2. Block loopback and local networks unless explicitly allowed (e.g. in local development)
    const isExplicitlyAllowedLocal = cleanAllowed.some(
      (h) => h === "localhost" || h === "127.0.0.1"
    );

    if (!isExplicitlyAllowedLocal) {
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host === "::1" ||
        host.endsWith(".local") ||
        host.endsWith(".internal")
      ) {
        return { allowed: false, reason: "Localhost and loopback domains are strictly blocked" };
      }
    }

    // 3. Block Private CIDRs & Cloud Metadata
    if (
      host === "169.254.169.254" || // AWS / GCP / Azure metadata
      host === "metadata.google.internal" ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return { allowed: false, reason: "Private network and metadata endpoints are blocked" };
    }

    // 4. Must match allowed website hostnames
    const isMatched = cleanAllowed.some((allowed) => {
      if (host === allowed) return true;
      if (host.endsWith(`.${allowed}`)) return true;
      return false;
    });

    if (!isMatched) {
      return {
        allowed: false,
        reason: `Target host "${host}" does not belong to authorized domains: [${cleanAllowed.join(", ")}]`,
      };
    }

    // 5. Block private system/editor routes
    const path = url.pathname.toLowerCase();
    if (
      path === "/api" ||
      path.startsWith("/api/") ||
      path === "/admin" ||
      path.startsWith("/admin/") ||
      path === "/dashboard" ||
      path.startsWith("/dashboard/") ||
      path.includes("/editor/")
    ) {
      return { allowed: false, reason: `Private path "${path}" is excluded from public crawls` };
    }

    // Normalize URL: remove hash, strip trailing slash unless root
    url.hash = "";
    let cleanPath = url.pathname;
    if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
      cleanPath = cleanPath.slice(0, -1);
    }
    url.pathname = cleanPath;

    return {
      allowed: true,
      normalizedUrl: url.toString(),
    };
  } catch (e) {
    return { allowed: false, reason: `Invalid URL format: ${e instanceof Error ? e.message : "Malformed"}` };
  }
}

