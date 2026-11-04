import { describe, it, expect } from "vitest";
import {
  listTemplates,
  getTemplateById,
  cloneTemplateForWebsite,
} from "@/templates/services/template-clone.service";
import { validatePageDocument } from "@/builder/schemas/document.schema";
import { validateThemeConfig } from "@/themes/schemas/theme.schema";

describe("Template System & Cloning Engine", () => {
  it("provides all 5 pre-built templates with valid schemas", () => {
    const templates = listTemplates();
    expect(templates.length).toBe(5);

    for (const tpl of templates) {
      expect(tpl.id).toBeTruthy();
      expect(tpl.name).toBeTruthy();
      expect(tpl.category).toBeTruthy();

      // Validate template theme
      const themeValidation = validateThemeConfig(tpl.theme);
      expect(themeValidation.success).toBe(true);

      // Validate all pages inside template
      for (const pageDoc of tpl.pages) {
        const pageValidation = validatePageDocument(pageDoc);
        expect(pageValidation.success).toBe(true);
      }
    }
  });

  it("retrieves template by ID or returns null if not found", () => {
    const tpl = getTemplateById("template-local-plumber");
    expect(tpl).not.toBeNull();
    expect(tpl?.name).toBe("Apex Plumbing & Trades");

    const nonExistent = getTemplateById("bad-id");
    expect(nonExistent).toBeNull();
  });

  it("deep clones template and assigns brand new unique IDs to all sections", () => {
    const tpl = getTemplateById("template-local-plumber");
    expect(tpl).not.toBeNull();
    if (!tpl) return;

    const { clonedTheme, clonedPages } = cloneTemplateForWebsite(tpl);

    expect(clonedPages.length).toBe(tpl.pages.length);
    expect(clonedPages[0].page.id).not.toBe(tpl.pages[0].page.id);
    expect(clonedPages[0].page.status).toBe("draft");

    // Ensure all section IDs are newly generated
    const originalSectionIds = tpl.pages[0].sections.map((s) => s.id);
    const clonedSectionIds = clonedPages[0].sections.map((s) => s.id);

    expect(clonedSectionIds.length).toBe(originalSectionIds.length);
    for (let i = 0; i < clonedSectionIds.length; i++) {
      expect(clonedSectionIds[i]).not.toBe(originalSectionIds[i]);
      expect(clonedSectionIds[i].startsWith("sec_")).toBe(true);
    }

    // Verify theme clone
    expect(clonedTheme.id).toBe(tpl.theme.id);
  });

  it("injects business overrides into cloned page components", () => {
    const tpl = getTemplateById("template-digital-agency");
    expect(tpl).not.toBeNull();
    if (!tpl) return;

    const overrides = {
      businessName: "Lone Star Growth Lab",
      phone: "(512) 999-8877",
      email: "growth@lonestar.com",
      address: "123 Congress Ave, Austin, TX",
    };

    const { clonedPages } = cloneTemplateForWebsite(tpl, overrides);
    const headerSection = clonedPages[0].sections.find(
      (s) => s.componentId === "header.simple.v1"
    );
    expect(headerSection?.props.brandName).toBe("Lone Star Growth Lab");

    const contactSection = clonedPages[0].sections.find(
      (s) => s.componentId === "contact.form.v1"
    );
    expect(contactSection?.props.phone).toBe("(512) 999-8877");
    expect(contactSection?.props.email).toBe("growth@lonestar.com");
    expect(contactSection?.props.address).toBe("123 Congress Ave, Austin, TX");
  });

  it("verifies template immutability (edits to cloned page never mutate original)", () => {
    const tpl = getTemplateById("template-bistro-restaurant");
    expect(tpl).not.toBeNull();
    if (!tpl) return;

    const originalTitle = tpl.pages[0].sections[1].props.title;
    const { clonedPages } = cloneTemplateForWebsite(tpl);

    // Mutate clone
    clonedPages[0].sections[1].props.title = "Completely Mutated Clone Title";

    // Original must be untouched
    expect(tpl.pages[0].sections[1].props.title).toBe(originalTitle);
  });
});
