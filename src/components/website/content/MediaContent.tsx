"use client";

import React, { useState } from "react";
import { z } from "zod";
import { CheckCircle, Image as ImageIcon } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import {
  sanitizeFooterHref,
  sanitizeFooterImageUrl,
} from "@/components/website/footer/shared/footer-url";

export const MediaContentPropsSchema = z.object({
  eyebrow: z.string().default("Why Choose Us"),
  title: z.string().default("Detail-Obsessed Work, Delivered On Schedule"),
  body: z
    .string()
    .default(
      "We combine experienced tradespeople with clear communication and modern equipment. Every project starts with a written scope and finishes with a walkthrough, so you know exactly what you paid for.\n\nNo subcontractor surprises, no vague pricing, and no mess left behind."
    ),
  bullets: z.array(z.string()).default([
    "Fixed quotes approved before work starts",
    "Licensed, insured and background-checked team",
    "Clean site and written completion report",
  ]),
  imageUrl: z
    .string()
    .default(
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"
    ),
  imageAlt: z.string().default("Our team completing a project on site"),
  imagePosition: z.enum(["left", "right"]).default("right"),
  imageAspect: z.enum(["video", "square"]).default("video"),
  ctaLabel: z.string().default("Request A Quote"),
  ctaHref: z.string().default("#contact"),
});

export type MediaContentProps = z.infer<typeof MediaContentPropsSchema>;

export const MediaContent: React.FC<MediaContentProps> = ({
  eyebrow,
  title,
  body,
  bullets = [],
  imageUrl,
  imageAlt,
  imagePosition = "right",
  imageAspect = "video",
  ctaLabel,
  ctaHref,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const safeImage = sanitizeFooterImageUrl(imageUrl);
  const safeHref = sanitizeFooterHref(ctaHref);
  const isImageLeft = imagePosition === "left";
  const aspectClass = imageAspect === "square" ? "aspect-square" : "aspect-video";

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        {/* Text block (first in DOM so mobile reads top-down) */}
        <div className={`min-w-0 space-y-3 ${isImageLeft ? "lg:order-2" : "lg:order-1"}`}>
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
          {body && (
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line break-words">
              {body}
            </p>
          )}

          {bullets.length > 0 && (
            <ul className="space-y-2 pt-1">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2 min-w-0">
                  <CheckCircle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: "var(--color-primary, #087A55)" }}
                  />
                  <span className="text-xs text-text-secondary leading-relaxed break-words">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {ctaLabel && safeHref && (
            <div className="pt-2">
              <a
                href={safeHref}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-btn font-semibold text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                style={{
                  backgroundColor: "var(--btn-primary-bg, #087A55)",
                  color: "var(--btn-primary-text, #FFFFFF)",
                }}
              >
                {ctaLabel}
              </a>
            </div>
          )}
        </div>

        {/* Media block */}
        <div className={`min-w-0 ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
          <div
            className={`w-full ${aspectClass} overflow-hidden border shadow-sm`}
            style={{
              backgroundColor: "var(--color-card-bg, #FFFFFF)",
              borderColor: "var(--color-border, #E1EAE4)",
              borderRadius: "var(--radius-card, 16px)",
            }}
          >
            {safeImage && !imageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={safeImage}
                alt={imageAlt || title}
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: "var(--color-primary-soft, #DDF3E8)" }}
              >
                <ImageIcon
                  className="w-8 h-8"
                  style={{ color: "var(--color-primary, #087A55)" }}
                />
                <span className="text-[11px] font-semibold" style={{ color: "var(--color-primary, #087A55)" }}>
                  Add an image URL in the properties panel
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const mediaContentDefinition: ComponentDefinition<MediaContentProps> = {
  id: "content.media.v1",
  name: "Image + Text (Media Split)",
  category: "content",
  version: 1,
  schema: MediaContentPropsSchema,
  defaults: MediaContentPropsSchema.parse({}),
  component: MediaContent,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "body", label: "Body Content", type: "textarea" },
      { propName: "bullets", label: "Bullet Points", type: "list" },
      { propName: "imageUrl", label: "Image URL", type: "image" },
      { propName: "imageAlt", label: "Image Alt Text (SEO)", type: "text" },
      {
        propName: "imagePosition",
        label: "Image Position",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      {
        propName: "imageAspect",
        label: "Image Shape",
        type: "select",
        options: [
          { label: "Widescreen (16:9)", value: "video" },
          { label: "Square", value: "square" },
        ],
      },
      { propName: "ctaLabel", label: "Button Label", type: "text" },
      { propName: "ctaHref", label: "Button URL", type: "text" },
    ],
  },
};
