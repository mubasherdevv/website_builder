import { PageDocument, SectionNode, ThemeConfig } from "@/types/builder";
import { TemplateDefinition } from "../types";
import { localServiceTemplate } from "../definitions/local-service.template";
import { digitalAgencyTemplate } from "../definitions/digital-agency.template";
import { restaurantTemplate } from "../definitions/restaurant.template";
import { corporateConsultingTemplate } from "../definitions/corporate-consulting.template";
import { wellnessClinicTemplate } from "../definitions/wellness-clinic.template";
import { getThemePreset } from "@/themes/presets";
import { generateEntityId } from "@/lib/utils/id";

export const allTemplates: TemplateDefinition[] = [
  localServiceTemplate,
  digitalAgencyTemplate,
  restaurantTemplate,
  corporateConsultingTemplate,
  wellnessClinicTemplate,
];

export function getTemplateById(templateId: string): TemplateDefinition | null {
  return allTemplates.find((t) => t.id === templateId) ?? null;
}

export function listTemplates(): TemplateDefinition[] {
  return allTemplates;
}

export interface BusinessDetailsOverride {
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  niche?: string;
  websiteUrl?: string;
  services?: { name: string; description?: string }[];
  locations?: { name: string }[];
  themePresetId?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
}

/**
 * Deep clones a template into an independent website package.
 * Injects user's business details, niche, phone, services, locations and theme styling.
 * PRD.md Section 11: Future template changes must never alter or overwrite customer websites.
 */
