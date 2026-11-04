import { describe, it, expect, beforeEach } from "vitest";
import { SEOManagerService } from "@/lib/services/seo-manager.service";
import { CMSPageItem } from "@/types/cms";
import { BlogPost } from "@/types/blog";
import { SEOSchemaConfig } from "@/types/seo";

describe("SEO Management & Technical Search Engine Engine", () => {
  const websiteId = "test-site-seo-101";

  beforeEach(() => {
    // Clear storage keys for clean tests
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe("Redirect Validation & Loop Detection", () => {
    it("should accept valid 301 and 302 redirects", () => {
      const res = SEOManagerService.validateRedirect(websiteId, {
        websiteId,
        sourcePath: "/old-blog-post",
        destinationPath: "/blog/new-post",
        statusCode: 301,
        isActive: true,
      });

      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("should reject source paths that do not start with a slash", () => {
      const res = SEOManagerService.validateRedirect(websiteId, {
        websiteId,
        sourcePath: "old-path-no-slash",
        destinationPath: "/new-path",
        statusCode: 301,
        isActive: true,
      });

      expect(res.valid).toBe(false);
      expect(res.error).toContain("must start with a forward slash");
    });

    it("should reject self-redirects where source and destination are identical", () => {
      const res = SEOManagerService.validateRedirect(websiteId, {
        websiteId,
        sourcePath: "/services",
        destinationPath: "/services",
        statusCode: 301,
        isActive: true,
      });

      expect(res.valid).toBe(false);
      expect(res.error).toContain("Self-redirect");
    });

    it("should reject duplicate source paths within the same website", () => {
      // Add initial redirect
      SEOManagerService.addRedirect(websiteId, {
        websiteId,
        sourcePath: "/pricing-2023",
        destinationPath: "/pricing",
        statusCode: 301,
        isActive: true,
      });

      // Try adding same source path
      const res = SEOManagerService.validateRedirect(websiteId, {
        websiteId,
        sourcePath: "/pricing-2023",
        destinationPath: "/plans",
        statusCode: 302,
        isActive: true,
      });

      expect(res.valid).toBe(false);
      expect(res.error).toContain("already exists");
    });

    it("should detect direct redirect loops (A -> B and B -> A)", () => {
      SEOManagerService.addRedirect(websiteId, {
        websiteId,
        sourcePath: "/page-a",
        destinationPath: "/page-b",
        statusCode: 301,
        isActive: true,
      });

      const res = SEOManagerService.validateRedirect(websiteId, {
        websiteId,
        sourcePath: "/page-b",
        destinationPath: "/page-a",
        statusCode: 301,
        isActive: true,
      });

      expect(res.valid).toBe(false);
      expect(res.error).toContain("Redirect loop detected");
    });

    it("should detect circular redirect chains (A -> B -> C -> A)", () => {
      SEOManagerService.addRedirect(websiteId, {
        websiteId,
        sourcePath: "/path-1",
        destinationPath: "/path-2",
        statusCode: 301,
        isActive: true,
      });

      SEOManagerService.addRedirect(websiteId, {
        websiteId,
        sourcePath: "/path-2",
        destinationPath: "/path-3",
        statusCode: 301,
        isActive: true,
      });

      const res = SEOManagerService.validateRedirect(websiteId, {
        websiteId,
        sourcePath: "/path-3",
        destinationPath: "/path-1",
        statusCode: 301,
        isActive: true,
      });

      expect(res.valid).toBe(false);
      expect(res.error).toContain("Circular redirect chain detected");
    });
  });

  describe("Dynamic XML Sitemap Generator", () => {
    const pages: CMSPageItem[] = [
      {
        id: "p1",
        websiteId,
        title: "Home",
        slug: "/",
        status: "published",
        updatedAt: "2026-11-01T12:00:00Z",
        isHome: true,
        seo: {
          title: "Austin Pro Roofing",
          description: "Top rated roofing contractors in Austin.",
          noIndex: false,
        },
      },
      {
        id: "p2",
        websiteId,
        title: "About",
        slug: "/about",
        status: "published",
        updatedAt: "2026-11-02T12:00:00Z",
        seo: {
          title: "About Us",
          description: "Family owned and operated since 2005.",
          noIndex: false,
        },
      },
      {
        id: "p3_draft",
        websiteId,
        title: "Secret Draft Page",
        slug: "/draft-promo",
        status: "draft",
        updatedAt: "2026-11-03T12:00:00Z",
      },
      {
        id: "p4_noindex",
        websiteId,
        title: "Thank You Confirmation",
        slug: "/thank-you",
        status: "published",
        updatedAt: "2026-11-03T12:00:00Z",
        seo: {
          title: "Thank You",
          description: "Thank you for contacting us.",
          noIndex: true, // Should be excluded from sitemap
        },
      },
    ];

    const posts: BlogPost[] = [
      {
        id: "b1",
        websiteId,
        title: "Roof Maintenance 101",
        slug: "roof-maintenance-tips",
        excerpt: "Essential tips for Texas homeowners.",
        content: { version: 1, blocks: [] },
        featuredImage: "https://example.com/img.jpg",
        author: { id: "a1", name: "John Doe" },
        tagIds: [],
        status: "published",
        publishedAt: "2026-11-01T10:00:00Z",
        scheduledAt: null,
        readingTimeMinutes: 4,
        createdAt: "2026-11-01T10:00:00Z",
        updatedAt: "2026-11-01T10:00:00Z",
        seo: {
          metaTitle: "Roof Maintenance Tips",
          metaDescription: "Tips for Texas homes.",
          focusKeyword: "roof maintenance",
          noIndex: false,
        },
        seoStatus: "good",
      },
      {
        id: "b2_draft",
        websiteId,
        title: "Unpublished Blog Post",
        slug: "unpublished-draft",
        excerpt: "Draft excerpt.",
        content: { version: 1, blocks: [] },
        featuredImage: "",
        author: { id: "a1", name: "John Doe" },
        tagIds: [],
        status: "draft",
        publishedAt: null,
        scheduledAt: null,
        readingTimeMinutes: 2,
        createdAt: "2026-11-01T10:00:00Z",
        updatedAt: "2026-11-01T10:00:00Z",
        seo: {
          metaTitle: "Draft",
          metaDescription: "Draft desc",
          focusKeyword: "",
          noIndex: false,
        },
        seoStatus: "warning",
      },
    ];

    it("should generate a valid XML sitemap containing only published and indexable items", () => {
      const xml = SEOManagerService.generateSitemapXml("https://austinroofing.com", pages, posts);

      expect(xml).toContain(`<?xml version="1.0" encoding="UTF-8"?>`);
      expect(xml).toContain(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);

      // Homepage & published page included
      expect(xml).toContain(`<loc>https://austinroofing.com</loc>`);
      expect(xml).toContain(`<loc>https://austinroofing.com/about</loc>`);

      // Published blog post included
      expect(xml).toContain(`<loc>https://austinroofing.com/blog/roof-maintenance-tips</loc>`);

      // Draft page and noindex page MUST NOT appear
      expect(xml).not.toContain("draft-promo");
      expect(xml).not.toContain("thank-you");

      // Draft blog post MUST NOT appear
      expect(xml).not.toContain("unpublished-draft");
    });
  });

  describe("Dynamic Robots.txt Generator", () => {
    it("should generate valid robots.txt protecting private areas and linking sitemap", () => {
      const robots = SEOManagerService.generateRobotsTxt("https://mybusiness.securesite.io");

      expect(robots).toContain("User-agent: *");
      expect(robots).toContain("Allow: /");
      expect(robots).toContain("Disallow: /dashboard/");
      expect(robots).toContain("Disallow: /admin/");
      expect(robots).toContain("Disallow: /editor/");
      expect(robots).toContain("Sitemap: https://mybusiness.securesite.io/sitemap.xml");
    });
  });

  describe("Structured Data (Schema.org JSON-LD)", () => {
    it("should produce valid LocalBusiness schema without arbitrary script injection", () => {
      const config: SEOSchemaConfig = {
        id: "local_1",
        websiteId,
        schemaType: "LocalBusiness",
        isActive: true,
        name: "Austin Pro Roofing",
        legalName: "Austin Pro Roofing LLC",
        url: "https://austinroofing.com",
        telephone: "(512) 555-0199",
        email: "info@austinroofing.com",
        address: {
          street: "701 Brazos St",
          city: "Austin",
          state: "TX",
          postalCode: "78701",
          country: "US",
        },
        priceRange: "$$",
        openingHours: ["Mo-Sa 08:00-18:00"],
      };

      const jsonLd = SEOManagerService.generateJsonLd(config);

      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toBe("LocalBusiness");
      expect(jsonLd.name).toBe("Austin Pro Roofing");
      expect(jsonLd.telephone).toBe("(512) 555-0199");
      expect(jsonLd.priceRange).toBe("$$");
      expect(jsonLd.address).toBeDefined();
    });

    it("should produce valid FAQPage schema", () => {
      const config: SEOSchemaConfig = {
        id: "faq_1",
        websiteId,
        schemaType: "FAQPage",
        isActive: true,
        faqItems: [
          { question: "How long does a roof last?", answer: "Between 20 and 30 years." },
          { question: "Do you offer free estimates?", answer: "Yes, 100% free with no obligation." },
        ],
      };

      const jsonLd = SEOManagerService.generateJsonLd(config);

      expect(jsonLd["@type"]).toBe("FAQPage");
      expect(Array.isArray(jsonLd.mainEntity)).toBe(true);
      expect((jsonLd.mainEntity as any[]).length).toBe(2);
      expect((jsonLd.mainEntity as any[])[0].name).toBe("How long does a roof last?");
    });
  });
});

