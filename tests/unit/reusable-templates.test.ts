import { describe, it, expect } from "vitest";
import {
  listTemplates,
  getTemplateById,
  cloneTemplateForWebsite,
} from "@/templates/services/template-clone.service";
import {
  listRegisteredComponents,
  getComponentDefinition,
  validateComponentProps,
} from "@/builder/registry";
import { validatePageDocument } from "@/builder/schemas/document.schema";
import { validateThemeConfig } from "@/themes/schemas/theme.schema";

describe("Reusable Website Template & Component Architecture", () => {
  it("registers 11 unique, allowlisted reusable components", () => {
    const components = listRegisteredComponents();
    expect(components.length).toBeGreaterThanOrEqual(11);

    const ids = components.map((c) => c.id);
    expect(ids).toContain("header.simple.v1");
    expect(ids).toContain("hero.split.v1");
    expect(ids).toContain("services.grid.v1");
    expect(ids).toContain("testimonials.cards.v1");
    expect(ids).toContain("contact.form.v1");
    expect(ids).toContain("footer.simple.v1");
    expect(ids).toContain("about.split.v1");
    expect(ids).toContain("features.grid.v1");
    expect(ids).toContain("gallery.grid.v1");
    expect(ids).toContain("cta.banner.v1");
    expect(ids).toContain("custom.embed.v1");
  });

  it("validates component layout variants and props correctly", () => {
    // Test Hero layout variants
    const heroSplitRes = validateComponentProps("hero.split.v1", {
      variant: "split",
      title: "Hero Title",
    });
    expect(heroSplitRes.success).toBe(true);

    const heroCenteredRes = validateComponentProps("hero.split.v1", {
      variant: "centered",
      title: "Centered Title",
    });
    expect(heroCenteredRes.success).toBe(true);

    // Test Services column options and cardStyle
    const servicesGridRes = validateComponentProps("services.grid.v1", {
      columns: "4",
      cardStyle: "boxed",
      services: [
        { title: "Service 1", description: "Desc 1" },
        { title: "Service 2", description: "Desc 2" },
      ],
    });
    expect(servicesGridRes.success).toBe(true);

    // Test Features Grid
    const featuresRes = validateComponentProps("features.grid.v1", {
      title: "Key Features",
      columns: "3",
      features: [
        { title: "Speed", description: "Lightning fast execution" },
      ],
    });
    expect(featuresRes.success).toBe(true);

    // Test Gallery Grid
    const galleryRes = validateComponentProps("gallery.grid.v1", {
      title: "Project Showcase",
      aspectRatio: "video",
      items: [
        { title: "Office A", imageUrl: "https://images.unsplash.com/photo-1" },
      ],
    });
    expect(galleryRes.success).toBe(true);

    // Test CTA Banner
    const ctaRes = validateComponentProps("cta.banner.v1", {
      title: "Ready to scale?",
      theme: "gradient",
      primaryButtonText: "Get Started Now",
    });
    expect(ctaRes.success).toBe(true);
  });

  it("provides 5 complete templates across distinct professional verticals", () => {
    const templates = listTemplates();
    expect(templates.length).toBe(5);

    const expectedIds = [
      "template-local-plumber",
      "template-digital-agency",
      "template-bistro-restaurant",
      "template-corporate-advisory",
      "template-wellness-clinic",
    ];

    for (const id of expectedIds) {
      const tpl = getTemplateById(id);
      expect(tpl).not.toBeNull();
      expect(tpl?.pages.length).toBeGreaterThanOrEqual(1);
      expect(tpl?.navigation.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("performs multi-page deep cloning with unique IDs and tenant details override", () => {
    const corporateTpl = getTemplateById("template-corporate-advisory");
    expect(corporateTpl).not.toBeNull();
    if (!corporateTpl) return;

    const originalHomeSectionCount = corporateTpl.pages[0].sections.length;
    const originalFirstSectionId = corporateTpl.pages[0].sections[0].id;

    // Clone for customer
    const customerDetails = {
      businessName: "Summit Global Consulting",
      phone: "(800) 555-8899",
      email: "hello@summitglobal.com",
      address: "500 5th Avenue, New York, NY",
    };

    const { clonedPages, clonedTheme } = cloneTemplateForWebsite(corporateTpl, customerDetails);

    // Verify all pages are cloned
    expect(clonedPages.length).toBe(corporateTpl.pages.length);

    // Verify IDs are regenerated
    expect(clonedPages[0].page.id).not.toBe(corporateTpl.pages[0].page.id);
    expect(clonedPages[0].sections[0].id).not.toBe(originalFirstSectionId);

    // Verify original template is completely untouched
    expect(corporateTpl.pages[0].sections.length).toBe(originalHomeSectionCount);
    expect(corporateTpl.pages[0].sections[0].id).toBe(originalFirstSectionId);

    // Verify all cloned pages validate against schema
    for (const page of clonedPages) {
      const validation = validatePageDocument(page);
      expect(validation.success).toBe(true);
    }

    // Verify cloned theme validates
    const themeValidation = validateThemeConfig(clonedTheme);
    expect(themeValidation.success).toBe(true);
  });

  it("guarantees theme isolation between customer and template", () => {
    const agencyTpl = getTemplateById("template-digital-agency");
    expect(agencyTpl).not.toBeNull();
    if (!agencyTpl) return;

    const originalPrimary = agencyTpl.theme.colors.primary;

    const { clonedTheme } = cloneTemplateForWebsite(agencyTpl);
    clonedTheme.colors.primary = "#000000";

    // Original must remain intact
    expect(agencyTpl.theme.colors.primary).toBe(originalPrimary);
    expect(agencyTpl.theme.colors.primary).not.toBe("#000000");
  });
});
