import { describe, it, expect } from "vitest";
import { SEOService } from "@/server/services/seo.service";
import { AIGeneratorService } from "@/lib/ai/ai-generator.service";
import { CMSPageItem } from "@/types/cms";
import { validatePageDocument } from "@/builder/schemas/document.schema";

describe("Phase 9: Technical SEO Service", () => {
  it("generates Schema.org LocalBusiness JSON-LD markup", () => {
    const meta = {
      title: "Austin Pro Roofing",
      description: "Best roofing in Austin",
      businessName: "Austin Pro Roofing Co.",
      telephone: "(512) 555-0199",
      address: "100 Main St, Austin, TX",
      canonicalUrl: "https://austinroof.com",
      noIndex: false,
      noFollow: false,
    };

    const schema = SEOService.generateLocalBusinessSchema(meta);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.name).toBe("Austin Pro Roofing Co.");
    expect(schema.telephone).toBe("(512) 555-0199");
    expect((schema.address as any)?.streetAddress).toBe("100 Main St, Austin, TX");
  });

  it("generates XML sitemap EXCLUDING draft pages per PRD.md Section 11", () => {
    const pages: (CMSPageItem & { noIndex?: boolean })[] = [
      { id: "1", websiteId: "s1", title: "Home", slug: "/", status: "published", updatedAt: "today", isHome: true },
      { id: "2", websiteId: "s1", title: "Services", slug: "/services", status: "published", updatedAt: "today" },
      { id: "3", websiteId: "s1", title: "Secret Draft", slug: "/secret-draft", status: "draft", updatedAt: "today" },
      { id: "4", websiteId: "s1", title: "NoIndex Page", slug: "/private", status: "published", noIndex: true, updatedAt: "today" },
    ];

    const sitemap = SEOService.generateXmlSitemap("https://austinroof.com", pages);

    expect(sitemap).toContain("<loc>https://austinroof.com</loc>");
    expect(sitemap).toContain("<loc>https://austinroof.com/services</loc>");
    // Draft page must NOT appear
    expect(sitemap).not.toContain("secret-draft");
    // noIndex page must NOT appear
    expect(sitemap).not.toContain("private");
  });

  it("generates robots.txt with sitemap reference", () => {
    const robots = SEOService.generateRobotsTxt("https://austinroof.com");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://austinroof.com/sitemap.xml");

    const noIndexRobots = SEOService.generateRobotsTxt("https://austinroof.com", true);
    expect(noIndexRobots).toContain("Disallow: /");
  });
});

describe("Phase 10: AI Website Generation Engine", () => {
  it("generates schema-compliant proposal strictly using approved component IDs", async () => {
    const proposal = await AIGeneratorService.generateWebsiteProposal({
      businessName: "Lone Star Emergency Plumbers",
      niche: "Plumbing Contractor",
      location: "San Antonio, TX",
      phone: "(210) 555-0198",
      services: ["Water Heater Repair", "Drain Cleaning", "Leak Detection"],
      brandTone: "professional",
    });

    expect(proposal.websiteName).toBe("Lone Star Emergency Plumbers");
    expect(proposal.pages.length).toBe(1);

    const homePage = proposal.pages[0];
    expect(homePage.page.status).toBe("draft"); // Draft status required per PRD.md Section 5.2
    expect(homePage.sections.length).toBe(6);

    // Verify all generated sections use approved component IDs
    const componentIds = homePage.sections.map((s) => s.componentId);
    expect(componentIds).toContain("header.simple.v1");
    expect(componentIds).toContain("hero.split.v1");
    expect(componentIds).toContain("services.grid.v1");
    expect(componentIds).toContain("testimonials.cards.v1");
    expect(componentIds).toContain("contact.form.v1");
    expect(componentIds).toContain("footer.simple.v1");

    // Full validation against Zod PageDocumentSchema
    const validation = validatePageDocument(homePage);
    expect(validation.success).toBe(true);
  });

  it("picks matching theme preset based on industry niche", async () => {
    // Dental / Health should pick cleanTealPreset
    const dental = await AIGeneratorService.generateWebsiteProposal({
      businessName: "Cedar Park Dental",
      niche: "Dental Clinic",
      location: "Austin, TX",
      services: ["Teeth Whitening", "Implants"],
      brandTone: "friendly",
    });
    expect(dental.theme.id).toBe("theme-clean-teal");

    // Roofing / Contractor should pick deepSlatePreset
    const roofing = await AIGeneratorService.generateWebsiteProposal({
      businessName: "Apex Roofers",
      niche: "Roofing Contractor",
      location: "Austin, TX",
      services: ["Shingle Repair"],
      brandTone: "professional",
    });
    expect(roofing.theme.id).toBe("theme-deep-slate");
  });
});

