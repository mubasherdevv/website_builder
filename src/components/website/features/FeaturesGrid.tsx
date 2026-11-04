"use client";

import React, { useRef } from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { IconRenderer } from "@/components/website/shared/IconRenderer";

export const FeaturesGridPropsSchema = z.object({
  eyebrow: z.string().default("Why Clients Choose Us"),
  title: z.string().default("Engineered for Maximum Speed, Security & Conversion"),
  subtitle: z.string().default("Every feature is designed to eliminate friction, build trust, and turn organic visitors into lifelong clients."),
  showIcons: z.boolean().default(true),
  layout: z.enum(["grid", "carousel"]).default("grid"),
  columns: z.enum(["2", "3", "4"]).default("3"),
  features: z.array(z.object({
    title: z.string().default("Feature Benefit"),
    description: z.string().default("Clear description of the core capability."),
    icon: z.string().default("shield"),
  })).default([
    {
      title: "Zero-Downtime Atomic Deployment",
      description: "Push changes live instantly with verified immutable revision snapshots. No broken pages or stale cache.",
      icon: "zap",
    },
    {
      title: "Bank-Grade Tenant Isolation",
      description: "Row Level Security (RLS) ensures full multi-tenant data separation and zero cross-account data leaks.",
      icon: "lock",
    },
    {
      title: "Built-In Programmatic SEO",
      description: "Auto-generates clean Schema.org LocalBusiness JSON-LD markup and sitemaps that Google loves.",
      icon: "sparkles",
    },
    {
      title: "24/7 Priority Emergency Support",
      description: "Dedicated account technicians on call round the clock to ensure maximum availability and peace of mind.",
      icon: "support",
    },
    {
      title: "Fast Sub-Second Page Loads",
      description: "Optimized server components and dynamic caching ensure Google Core Web Vitals score 95+ on all devices.",
      icon: "clock",
    },
    {
      title: "100% Code-Compliance Guarantee",
      description: "All work and architecture adheres strictly to industry standard building codes and security certifications.",
      icon: "shield",
    },
  ]),
});

export type FeaturesGridProps = z.infer<typeof FeaturesGridPropsSchema>;

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({
  eyebrow,
  title,
  subtitle,
  showIcons = true,
  layout = "grid",
  columns = "3",
  features = [],
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  const colClasses = {
    "2": "md:grid-cols-2",
    "3": "md:grid-cols-2 lg:grid-cols-3",
    "4": "md:grid-cols-2 lg:grid-cols-4",
  }[columns] || "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-4 text-center md:text-left">
        <div className="space-y-2.5 max-w-3xl mx-auto md:mx-0">
          {eyebrow && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                color: "var(--color-accent, var(--color-primary, #087A55))",
                backgroundColor: "var(--color-primary-soft, #DDF3E8)",
              }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{eyebrow}</span>
            </div>
          )}
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight break-words"
            style={{
              color: "var(--color-heading, var(--color-text-primary, #172B24))",
              fontFamily: "var(--font-heading, inherit)",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-text-secondary font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Carousel controls */}
        {layout === "carousel" && (
          <div className="flex items-center justify-center md:justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous feature"
              className="w-9 h-9 rounded-full border text-text-primary flex items-center justify-center transition-all shadow-xs cursor-pointer"
              style={{
                backgroundColor: "var(--color-card-bg, #FFFFFF)",
                borderColor: "var(--color-border, #E1EAE4)",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next feature"
              className="w-9 h-9 rounded-full border text-text-primary flex items-center justify-center transition-all shadow-xs cursor-pointer"
              style={{
                backgroundColor: "var(--color-card-bg, #FFFFFF)",
                borderColor: "var(--color-border, #E1EAE4)",
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {layout === "carousel" ? (
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-6 sm:px-6"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {features.map((item, idx) => {
            const hasIcon = showIcons && item.icon && item.icon !== "none";

            return (
              <div
                key={idx}
                className="min-w-[260px] sm:min-w-[320px] max-w-[360px] snap-center shrink-0 p-6 sm:p-8 border hover:shadow-md space-y-4 flex flex-col justify-between transition-all"
                style={{
                  backgroundColor: "var(--color-card-bg, #FFFFFF)",
                  borderColor: "var(--color-border, #E1EAE4)",
                  borderRadius: "var(--radius-card, 16px)",
                  boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                }}
              >
                <div className="space-y-3">
                  {hasIcon && (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: "var(--color-primary-soft, #DDF3E8)",
                        color: "var(--color-icon, var(--color-primary, #087A55))",
                      }}
                    >
                      <IconRenderer icon={item.icon} className="w-6 h-6" />
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary break-words">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid */
        <div className={`grid grid-cols-1 ${colClasses} gap-4 sm:gap-6`}>
          {features.map((item, idx) => {
            const hasIcon = showIcons && item.icon && item.icon !== "none";

            return (
              <div
                key={idx}
                className="w-full min-w-0 p-6 sm:p-8 border hover:shadow-md space-y-4 transition-all"
                style={{
                  backgroundColor: "var(--color-card-bg, #FFFFFF)",
                  borderColor: "var(--color-border, #E1EAE4)",
                  borderRadius: "var(--radius-card, 16px)",
                  boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                }}
              >
                {hasIcon && (
                  <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
                    <IconRenderer icon={item.icon} className="w-6 h-6" />
                  </div>
                )}
                <h3 className="text-lg sm:text-xl font-bold text-text-primary break-words">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export const featuresGridDefinition: ComponentDefinition<FeaturesGridProps> = {
  id: "features.grid.v1",
  name: "Features & Value Propositions",
  category: "content",
  version: 1,
  schema: FeaturesGridPropsSchema,
  defaults: FeaturesGridPropsSchema.parse({}),
  component: FeaturesGrid,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      { propName: "showIcons", label: "Show Feature Icons", type: "switch" },
      {
        propName: "layout",
        label: "Layout Style",
        type: "select",
        options: [
          { label: "Adaptive Grid (1 / 2 / 3 cols)", value: "grid" },
          { label: "Touch Carousel", value: "carousel" },
        ],
      },
      {
        propName: "columns",
        label: "Columns (Grid Mode)",
        type: "select",
        options: [
          { label: "2 Columns", value: "2" },
          { label: "3 Columns", value: "3" },
          { label: "4 Columns", value: "4" },
        ],
      },
      { propName: "features", label: "Features List", type: "list" },
    ],
  },
};
