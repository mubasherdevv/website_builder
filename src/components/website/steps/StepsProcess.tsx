"use client";

import React from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import { IconRenderer } from "@/components/website/shared/IconRenderer";

export const ProcessStepSchema = z.object({
  step: z.string().default(""),
  title: z.string().default("Step Title"),
  description: z.string().default("Explain what happens during this step in one or two sentences."),
  icon: z.string().default("none"),
});

export const StepsProcessPropsSchema = z.object({
  eyebrow: z.string().default("How It Works"),
  title: z.string().default("A Simple Process From First Call To Final Check"),
  subtitle: z.string().default(
    "No guesswork and no surprises — here is exactly what happens when you book with us."
  ),
  variant: z.enum(["horizontal", "vertical"]).default("horizontal"),
  steps: z
    .array(ProcessStepSchema)
    .default([
      {
        step: "01",
        title: "Book Your Slot",
        description: "Call or submit the quick form. We confirm timing and share a fixed quote.",
        icon: "none",
      },
      {
        step: "02",
        title: "We Arrive Prepared",
        description: "A licensed technician arrives on time with the right tools and parts.",
        icon: "none",
      },
      {
        step: "03",
        title: "Work Completed Clean",
        description: "The job is done to code, tested on site, and the area is left spotless.",
        icon: "none",
      },
      {
        step: "04",
        title: "Guaranteed Follow-Up",
        description: "You receive a written summary and remain covered by our workmanship warranty.",
        icon: "none",
      },
    ]),
});

export type StepsProcessProps = z.infer<typeof StepsProcessPropsSchema>;

const horizontalCols = (count: number): string => {
  if (count <= 1) return "grid-cols-1 max-w-md";
  if (count === 2) return "sm:grid-cols-2 max-w-3xl";
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
};

export const StepsProcess: React.FC<StepsProcessProps> = ({
  eyebrow,
  title,
  subtitle,
  variant = "horizontal",
  steps = [],
}) => {
  const isVertical = variant === "vertical";

  const renderBadge = (icon: string | undefined, index: number) => {
    const hasIcon = Boolean(icon && icon !== "none");
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
        style={{
          backgroundColor: "var(--color-primary, #087A55)",
          color: "var(--color-primary-contrast, #FFFFFF)",
        }}
      >
        {hasIcon ? (
          <IconRenderer icon={icon} className="w-4 h-4" />
        ) : (
          <span>{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
    );
  };

  return (
    <section
      className="py-10 sm:py-14 px-4 sm:px-6 transition-colors"
      style={{ backgroundColor: "var(--color-section-bg, #FFFFFF)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 space-y-2">
          {eyebrow && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                color: "var(--color-accent, var(--color-primary, #087A55))",
                backgroundColor: "var(--color-primary-soft, #DDF3E8)",
              }}
            >
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

        {isVertical ? (
          <div className="relative max-w-2xl mx-auto">
            <div
              className="absolute left-5 top-3 bottom-3 w-px"
              style={{ backgroundColor: "var(--color-border, #E1EAE4)" }}
              aria-hidden="true"
            />
            <ol className="space-y-6">
              {steps.map((step, index) => (
                <li key={index} className="relative flex items-start gap-4">
                  <div className="relative z-10 rounded-full">{renderBadge(step.icon, index)}</div>
                  <div className="pt-1 min-w-0">
                    <h3 className="text-sm font-bold text-text-primary break-words">{step.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed mt-0.5 break-words">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <ol className={`grid grid-cols-1 ${horizontalCols(steps.length)} gap-4 sm:gap-6 mx-auto`}>
            {steps.map((step, index) => (
              <li
                key={index}
                className="min-w-0 p-4 sm:p-5 border"
                style={{
                  backgroundColor: "var(--color-card-bg, #FFFFFF)",
                  borderColor: "var(--color-border, #E1EAE4)",
                  borderRadius: "var(--radius-card, 16px)",
                  boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {renderBadge(step.icon, index)}
                  <h3 className="text-sm font-bold text-text-primary break-words min-w-0">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed break-words">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};

export const stepsProcessDefinition: ComponentDefinition<StepsProcessProps> = {
  id: "steps.process.v1",
  name: "Process / How It Works",
  category: "content",
  version: 1,
  schema: StepsProcessPropsSchema,
  defaults: StepsProcessPropsSchema.parse({}),
  component: StepsProcess,
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
          { label: "Horizontal Cards", value: "horizontal" },
          { label: "Vertical Timeline", value: "vertical" },
        ],
      },
      { propName: "steps", label: "Process Steps", type: "list" },
    ],
  },
};
