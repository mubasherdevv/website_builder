import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter } from "@/lib/security/rate-limiter";
import { validatePageDocument } from "@/builder/schemas/document.schema";
import { localServiceTemplate } from "@/templates/definitions/local-service.template";
import { PageDocument } from "@/types/builder";

describe("Phase 13: Security Hardening & Rate Limiting", () => {
  beforeEach(() => {
    RateLimiter.reset();
  });

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
});

