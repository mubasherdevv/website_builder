import { AnyComponentDefinition } from "./types";
import { headerSimpleDefinition, headerClassicDefinition } from "@/components/website/header/HeaderSimple";
import { headerTopBarDefinition } from "@/components/website/header/HeaderTopBar";
import { headerTransparentDefinition } from "@/components/website/header/HeaderTransparent";
import { heroSplitDefinition } from "@/components/website/hero/HeroSplit";
import { servicesGridDefinition } from "@/components/website/services/ServicesGrid";
import { testimonialsCardsDefinition } from "@/components/website/testimonials/TestimonialsCards";
import { contactFormDefinition } from "@/components/website/forms/ContactForm";
import { footerSimpleDefinition } from "@/components/website/footer/FooterSimple";
import { aboutSplitDefinition } from "@/components/website/about/AboutSplit";
import { featuresGridDefinition } from "@/components/website/features/FeaturesGrid";
import { galleryGridDefinition } from "@/components/website/gallery/GalleryGrid";
import { ctaBannerDefinition } from "@/components/website/cta/CtaBanner";
import { customEmbedDefinition } from "@/components/website/custom/CustomEmbed";

/**
 * Strict allowlisted Component Registry.
 * PRD.md Section 2.4: Code defines what is possible; JSON cannot import arbitrary code.
 * Scalable component library supporting multi-tenant templates and visual editor canvas.
 */
export const componentRegistry: Record<string, AnyComponentDefinition> = {
  // Navigation & Headers (3 Ready-Made Variants)
  [headerSimpleDefinition.id]: headerSimpleDefinition as unknown as AnyComponentDefinition,
  [headerClassicDefinition.id]: headerClassicDefinition as unknown as AnyComponentDefinition,
  [headerTopBarDefinition.id]: headerTopBarDefinition as unknown as AnyComponentDefinition,
  [headerTransparentDefinition.id]: headerTransparentDefinition as unknown as AnyComponentDefinition,
  // Heroes & Sections
  [heroSplitDefinition.id]: heroSplitDefinition as unknown as AnyComponentDefinition,
  [servicesGridDefinition.id]: servicesGridDefinition as unknown as AnyComponentDefinition,
  [testimonialsCardsDefinition.id]: testimonialsCardsDefinition as unknown as AnyComponentDefinition,
  [contactFormDefinition.id]: contactFormDefinition as unknown as AnyComponentDefinition,
  [footerSimpleDefinition.id]: footerSimpleDefinition as unknown as AnyComponentDefinition,
  // Section components
  [aboutSplitDefinition.id]: aboutSplitDefinition as unknown as AnyComponentDefinition,
  [featuresGridDefinition.id]: featuresGridDefinition as unknown as AnyComponentDefinition,
  [galleryGridDefinition.id]: galleryGridDefinition as unknown as AnyComponentDefinition,
  [ctaBannerDefinition.id]: ctaBannerDefinition as unknown as AnyComponentDefinition,
  // Custom Embed & Rich HTML
  [customEmbedDefinition.id]: customEmbedDefinition as unknown as AnyComponentDefinition,
};

/**
 * Check if a component ID exists in the allowlist
 */
export function isComponentRegistered(componentId: string): boolean {
  return Object.prototype.hasOwnProperty.call(componentRegistry, componentId);
}

/**
 * Get definition by component ID or return null if unknown
 */
export function getComponentDefinition(
  componentId: string
): AnyComponentDefinition | null {
  if (!isComponentRegistered(componentId)) {
    return null;
  }
  return componentRegistry[componentId];
}

/**
 * Get all registered component definitions
 */
export function listRegisteredComponents(): AnyComponentDefinition[] {
  return Object.values(componentRegistry);
}

/**
 * Validate raw props against the component's registered schema
 */
export function validateComponentProps(
  componentId: string,
  rawProps: unknown
): {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
} {
  const def = getComponentDefinition(componentId);
  if (!def) {
    return {
      success: false,
      error: `Unregistered component ID: "${componentId}"`,
    };
  }

  const result = def.schema.safeParse(rawProps);
  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }

  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
  };
}
