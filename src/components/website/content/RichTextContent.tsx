"use client";

import React from "react";
import { z } from "zod";
import { BookOpen } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import { sanitizeFooterHref } from "@/components/website/footer/shared/footer-url";

export const RichTextLinkSchema = z.object({
  label: z.string().default("Overview"),
  href: z.string().default("#"),
});

export const RichTextContentPropsSchema = z.object({
  eyebrow: z.string().default("Our Story"),
  title: z.string().default("Built On Craftsmanship, Trust And Detail"),
  body: z
    .string()
    .default(
      [
        "We started with a simple promise: do the job properly the first time and treat every home like our own. That promise still guides every project we take on today.",
        "Our team combines hands-on trade experience with modern equipment and clear communication. You always know who is arriving, what will happen, and what it will cost.",
        "From the first call to the final walkthrough, we keep the process straightforward — honest quotes, tidy workmanship, and a warranty you can rely on.",
      ].join("\n\n")
    ),
  variant: z.enum(["simple", "with-sidebar"]).default("simple"),
  align: z.enum(["left", "center"]).default("left"),
  sidebarTitle: z.string().default("On This Page"),
  sidebarLinks: z
    .array(RichTextLinkSchema)
    .default([
      { label: "Who We Are", href: "#about" },
      { label: "Our Process", href: "#process" },
      { label: "Service Areas", href: "#areas" },
      { label: "Get In Touch", href: "#contact" },
    ]),
});

export type RichTextContentProps = z.infer<typeof RichTextContentPropsSchema>;

export const RichTextContent: React.FC<RichTextContentProps> = ({
  eyebrow,
  title,
  body,
  variant = "simple",
  align = "left",
  sidebarTitle,
  sidebarLinks = [],
}) => {
  const isSidebar = variant === "with-sidebar";
  const isCentered = align === "center";

  const paragraphs = (body || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  const heading = (
    <div className={`space-y-2 ${isCentered ? "text-center" : ""}`}>
      {eyebrow && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{
            color: "var(--color-accent, var(--color-primary, #087A55))",
            backgroundColor: "var(--color-primary-soft, #DDF3E8)",
          }}
        >
          <BookOpen className="w-3 h-3" />
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
    </div>
  );

  const prose = (
    <div className="space-y-3 sm:space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line break-words"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      {isSidebar ? (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-10 max-w-6xl mx-auto items-start">
          {/* Content (first on mobile) */}
          <div className="order-1 lg:order-2 min-w-0 space-y-4">
            {heading}
            {prose}
          </div>

          {/* Sidebar / table of contents */}
          {sidebarLinks.length > 0 && (
            <aside
              className="order-2 lg:order-1 w-full lg:sticky lg:top-6 p-4 border"
              style={{
                backgroundColor: "var(--color-card-bg, #FFFFFF)",
                borderColor: "var(--color-border, #E1EAE4)",
                borderRadius: "var(--radius-card, 16px)",
                boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
              }}
            >
              {sidebarTitle && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-2">
                  {sidebarTitle}
                </p>
              )}
              <ul className="space-y-1.5">
                {sidebarLinks.map((link, index) => {
                  const safeHref = sanitizeFooterHref(link.href);
                  return (
                    <li key={index} className="min-w-0">
                      {safeHref ? (
                        <a
                          href={safeHref}
                          className="block text-xs font-medium text-text-secondary hover:text-brand transition-colors break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <span className="block text-xs font-medium text-text-secondary break-words">
                          {link.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}
        </div>
      ) : (
        <div className={`max-w-3xl mx-auto space-y-4 ${isCentered ? "text-center" : ""}`}>
          {heading}
          <div className={isCentered ? "text-left" : ""}>{prose}</div>
        </div>
      )}
    </section>
  );
};

export const richTextContentDefinition: ComponentDefinition<RichTextContentProps> = {
  id: "content.richtext.v1",
  name: "Rich Text Content",
  category: "content",
  version: 1,
  schema: RichTextContentPropsSchema,
  defaults: RichTextContentPropsSchema.parse({}),
  component: RichTextContent,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "body", label: "Body Content (blank line = new paragraph)", type: "textarea" },
      {
        propName: "variant",
        label: "Layout",
        type: "select",
        options: [
          { label: "Centered Column", value: "simple" },
          { label: "With Sidebar Navigation", value: "with-sidebar" },
        ],
      },
      {
        propName: "align",
        label: "Heading Alignment",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
        ],
      },
      { propName: "sidebarTitle", label: "Sidebar Title", type: "text" },
      { propName: "sidebarLinks", label: "Sidebar Links", type: "list" },
    ],
  },
};
