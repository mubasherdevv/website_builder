/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import Link from "next/link";
import { Menu, X, ChevronDown, ChevronRight, ExternalLink, ArrowUpRight } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import { useHeaderNavigation } from "./useHeaderNavigation";

export const HeaderTransparentPropsSchema = z.object({
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
      { label: "About us", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Team", href: "#team" },
      { label: "Pricing", href: "#pricing" },
      { label: "Awards", href: "#awards" },
    ]),
  ctaLabel: z.string().default("Let's Collaborate"),
  ctaHref: z.string().default("#contact"),
  stickyHeader: z.boolean().default(true),
  overlayHero: z.boolean().default(true),
  scrolledBackground: z.enum(["dark", "glass", "light"]).default("glass"),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  desktopItemLimit: z.number().default(6),
});

export type HeaderTransparentProps = z.infer<typeof HeaderTransparentPropsSchema>;

export const HeaderTransparent: React.FC<HeaderTransparentProps> = ({
  brandName = "Site Nexa",
  logoUrl,
  menuId,
  websiteId,
  navLinks = [],
  ctaLabel = "Let's Collaborate",
  ctaHref = "#contact",
  stickyHeader = true,
  overlayHero = true,
  scrolledBackground = "glass",
  desktopItemLimit = 6,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedMobileIds, setExpandedMobileIds] = useState<string[]>([]);

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

  const effectiveSticky = menuSettings?.stickyHeader !== undefined ? menuSettings.stickyHeader : stickyHeader;
  const effectiveDropdownWidth = menuSettings?.dropdownWidth || 210;
  const effectiveCtaEnabled = menuSettings?.ctaButtonEnabled !== undefined ? menuSettings.ctaButtonEnabled : Boolean(ctaLabel);
  const effectiveCtaLabel = ctaLabel || menuSettings?.ctaButtonLabel || "Let's Collaborate";
  const effectiveCtaHref = ctaHref || menuSettings?.ctaButtonHref || "#contact";

  // Scroll detection for backdrop intensification
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileSubmenu = (id: string) => {
    setExpandedMobileIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Derive visual pill styles based on transparent & frosted effect
  const getPillBackgroundStyles = () => {
    if (scrolledBackground === "dark") {
      return "bg-slate-950/80 border-white/15 text-white shadow-xl shadow-black/20 backdrop-blur-2xl";
    }

    if (scrolledBackground === "light") {
      return isScrolled
        ? "bg-white/95 border-slate-200/90 text-slate-900 shadow-xl shadow-slate-900/10 backdrop-blur-2xl"
        : "bg-white/80 border-white/80 text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur-xl";
    }

    // Default: Premium Frosted Glass Pill
    return isScrolled
      ? "bg-white/75 border-white/60 text-slate-900 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl"
      : "bg-white/60 border-white/50 text-slate-900 shadow-lg shadow-black/5 backdrop-blur-xl";
  };

  const isDarkMode = scrolledBackground === "dark";

  return (
    <header
      className={`w-full transition-all duration-300 ${
        overlayHero ? "absolute top-0 left-0 z-40" : "relative z-30"
      } ${effectiveSticky ? "sticky top-0" : ""} pt-3 sm:pt-5 px-3 sm:px-6`}
    >
      {/* Floating Capsule Bar */}
      <div
        className={`max-w-6xl mx-auto rounded-full px-3 sm:px-5 py-2 sm:py-2.5 border flex items-center justify-between gap-3 sm:gap-6 min-w-0 transition-all duration-300 ${getPillBackgroundStyles()}`}
      >
        {/* Brand / Logo (Left) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold shrink-0 min-w-0 group py-1"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              className="h-8 sm:h-9 w-auto max-w-[160px] object-contain shrink-0 transition-transform group-hover:scale-105"
            />
          ) : (
            <span
              className={`text-base sm:text-[17px] font-extrabold tracking-tight truncate transition-colors ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {brandName}
            </span>
          )}
        </Link>

        {/* Center: Inner Capsule Navigation */}
        <nav
          className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-2xs backdrop-blur-md transition-colors ${
            isDarkMode
              ? "bg-white/10 border-white/15"
              : "bg-white/60 border-white/80"
          }`}
        >
          {visibleItems.map((link) => {
            const hasChildren = link.children && link.children.length > 0;
            const isOpen = openDropdownId === link.id;
            const active = isLinkActive(link.href);

            return (
              <div
                key={link.id}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenDropdownId(link.id)}
                onMouseLeave={() => setOpenDropdownId(null)}
              >
                <div className="flex items-center">
                  <Link
                    href={link.href || "#"}
                    target={link.openInNewTab ? "_blank" : undefined}
                    rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                    className={`px-3.5 py-1.5 rounded-full text-[14px] transition-all duration-150 flex items-center gap-1.5 ${
                      active
                        ? isDarkMode
                          ? "bg-emerald-500/25 text-emerald-300 font-bold shadow-xs border border-emerald-400/30"
                          : "bg-[var(--color-brand,#087A55)]/10 text-[var(--color-brand,#087A55)] font-bold shadow-xs border border-[var(--color-brand,#087A55)]/20"
                        : isDarkMode
                        ? "text-white/85 hover:text-white hover:bg-white/10 font-medium"
                        : "text-slate-700 hover:text-slate-950 hover:bg-white/70 font-medium"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.openInNewTab && (
                      <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                    )}
                  </Link>

                  {hasChildren && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenDropdownId(isOpen ? null : link.id);
                      }}
                      className={`p-1 -ml-1 transition-colors cursor-pointer ${
                        isDarkMode
                          ? "text-white/70 hover:text-white"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
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
                    className={`absolute top-full left-0 mt-2 py-2 border shadow-2xl rounded-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                      isDarkMode
                        ? "bg-slate-950/95 border-white/20 text-white backdrop-blur-2xl"
                        : "bg-white/95 border-slate-200/90 text-slate-900 backdrop-blur-2xl"
                    }`}
                    style={{ width: `${effectiveDropdownWidth}px` }}
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
                          className={`flex items-center justify-between px-3.5 py-1.5 text-xs transition-colors rounded-xl mx-1.5 ${
                            childActive
                              ? isDarkMode
                                ? "bg-emerald-500/20 text-emerald-300 font-bold"
                                : "bg-[var(--color-brand,#087A55)]/10 text-[var(--color-brand,#087A55)] font-bold"
                              : isDarkMode
                              ? "text-white/80 hover:text-white hover:bg-white/10"
                              : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{child.label}</span>
                          {child.openInNewTab ? (
                            <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
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
              onMouseEnter={() => setOpenDropdownId("overflow_transparent")}
              onMouseLeave={() => setOpenDropdownId(null)}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenDropdownId(openDropdownId === "overflow_transparent" ? null : "overflow_transparent")
                }
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                  isDarkMode
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-slate-950 hover:bg-white/40"
                }`}
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {openDropdownId === "overflow_transparent" && (
                <div
                  className={`absolute top-full right-0 mt-2 py-2 border shadow-2xl rounded-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                    isDarkMode
                      ? "bg-slate-950/95 border-white/20 text-white backdrop-blur-2xl"
                      : "bg-white/95 border-slate-200/90 text-slate-900 backdrop-blur-2xl"
                  }`}
                  style={{ width: `${effectiveDropdownWidth}px` }}
                >
                  {overflowItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href || "#"}
                      target={item.openInNewTab ? "_blank" : undefined}
                      onClick={() => setOpenDropdownId(null)}
                      className={`block px-3.5 py-1.5 text-xs rounded-xl mx-1.5 transition-colors ${
                        isDarkMode
                          ? "hover:bg-white/10 text-white"
                          : "hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Section: Pill CTA Button (Theme Brand Green) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {effectiveCtaEnabled && effectiveCtaLabel && (
            <Link
              href={effectiveCtaHref || "#"}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-[13.5px] font-semibold rounded-full transition-all duration-200 shadow-sm active:scale-95 text-center shrink-0 bg-[var(--color-brand,#087A55)] text-white hover:bg-[var(--color-brand-hover,#066747)] hover:shadow-md"
            >
              <span>{effectiveCtaLabel}</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-full transition-colors cursor-pointer ${
            isDarkMode
              ? "text-white hover:bg-white/10"
              : "text-slate-900 hover:bg-white/60"
          }`}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer (Rounded Capsule Style) */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden max-w-6xl mx-auto mt-2 rounded-3xl border p-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl ${
            isDarkMode
              ? "bg-slate-950/95 border-white/15 text-white"
              : "bg-white/95 border-slate-200/90 text-slate-900"
          }`}
        >
          <nav className="flex flex-col space-y-1">
            {visibleItems.concat(overflowItems).map((link) => {
              const hasChildren = link.children && link.children.length > 0;
              const isExpanded = expandedMobileIds.includes(link.id);
              const active = isLinkActive(link.href);

              return (
                <div
                  key={link.id}
                  className={`border-b py-1.5 last:border-b-0 ${
                    isDarkMode ? "border-white/10" : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href || "#"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-colors ${
                        active
                          ? isDarkMode
                            ? "bg-emerald-500/20 font-bold text-emerald-300"
                            : "bg-[var(--color-brand,#087A55)]/10 font-bold text-[var(--color-brand,#087A55)]"
                          : isDarkMode
                          ? "text-white/80 hover:text-white"
                          : "text-slate-700 hover:text-slate-950"
                      }`}
                    >
                      {link.label}
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleMobileSubmenu(link.id)}
                        className="p-2 opacity-75 hover:opacity-100"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div
                      className={`pl-3 py-1.5 space-y-1 rounded-xl my-1 ${
                        isDarkMode ? "bg-white/5" : "bg-slate-50"
                      }`}
                    >
                      {link.children!.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href || "#"}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1 px-3 text-xs opacity-85 hover:opacity-100"
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

          {effectiveCtaEnabled && effectiveCtaLabel && (
            <div className="pt-2">
              <Link
                href={effectiveCtaHref || "#"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs font-bold rounded-full transition-all text-center bg-[var(--color-brand,#087A55)] text-white hover:bg-[var(--color-brand-hover,#066747)] shadow-sm"
              >
                <span>{effectiveCtaLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export const headerTransparentDefinition: ComponentDefinition<HeaderTransparentProps> = {
  id: "header.transparent.v1",
  name: "Modern Transparent / Hero Header",
  category: "navigation",
  version: 1,
  schema: HeaderTransparentPropsSchema,
  defaults: HeaderTransparentPropsSchema.parse({}),
  component: HeaderTransparent,
  editor: {
    controls: [
      { propName: "brandName", label: "Business Name", type: "text" },
      { propName: "logoUrl", label: "Logo URL", type: "image" },
      { propName: "overlayHero", label: "Overlay Hero Section", type: "switch" },
      {
        propName: "scrolledBackground",
        label: "Scrolled Style",
        type: "select",
        options: [
          { label: "Frosted Glass", value: "glass" },
          { label: "Dark Forest", value: "dark" },
          { label: "Pure Light", value: "light" },
        ],
      },
      { propName: "stickyHeader", label: "Sticky on Scroll", type: "switch" },
      { propName: "ctaLabel", label: "CTA Button Text", type: "text" },
      { propName: "ctaHref", label: "CTA Button Destination", type: "text" },
      { propName: "desktopItemLimit", label: "Max Desktop Items", type: "number" },
    ],
  },
};
