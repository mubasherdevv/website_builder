"use client";

import React from "react";
import { z } from "zod";
import Link from "next/link";
import { ChevronRight, ArrowRight, Slash } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";

export const BreadcrumbItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const InnerPageHeroPropsSchema = z.object({
  // Content
  eyebrow: z.string().optional(),
  title: z.string().min(1).default("Our Services"),
  subtitle: z
    .string()
    .default(
      "Comprehensive roofing and exterior care backed by certified Texas craftspeople."
    ),
  primaryCtaLabel: z.string().optional(),
  primaryCtaHref: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaHref: z.string().optional(),

  // Breadcrumbs
  showBreadcrumb: z.boolean().default(true),
  hideBreadcrumbOnImageBg: z.boolean().default(false),
  breadcrumbSeparator: z.enum(["chevron", "slash", "arrow"]).default("chevron"),
  breadcrumbAlignment: z.enum(["left", "center", "right"]).default("center"),
  customBreadcrumbs: z.array(BreadcrumbItemSchema).optional(),
  breadcrumbColor: z.string().optional(),
  breadcrumbHoverColor: z.string().optional(),

  // Background
  bgType: z.enum(["image", "color", "gradient"]).default("image"),
  bgImageUrl: z
    .string()
    .default(
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80"
    ),
  bgMobileImageUrl: z.string().optional(),
  bgPosition: z
    .enum(["center", "top", "bottom", "left", "right"])
    .default("center"),
  bgSize: z.enum(["cover", "contain"]).default("cover"),
  overlayColor: z.string().default("#062B21"),
  overlayOpacity: z.number().min(0).max(100).default(75),
  bgColor: z.string().optional(),
  bgGradient: z
    .object({
      from: z.string().default("#063B2E"),
      to: z.string().default("#0D5744"),
      direction: z
        .enum(["to-r", "to-br", "to-b", "to-bl", "to-t"])
        .default("to-br"),
    })
    .optional(),

  // Layout & Alignment
  alignment: z.enum(["left", "center", "right"]).default("center"),
  verticalAlignment: z.enum(["top", "center", "bottom"]).default("center"),
  heightPreset: z
    .enum(["small", "medium", "large", "viewport", "custom"])
    .default("medium"),
  customHeightPx: z.number().optional(),
  contentMaxWidth: z.enum(["narrow", "normal", "wide", "full"]).default("normal"),
  paddingY: z.enum(["compact", "normal", "spacious"]).default("normal"),

  // Typography & Styling Overrides
  headingSize: z.enum(["sm", "md", "lg", "xl"]).default("lg"),
  textColor: z.string().optional(),
  borderRadius: z
    .enum(["none", "sm", "md", "lg", "xl", "2xl"])
    .default("none"),

  // Inheritance flag
  useGlobalDefaults: z.boolean().default(true),
});

export type InnerPageHeroProps = z.infer<typeof InnerPageHeroPropsSchema>;

