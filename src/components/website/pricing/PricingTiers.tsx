"use client";

import React from "react";
import { z } from "zod";
import { CheckCircle, Sparkles } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import { sanitizeFooterHref } from "@/components/website/footer/shared/footer-url";

export const PricingTierSchema = z.object({
  name: z.string().default("Starter"),
  price: z.string().default("$99"),
  period: z.string().default("/month"),
  description: z.string().default("Everything a small team needs to get started."),
  features: z.array(z.string()).default([
    "Up to 3 pages",
    "Basic SEO setup",
    "Email support",
    "Monthly reporting",
  ]),
  ctaLabel: z.string().default("Choose Plan"),
  ctaHref: z.string().default("#contact"),
  highlighted: z.boolean().default(false),
  badge: z.string().default(""),
});

export const PricingTiersPropsSchema = z.object({
  eyebrow: z.string().default("Simple Pricing"),
  title: z.string().default("Plans That Fit Every Budget"),
  subtitle: z.string().default(
    "Transparent pricing with no hidden fees. Upgrade or cancel whenever you need."
  ),
  variant: z.enum(["cards", "stacked"]).default("cards"),
  tiers: z
    .array(PricingTierSchema)
    .default([
      {
        name: "Starter",
        price: "$99",
        period: "/month",
        description: "For small teams getting their first site online.",
        features: ["Up to 3 pages", "Basic SEO setup", "Email support", "Monthly reporting"],
        ctaLabel: "Choose Starter",
        ctaHref: "#contact",
        highlighted: false,
        badge: "",
      },
      {
        name: "Professional",
        price: "$249",
        period: "/month",
        description: "Everything growing businesses need to convert visitors.",
        features: [
          "Up to 15 pages",
          "Advanced SEO & schema",
          "Priority support",
          "Conversion tracking",
          "Monthly strategy call",
        ],
        ctaLabel: "Choose Professional",
        ctaHref: "#contact",
        highlighted: true,
        badge: "Most Popular",
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "Tailored builds for multi-location and high-traffic brands.",
        features: [
          "Unlimited pages",
          "Dedicated account manager",
          "Custom integrations",
          "SLA & uptime guarantee",
        ],
        ctaLabel: "Talk To Sales",
        ctaHref: "#contact",
        highlighted: false,
        badge: "",
      },
    ]),
  footnote: z.string().default("All plans include hosting, SSL and free updates."),
});

export type PricingTiersProps = z.infer<typeof PricingTiersPropsSchema>;

const gridColsForCount = (count: number): string => {
  if (count <= 1) return "grid-cols-1 max-w-md";
  if (count === 2) return "sm:grid-cols-2 max-w-4xl";
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
};

