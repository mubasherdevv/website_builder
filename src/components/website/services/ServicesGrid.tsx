"use client";

import React, { useRef } from "react";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import { IconRenderer } from "@/components/website/shared/IconRenderer";

export const ServiceItemSchema = z.object({
  title: z.string().min(1).default("Service Title"),
  description: z.string().default("Professional service offering."),
  icon: z.string().default("wrench"),
});

export const ServicesGridPropsSchema = z.object({
  eyebrow: z.string().default("What We Do"),
  title: z.string().default("Professional Services Tailored to Your Needs"),
  subtitle: z
    .string()
    .default("We deliver high-standard workmanship backed by years of field experience."),
  showIcons: z.boolean().default(true),
  layout: z.enum(["grid", "carousel"]).default("grid"),
  columns: z.enum(["2", "3", "4"]).default("3"),
  cardStyle: z.enum(["boxed", "minimal"]).default("boxed"),
  services: z
    .array(ServiceItemSchema)
    .default([
      {
        title: "Emergency Repairs",
        description: "24/7 on-call dispatch for urgent local residential and commercial issues.",
        icon: "clock",
      },
      {
        title: "Installation & Upgrades",
        description: "Complete modern fixtures, energy-efficient replacements, and code compliance.",
        icon: "wrench",
      },
      {
        title: "Routine Maintenance",
        description: "Preventative checks and cleanings to prolong the lifespan of your systems.",
        icon: "check",
      },
    ]),
});

export type ServicesGridProps = z.infer<typeof ServicesGridPropsSchema>;

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  eyebrow,
  title,
  subtitle,
  showIcons = true,
  layout = "grid",
  columns = "3",
  cardStyle = "boxed",
  services = [],
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = Math.min(320, scrollRef.current.clientWidth * 0.85);
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const colClass =
    columns === "2"
      ? "md:grid-cols-2"
      : columns === "4"
      ? "md:grid-cols-2 lg:grid-cols-4"
      : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="services"
      className="py-14 sm:py-20 transition-colors"
      style={{ backgroundColor: "var(--color-section-bg, #FFFFFF)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-4 text-center md:text-left">
          <div className="space-y-2.5 max-w-2xl mx-auto md:mx-0">
            {eyebrow && (
              <span
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "var(--color-accent, var(--color-primary, #087A55))" }}
              >
                {eyebrow}
              </span>
            )}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words"
              style={{
                color: "var(--color-heading, var(--color-text-primary, #172B24))",
                fontFamily: "var(--font-heading, inherit)",
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{subtitle}</p>
            )}
          </div>

          {/* Carousel Arrows when carousel variant is active */}
          {layout === "carousel" && (
            <div className="flex items-center justify-center md:justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous service"
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
                aria-label="Next service"
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
          /* Horizontal Scroll Container (Touch friendly swipe on mobile, smooth arrows on desktop) */
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-6 sm:px-6"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {services.map((service, idx) => {
              const hasIcon = showIcons && service.icon && service.icon !== "none";
              const isMinimal = cardStyle === "minimal";

              return (
                <div
                  key={idx}
                  className={`w-[84vw] max-w-[340px] sm:w-[320px] snap-center shrink-0 flex flex-col justify-between transition-all space-y-3 sm:space-y-4 ${
                    isMinimal ? "p-5 sm:p-6 border" : "p-5 sm:p-7 md:p-8 border hover:shadow-md"
                  }`}
                  style={{
                    backgroundColor: isMinimal
                      ? "var(--color-alt-section-bg, #EDF4EF)"
                      : "var(--color-card-bg, #FFFFFF)",
                    borderColor: isMinimal
                      ? "var(--color-divider, #E1EAE4)"
                      : "var(--color-border, #E1EAE4)",
                    borderRadius: "var(--radius-card, 16px)",
                    boxShadow: isMinimal ? "none" : "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                  }}
                >
                  <div className="space-y-2.5 sm:space-y-3">
                    {hasIcon && (
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: "var(--color-primary-soft, #DDF3E8)",
                          color: "var(--color-icon, var(--color-primary, #087A55))",
                        }}
                      >
                        <IconRenderer icon={service.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    )}
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary break-words">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Responsive Grid Layout */
          <div className={`grid grid-cols-1 ${colClass} gap-4 sm:gap-6 lg:gap-8`}>
            {services.map((service, idx) => {
              const hasIcon = showIcons && service.icon && service.icon !== "none";
              const isMinimal = cardStyle === "minimal";

              return (
                <div
                  key={idx}
                  className={`w-full min-w-0 flex flex-col justify-between transition-all ${
                    isMinimal
                      ? "p-4 sm:p-6 bg-transparent border-0 border-b space-y-2.5"
                      : "p-5 sm:p-7 md:p-8 border hover:shadow-md space-y-3 sm:space-y-4"
                  }`}
                  style={{
                    backgroundColor: isMinimal ? "transparent" : "var(--color-card-bg, #FFFFFF)",
                    borderColor: isMinimal
                      ? "var(--color-divider, #E1EAE4)"
                      : "var(--color-border, #E1EAE4)",
                    borderRadius: isMinimal ? "0px" : "var(--radius-card, 16px)",
                    boxShadow: isMinimal ? "none" : "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                  }}
                >
                  <div className="space-y-2.5 sm:space-y-3">
                    {hasIcon && (
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: "var(--color-primary-soft, #DDF3E8)",
                          color: "var(--color-icon, var(--color-primary, #087A55))",
                        }}
                      >
                        <IconRenderer icon={service.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    )}
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary break-words">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export const servicesGridDefinition: ComponentDefinition<ServicesGridProps> = {
  id: "services.grid.v1",
  name: "Services Grid",
  category: "content",
  version: 1,
  schema: ServicesGridPropsSchema,
  defaults: ServicesGridPropsSchema.parse({}),
  component: ServicesGrid,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      { propName: "showIcons", label: "Display Service Icons", type: "switch" },
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
      {
        propName: "cardStyle",
        label: "Card Style",
        type: "select",
        options: [
          { label: "Boxed Border Cards", value: "boxed" },
          { label: "Minimal Borderless", value: "minimal" },
        ],
      },
      {
        propName: "services",
        label: "Services List",
        type: "list",
      },
    ],
  },
};
