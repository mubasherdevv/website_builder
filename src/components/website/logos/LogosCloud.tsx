"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import {
  sanitizeFooterHref,
  sanitizeFooterImageUrl,
} from "@/components/website/footer/shared/footer-url";

export const LogoItemSchema = z.object({
  title: z.string().default("Client Brand"),
  imageUrl: z.string().default(""),
  href: z.string().default(""),
});

export const LogosCloudPropsSchema = z.object({
  title: z.string().default("Trusted By Industry Leaders"),
  subtitle: z.string().default("Local businesses and national brands rely on our work every day."),
  variant: z.enum(["grid", "marquee"]).default("grid"),
  grayscale: z.boolean().default(true),
  logos: z
    .array(LogoItemSchema)
    .default([
      {
        title: "Northline Group",
        imageUrl:
          "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=240&q=80",
        href: "",
      },
      {
        title: "Harbor & Co",
        imageUrl:
          "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&w=240&q=80",
        href: "",
      },
      {
        title: "Summit Partners",
        imageUrl:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=240&q=80",
        href: "",
      },
      {
        title: "Greenfield Estates",
        imageUrl:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=240&q=80",
        href: "",
      },
      {
        title: "Metro Logistics",
        imageUrl:
          "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=240&q=80",
        href: "",
      },
      {
        title: "Civic Builders",
        imageUrl:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=240&q=80",
        href: "",
      },
    ]),
});

export type LogosCloudProps = z.infer<typeof LogosCloudPropsSchema>;

interface LogoMarkProps {
  logo: { title: string; imageUrl: string; href: string };
  grayscale: boolean;
}

const LogoMark: React.FC<LogoMarkProps> = ({ logo, grayscale }) => {
  const [failed, setFailed] = useState(false);
  const source = sanitizeFooterImageUrl(logo.imageUrl);

  if (!source || failed) {
    return (
      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-text-secondary text-center line-clamp-2 break-words">
        {logo.title}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt={logo.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`max-h-8 sm:max-h-10 w-auto max-w-[110px] sm:max-w-[150px] object-contain transition-all duration-300 ${
        grayscale ? "grayscale opacity-70 hover:grayscale-0 hover:opacity-100" : "opacity-90 hover:opacity-100"
      }`}
    />
  );
};

export const LogosCloud: React.FC<LogosCloudProps> = ({
  title,
  subtitle,
  variant = "grid",
  grayscale = true,
  logos = [],
}) => {
  const isMarquee = variant === "marquee";
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const renderLogo = (logo: LogosCloudProps["logos"][number], key: string) => {
    const safeHref = sanitizeFooterHref(logo.href);
    const inner = <LogoMark logo={logo} grayscale={grayscale} />;

    const tileClass = isMarquee
      ? "flex items-center justify-center h-16 min-w-[130px] sm:min-w-[160px] px-3 shrink-0"
      : "flex items-center justify-center h-16 sm:h-20 px-3 border min-w-0";

    const tileStyle = isMarquee
      ? undefined
      : {
          backgroundColor: "var(--color-card-bg, #FFFFFF)",
          borderColor: "var(--color-border, #E1EAE4)",
          borderRadius: "var(--radius-card, 16px)",
        };

    if (safeHref) {
      const opensNewTab = /^https?:/i.test(safeHref);
      return (
        <a
          key={key}
          href={safeHref}
          aria-label={logo.title}
          {...(opensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`${tileClass} transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40`}
          style={tileStyle}
        >
          {inner}
        </a>
      );
    }

    return (
      <div key={key} className={tileClass} style={tileStyle}>
        {inner}
      </div>
    );
  };

  // Auto-scroll loop for marquee. Paused while user drags.
  useEffect(() => {
    if (!isMarquee || isDragging) return;
    const el = containerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    let scrollLeft = el.scrollLeft;
    const step = 0.5;

    const animate = () => {
      if (!isDragging) {
        scrollLeft += step;
        if (scrollLeft >= maxScroll) scrollLeft = 0;
        el.scrollLeft = scrollLeft;
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isMarquee, isDragging]);

  const onDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isMarquee) return;
      setIsDragging(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      startX.current = clientX;
      startScrollLeft.current = containerRef.current?.scrollLeft ?? 0;
    },
    [isMarquee]
  );

  const onDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !isMarquee) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const dx = clientX - startX.current;
      const el = containerRef.current;
      if (el) el.scrollLeft = Math.max(0, startScrollLeft.current - dx * 1.5);
    },
    [isDragging, isMarquee]
  );

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto transition-colors">
      {(title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8 space-y-1.5">
          {title && (
            <h2
              className="text-lg sm:text-xl font-bold tracking-tight break-words"
              style={{
                color: "var(--color-heading, var(--color-text-primary, #172B24))",
                fontFamily: "var(--font-heading, inherit)",
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed">{subtitle}</p>
          )}
        </div>
      )}

      {isMarquee ? (
        <div className="relative overflow-hidden max-w-6xl mx-auto">
          <div
            ref={containerRef}
            className="flex w-max gap-3 sm:gap-5 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            onMouseMove={onDragMove}
            onTouchMove={onDragMove}
            onMouseUp={onDragEnd}
            onTouchEnd={onDragEnd}
            onMouseLeave={onDragEnd}
          >
            {[false, true].map((isClone) => (
              <div
                key={isClone ? "clone" : "original"}
                aria-hidden={isClone || undefined}
                className="flex items-center gap-3 sm:gap-5"
              >
                {logos.map((logo, index) =>
                  renderLogo(logo, `${isClone ? "clone" : "original"}-${index}`)
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {logos.map((logo, index) => renderLogo(logo, `grid-${index}`))}
        </div>
      )}
    </section>
  );
};

export const logosCloudDefinition: ComponentDefinition<LogosCloudProps> = {
  id: "logos.cloud.v1",
  name: "Client Logos / Trust Bar",
  category: "social",
  version: 1,
  schema: LogosCloudPropsSchema,
  defaults: LogosCloudPropsSchema.parse({}),
  component: LogosCloud,
  editor: {
    controls: [
      { propName: "title", label: "Title", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      {
        propName: "variant",
        label: "Layout",
        type: "select",
        options: [
          { label: "Static Grid", value: "grid" },
          { label: "Draggable Scrolling Marquee", value: "marquee" },
        ],
      },
      { propName: "grayscale", label: "Grayscale Until Hover", type: "switch" },
      { propName: "logos", label: "Client Logos", type: "list" },
    ],
  },
};