export const PricingTiers: React.FC<PricingTiersProps> = ({
  eyebrow,
  title,
  subtitle,
  variant = "cards",
  tiers = [],
  footnote,
}) => {
  const isStacked = variant === "stacked";

  const cardChrome = (isFeatured: boolean) => ({
    backgroundColor: "var(--color-card-bg, #FFFFFF)",
    borderColor: isFeatured
      ? "var(--color-primary, #087A55)"
      : "var(--color-border, #E1EAE4)",
    borderRadius: "var(--radius-card, 16px)",
    boxShadow: isFeatured
      ? "0 10px 25px rgba(8,122,85,0.12)"
      : "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
  });

  const renderFeatures = (features: string[]) =>
    features.length > 0 ? (
      <ul className="space-y-2">
        {features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-2 min-w-0">
            <CheckCircle
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: "var(--color-primary, #087A55)" }}
            />
            <span className="text-xs text-text-secondary leading-relaxed break-words">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    ) : null;

  const renderCta = (tier: PricingTiersProps["tiers"][number], isFeatured: boolean) => {
    const safeHref = sanitizeFooterHref(tier.ctaHref);
    const baseClass =
      "w-full inline-flex items-center justify-center px-4 py-2.5 rounded-btn font-semibold text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";
    const style = isFeatured
      ? {
          backgroundColor: "var(--btn-primary-bg, #087A55)",
          color: "var(--btn-primary-text, #FFFFFF)",
        }
      : {
          backgroundColor: "var(--btn-secondary-bg, #FFFFFF)",
          color: "var(--btn-secondary-text, #172B24)",
          borderColor: "var(--btn-border, #E1EAE4)",
        };

    if (!safeHref) {
      return (
        <span
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-btn border text-xs sm:text-sm font-semibold text-text-muted"
          style={{ borderColor: "var(--color-border, #E1EAE4)" }}
        >
          {tier.ctaLabel}
        </span>
      );
    }

    return (
      <a
        href={safeHref}
        className={`${baseClass} ${isFeatured ? "" : "border"}`}
        style={style}
      >
        {tier.ctaLabel}
      </a>
    );
  };

  const renderPrice = (tier: PricingTiersProps["tiers"][number]) => (
    <div className="flex items-end gap-1 min-w-0 flex-wrap">
      <span
        className="text-3xl sm:text-4xl font-extrabold tracking-tight break-words leading-none"
        style={{ color: "var(--color-heading, var(--color-text-primary, #172B24))" }}
      >
        {tier.price}
      </span>
      {tier.period && (
        <span className="text-[11px] sm:text-xs text-text-muted font-medium pb-0.5">
          {tier.period}
        </span>
      )}
    </div>
  );

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 space-y-2">
        {eyebrow && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              color: "var(--color-accent, var(--color-primary, #087A55))",
              backgroundColor: "var(--color-primary-soft, #DDF3E8)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{eyebrow}</span>
          </div>
        )}
        <h2
          className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words"
          style={{
            color: "var(--color-heading, var(--color-text-primary, #172B24))",
            fontFamily: "var(--font-heading, inherit)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{subtitle}</p>
        )}
      </div>

      {isStacked ? (
        <div className="space-y-3 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 border"
              style={cardChrome(tier.highlighted)}
            >
              <div className="sm:w-56 shrink-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    {tier.name}
                  </p>
                  {tier.badge && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: "var(--color-primary-soft, #DDF3E8)",
                        color: "var(--color-primary, #087A55)",
                      }}
                    >
                      {tier.badge}
                    </span>
                  )}
                </div>
                {renderPrice(tier)}
                <p className="text-xs text-text-secondary leading-relaxed">{tier.description}</p>
              </div>

              <div className="flex-1 min-w-0">{renderFeatures(tier.features)}</div>

              <div className="sm:w-44 shrink-0">{renderCta(tier, tier.highlighted)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${gridColsForCount(tiers.length)} gap-4 mx-auto`}>
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="relative flex flex-col h-full p-5 sm:p-6 border"
              style={cardChrome(tier.highlighted)}
            >
              {tier.badge && (
                <span
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: "var(--color-primary, #087A55)",
                    color: "var(--color-primary-contrast, #FFFFFF)",
                  }}
                >
                  {tier.badge}
                </span>
              )}

              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  {tier.name}
                </p>
                {renderPrice(tier)}
                <p className="text-xs text-text-secondary leading-relaxed">{tier.description}</p>
              </div>

              <div className="mt-4 flex-1">{renderFeatures(tier.features)}</div>

              <div
                className="mt-5 pt-4 border-t"
                style={{ borderColor: "var(--color-border, #E1EAE4)" }}
              >
                {renderCta(tier, tier.highlighted)}
              </div>
            </div>
          ))}
        </div>
      )}

      {footnote && (
        <p className="text-center text-[11px] sm:text-xs text-text-muted mt-5">{footnote}</p>
      )}
    </section>
  );
};

export const pricingTiersDefinition: ComponentDefinition<PricingTiersProps> = {
  id: "pricing.tiers.v1",
  name: "Pricing Plans",
  category: "content",
  version: 1,
  schema: PricingTiersPropsSchema,
  defaults: PricingTiersPropsSchema.parse({}),
  component: PricingTiers,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      {
        propName: "variant",
        label: "Layout",
        type: "select",
        options: [
          { label: "Pricing Cards", value: "cards" },
          { label: "Stacked Rows", value: "stacked" },
        ],
      },
      { propName: "tiers", label: "Pricing Plans", type: "list" },
      { propName: "footnote", label: "Footnote", type: "text" },
    ],
  },
};
