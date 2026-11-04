import { PageDocument, SectionNode, ThemeConfig } from "@/types/builder";
import { TemplateDefinition } from "../types";
import { localServiceTemplate } from "../definitions/local-service.template";
import { digitalAgencyTemplate } from "../definitions/digital-agency.template";
import { restaurantTemplate } from "../definitions/restaurant.template";
import { corporateConsultingTemplate } from "../definitions/corporate-consulting.template";
import { wellnessClinicTemplate } from "../definitions/wellness-clinic.template";
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
}

/**
 * Deep clones a template into an independent website package.
 * PRD.md Section 11: Future template changes must never alter or overwrite customer websites.
 */
export function cloneTemplateForWebsite(
  template: TemplateDefinition,
  overrides?: BusinessDetailsOverride
): {
  clonedTheme: ThemeConfig;
  clonedPages: PageDocument[];
} {
  // 1. Independent copy of ThemeConfig
  const clonedTheme: ThemeConfig = JSON.parse(JSON.stringify(template.theme));

  // 2. Clone pages and regenerate all IDs
  const clonedPages: PageDocument[] = template.pages.map((originalPage) => {
    function regenerateSectionIds(node: SectionNode): SectionNode {
      const updatedProps = { ...(node.props || {}) };

      // Inject custom business details if available
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
      pageTitle = `${overrides.businessName} | ${originalPage.page.title.split("|")[1]?.trim() || "Home"}`;
    }

    return {
      schemaVersion: originalPage.schemaVersion,
      page: {
        ...originalPage.page,
        id: generateEntityId("page"),
        title: pageTitle,
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
