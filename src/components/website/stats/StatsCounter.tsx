"use client";

import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import { IconRenderer } from "@/components/website/shared/IconRenderer";

export const StatItemSchema = z.object({
  value: z.string().default("100+"),
  label: z.string().default("Happy Clients"),
  icon: z.string().default("award"),
});

export const StatsCounterPropsSchema = z.object({
  title: z.string().default("Numbers That Speak For Themselves"),
  subtitle: z.string().default("Real results delivered for local homes and businesses."),
  variant: z.enum(["strip", "cards"]).default("strip"),
  showIcons: z.boolean().default(true),
  animateCount: z.boolean().default(true),
  stats: z
    .array(StatItemSchema)
    .default([
      { value: "15+", label: "Years Experience", icon: "award" },
      { value: "2,400+", label: "Projects Completed", icon: "check" },
      { value: "98%", label: "Client Retention", icon: "heart" },
      { value: "24/7", label: "Support Available", icon: "support" },
    ]),
});

export type StatsCounterProps = z.infer<typeof StatsCounterPropsSchema>;

const parseNumber = (value: string): number => {
  const digits = value.replace(/[^0-9.]/g, "");
  return digits === "" ? 0 : parseFloat(digits);
};

const valueSuffix = (value: string): string => value.replace(/[0-9.]/g, "");

const StatItem: React.FC<{
  stat: StatsCounterProps["stats"][number];
  showIcons: boolean;
  animateCount: boolean;
}> = ({ stat, showIcons, animateCount }) => {
  const [displayValue, setDisplayValue] = useState(animateCount ? "0" : stat.value);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!animateCount || animated.current || typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || animated.current) return;
        animated.current = true;

        const target = parseNumber(stat.value);
        const suf = valueSuffix(stat.value);
        const duration = 1500;
        const start = performance.now();

        const tick = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(progress * target);
          setDisplayValue(current.toLocaleString() + suf);
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animateCount, stat.value]);

  return (
    <div
      ref={ref}
      className={
        showIcons
          ? "flex flex-col items-center text-center gap-2 p-4 sm:p-5 border"
          : "flex flex-col items-center text-center gap-1.5 min-w-0"
      }
      style={
        showIcons
          ? {
              backgroundColor: "var(--color-card-bg, #FFFFFF)",
              borderColor: "var(--color-border, #E1EAE4)",
              borderRadius: "var(--radius-card, 16px)",
              boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
            }
          : undefined
      }
    >
      {showIcons && stat.icon && stat.icon !== "none" && (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
          <IconRenderer icon={stat.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}
      <div
        className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight break-words tabular-nums"
        style={{ color: "var(--color-primary, #087A55)" }}
      >
        {displayValue}
      </div>
      <div className="text-[11px] sm:text-xs uppercase tracking-wider text-text-secondary font-semibold break-words">
        {stat.label}
      </div>
    </div>
  );
};

export const StatsCounter: React.FC<StatsCounterProps> = ({
  title,
  subtitle,
  variant = "strip",
  showIcons = true,
  animateCount = true,
  stats = [],
}) => {
  const isCards = variant === "cards";

  return (
    <section
      className="py-10 sm:py-14 px-4 sm:px-6 transition-colors"
      style={
        isCards
          ? { backgroundColor: "var(--color-section-bg, #FFFFFF)" }
          : { backgroundColor: "var(--color-alt-section-bg, #EDF4EF)" }
      }
    >
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 space-y-2">
            {title && (
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words"
                style={{
                  color: "var(--color-heading, var(--color-text-primary, #172B24))",
                  fontFamily: "var(--font-heading, inherit)",
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{subtitle}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {stats.map((stat, index) => (
            <StatItem key={index} stat={stat} showIcons={showIcons} animateCount={animateCount} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const statsCounterDefinition: ComponentDefinition<StatsCounterProps> = {
  id: "stats.counter.v1",
  name: "Stats & Counters",
  category: "content",
  version: 1,
  schema: StatsCounterPropsSchema,
  defaults: StatsCounterPropsSchema.parse({}),
  component: StatsCounter,
  editor: {
    controls: [
      { propName: "title", label: "Title", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      {
        propName: "variant",
        label: "Layout",
        type: "select",
        options: [
          { label: "Open Strip", value: "strip" },
          { label: "Card Tiles", value: "cards" },
        ],
      },
      { propName: "showIcons", label: "Show Icons", type: "switch" },
      { propName: "animateCount", label: "Animate Counting Numbers", type: "switch" },
      { propName: "stats", label: "Stats List", type: "list" },
    ],
  },
};
