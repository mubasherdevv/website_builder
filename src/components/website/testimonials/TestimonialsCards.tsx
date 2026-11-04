"use client";

import React, { useRef } from "react";
import { z } from "zod";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";

export const TestimonialItemSchema = z.object({
  quote: z.string().default("Outstanding craftsmanship, punctual team, and transparent upfront pricing."),
  authorName: z.string().default("Verified Client"),
  authorRole: z.string().default("Homeowner in Austin, TX"),
  rating: z.number().int().min(1).max(5).default(5),
  avatarUrl: z.string().optional(),
});

export const TestimonialsCardsPropsSchema = z.object({
  eyebrow: z.string().default("Customer Reviews"),
  title: z.string().default("Trusted by Hundreds of Local Clients"),
  subtitle: z
    .string()
    .default("Read real feedback from homeowners and businesses who rely on our services."),
  layout: z.enum(["grid", "carousel"]).default("carousel"),
  showStars: z.boolean().default(true),
  testimonials: z
    .array(TestimonialItemSchema)
    .default([
      {
        quote: "They arrived within 30 minutes on a Sunday morning and fixed our leak quickly. Transparent pricing with zero hidden fees.",
        authorName: "Sarah Jenkins",
        authorRole: "Verified Homeowner",
        rating: 5,
      },
      {
        quote: "Professional from start to finish. Highly recommend them for anyone needing dependable, prompt local support.",
        authorName: "Marcus Vance",
        authorRole: "Commercial Property Manager",
        rating: 5,
      },
      {
        quote: "Excellent communication, tidy workspace, and the final bill was exactly what was estimated.",
        authorName: "David Lee",
        authorRole: "Small Business Owner",
        rating: 5,
      },
      {
        quote: "Top-tier service and honest guidance. They saved us thousands by repairing rather than replacing unnecessarily.",
        authorName: "Elena Rostova",
        authorRole: "Residential Client",
        rating: 5,
      },
      {
        quote: "Their crew went above and beyond during a severe storm. Truly a 5-star experience all the way through.",
        authorName: "Robert Garcia",
        authorRole: "Austin Resident",
        rating: 5,
      },
    ]),
});

export type TestimonialsCardsProps = z.infer<typeof TestimonialsCardsPropsSchema>;

export const TestimonialsCards: React.FC<TestimonialsCardsProps> = ({
  eyebrow,
  title,
  subtitle,
  layout = "carousel",
  showStars = true,
  testimonials = [],
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

  const isCarousel = layout === "carousel";

  return (
    <section
      className="py-12 sm:py-16 md:py-20 border-y relative overflow-hidden transition-colors"
      style={{
        backgroundColor: "var(--color-alt-section-bg, #EDF4EF)",
        borderColor: "var(--color-divider, #E1EAE4)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Block with Carousel Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="space-y-2.5 max-w-2xl text-left">
            {eyebrow && (
              <span
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "var(--color-accent, var(--color-primary, #087A55))" }}
              >
                {eyebrow}
              </span>
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
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal">
                {subtitle}
              </p>
            )}
          </div>

          {/* Carousel Arrows */}
          {isCarousel && (
            <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll reviews left"
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border text-text-primary flex items-center justify-center transition-all shadow-xs cursor-pointer"
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
                aria-label="Scroll reviews right"
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border text-text-primary flex items-center justify-center transition-all shadow-xs cursor-pointer"
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

        {/* Testimonials Container */}
        {isCarousel ? (
          /* Horizontal Scroll Container (Smooth touch swipe on Mobile + Arrows on Desktop) */
          <div
            ref={scrollRef}
            tabIndex={0}
            className="flex gap-3.5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-6 sm:px-6 focus:outline-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {testimonials.map((item, idx) => {
              const rating = typeof item.rating === "number" ? Math.max(1, Math.min(5, item.rating)) : 5;
              return (
                <div
                  key={idx}
                  className="w-[84vw] max-w-[340px] sm:w-[320px] min-w-[250px] snap-center shrink-0 p-5 sm:p-7 md:p-8 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  style={{
                    backgroundColor: "var(--color-card-bg, #FFFFFF)",
                    borderColor: "var(--color-border, #E1EAE4)",
                    borderRadius: "var(--radius-card, 16px)",
                    boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                  }}
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      {showStars ? (
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rating }).map((_, sIdx) => (
                            <Star key={sIdx} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" />
                          ))}
                        </div>
                      ) : (
                        <div />
                      )}
                      <Quote className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted/40 shrink-0" />
                    </div>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div
                    className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t flex items-center gap-3"
                    style={{ borderColor: "var(--color-divider, #E1EAE4)" }}
                  >
                    {item.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.avatarUrl}
                        alt={item.authorName}
                        className="w-9 sm:w-10 h-9 sm:h-10 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-brand-soft text-brand font-bold text-xs flex items-center justify-center shrink-0">
                        {item.authorName.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary text-xs sm:text-sm truncate">{item.authorName}</p>
                      <p className="text-[11px] sm:text-xs text-text-muted truncate">{item.authorRole}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Standard Multi-Column Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((item, idx) => {
              const rating = typeof item.rating === "number" ? Math.max(1, Math.min(5, item.rating)) : 5;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-7 md:p-8 border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  style={{
                    backgroundColor: "var(--color-card-bg, #FFFFFF)",
                    borderColor: "var(--color-border, #E1EAE4)",
                    borderRadius: "var(--radius-card, 16px)",
                    boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
                  }}
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      {showStars ? (
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rating }).map((_, sIdx) => (
                            <Star key={sIdx} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" />
                          ))}
                        </div>
                      ) : (
                        <div />
                      )}
                      <Quote className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted/40 shrink-0" />
                    </div>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div
                    className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t flex items-center gap-3"
                    style={{ borderColor: "var(--color-divider, #E1EAE4)" }}
                  >
                    {item.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.avatarUrl}
                        alt={item.authorName}
                        className="w-9 sm:w-10 h-9 sm:h-10 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-brand-soft text-brand font-bold text-xs flex items-center justify-center shrink-0">
                        {item.authorName.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary text-xs sm:text-sm truncate">{item.authorName}</p>
                      <p className="text-[11px] sm:text-xs text-text-muted truncate">{item.authorRole}</p>
                    </div>
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

export const testimonialsCardsDefinition: ComponentDefinition<TestimonialsCardsProps> = {
  id: "testimonials.cards.v1",
  name: "Client Reviews & Quotes",
  category: "social",
  version: 1,
  schema: TestimonialsCardsPropsSchema,
  defaults: TestimonialsCardsPropsSchema.parse({}),
  component: TestimonialsCards,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow Tag", type: "text" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      {
        propName: "layout",
        label: "Layout",
        type: "select",
        options: [
          { label: "Horizontal Carousel", value: "carousel" },
          { label: "Standard Grid", value: "grid" },
        ],
      },
      { propName: "showStars", label: "Display Star Ratings", type: "switch" },
      { propName: "testimonials", label: "Reviews List", type: "list" },
    ],
  },
};
