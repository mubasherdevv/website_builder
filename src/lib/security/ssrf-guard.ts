import { URL } from "url";

/**
 * Checks if a hostname or IP address resolves to a private, loopback, or metadata address.
 */
export function isPrivateOrLocalAddress(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  // Localhost checks
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  // Cloud metadata endpoint (AWS, GCP, Azure, DigitalOcean, etc.)
  if (host === "169.254.169.254" || host.startsWith("169.254.")) {
    return true;
  }

  // IPv4 Private Address Blocks:
  // 10.0.0.0/8
  // 172.16.0.0/12
  // 192.168.0.0/16
  const ipParts = host.split(".").map(Number);
  if (ipParts.length === 4 && ipParts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    // 10.0.0.0/8
    if (ipParts[0] === 10) return true;

    // 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
    if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return true;

    // 192.168.0.0/16
    if (ipParts[0] === 192 && ipParts[1] === 168) return true;

    // 127.0.0.0/8 (Loopback)
    if (ipParts[0] === 127) return true;

    // 0.0.0.0/8
    if (ipParts[0] === 0) return true;
  }

  return false;
}

/**
 * Validates a custom AI Base URL for security and protocol compliance.
 * Throws an error if invalid, insecure, or pointing to private infrastructure.
 */
export function validateCustomAiBaseUrl(rawUrl: string): { valid: boolean; error?: string; parsedUrl?: string } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, error: "Base URL is required" };
  }

  try {
    const parsed = new URL(rawUrl.trim());

    // Protocol validation
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { valid: false, error: "Invalid protocol: Base URL must use HTTPS (or HTTP for verified dev proxies)" };
    }

    // Block private/local networks
    if (isPrivateOrLocalAddress(parsed.hostname)) {
      return { valid: false, error: "Security restriction: Localhost, private networks, and cloud metadata endpoints are strictly blocked" };
    }

    // Clean up trailing slash
    let sanitized = parsed.origin + parsed.pathname;
    if (sanitized.endsWith("/")) {
      sanitized = sanitized.slice(0, -1);
    }

    return { valid: true, parsedUrl: sanitized };
  } catch {
    return { valid: false, error: "Malformed URL format. Please provide a valid URL like https://api.together.xyz/v1" };
  }
}

