import { describe, it, expect, beforeEach } from "vitest";
import {
  PAGE_TEMPLATES,
  listPageTemplates,
  generatePageDocumentFromTemplate,
} from "@/builder/templates/page-templates";
import {
  PagesManagerService,
  sanitizeSlug,
  computeSEOHealth,
} from "@/lib/services/pages-manager.service";
import {
  componentRegistry,
  getComponentDefinition,
} from "@/builder/registry";

describe("Phase 18: Complete Website Pages Management & Architecture", () => {
  beforeEach(() => {
    // Clear localStorage before each test run
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  describe("1. Blueprint Page Templates (12 Templates)", () => {
    it("provides exactly 12 predefined blueprint page templates", () => {
      const templates = listPageTemplates();
      expect(templates).toHaveLength(12);
      const templateKeys = Object.keys(PAGE_TEMPLATES);
      expect(templateKeys).toEqual([
        "home",
        "about",
        "services",
        "service_detail",
        "pricing",
        "team",
        "contact",
        "faq",
        "testimonials",
        "gallery",
        "locations",
        "custom",
      ]);
    });

    it("generates valid PageDocuments using allowlisted components for all 12 templates", () => {
      const templates = listPageTemplates();
      templates.forEach((tpl) => {
        const doc = generatePageDocumentFromTemplate(
          tpl.type,
          "Austin Roofing",
          tpl.defaultSlug,
          tpl.name
        );

        expect(doc.schemaVersion).toBe(1);
        expect(doc.page.title).toBe(tpl.name);
        expect(doc.page.slug).toBe(tpl.defaultSlug);
        expect(doc.sections.length).toBeGreaterThanOrEqual(1);

        // Every section componentId must exist in the component registry
        doc.sections.forEach((sec) => {
          const comp = getComponentDefinition(sec.componentId);
          expect(comp).toBeDefined();
          expect(comp?.id).toBe(sec.componentId);
        });
      });
    });
  });

  describe("2. Slug Sanitization & SEO Health Engine", () => {
    it("sanitizes slugs to URL-safe lowercase kebab-case format", () => {
      expect(sanitizeSlug("About Us")).toBe("/about-us");
      expect(sanitizeSlug("Special Commercial & Residential Roofs! (2026)")).toBe(
        "/special-commercial-residential-roofs-2026"
      );
      expect(sanitizeSlug("///already-slashed///")).toBe("/already-slashed");
      expect(sanitizeSlug("")).toBe("/");
    });

    it("computes accurate SEO health statuses based on title, description, and keywords", () => {
      // Missing
      expect(computeSEOHealth()).toBe("missing");
      expect(
        computeSEOHealth({
          title: "",
          description: "",
          focusKeyword: "",
        })
      ).toBe("missing");

      // Warning: missing focus keyword
      expect(
        computeSEOHealth({
          title: "Short Title Here",
          description: "A short description without focus keywords.",
          focusKeyword: "roofing",
        })
      ).toBe("warning");

      // Good: proper length title (20-70) and description (30-170) containing keyword
      expect(
        computeSEOHealth({
          title: "Professional Austin Commercial Roofing & Repair Services",
          description:
            "Get top-rated commercial roofing services in Austin Texas with 24/7 emergency dispatch and warranty-backed shingles.",
          focusKeyword: "commercial roofing",
        })
      ).toBe("good");
    });
  });

  describe("3. Pages Management CRUD & Website Isolation", () => {
    const siteA = "site_austin_roofing";
    const siteB = "site_dallas_plumbing";

    it("initializes default starter pages for a new website", () => {
      const pagesA = PagesManagerService.getPages(siteA);
      expect(pagesA.length).toBe(4);
      expect(pagesA.some((p) => p.isHome && p.slug === "/")).toBe(true);
      expect(pagesA.some((p) => p.slug === "/services")).toBe(true);
      expect(pagesA.some((p) => p.slug === "/about")).toBe(true);
      expect(pagesA.some((p) => p.slug === "/contact")).toBe(true);
    });

    it("enforces tenant isolation across multiple websites", () => {
      // Create page in site A
      const resA = PagesManagerService.createPage(siteA, {
        title: "Commercial Estimates",
        slug: "/estimates",
        pageType: "pricing",
        description: "Free cost estimator",
        templateId: "pricing",
        inNavigation: true,
        navLabel: "Estimates",
        seo: {
          title: "Roof Estimates Austin",
          description: "Fast free roofing estimates",
          focusKeyword: "estimates",
          ogTitle: "",
          ogDescription: "",
          canonicalUrl: "",
          noIndex: false,
        },
      });
      expect(resA.success).toBe(true);
      expect(resA.page?.slug).toBe("/estimates");

      const pagesA = PagesManagerService.getPages(siteA);
      const pagesB = PagesManagerService.getPages(siteB);

      expect(pagesA.some((p) => p.slug === "/estimates")).toBe(true);
      expect(pagesB.some((p) => p.slug === "/estimates")).toBe(false);

      // Site B can also have /estimates without collision
      const resB = PagesManagerService.createPage(siteB, {
        title: "Plumbing Estimates",
        slug: "/estimates",
        pageType: "pricing",
        description: "Plumbing quote",
        templateId: "pricing",
        inNavigation: true,
        navLabel: "Quotes",
        seo: {
          title: "Plumbing Quotes Dallas",
          description: "Free plumbing quotes",
          focusKeyword: "estimates",
          ogTitle: "",
          ogDescription: "",
          canonicalUrl: "",
          noIndex: false,
        },
      });
      expect(resB.success).toBe(true);
      expect(resB.page?.slug).toBe("/estimates");
    });

    it("rejects duplicate slugs within the same website", () => {
      const res = PagesManagerService.createPage(siteA, {
        title: "About Clone",
        slug: "/about",
        pageType: "about",
        description: "Duplicate slug test",
        templateId: "about",
        inNavigation: false,
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/already in use|already taken/i);
    });

    it("duplicates pages correctly with unique copy slugs and cloned sections", () => {
      const original = PagesManagerService.getPages(siteA).find((p) => p.slug === "/services")!;
      const dupRes = PagesManagerService.duplicatePage(siteA, original.id);

      expect(dupRes.success).toBe(true);
      const duplicated = dupRes.page!;
      expect(duplicated.id).not.toBe(original.id);
      expect(duplicated.title).toBe(`${original.title} (Copy)`);
      expect(duplicated.slug).toBe("/services-copy");
      expect(duplicated.status).toBe("draft");
      expect(duplicated.document?.sections.length).toBe(original.document?.sections.length);
    });

    it("protects the root Home page from deletion", () => {
      const homePage = PagesManagerService.getPages(siteA).find((p) => p.isHome)!;
      const res = PagesManagerService.deletePage(siteA, homePage.id);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/cannot be deleted/i);
    });

    it("deletes a page and removes it from navigation", () => {
      const newPageRes = PagesManagerService.createPage(siteA, {
        title: "FAQ Page",
        slug: "/faq",
        pageType: "faq",
        description: "Frequently asked questions",
        templateId: "faq",
        inNavigation: true,
        navLabel: "FAQ",
      });
      expect(newPageRes.success).toBe(true);
      const newPage = newPageRes.page!;

      let nav = PagesManagerService.getNavigation(siteA);
      expect(nav.some((n) => n.url === "/faq")).toBe(true);

      const delRes = PagesManagerService.deletePage(siteA, newPage.id);
      expect(delRes.success).toBe(true);

      const pages = PagesManagerService.getPages(siteA);
      expect(pages.some((p) => p.id === newPage.id)).toBe(false);

      nav = PagesManagerService.getNavigation(siteA);
      expect(nav.some((n) => n.url === "/faq")).toBe(false);
    });

    it("toggles page publish status cleanly", () => {
      const page = PagesManagerService.getPages(siteA).find((p) => p.slug === "/services")!;
      const initialStatus = page.status;

      const toggleRes = PagesManagerService.togglePublish(siteA, page.id);
      expect(toggleRes.success).toBe(true);
      expect(toggleRes.status).toBe(initialStatus === "published" ? "draft" : "published");
    });
  });

  describe("4. Navigation Sync & Item Ordering", () => {
    const websiteId = "site_navigation_test";

    it("synchronizes navigation items from pages with inNavigation enabled", () => {
      const initialNav = PagesManagerService.getNavigation(websiteId);
      expect(initialNav.length).toBeGreaterThanOrEqual(1);

      // Create a gallery page with inNavigation true
      PagesManagerService.createPage(websiteId, {
        title: "Project Portfolio",
        slug: "/portfolio",
        pageType: "gallery",
        description: "Past projects",
        templateId: "gallery",
        inNavigation: true,
        navLabel: "Portfolio",
      });

      const synced = PagesManagerService.syncNavigationFromPages(websiteId);
      expect(synced.some((n) => n.url === "/portfolio" && n.label === "Portfolio")).toBe(true);
    });

    it("allows reordering and saving customized navigation items", () => {
      const items = [
        { id: "1", label: "Home", url: "/" },
        { id: "2", label: "Services", url: "/services" },
        { id: "3", label: "External Link", url: "https://example.com", isExternal: true },
      ];

      PagesManagerService.saveNavigation(websiteId, items);
      const reloaded = PagesManagerService.getNavigation(websiteId);
      expect(reloaded).toHaveLength(3);
      expect(reloaded[2].isExternal).toBe(true);
    });
  });
});
