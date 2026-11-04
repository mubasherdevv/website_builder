import React from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import { CheckCircle2, Award, TrendingUp } from "lucide-react";

export const AboutSplitPropsSchema = z.object({
  eyebrow: z.string().default("About Our Company"),
  title: z.string().default("Delivering Excellence & Integrity Since 2012"),
  description: z.string().default("We started with a single truck and a promise: honest craftsmanship, transparent pricing, and treating every client's property like our own."),
  storyParagraph: z.string().default("Over the past decade, we have grown into one of the most trusted names in the region. Our certified team brings decades of combined expertise to residential and commercial projects alike."),
  imageUrl: z.string().default("https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"),
  imagePosition: z.enum(["left", "right"]).default("right"),
  showIcons: z.boolean().default(true),
  stats: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).default([
    { label: "Years in Business", value: "14+" },
    { label: "Verified Projects", value: "3,800+" },
    { label: "Client Satisfaction", value: "99.4%" },
  ]),
  highlights: z.array(z.string()).default([
    "Fully Licensed, Bonded & Insured",
    "Upfront Transparent Flat-Rate Pricing",
    "100% Satisfaction Money-Back Guarantee",
  ]),
});

export type AboutSplitProps = z.infer<typeof AboutSplitPropsSchema>;

export const AboutSplit: React.FC<AboutSplitProps> = ({
  eyebrow,
  title,
  description,
  storyParagraph,
  imageUrl,
  imagePosition = "right",
  showIcons = true,
  stats = [],
  highlights = [],
}) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center ${
        imagePosition === "left" ? "lg:flex-row-reverse" : ""
      }`}>
        {/* Content Column */}
        <div className={`space-y-5 sm:space-y-6 ${imagePosition === "left" ? "lg:col-span-7 lg:order-2" : "lg:col-span-7"}`}>
          {eyebrow && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                color: "var(--color-accent, var(--color-primary, #087A55))",
                backgroundColor: "var(--color-primary-soft, #DDF3E8)",
              }}
            >
              {showIcons && <Award className="w-3.5 h-3.5" />}
              <span>{eyebrow}</span>
            </div>
          )}

          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight break-words"
            style={{
              color: "var(--color-heading, var(--color-text-primary, #172B24))",
              fontFamily: "var(--font-heading, inherit)",
            }}
          >
            {title}
          </h2>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal">
            {description}
          </p>

          {storyParagraph && (
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {storyParagraph}
            </p>
          )}

          {/* Key Bullet Highlights */}
          {highlights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  {showIcons && (
                    <CheckCircle2
                      className="w-4 h-4 shrink-0"
                      style={{ color: "var(--color-icon, var(--color-primary, #087A55))" }}
                    />
                  )}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats Bar */}
          {stats.length > 0 && (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5 border-t"
              style={{ borderColor: "var(--color-divider, #E1EAE4)" }}
            >
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div
                    className="text-xl sm:text-2xl md:text-3xl font-extrabold"
                    style={{ color: "var(--color-accent, var(--color-primary, #087A55))" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[11px] sm:text-xs text-text-muted font-medium mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Column */}
        <div className={`relative w-full ${imagePosition === "left" ? "lg:col-span-5 lg:order-1" : "lg:col-span-5"}`}>
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-border aspect-16/10 sm:aspect-square w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Decorative Trust Badge (Hidden on very small mobile to prevent overflow) */}
          <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-3 bg-surface p-3.5 rounded-xl border border-border shadow-md">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">Top Rated Local Pro</div>
              <div className="text-[10px] text-text-muted">A+ BBB Accredited</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const aboutSplitDefinition: ComponentDefinition<AboutSplitProps> = {
  id: "about.split.v1",
  name: "About Us (Split Story & Stats)",
  category: "content",
  version: 1,
  schema: AboutSplitPropsSchema,
  defaults: AboutSplitPropsSchema.parse({}),
  component: AboutSplit,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "showIcons", label: "Show Bullet & Tag Icons", type: "switch" },
      { propName: "title", label: "Heading Title", type: "text" },
      { propName: "description", label: "Main Description", type: "textarea" },
      { propName: "storyParagraph", label: "Heritage Story", type: "textarea" },
      { propName: "imageUrl", label: "Image URL", type: "image" },
      {
        propName: "imagePosition",
        label: "Image Position",
        type: "select",
        options: [
          { label: "Right Side", value: "right" },
          { label: "Left Side", value: "left" },
        ],
      },
      { propName: "highlights", label: "Key Highlights", type: "list" },
      { propName: "stats", label: "Metrics & Numbers", type: "list" },
    ],
  },
};
