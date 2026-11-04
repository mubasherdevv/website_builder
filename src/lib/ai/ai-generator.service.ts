import { AIWebsitePrompt, AIWebsiteProposal } from "@/types/ai";
import { PageDocument, SectionNode, ThemeConfig } from "@/types/builder";
import { modernPurplePreset, cleanTealPreset, deepSlatePreset } from "@/themes/presets";
import { validatePageDocument } from "@/builder/schemas/document.schema";
import { generateNodeId } from "@/builder/operations/document-operations";
import { sanitizeSubdomain } from "@/lib/utils/url";
import { ValidationError } from "@/server/errors";

/**
 * Maps niche keywords to the best aesthetic theme preset
 */
function resolveThemeForNiche(niche: string): ThemeConfig {
  const lower = niche.toLowerCase();
  if (lower.includes("health") || lower.includes("dental") || lower.includes("clean") || lower.includes("med")) {
    return cleanTealPreset;
  }
  if (
    lower.includes("roof") ||
    lower.includes("plumb") ||
    lower.includes("contractor") ||
    lower.includes("electric") ||
    lower.includes("construct")
  ) {
    return deepSlatePreset;
  }
  return modernPurplePreset;
}

/**
 * Extracts digits for tel: links
 */
function toTelUri(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits ? `tel:${digits}` : "tel:5125550199";
}

/**
 * AI Website Generation Engine
 * PRD.md Section 12: Generates structured, validated website proposals using only approved component IDs.
 */
export class AIGeneratorService {
  /**
   * Generates a fully-structured, schema-validated website proposal from business prompt
   */
  public static async generateWebsiteProposal(
    prompt: AIWebsitePrompt
  ): Promise<AIWebsiteProposal> {
    const { businessName, niche, location, phone = "(512) 555-0199", services } = prompt;

    const theme = resolveThemeForNiche(niche);
    const subdomain = sanitizeSubdomain(businessName) || "my-website";
    const telHref = toTelUri(phone);

    // Structured homepage sections using strictly approved Component Registry IDs
    const sections: SectionNode[] = [
      {
        id: generateNodeId("sec"),
        componentId: "header.simple.v1",
        componentVersion: 1,
        props: {
          brandName: businessName,
          phone,
          ctaLabel: "Emergency Call",
          ctaHref: telHref,
        },
      },
      {
        id: generateNodeId("sec"),
        componentId: "hero.split.v1",
        componentVersion: 1,
        props: {
          eyebrow: `Top-Rated ${niche} in ${location}`,
          title: `Professional ${niche} You Can Rely On in ${location}`,
          description: `Trusted residential and commercial ${niche.toLowerCase()} backed by licensed technicians, upfront estimates, and prompt local dispatch throughout ${location}.`,
          primaryButtonLabel: "Request Free Estimate",
          primaryButtonHref: "#contact",
          secondaryButtonLabel: `Call ${phone}`,
          secondaryButtonHref: telHref,
          badgeText: "100% Workmanship Guarantee · Licensed & Insured",
        },
      },
      {
        id: generateNodeId("sec"),
        componentId: "services.grid.v1",
        componentVersion: 1,
        props: {
          eyebrow: "Our Specialized Services",
          title: `Comprehensive ${niche} Solutions`,
          subtitle: `Engineered for durability, code-compliance, and total peace of mind in ${location}.`,
          columns: "3",
          services: services.slice(0, 3).map((s, idx) => ({
            title: s,
            description: `Complete diagnostic evaluation and professional grade execution for ${s.toLowerCase()} in ${location}.`,
            icon: (["wrench", "check", "clock"] as const)[idx % 3],
          })),
        },
      },
      {
        id: generateNodeId("sec"),
        componentId: "testimonials.cards.v1",
        componentVersion: 1,
        props: {
          eyebrow: `${location} Client Reviews`,
          title: `Why Property Owners in ${location} Choose Us`,
          subtitle: `Verified 5-star customer feedback from residential and commercial clients across ${location}.`,
        },
      },
      {
        id: generateNodeId("sec"),
        componentId: "contact.form.v1",
        componentVersion: 1,
        props: {
          eyebrow: "Fast Dispatch",
          title: `Book Your ${niche} Service Today`,
          subtitle: `Fill out the request form below and our on-call coordinator in ${location} will get back to you within 15 minutes.`,
          phone,
          email: `contact@${subdomain}.com`,
          address: `Serving all of ${location} & Surrounding Communities`,
          submitButtonLabel: "Request Immediate Callback",
        },
      },
      {
        id: generateNodeId("sec"),
        componentId: "footer.simple.v1",
        componentVersion: 1,
        props: {
          brandName: businessName,
          brandDescription: `Leading ${niche.toLowerCase()} specialist serving ${location} with 24/7 priority support and certified local technicians.`,
          copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
        },
      },
    ];

    const homePage: PageDocument = {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: `${businessName} | Expert ${niche} in ${location}`,
        slug: "/",
        status: "draft", // Strictly initialized as draft per PRD.md Section 12
        description: `Looking for top-rated ${niche.toLowerCase()} in ${location}? ${businessName} provides upfront pricing, verified reviews, and fast response times.`,
      },
      sections,
    };

    // Strict schema integrity verification before returning proposal
    const validation = validatePageDocument(homePage);
    if (!validation.success) {
      throw new ValidationError(`Generated proposal failed schema validation: ${validation.error}`);
    }

    return {
      websiteName: businessName,
      subdomain,
      theme,
      pages: [homePage],
      seoTitle: homePage.page.title,
      seoDescription: homePage.page.description ?? "",
    };
  }
}
