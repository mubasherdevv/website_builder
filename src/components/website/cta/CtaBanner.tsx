import React from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import { Sparkles, ArrowRight } from "lucide-react";

export const CtaBannerPropsSchema = z.object({
  eyebrow: z.string().default("Ready to Experience the Difference?"),
  title: z.string().default("Get Your Free Estimate & Project Consultation in Minutes"),
  description: z.string().default("No waiting, no hidden travel charges. Connect directly with our on-call specialist and lock in your service slot today."),
  primaryButtonLabel: z.string().default("Book Online Now"),
  primaryButtonHref: z.string().default("#contact"),
  secondaryButtonLabel: z.string().default("Call (512) 555-0199"),
  secondaryButtonHref: z.string().default("tel:5125550199"),
  badgeText: z.string().default("Guaranteed Same-Day Emergency Response Available"),
  variant: z.enum(["brand", "dark", "gradient"]).default("brand"),
  showBadgeIcon: z.boolean().default(true),
  showEyebrowIcon: z.boolean().default(true),
});

export type CtaBannerProps = z.infer<typeof CtaBannerPropsSchema>;

export const CtaBanner: React.FC<CtaBannerProps> = ({
  eyebrow,
  title,
  description,
  primaryButtonLabel,
  primaryButtonHref = "#contact",
  secondaryButtonLabel,
  secondaryButtonHref = "tel:5125550199",
  badgeText,
  variant = "brand",
  showEyebrowIcon = true,
}) => {
  const bgStyles = {
    brand: "bg-brand text-white",
    dark: "bg-slate-950 text-white border border-slate-800",
    gradient: "bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-950 text-white",
  }[variant] || "bg-brand text-white";

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className={`rounded-xl sm:rounded-2xl p-6 sm:p-10 lg:p-16 shadow-xl relative overflow-hidden ${bgStyles}`}>
        {/* Subtle decorative background circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/10 text-white backdrop-blur-xs">
              {showEyebrowIcon && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              <span>{eyebrow}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight break-words">
            {title}
          </h2>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 leading-relaxed font-normal max-w-2xl mx-auto">
            {description}
          </p>

          {/* Action Buttons (Stacked on mobile, side-by-side on sm+) */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto sm:max-w-none">
            {primaryButtonLabel && (
              <a
                href={primaryButtonHref || "#"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-btn bg-white text-brand font-bold text-sm hover:bg-slate-50 shadow-md transition-all text-center"
              >
                <span>{primaryButtonLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            {secondaryButtonLabel && (
              <a
                href={secondaryButtonHref || "#"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-btn bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs border border-white/20 transition-all text-center"
              >
                <span>{secondaryButtonLabel}</span>
              </a>
            )}
          </div>

          {badgeText && (
            <p className="text-[11px] sm:text-xs text-white/70 flex items-center justify-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>{badgeText}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export const ctaBannerDefinition: ComponentDefinition<CtaBannerProps> = {
  id: "cta.banner.v1",
  name: "Call to Action Conversion Banner",
  category: "content",
  version: 1,
  schema: CtaBannerPropsSchema,
  defaults: CtaBannerPropsSchema.parse({}),
  component: CtaBanner,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "showEyebrowIcon", label: "Show Sparkle Icon", type: "switch" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "description", label: "Description", type: "textarea" },
      { propName: "primaryButtonLabel", label: "Primary Button Label", type: "text" },
      { propName: "primaryButtonHref", label: "Primary Button URL", type: "text" },
      { propName: "secondaryButtonLabel", label: "Secondary Button Label", type: "text" },
      { propName: "secondaryButtonHref", label: "Secondary Button URL", type: "text" },
      { propName: "badgeText", label: "Trust Note", type: "text" },
      {
        propName: "variant",
        label: "Visual Theme",
        type: "select",
        options: [
          { label: "Brand Color Theme", value: "brand" },
          { label: "Dark High Contrast", value: "dark" },
          { label: "Indigo Gradient", value: "gradient" },
        ],
      },
    ],
  },
};