export const InnerPageHero: React.FC<InnerPageHeroProps> = ({
  eyebrow,
  title = "Our Services",
  subtitle = "Comprehensive roofing and exterior care backed by certified Texas craftspeople.",
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,

  showBreadcrumb = true,
  hideBreadcrumbOnImageBg = false,
  breadcrumbSeparator = "chevron",
  breadcrumbAlignment = "center",
  customBreadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ],
  breadcrumbColor,
  breadcrumbHoverColor,

  bgType = "image",
  bgImageUrl = "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80",
  bgMobileImageUrl,
  bgPosition = "center",
  bgSize = "cover",
  overlayColor = "#062B21",
  overlayOpacity = 75,
  bgColor = "#063B2E",
  bgGradient,

  alignment = "center",
  verticalAlignment = "center",
  heightPreset = "medium",
  customHeightPx,
  contentMaxWidth = "normal",
  paddingY = "normal",

  headingSize = "lg",
  textColor,
  borderRadius = "none",
}) => {
  // Breadcrumb Visibility Rules:
  // If showBreadcrumb is false -> hide.
  // If bgType === 'image' and hideBreadcrumbOnImageBg is true -> hide.
  const isBreadcrumbVisible =
    showBreadcrumb && !(bgType === "image" && hideBreadcrumbOnImageBg);

  // Height preset calculations
  const getHeightStyle = () => {
    if (heightPreset === "small") return "min-h-[220px] sm:min-h-[260px]";
    if (heightPreset === "medium") return "min-h-[300px] sm:min-h-[380px]";
    if (heightPreset === "large") return "min-h-[400px] sm:min-h-[500px]";
    if (heightPreset === "viewport") return "min-h-[70vh] sm:min-h-[85vh]";
    return "";
  };

  // Padding preset calculations
  const getPaddingClasses = () => {
    if (paddingY === "compact") return "py-8 sm:py-12";
    if (paddingY === "spacious") return "py-20 sm:py-28";
    return "py-12 sm:py-18 md:py-20";
  };

  // Max width container
  const getMaxWidthClass = () => {
    if (contentMaxWidth === "narrow") return "max-w-2xl";
    if (contentMaxWidth === "wide") return "max-w-5xl";
    if (contentMaxWidth === "full") return "max-w-7xl";
    return "max-w-3xl";
  };

  // Text alignment
  const getAlignClasses = () => {
    if (alignment === "left") return "text-left items-start";
    if (alignment === "right") return "text-right items-end";
    return "text-center items-center";
  };

  // Vertical alignment
  const getVerticalAlignClass = () => {
    if (verticalAlignment === "top") return "justify-start";
    if (verticalAlignment === "bottom") return "justify-end";
    return "justify-center";
  };

  // Heading size
  const getHeadingSizeClasses = () => {
    if (headingSize === "sm") return "text-2xl sm:text-3xl lg:text-4xl";
    if (headingSize === "md") return "text-3xl sm:text-4xl lg:text-5xl";
    if (headingSize === "xl") return "text-4xl sm:text-5xl lg:text-6xl";
    return "text-3xl sm:text-4xl md:text-5xl"; // lg default
  };

  // Border radius
  const getBorderRadiusClass = () => {
    if (borderRadius === "sm") return "rounded-sm";
    if (borderRadius === "md") return "rounded-md";
    if (borderRadius === "lg") return "rounded-lg";
    if (borderRadius === "xl") return "rounded-xl";
    if (borderRadius === "2xl") return "rounded-2xl";
    return "rounded-none";
  };

  // Background styling
  const getBackgroundInlineStyle = (): React.CSSProperties => {
    if (customHeightPx && heightPreset === "custom") {
      return { minHeight: `${customHeightPx}px` };
    }
    return {};
  };

  // Separator icon
  const renderSeparator = () => {
    if (breadcrumbSeparator === "slash") {
      return <Slash className="w-3 h-3 text-white/50 shrink-0 -rotate-12" />;
    }
    if (breadcrumbSeparator === "arrow") {
      return <ArrowRight className="w-3 h-3 text-white/50 shrink-0" />;
    }
    return <ChevronRight className="w-3.5 h-3.5 text-white/50 shrink-0" />;
  };

  // Gradient directions
  const getGradientClass = () => {
    if (!bgGradient) return "bg-gradient-to-br from-[#063B2E] to-[#0D5744]";
    const dir = bgGradient.direction;
    if (dir === "to-r") return "bg-gradient-to-r";
    if (dir === "to-b") return "bg-gradient-to-b";
    if (dir === "to-bl") return "bg-gradient-to-bl";
    if (dir === "to-t") return "bg-gradient-to-t";
    return "bg-gradient-to-br";
  };

  return (
    <header
      className={`relative w-full overflow-hidden flex flex-col ${getHeightStyle()} ${getPaddingClasses()} ${getVerticalAlignClass()} ${getBorderRadiusClass()}`}
      style={getBackgroundInlineStyle()}
    >
      {/* Background layer */}
      {bgType === "image" && (
        <div className="absolute inset-0 z-0">
          <picture className="w-full h-full block">
            {bgMobileImageUrl && (
              <source media="(max-width: 640px)" srcSet={bgMobileImageUrl} />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bgImageUrl}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover transition-transform duration-700"
              style={{
                objectPosition: bgPosition,
                objectFit: bgSize,
              }}
            />
          </picture>
          {/* Configurable overlay */}
          <div
            className="absolute inset-0 transition-opacity"
            style={{
              backgroundColor: overlayColor,
              opacity: overlayOpacity / 100,
            }}
          />
        </div>
      )}

      {bgType === "color" && (
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor: bgColor || "#063B2E" }}
        />
      )}

      {bgType === "gradient" && (
        <div
          className={`absolute inset-0 z-0 ${getGradientClass()}`}
          style={{
            backgroundImage: bgGradient
              ? `linear-gradient(${bgGradient.direction.replace("to-", "to ")}, ${bgGradient.from}, ${bgGradient.to})`
              : undefined,
          }}
        />
      )}

      {/* Main Inner Banner Container */}
      <div
        className={`relative z-10 w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col ${getMaxWidthClass()} ${getAlignClasses()}`}
      >
        {/* Dynamic Breadcrumbs - INSIDE the banner container */}
        {isBreadcrumbVisible && customBreadcrumbs && customBreadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 sm:mb-6 overflow-x-auto max-w-full py-1"
          >
            <ol
              className={`flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium ${
                breadcrumbAlignment === "left"
                  ? "justify-start"
                  : breadcrumbAlignment === "right"
                  ? "justify-end"
                  : "justify-center"
              }`}
            >
              {customBreadcrumbs.map((item, idx) => {
                const isLast = idx === customBreadcrumbs.length - 1;
                return (
                  <li key={idx} className="flex items-center gap-1.5 sm:gap-2">
                    {idx > 0 && renderSeparator()}
                    {isLast ? (
                      <span
                        aria-current="page"
                        className="font-semibold text-white/95 truncate max-w-[200px] sm:max-w-[320px]"
                        style={{ color: breadcrumbColor }}
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-white/75 hover:text-white transition-colors duration-200 hover:underline"
                        style={{
                          color: breadcrumbColor ? `${breadcrumbColor}CC` : undefined,
                        }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Optional Eyebrow */}
        {eyebrow && (
          <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 backdrop-blur-xs">
            {eyebrow}
          </span>
        )}

        {/* Main H1 Page Title */}
        <h1
          className={`font-extrabold tracking-tight leading-tight sm:leading-tight ${getHeadingSizeClasses()} ${
            textColor ? "" : "text-white"
          }`}
          style={textColor ? { color: textColor } : undefined}
        >
          {title}
        </h1>

        {/* Subtitle / Description */}
        {subtitle && (
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/85 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}

        {/* Optional CTA buttons */}
        {(primaryCtaLabel || secondaryCtaLabel) && (
          <div
            className={`mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 ${
              alignment === "left"
                ? "justify-start"
                : alignment === "right"
                ? "justify-end"
                : "justify-center"
            }`}
          >
            {primaryCtaLabel && (
              <Link
                href={primaryCtaHref || "#"}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-bold bg-[#12A875] text-white hover:bg-[#0E8A60] transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {secondaryCtaLabel && (
              <Link
                href={secondaryCtaHref || "#"}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold bg-white/15 text-white hover:bg-white/25 border border-white/20 transition-colors backdrop-blur-xs"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export const innerPageHeroDefinition: ComponentDefinition<typeof InnerPageHeroPropsSchema> = {
  id: "hero.inner.v1",
  name: "Inner Page Hero",
  description:
    "Full-width inner page banner with background image/color/gradient, dark overlay, integrated breadcrumb, title, subtitle & CTAs.",
  version: 1,
  category: "hero",
  schema: InnerPageHeroPropsSchema,
  defaults: {
    title: "Our Services",
    subtitle:
      "Comprehensive roofing and exterior care backed by certified Texas craftspeople.",
    showBreadcrumb: true,
    hideBreadcrumbOnImageBg: false,
    breadcrumbSeparator: "chevron",
    breadcrumbAlignment: "center",
    bgType: "image",
    bgImageUrl:
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80",
    bgPosition: "center",
    bgSize: "cover",
    overlayColor: "#062B21",
    overlayOpacity: 75,
    alignment: "center",
    verticalAlignment: "center",
    heightPreset: "medium",
    contentMaxWidth: "normal",
    paddingY: "normal",
    headingSize: "lg",
    borderRadius: "none",
    useGlobalDefaults: true,
  },
  component: InnerPageHero,
  editor: {
    controls: [
      { propName: "title", label: "Page Heading", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      { propName: "eyebrow", label: "Eyebrow Badge", type: "text" },
      { propName: "bgImageUrl", label: "Background Image URL", type: "text" },
      { propName: "showBreadcrumb", label: "Show Breadcrumb", type: "switch" },
      { propName: "primaryCtaLabel", label: "Primary Button Label", type: "text" },
      { propName: "primaryCtaHref", label: "Primary Button URL", type: "text" },
    ],
  },
};
