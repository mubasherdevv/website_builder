import React from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import { Code2, ExternalLink } from "lucide-react";

export const CustomEmbedPropsSchema = z.object({
  eyebrow: z.string().default("Custom Content"),
  title: z.string().default("Tailored Section Built to Your Specifications"),
  description: z.string().default("Add custom rich text, embeds, or HTML widgets tailored to your exact business needs."),
  htmlContent: z.string().default("<div class='p-6 bg-slate-50 border border-slate-200 rounded-xl text-center'><p class='text-sm text-slate-700 font-medium'>Paste your custom embed code, Google Maps iframe, or rich markup here.</p></div>"),
  containerWidth: z.enum(["narrow", "standard", "wide", "full"]).default("standard"),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  buttonLabel: z.string().default("Learn More"),
  buttonHref: z.string().default("#"),
  showButton: z.boolean().default(false),
});

export type CustomEmbedProps = z.infer<typeof CustomEmbedPropsSchema>;

export const CustomEmbed: React.FC<CustomEmbedProps> = ({
  eyebrow,
  title,
  description,
  htmlContent,
  containerWidth = "standard",
  alignment = "center",
  buttonLabel,
  buttonHref = "#",
  showButton = false,
}) => {
  const widthClasses = {
    narrow: "max-w-4xl",
    standard: "max-w-6xl",
    wide: "max-w-7xl",
    full: "max-w-full px-2 sm:px-4",
  }[containerWidth] || "max-w-6xl";

  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  }[alignment] || "text-center items-center mx-auto";

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 w-full overflow-hidden">
      <div className={`${widthClasses} mx-auto space-y-6 sm:space-y-8`}>
        {/* Header Block */}
        {(eyebrow || title || description) && (
          <div className={`space-y-2.5 flex flex-col ${alignClasses} max-w-3xl`}>
            {eyebrow && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-soft text-brand">
                <Code2 className="w-3.5 h-3.5" />
                <span>{eyebrow}</span>
              </div>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight break-words">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Custom Rendered HTML / Embed Container */}
        {htmlContent && (
          <div
            className="w-full overflow-x-auto rounded-xl"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {/* Optional Action Button */}
        {showButton && buttonLabel && (
          <div className={`pt-2 flex ${alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center"}`}>
            <a
              href={buttonHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-brand text-white font-semibold text-sm hover:bg-brand-hover shadow-sm transition-all"
            >
              <span>{buttonLabel}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export const customEmbedDefinition: ComponentDefinition<CustomEmbedProps> = {
  id: "custom.embed.v1",
  name: "Custom HTML & Embed Widget",
  category: "content",
  version: 1,
  schema: CustomEmbedPropsSchema,
  defaults: CustomEmbedPropsSchema.parse({}),
  component: CustomEmbed,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "title", label: "Section Title", type: "text" },
      { propName: "description", label: "Description", type: "textarea" },
      { propName: "htmlContent", label: "Embed Code / Raw HTML", type: "textarea" },
      {
        propName: "containerWidth",
        label: "Container Width",
        type: "select",
        options: [
          { label: "Narrow (max-w-4xl)", value: "narrow" },
          { label: "Standard (max-w-6xl)", value: "standard" },
          { label: "Wide (max-w-7xl)", value: "wide" },
          { label: "Full Width (100%)", value: "full" },
        ],
      },
      {
        propName: "alignment",
        label: "Header Alignment",
        type: "select",
        options: [
          { label: "Center", value: "center" },
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      { propName: "showButton", label: "Show Action Button", type: "switch" },
      { propName: "buttonLabel", label: "Button Label", type: "text" },
      { propName: "buttonHref", label: "Button Link", type: "text" },
    ],
  },
};
