/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import Link from "next/link";
import { Menu, X, Phone as PhoneIcon, ChevronDown, ChevronRight, ArrowRight, ExternalLink } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import { useHeaderNavigation } from "./useHeaderNavigation";

export const HeaderSimplePropsSchema = z.object({
  brandName: z.string().min(1).default("Site Nexa"),
  logoUrl: z.string().optional(),
  menuId: z.string().optional(),
  websiteId: z.string().optional(),
  navLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
        children: z.array(z.any()).optional(),
      })
    )
    .default([
      { label: "Home", href: "/" },
      { label: "Services", href: "/#services" },
      { label: "About", href: "/#about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/#contact" },
    ]),
  ctaLabel: z.string().default("Get a Quote"),
  ctaHref: z.string().default("/#contact"),
  phone: z.string().default("+1 (555) 123-4567"),
  showPhone: z.boolean().default(true),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  stickyHeader: z.boolean().default(true),
  transparentHeader: z.boolean().default(false),
  dropdownTrigger: z.enum(["hover", "click"]).default("hover"),
  desktopItemLimit: z.number().default(6),
});

export type HeaderSimpleProps = z.infer<typeof HeaderSimplePropsSchema>;

export const HeaderSimple: React.FC<HeaderSimpleProps> = ({
  brandName = "Site Nexa",
  logoUrl,
  menuId,
  websiteId,
  navLinks = [],
  ctaLabel = "Get a Quote",
  ctaHref = "/#contact",
  phone = "+1 (555) 123-4567",
  showPhone = true,
  alignment = "center",
  stickyHeader = true,
  transparentHeader = false,
  dropdownTrigger = "hover",
  desktopItemLimit = 6,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedMobileIds, setExpandedMobileIds] = useState<string[]>([]);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const isValidLogo = Boolean(
    logoUrl &&
    typeof logoUrl === "string" &&
    logoUrl.trim().length > 3 &&
    (logoUrl.startsWith("http://") ||
      logoUrl.startsWith("https://") ||
      logoUrl.startsWith("/") ||
      logoUrl.startsWith("data:image/")) &&
    !imgError
  );

  const {
    menuSettings,
    visibleItems,
    overflowItems,
    isLinkActive,
  } = useHeaderNavigation({
    menuId,
    websiteId,
    fallbackLinks: navLinks,
    desktopItemLimit,
  });

  const effectiveAlignment = alignment || menuSettings?.alignment || "center";
  const effectiveSticky = menuSettings?.stickyHeader !== undefined ? menuSettings.stickyHeader : stickyHeader;
  const effectiveTransparent = menuSettings?.transparentHeader !== undefined ? menuSettings.transparentHeader : transparentHeader;
  const effectiveDropdownTrigger = menuSettings?.dropdownTrigger || dropdownTrigger;
  const effectiveItemSpacing = menuSettings?.itemSpacing || 24;
  const effectiveFontSize = menuSettings?.fontSize || 14;
  const effectiveFontWeight = menuSettings?.fontWeight || "500";
  const effectiveDropdownWidth = menuSettings?.dropdownWidth || 210;
  const effectiveDropdownRadius = menuSettings?.dropdownBorderRadius || 10;
  const effectiveCtaEnabled = menuSettings?.ctaButtonEnabled !== undefined ? menuSettings.ctaButtonEnabled : Boolean(ctaLabel);
  const effectiveCtaLabel = (ctaLabel && ctaLabel !== "Get a Quote")
    ? ctaLabel
    : ((menuSettings?.ctaButtonLabel !== undefined && menuSettings.ctaButtonLabel !== "") ? menuSettings.ctaButtonLabel : ctaLabel);
  const effectiveCtaHref = (menuSettings?.ctaButtonHref !== undefined && menuSettings.ctaButtonHref !== "") ? menuSettings.ctaButtonHref : ctaHref;
  const effectiveMobileCta = menuSettings?.mobileCtaEnabled !== undefined ? menuSettings.mobileCtaEnabled : true;

  const toggleMobileSubmenu = (id: string) => {
    setExpandedMobileIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getAlignmentClass = () => {
    if (effectiveAlignment === "left") return "justify-start";
    if (effectiveAlignment === "right") return "justify-end";
    return "justify-center";
  };

  return (
    <header
      className={`w-full border-b transition-all duration-200 ${
        effectiveSticky ? "sticky top-0 z-40 shadow-xs backdrop-blur-md" : "relative z-30"
      }`}
      style={{
        backgroundColor: effectiveTransparent ? "transparent" : "var(--color-section-bg, #FFFFFF)",
        borderColor: "var(--color-divider, #E1EAE4)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-6 min-w-0">
        {/* Brand / Logo (Left) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-base sm:text-lg md:text-xl shrink-0 min-w-0 group"
          style={{ color: "var(--color-heading, var(--color-primary, #087A55))" }}
        >
          {isValidLogo ? (
            <img
              src={logoUrl}
              alt=""
              onError={() => setImgError(true)}
              className="h-8 sm:h-10 w-auto object-contain shrink-0 rounded transition-transform group-hover:scale-105"
            />
          ) : (
            <div
              className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center font-extrabold text-white text-base shadow-xs shrink-0"
              style={{ backgroundColor: "var(--color-primary, #087A55)" }}
            >
              {brandName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate tracking-tight font-extrabold">{brandName}</span>
        </Link>

        {/* Desktop Navigation Links (Center / Flexible) */}
        <nav
          className={`hidden md:flex items-center flex-1 min-w-0 ${getAlignmentClass()}`}
          style={{ gap: `${effectiveItemSpacing}px` }}
        >
          {visibleItems.map((link) => {
            const hasChildren = link.children && link.children.length > 0;
            const isOpen = openDropdownId === link.id;
            const active = isLinkActive(link.href);

            return (
              <div
                key={link.id}
                className="relative"
                onMouseEnter={() => {
                  if (effectiveDropdownTrigger === "hover" && hasChildren) {
                    setOpenDropdownId(link.id);
                  }
                }}
                onMouseLeave={() => {
                  if (effectiveDropdownTrigger === "hover") {
                    setOpenDropdownId(null);
                  }
                }}
              >
                <div className="flex items-center">
                  <Link
                    href={link.href || "#"}
                    target={link.openInNewTab ? "_blank" : undefined}
                    rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                    className="relative py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 group/link"
                    style={{
                      fontSize: `${effectiveFontSize}px`,
                      fontWeight: effectiveFontWeight,
                      color: active
                        ? "var(--color-primary, #087A55)"
                        : "var(--color-text-secondary, #64756C)",
                    }}
                  >
                    <span className="group-hover/link:text-primary transition-colors">{link.label}</span>
                    {active && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ backgroundColor: "var(--color-primary, #087A55)" }}
                      />
                    )}
                    {link.openInNewTab && (
                      <ExternalLink className="w-3 h-3 text-text-muted shrink-0 opacity-60" />
                    )}
                  </Link>

                  {hasChildren && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`Toggle ${link.label} dropdown`}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenDropdownId(isOpen ? null : link.id);
                      }}
                      className="p-1 -ml-0.5 text-text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {hasChildren && isOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 py-1.5 bg-surface border border-border shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    style={{
                      width: `${effectiveDropdownWidth}px`,
                      borderRadius: `${effectiveDropdownRadius}px`,
                      backgroundColor: "var(--color-section-bg, #FFFFFF)",
                      borderColor: "var(--color-divider, #E1EAE4)",
                    }}
                  >
                    {link.children!.map((child) => {
                      const childActive = isLinkActive(child.href);
                      return (
                        <Link
                          key={child.id}
                          href={child.href || "#"}
                          target={child.openInNewTab ? "_blank" : undefined}
                          rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                          onClick={() => setOpenDropdownId(null)}
                          className="flex items-center justify-between px-3.5 py-2 text-xs transition-colors hover:bg-surface-subtle"
                          style={{
                            color: childActive
                              ? "var(--color-primary, #087A55)"
                              : "var(--color-text-primary, #172B24)",
                            fontWeight: childActive ? "600" : "400",
                          }}
                        >
                          <span className="truncate">{child.label}</span>
                          {child.openInNewTab ? (
                            <ExternalLink className="w-3 h-3 text-text-muted opacity-50 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 opacity-30 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Overflow Menu ("More") */}
          {overflowItems.length > 0 && (
            <div
              className="relative"
              onMouseEnter={() => {
                if (effectiveDropdownTrigger === "hover") setOpenDropdownId("overflow_menu");
              }}
              onMouseLeave={() => {
                if (effectiveDropdownTrigger === "hover") setOpenDropdownId(null);
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenDropdownId(openDropdownId === "overflow_menu" ? null : "overflow_menu")
                }
                className="py-2 text-xs sm:text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {openDropdownId === "overflow_menu" && (
                <div
                  className="absolute top-full right-0 mt-1 py-1.5 bg-surface border border-border shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  style={{
                    width: `${effectiveDropdownWidth}px`,
                    borderRadius: `${effectiveDropdownRadius}px`,
                    backgroundColor: "var(--color-section-bg, #FFFFFF)",
                  }}
                >
                  {overflowItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href || "#"}
                      target={item.openInNewTab ? "_blank" : undefined}
                      onClick={() => setOpenDropdownId(null)}
                      className="block px-3.5 py-2 text-xs text-text-primary hover:bg-surface-subtle transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Section: Contact Phone + Primary CTA Button */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4 shrink-0 pl-3">
          {showPhone && phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
              style={{ color: "var(--color-text-primary, #172B24)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-primary-soft, #DDF3E8)" }}
              >
                <PhoneIcon
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--color-primary, #087A55)" }}
                />
              </div>
              <span className="hidden lg:inline shrink-0">{phone}</span>
            </a>
          )}

          {effectiveCtaEnabled && effectiveCtaLabel && (
            <Link
              href={effectiveCtaHref || "#"}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:opacity-90 active:scale-95 text-center shrink-0"
              style={{
                backgroundColor: "var(--btn-primary-bg, var(--color-primary, #087A55))",
                color: "var(--btn-primary-text, #FFFFFF)",
                borderColor: "var(--btn-border, transparent)",
                borderRadius: "var(--radius-button, 10px)",
                borderWidth: "var(--btn-border-width, 1px)",
                borderStyle: "solid",
              }}
            >
              <span>{effectiveCtaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-btn text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            backgroundColor: "var(--color-section-bg, #FFFFFF)",
            borderColor: "var(--color-divider, #E1EAE4)",
          }}
        >
          <nav className="flex flex-col space-y-1">
            {visibleItems.concat(overflowItems).map((link) => {
              const hasChildren = link.children && link.children.length > 0;
              const isExpanded = expandedMobileIds.includes(link.id);
              const active = isLinkActive(link.href);

              return (
                <div key={link.id} className="border-b border-border/40 py-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href || "#"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 px-2 py-2 text-xs sm:text-sm font-medium transition-colors"
                      style={{
                        color: active
                          ? "var(--color-primary, #087A55)"
                          : "var(--color-text-primary, #172B24)",
                        fontWeight: active ? "700" : "500",
                      }}
                    >
                      {link.label}
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleMobileSubmenu(link.id)}
                        className="p-2 text-text-muted hover:text-primary"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div className="pl-4 py-1 space-y-1 bg-surface-subtle/60 rounded-md my-1">
                      {link.children!.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href || "#"}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 px-2 text-xs text-text-secondary hover:text-primary"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div
            className="pt-3.5 mt-2.5 border-t space-y-2.5"
            style={{ borderColor: "var(--color-divider, #E1EAE4)" }}
          >
            {phone && (
              <a
                href={`tel:${phone}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3.5 rounded-btn border text-xs font-semibold hover:bg-surface-subtle transition-colors"
                style={{
                  color: "var(--color-text-primary, #172B24)",
                  borderColor: "var(--color-border, #E1EAE4)",
                }}
              >
                <PhoneIcon
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--color-primary, #087A55)" }}
                />
                <span>Call Us: {phone}</span>
              </a>
            )}

            {effectiveMobileCta && effectiveCtaLabel && (
              <Link
                href={effectiveCtaHref || "#"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold shadow-xs transition-all text-center"
                style={{
                  backgroundColor: "var(--btn-primary-bg, var(--color-primary, #087A55))",
                  color: "var(--btn-primary-text, #FFFFFF)",
                  borderColor: "var(--btn-border, transparent)",
                  borderRadius: "var(--radius-button, 10px)",
                  borderWidth: "var(--btn-border-width, 1px)",
                  borderStyle: "solid",
                }}
              >
                <span>{effectiveCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export const headerSimpleDefinition: ComponentDefinition<HeaderSimpleProps> = {
  id: "header.simple.v1",
  name: "Simple Navigation Header",
  category: "navigation",
  version: 1,
  schema: HeaderSimplePropsSchema,
  defaults: HeaderSimplePropsSchema.parse({}),
  component: HeaderSimple,
  editor: {
    controls: [
      { propName: "brandName", label: "Business Name", type: "text" },
      { propName: "logoUrl", label: "Logo URL", type: "image" },
      { propName: "phone", label: "Phone Number", type: "text" },
      { propName: "showPhone", label: "Show Phone Number", type: "switch" },
      { propName: "ctaLabel", label: "CTA Button Text", type: "text" },
      { propName: "ctaHref", label: "CTA Button Link", type: "text" },
      {
        propName: "alignment",
        label: "Nav Alignment",
        type: "select",
        options: [
          { label: "Center Aligned", value: "center" },
          { label: "Right Aligned", value: "right" },
          { label: "Left Aligned", value: "left" },
        ],
      },
      {
        propName: "dropdownTrigger",
        label: "Dropdown Trigger",
        type: "select",
        options: [
          { label: "Hover + Keyboard", value: "hover" },
          { label: "Click / Tap", value: "click" },
        ],
      },
      { propName: "stickyHeader", label: "Sticky Header on Scroll", type: "switch" },
      { propName: "transparentHeader", label: "Transparent Background", type: "switch" },
      { propName: "desktopItemLimit", label: "Desktop Item Limit", type: "number" },
    ],
  },
};

// Also export alias headerClassicDefinition pointing to classic business variant
export const headerClassicDefinition: ComponentDefinition<HeaderSimpleProps> = {
  ...headerSimpleDefinition,
  id: "header.classic.v1",
};
