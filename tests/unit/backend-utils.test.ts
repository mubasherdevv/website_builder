import { describe, it, expect } from "vitest";
import {
  normalizeSlug,
  sanitizeSubdomain,
  stripTrailingSlash,
  buildPublishedUrl,
  getAppBaseDomain,
} from "@/lib/utils/url";
import { generateEntityId, generateRevisionId } from "@/lib/utils/id";
import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from "@/server/errors";

describe("Backend Code Quality & Architecture Utilities", () => {
  describe("URL & Domain Utilities", () => {
    it("normalizes root and nested slugs properly", () => {
      expect(normalizeSlug("")).toBe("/");
      expect(normalizeSlug("/")).toBe("/");
      expect(normalizeSlug("services")).toBe("/services");
      expect(normalizeSlug("/services/")).toBe("/services");
      expect(normalizeSlug("//blog/post-1//")).toBe("/blog/post-1");
    });

    it("sanitizes subdomains to DNS-compliant lowercase format", () => {
      expect(sanitizeSubdomain("Austin Elite Plumbing")).toBe("austin-elite-plumbing");
      expect(sanitizeSubdomain("  --Nexa Agency 2026-- ")).toBe("nexa-agency-2026");
      expect(sanitizeSubdomain("Café & Bistro!")).toBe("caf-bistro");
    });

    it("strips trailing slashes from URLs", () => {
      expect(stripTrailingSlash("https://example.com/")).toBe("https://example.com");
      expect(stripTrailingSlash("https://example.com/path//")).toBe("https://example.com/path");
    });

    it("builds published tenant URLs correctly", () => {
      const url = buildPublishedUrl("austin-plumbing", "/services");
      expect(url).toBe(`https://austin-plumbing.${getAppBaseDomain()}/services`);

      const rootUrl = buildPublishedUrl("austin-plumbing", "/");
      expect(rootUrl).toBe(`https://austin-plumbing.${getAppBaseDomain()}`);
    });
  });

  describe("ID Utilities", () => {
    it("generates entity IDs with given prefix", () => {
      const pageId = generateEntityId("page");
      expect(pageId).toMatch(/^page_[a-z0-9]{8}$/);

      const siteId = generateEntityId("site");
      expect(siteId).toMatch(/^site_[a-z0-9]{8}$/);
    });

    it("generates structured revision IDs", () => {
      const revId = generateRevisionId("page-1", 4);
      expect(revId).toMatch(/^rev_page-1_4_\d+$/);
    });
  });

  describe("Domain Errors", () => {
    it("instantiates custom errors with correct HTTP status codes", () => {
      const notFound = new NotFoundError("Page", "p-123");
      expect(notFound.statusCode).toBe(404);
      expect(notFound.code).toBe("NOT_FOUND");
      expect(notFound.message).toContain("Page not found: p-123");

      const validation = new ValidationError("Invalid format", ["field1 required"]);
      expect(validation.statusCode).toBe(400);
      expect(validation.errors).toEqual(["field1 required"]);

      const conflict = new ConflictError("Subdomain in use");
      expect(conflict.statusCode).toBe(409);

      const unauth = new UnauthorizedError();
      expect(unauth.statusCode).toBe(401);

      expect(notFound instanceof AppError).toBe(true);
      expect(notFound instanceof Error).toBe(true);
    });
  });
});

