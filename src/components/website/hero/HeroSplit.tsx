/* eslint-disable @next/next/no-img-element */
import React from "react";
import { z } from "zod";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";

export const HeroSplitPropsSchema = z.object({
  eyebrow: z.string().default("Verified & Licensed Local Experts"),
  title: z.string().default("Top-Rated Services You Can Count On"),
  description: z
    .string()
    .default(
      "Fast, dependable local service for homeowners and commercial businesses. Available 24/7 with upfront pricing."
    ),
  primaryButtonLabel: z.string().default("Book an Appointment"),
  primaryButtonHref: z.string().default("#contact"),
  secondaryButtonLabel: z.string().default("Call Now"),
  secondaryButtonHref: z.string().default("tel:5550192"),
  imageUrl: z
    .string()
    .default(
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80"
    ),
  imageAlt: z.string().default("Hero background image"),
  badgeText: z.string().default("100% Satisfaction Guarantee"),
  variant: z.enum(["split", "centered"]).default("split"),
  showEyebrowIcon: z.boolean().default(true),
});

export type HeroSplitProps = z.infer<typeof HeroSplitPropsSchema>;

export const HeroSplit: React.FC<HeroSplitProps> = ({
  eyebrow,
  title,
  description,
  primaryButtonLabel,
  primaryButtonHref,
  secondaryButtonLabel,
  secondaryButtonHref,
  imageUrl,
  imageAlt = "Hero background image",
  badgeText,
  variant = "split",
  showEyebrowIcon = true,
}) => {
  if (variant === "centered") {
    return (
      <section
        className="py-10 sm:py-16 md:py-24 text-center px-3.5 sm:px-6 relative overflow-hidden transition-colors"
        style={{ backgroundColor: "var(--color-alt-section-bg, #EDF4EF)" }}
      >
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {eyebrow && (
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-full"
              style={{
                color: "var(--color-accent, var(--color-primary, #087A55))",
                backgroundColor: "var(--color-primary-soft, #DDF3E8)",
              }}
            >
              {showEyebrowIcon && <Sparkles className="w-3.5 h-3.5" />}
              <span>{eyebrow}</span>
            </div>
          )}

          <h1
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2] sm:leading-[1.15] break-words"
            style={{
              color: "var(--color-heading, var(--color-text-primary, #172B24))",
              fontFamily: "var(--font-heading, inherit)",
            }}
          >
            {title}
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto font-normal">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 pt-1 sm:pt-2 w-full max-w-md mx-auto sm:max-w-none">
            {primaryButtonLabel && (
              <Link
                href={primaryButtonHref || "#"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--btn-primary-bg, var(--color-primary, #087A55))",
                  color: "var(--btn-primary-text, #FFFFFF)",
                  borderColor: "var(--btn-border, transparent)",
                  borderRadius: "var(--radius-button, 10px)",
                  borderWidth: "var(--btn-border-width, 1px)",
                  borderStyle: "solid",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--btn-hover-bg, var(--color-primary-hover, #066747))";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--btn-primary-bg, var(--color-primary, #087A55))";
                }}
              >
                <span>{primaryButtonLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {secondaryButtonLabel && (
              <Link
                href={secondaryButtonHref || "#"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "var(--btn-secondary-bg, #FFFFFF)",
                  color: "var(--btn-secondary-text, var(--color-text-primary, #172B24))",
                  borderColor: "var(--btn-border, var(--color-border, #E1EAE4))",
                  borderRadius: "var(--radius-button, 10px)",
                  borderWidth: "var(--btn-border-width, 1px)",
                  borderStyle: "solid",
                }}
              >
                <span>{secondaryButtonLabel}</span>
              </Link>
            )}
          </div>

          {badgeText && (
            <p className="text-[11px] sm:text-xs font-medium text-text-muted flex items-center justify-center gap-2 pt-1 sm:pt-2">
              <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
              <span>{badgeText}</span>
            </p>
          )}

          {imageUrl && (
            <div className="pt-4 sm:pt-8 w-full">
              <div
                className="relative mx-auto overflow-hidden shadow-lg border aspect-[16/10] sm:aspect-[16/9] max-w-3xl w-full"
                style={{
                  borderRadius: "var(--radius-card, 16px)",
                  borderColor: "var(--color-border, #E1EAE4)",
                  boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                }}
              >
                <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default Split Layout
  return (
    <section
      className="py-10 sm:py-16 md:py-24 px-3.5 sm:px-6 transition-colors"
      style={{ backgroundColor: "var(--color-section-bg, #FFFFFF)" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-3.5 sm:space-y-5 md:space-y-6 text-left">
          {eyebrow && (
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-full"
              style={{
                color: "var(--color-accent, var(--color-primary, #087A55))",
                backgroundColor: "var(--color-primary-soft, #DDF3E8)",
              }}
            >
              {showEyebrowIcon && <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{eyebrow}</span>
            </div>
          )}

          <h1
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2] sm:leading-[1.15] break-words"
            style={{
              color: "var(--color-heading, var(--color-text-primary, #172B24))",
              fontFamily: "var(--font-heading, inherit)",
            }}
          >
            {title}
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-text-secondary leading-relaxed max-w-xl font-normal">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
            {primaryButtonLabel && (
              <Link
                href={primaryButtonHref || "#"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--btn-primary-bg, var(--color-primary, #087A55))",
                  color: "var(--btn-primary-text, #FFFFFF)",
                  borderColor: "var(--btn-border, transparent)",
                  borderRadius: "var(--radius-button, 10px)",
                  borderWidth: "var(--btn-border-width, 1px)",
                  borderStyle: "solid",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--btn-hover-bg, var(--color-primary-hover, #066747))";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--btn-primary-bg, var(--color-primary, #087A55))";
                }}
              >
                <span>{primaryButtonLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {secondaryButtonLabel && (
              <Link
                href={secondaryButtonHref || "#"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "var(--btn-secondary-bg, #FFFFFF)",
                  color: "var(--btn-secondary-text, var(--color-text-primary, #172B24))",
                  borderColor: "var(--btn-border, var(--color-border, #E1EAE4))",
                  borderRadius: "var(--radius-button, 10px)",
                  borderWidth: "var(--btn-border-width, 1px)",
                  borderStyle: "solid",
                }}
              >
                <span>{secondaryButtonLabel}</span>
              </Link>
            )}
          </div>

          {badgeText && (
            <p className="text-[11px] sm:text-xs font-medium text-text-muted flex items-center gap-2 pt-0.5 sm:pt-1">
              <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
              <span>{badgeText}</span>
            </p>
          )}
        </div>

        {/* Right Image (Stacks below content on mobile and tablet) */}
        <div className="relative w-full mt-2 sm:mt-4 lg:mt-0">
          <div
            className="relative mx-auto overflow-hidden shadow-md border aspect-[16/10] sm:aspect-[4/3] w-full max-w-full"
            style={{
              borderRadius: "var(--radius-card, 16px)",
              borderColor: "var(--color-border, #E1EAE4)",
              boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
            }}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export const heroSplitDefinition: ComponentDefinition<HeroSplitProps> = {
  id: "hero.split.v1",
  name: "Hero Section (Split or Centered)",
  category: "hero",
  version: 1,
  schema: HeroSplitPropsSchema,
  defaults: HeroSplitPropsSchema.parse({}),
  component: HeroSplit,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "showEyebrowIcon", label: "Show Eyebrow Icon", type: "switch" },
      { propName: "title", label: "Hero Title", type: "text" },
      { propName: "description", label: "Hero Description", type: "textarea" },
      { propName: "primaryButtonLabel", label: "Primary Button Label", type: "text" },
      { propName: "primaryButtonHref", label: "Primary Button URL", type: "text" },
      { propName: "secondaryButtonLabel", label: "Secondary Button Label", type: "text" },
      { propName: "secondaryButtonHref", label: "Secondary Button URL", type: "text" },
      { propName: "imageUrl", label: "Hero Image URL", type: "text" },
      { propName: "badgeText", label: "Trust Badge Text", type: "text" },
      {
        propName: "variant",
        label: "Layout Variant",
        type: "select",
        options: [
          { label: "Side-by-Side Split", value: "split" },
          { label: "Centered Hero", value: "centered" },
        ],
      },
    ],
  },
};
