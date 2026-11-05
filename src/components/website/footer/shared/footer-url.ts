const RELATIVE_URL_RE = /^\/(?!\/)[^\u0000-\u001F\s]*$/;
const HASH_URL_RE = /^#[A-Za-z0-9_-]*$/;
const ABSOLUTE_URL_RE = /^(https?:|mailto:|tel:)/i;

const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;

/**
 * Returns a safe href for rendered links, or null when the value is unsafe.
 * Relative links, hash anchors and http/https/mailto/tel URLs are allowed.
 */
export function sanitizeFooterHref(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) return null;

  if (RELATIVE_URL_RE.test(trimmed) || HASH_URL_RE.test(trimmed)) {
    return trimmed;
  }

  if (ABSOLUTE_URL_RE.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol)) {
        return trimmed;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function isSafeFetchEndpoint(value: string | null | undefined): boolean {
  if (!value) return false;

  const trimmed = value.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) return false;

  if (RELATIVE_URL_RE.test(trimmed)) {
    return true;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }

  return false;
}

export function sanitizeFooterImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) return null;

  if (RELATIVE_URL_RE.test(trimmed)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? trimmed : null;
    } catch {
      return null;
    }
  }

  return null;
}
