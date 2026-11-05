"use client";

import React, { useId, useState } from "react";
import { z } from "zod";
import { ChevronDown, HelpCircle } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";

export const FaqItemSchema = z.object({
  question: z.string().min(1).default("How does the process work?"),
  answer: z
    .string()
    .default("Share a short, clear answer that removes doubt and answers the visitor's question."),
});

export const FaqAccordionPropsSchema = z.object({
  eyebrow: z.string().default("Questions & Answers"),
  title: z.string().default("Frequently Asked Questions"),
  subtitle: z
    .string()
    .default("Everything you need to know before getting started. Still unsure? Contact our team."),
  variant: z.enum(["accordion", "two-column"]).default("accordion"),
  defaultOpenFirst: z.boolean().default(true),
  faqItems: z
    .array(FaqItemSchema)
    .default([
      {
        question: "How quickly can you get started?",
        answer:
          "Most projects begin within 24–48 hours of approval. We confirm the schedule in writing before any work starts.",
      },
      {
        question: "Do you provide a written quote?",
        answer:
          "Yes. Every job receives a fixed, itemised quote up front — no hidden fees and no surprise charges after the work is complete.",
      },
      {
        question: "What areas do you serve?",
        answer:
          "We cover the city and surrounding suburbs. Share your postcode and we will confirm availability and arrival windows.",
      },
      {
        question: "Are your technicians licensed and insured?",
        answer:
          "All technicians are fully licensed, background-checked and covered by public liability insurance for your protection.",
      },
      {
        question: "What happens if I am not happy with the work?",
        answer:
          "Our workmanship is guaranteed. Contact us within the warranty period and we will return to resolve the issue at no extra cost.",
      },
    ]),
});

export type FaqAccordionProps = z.infer<typeof FaqAccordionPropsSchema>;

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  eyebrow,
  title,
  subtitle,
  variant = "accordion",
  defaultOpenFirst = true,
  faqItems = [],
}) => {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenFirst ? 0 : null);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const isTwoColumn = variant === "two-column";

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 space-y-2">
        {eyebrow && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              color: "var(--color-accent, var(--color-primary, #087A55))",
              backgroundColor: "var(--color-primary-soft, #DDF3E8)",
            }}
          >
            <HelpCircle className="w-3 h-3" />
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

      {/* Items */}
      <div
        className={
          isTwoColumn
            ? "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto items-start"
            : "max-w-3xl mx-auto border divide-y divide-border overflow-hidden"
        }
        style={
          isTwoColumn
            ? undefined
            : {
                backgroundColor: "var(--color-card-bg, #FFFFFF)",
                borderColor: "var(--color-border, #E1EAE4)",
                borderRadius: "var(--radius-card, 16px)",
                boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
              }
        }
      >
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          const buttonId = `${baseId}-faq-button-${index}`;
          const panelId = `${baseId}-faq-panel-${index}`;

          return (
            <div
              key={index}
              className={isTwoColumn ? "border" : ""}
              style={
                isTwoColumn
                  ? {
                      backgroundColor: "var(--color-card-bg, #FFFFFF)",
                      borderColor: "var(--color-border, #E1EAE4)",
                      borderRadius: "var(--radius-card, 16px)",
                      boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                    }
                  : undefined
              }
            >
              <h3 className="m-0">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className={`w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                    isTwoColumn ? "rounded-t-card" : ""
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold text-text-primary break-words">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-brand transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </h3>
              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-4 sm:px-5 pb-4"
                >
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const faqAccordionDefinition: ComponentDefinition<FaqAccordionProps> = {
  id: "faq.accordion.v1",
  name: "FAQ / Accordion",
  category: "content",
  version: 1,
  schema: FaqAccordionPropsSchema,
  defaults: FaqAccordionPropsSchema.parse({}),
  component: FaqAccordion,
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
          { label: "Single Accordion", value: "accordion" },
          { label: "Two-Column Cards", value: "two-column" },
        ],
      },
      { propName: "defaultOpenFirst", label: "Open First Question", type: "switch" },
      { propName: "faqItems", label: "Questions & Answers", type: "list" },
    ],
  },
};