export function cloneTemplateForWebsite(
  template: TemplateDefinition,
  overrides?: BusinessDetailsOverride
): {
  clonedTheme: ThemeConfig;
  clonedPages: PageDocument[];
} {
  // 1. Independent copy of ThemeConfig (using selected preset or template theme)
  const baseTheme = overrides?.themePresetId
    ? getThemePreset(overrides.themePresetId)
    : template.theme;
  const clonedTheme: ThemeConfig = JSON.parse(JSON.stringify(baseTheme));

  if (overrides?.brandPrimaryColor) {
    clonedTheme.colors.primary = overrides.brandPrimaryColor;
    clonedTheme.colors.buttonPrimaryBg = overrides.brandPrimaryColor;
    clonedTheme.colors.link = overrides.brandPrimaryColor;
    clonedTheme.colors.icon = overrides.brandPrimaryColor;
    clonedTheme.colors.buttonBorder = overrides.brandPrimaryColor;
  }
  if (overrides?.brandSecondaryColor) {
    clonedTheme.colors.secondary = overrides.brandSecondaryColor;
    clonedTheme.colors.footerBackground = overrides.brandSecondaryColor;
  }

  // 2. Clone pages and regenerate all IDs
  const clonedPages: PageDocument[] = template.pages.map((originalPage) => {
    function regenerateSectionIds(node: SectionNode): SectionNode {
      const updatedProps = { ...(node.props || {}) };

      // Base business details injection across all matching fields
      if (overrides?.businessName) {
        if ("brandName" in updatedProps) updatedProps.brandName = overrides.businessName;
        if ("logoAlt" in updatedProps) updatedProps.logoAlt = overrides.businessName;
      }
      if (overrides?.phone && "phone" in updatedProps) {
        updatedProps.phone = overrides.phone;
      }
      if (overrides?.email && "email" in updatedProps) {
        updatedProps.email = overrides.email;
      }
      if (overrides?.address && "address" in updatedProps) {
        updatedProps.address = overrides.address;
      }

      // 1. Header Sections
      if (node.componentId.startsWith("header.")) {
        if (overrides?.businessName) {
          updatedProps.brandName = overrides.businessName;
        }
        if (overrides?.phone) {
          updatedProps.phone = overrides.phone;
        }
      }

      // 2. Hero Sections (split, simple, inner) customization
      if (node.componentId.startsWith("hero.")) {
        if (overrides?.city) {
          updatedProps.eyebrow = `${overrides.city.toUpperCase()} · ${overrides.niche ? overrides.niche.toUpperCase() : "TOP-RATED SERVICES"}`;
        } else if (overrides?.businessName) {
          updatedProps.eyebrow = `WELCOME TO ${overrides.businessName.toUpperCase()}`;
        }

        if (overrides?.businessName && overrides?.niche) {
          updatedProps.title = `${overrides.businessName} — Leading ${overrides.niche} in ${overrides.city || "Your Area"}`;
        } else if (overrides?.businessName) {
          updatedProps.title = overrides.businessName;
        }

        if (overrides?.niche || overrides?.city) {
          updatedProps.description = `Delivering premier ${overrides?.niche?.toLowerCase() || "craftsmanship"} and dependable service across ${overrides?.city || "your area"}. Licensed, verified professionals with upfront pricing and guaranteed quality.`;
        }

        updatedProps.primaryButtonLabel = "Schedule Service";
        updatedProps.primaryButtonHref = "#contact";

        if (overrides?.phone) {
          updatedProps.secondaryButtonLabel = `Call ${overrides.phone}`;
          updatedProps.secondaryButtonHref = `tel:${overrides.phone.replace(/[^0-9+]/g, "")}`;
        }

        if (overrides?.city) {
          updatedProps.badgeText = `Proudly Serving ${overrides.city} & Surrounding Areas · Upfront Pricing`;
        }
      }

      // 3. Features Grid
      if (node.componentId.startsWith("features.")) {
        if (overrides?.businessName) {
          updatedProps.eyebrow = `The ${overrides.businessName} Standard`;
          updatedProps.title = `Why ${overrides.city || "Local"} Clients Trust ${overrides.businessName}`;
          updatedProps.subtitle = `We believe in honest upfront estimates, prompt response, and lasting quality across all our work.`;
        }
      }

      // 4. Services Grid
      if (node.componentId.startsWith("services.")) {
        if (overrides?.niche) {
          updatedProps.eyebrow = "Core Capabilities";
          updatedProps.title = `Our ${overrides.niche} Services`;
          updatedProps.subtitle = `Comprehensive solutions tailored for homes and businesses across ${overrides.city || "the region"}.`;
        }

        // Replace dummy services with user's actual services from Step 2
        if (overrides?.services && overrides.services.length > 0) {
          const iconList = ["check", "wrench", "clock", "shield", "layers", "star"];
          updatedProps.services = overrides.services.slice(0, 6).map((srv, idx) => ({
            title: srv.name,
            description:
              srv.description ||
              `High-quality ${srv.name.toLowerCase()} delivered with master-level precision and guaranteed workmanship.`,
            icon: iconList[idx % iconList.length],
          }));
        }
      }

      // 5. About Section
      if (node.componentId.startsWith("about.")) {
        if (overrides?.businessName) {
          updatedProps.eyebrow = `About ${overrides.businessName}`;
          updatedProps.title = `Proudly Serving ${overrides.city || "Our Community"} With Integrity`;
          updatedProps.description = `At ${overrides.businessName}, we founded our practice on a simple standard: arrive on time, explain every option clearly, and back every job with an ironclad satisfaction guarantee.`;
        }
      }

      // 6. Gallery Section
      if (node.componentId.startsWith("gallery.")) {
        if (overrides?.city) {
          updatedProps.subtitle = `Take a look at our recent installations and finished work across ${overrides.city} and surrounding communities.`;
        }
      }

      // 7. Testimonials Section
      if (node.componentId.startsWith("testimonials.")) {
        if (overrides?.businessName && Array.isArray(updatedProps.testimonials)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updatedProps.testimonials = updatedProps.testimonials.map((t: any) => ({
            ...t,
            quote:
              typeof t.quote === "string"
                ? t.quote
                    .replace(/Apex(\s+Plumbing(\s+Pros)?)?/gi, overrides.businessName || "the team")
                    .replace(/Vanguard(\s+(Digital|Legal))?/gi, overrides.businessName || "the team")
                    .replace(/Austin|Round Rock|Dallas|Houston/gi, overrides.city || "our area")
                : t.quote,
            authorRole: overrides.city ? `Client in ${overrides.city}` : t.authorRole,
          }));
        }
      }

      // 8. CTA Banner
      if (node.componentId.startsWith("cta.")) {
        if (overrides?.businessName) {
          updatedProps.eyebrow = `Need ${overrides.niche || "Professional Help"}?`;
          updatedProps.title = `Contact ${overrides.businessName} Today`;
          updatedProps.description = `Our dedicated team is ready to help across ${overrides.city || "your area"}. Fast scheduling, transparent pricing, and guaranteed work.`;
        }
        if (overrides?.phone) {
          updatedProps.primaryButtonLabel = `Call ${overrides.phone}`;
          updatedProps.primaryButtonHref = `tel:${overrides.phone.replace(/[^0-9+]/g, "")}`;
        }
        updatedProps.secondaryButtonLabel = "Request Callback Online";
        updatedProps.secondaryButtonHref = "#contact";
      }

      // 9. Contact Form
      if (node.componentId.startsWith("contact.")) {
        if (overrides?.businessName) {
          updatedProps.title = `Book Service or Request a Free Estimate`;
          updatedProps.subtitle = `Fill out the quick form below or call us directly at ${overrides.phone || "our office"}. We respond promptly.`;
        }
        if (overrides?.phone) updatedProps.phone = overrides.phone;
        if (overrides?.email) updatedProps.email = overrides.email;
        if (overrides?.address || overrides?.city) {
          updatedProps.address =
            overrides.address ||
            `${overrides.city || ""}${overrides.state ? ", " + overrides.state : ""}`;
        }
      }

      // 10. Footer Sections
      if (node.componentId.startsWith("footer.")) {
        if (overrides?.businessName) {
          updatedProps.brandName = overrides.businessName;
          updatedProps.copyright = `© ${new Date().getFullYear()} ${overrides.businessName}. All rights reserved.`;
          updatedProps.description = `Dedicated ${overrides.niche || "professional services"} proudly serving ${overrides.city || "the community"}.`;
        }
        if (overrides?.phone) updatedProps.phone = overrides.phone;
        if (overrides?.email) updatedProps.email = overrides.email;
        if (overrides?.address || overrides?.city) {
          updatedProps.address =
            overrides.address ||
            `${overrides.city || ""}${overrides.state ? ", " + overrides.state : ""}`;
        }
      }

      return {
        ...node,
        id: generateEntityId("sec"),
        props: updatedProps,
        children: node.children ? node.children.map(regenerateSectionIds) : undefined,
      };
    }

    const clonedSections = originalPage.sections.map(regenerateSectionIds);

    let pageTitle = originalPage.page.title;
    if (overrides?.businessName) {
      const suffix = overrides.niche
        ? `${overrides.niche} in ${overrides.city || "Your Area"}`
        : originalPage.page.title.split("|")[1]?.trim() || "Official Website";
      pageTitle = `${overrides.businessName} | ${suffix}`;
    }

    const pageDesc =
      overrides?.niche && overrides?.city
        ? `Professional ${overrides.niche.toLowerCase()} in ${overrides.city} by ${overrides.businessName}. Licensed technicians, upfront pricing, and prompt local service.`
        : originalPage.page.description;

    return {
      schemaVersion: originalPage.schemaVersion,
      page: {
        ...originalPage.page,
        id: generateEntityId("page"),
        title: pageTitle,
        description: pageDesc,
        status: "draft", // Cloned websites start strictly as draft
      },
      sections: clonedSections,
    };
  });

  return {
    clonedTheme,
    clonedPages,
  };
}
