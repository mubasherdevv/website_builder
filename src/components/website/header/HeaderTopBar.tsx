/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import Link from "next/link";
import {
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Search,
  Calendar,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import { useHeaderNavigation } from "./useHeaderNavigation";

export const HeaderTopBarPropsSchema = z.object({
  brandName: z.string().min(1).default("Site Nexa"),
  logoUrl: z.string().optional(),
  menuId: z.string().optional(),
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
      { label: "Projects", href: "/#projects" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/#about" },
      { label: "Contact", href: "/#contact" },
    ]),
  // Top bar props
  email: z.string().default("info@sitenexa.com"),
  phone: z.string().default("+1 (555) 123-4567"),
  location: z.string().default("New York, USA"),
  topBarBgColor: z.string().default("#063B2E"),
  topBarTextColor: z.string().default("#DDF3E8"),
  showTopBar: z.boolean().default(true),
  showSocials: z.boolean().default(true),
  socialFacebook: z.string().default("https://facebook.com"),
  socialInstagram: z.string().default("https://instagram.com"),
  socialLinkedin: z.string().default("https://linkedin.com"),
  socialYoutube: z.string().default("https://youtube.com"),
  // Main header props
  showSearch: z.boolean().default(true),
  ctaLabel: z.string().default("Request a Call"),
  ctaHref: z.string().default("/#contact"),
  stickyHeader: z.boolean().default(true),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  desktopItemLimit: z.number().default(6),
});

export type HeaderTopBarProps = z.infer<typeof HeaderTopBarPropsSchema>;

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  brandName = "Site Nexa",
  logoUrl,
  menuId,
  navLinks = [],
  email = "info@sitenexa.com",
  phone = "+1 (555) 123-4567",
  location = "New York, USA",
  topBarBgColor = "#063B2E",
  topBarTextColor = "#DDF3E8",
  showTopBar = true,
  showSocials = true,
  socialFacebook = "https://facebook.com",
  socialInstagram = "https://instagram.com",
  socialLinkedin = "https://linkedin.com",
  socialYoutube = "https://youtube.com",
  showSearch = true,
  ctaLabel = "Request a Call",
  ctaHref = "/#contact",
  stickyHeader = true,
  alignment = "center",
  desktopItemLimit = 6,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    fallbackLinks: navLinks,
    desktopItemLimit,
  });

  const effectiveAlignment = alignment || menuSettings?.alignment || "center";
  const effectiveSticky = menuSettings?.stickyHeader !== undefined ? menuSettings.stickyHeader : stickyHeader;
  const effectiveItemSpacing = menuSettings?.itemSpacing || 24;
  const effectiveFontSize = menuSettings?.fontSize || 14;
  const effectiveFontWeight = menuSettings?.fontWeight || "500";
  const effectiveDropdownWidth = menuSettings?.dropdownWidth || 210;
  const effectiveDropdownRadius = menuSettings?.dropdownBorderRadius || 10;
  const effectiveCtaEnabled = menuSettings?.ctaButtonEnabled !== undefined ? menuSettings.ctaButtonEnabled : Boolean(ctaLabel);
  const effectiveCtaLabel = ctaLabel || menuSettings?.ctaButtonLabel || "Request a Call";
  const effectiveCtaHref = ctaHref || menuSettings?.ctaButtonHref || "#contact";

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
    <header className={`w-full ${effectiveSticky ? "sticky top-0 z-40" : "relative z-30"}`}>
      {/* 1. TOP UTILITY BAR (Deep Forest / Primary Theme Accent) */}
      {showTopBar && (
        <div
          className="w-full text-xs py-2 px-4 sm:px-6 transition-colors border-b"
          style={{
            backgroundColor: topBarBgColor || "var(--color-deep-forest, #063B2E)",
            color: topBarTextColor || "var(--color-primary-soft, #DDF3E8)",
            borderColor: "rgba(255, 255, 255, 0.15)",
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left Info: Email, Phone, Location */}
            <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-[11px] sm:text-xs">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 opacity-80" />
                  <span className="hidden xs:inline">{email}</span>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 opacity-80" />
                  <span>{phone}</span>
                </a>
              )}
              {location && (
                <div className="hidden md:flex items-center gap-1.5 opacity-85">
                  <MapPin className="w-3.5 h-3.5 opacity-80" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* Right: Social Media Icons */}
            {showSocials && (
              <div className="flex items-center gap-3">
                {socialFacebook && (
                  <a
                    href={socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="hover:text-white transition-colors opacity-80 hover:opacity-100"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {socialInstagram && (
                  <a
                    href={socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="hover:text-white transition-colors opacity-80 hover:opacity-100"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {socialLinkedin && (
                  <a
                    href={socialLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="hover:text-white transition-colors opacity-80 hover:opacity-100"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {socialYoutube && (
                  <a
                    href={socialYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="hover:text-white transition-colors opacity-80 hover:opacity-100"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER (Clean Surface, Brand, Navigation, Search, CTA) */}
      <div
        className="w-full border-b shadow-xs transition-colors backdrop-blur-md"
        style={{
          backgroundColor: "var(--color-section-bg, #FFFFFF)",
          borderColor: "var(--color-divider, #E1EAE4)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-6 min-w-0">
          {/* Brand Logo (Left) */}
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

          {/* Navigation Links */}
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
                  onMouseEnter={() => hasChildren && setOpenDropdownId(link.id)}
                  onMouseLeave={() => setOpenDropdownId(null)}
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

            {/* Overflow "More" */}
            {overflowItems.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdownId("overflow_topbar")}
                onMouseLeave={() => setOpenDropdownId(null)}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdownId(openDropdownId === "overflow_topbar" ? null : "overflow_topbar")
                  }
                  className="py-2 text-xs sm:text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>More</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {openDropdownId === "overflow_topbar" && (
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

          {/* Right Action: Search Trigger + Primary CTA Button */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {showSearch && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Search website"
                  className="p-2 text-text-secondary hover:text-primary hover:bg-surface-subtle rounded-full transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>

                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 p-2 bg-surface rounded-card border border-border shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-subtle rounded-btn border border-border">
                      <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <input
                        type="text"
                        placeholder="Search services or articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs text-text-primary focus:outline-none"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="text-[10px] text-text-muted hover:text-text-primary"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {effectiveCtaEnabled && effectiveCtaLabel && (
              <Link
                href={effectiveCtaHref || "#"}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:opacity-90 active:scale-95 text-center shrink-0"
                style={{
                  backgroundColor: "var(--btn-primary-bg, var(--color-primary, #087A55))",
                  color: "var(--btn-primary-text, #FFFFFF)",
                  borderColor: "var(--btn-border, transparent)",
                  borderRadius: "var(--radius-button, 10px)",
                  borderWidth: "var(--btn-border-width, 1px)",
                  borderStyle: "solid",
                }}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{effectiveCtaLabel}</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-btn text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            backgroundColor: "var(--color-section-bg, #FFFFFF)",
            borderColor: "var(--color-divider, #E1EAE4)",
          }}
        >
          {/* Top Bar info inside mobile drawer */}
          {(email || phone || location) && (
            <div className="p-3 rounded-lg bg-surface-subtle text-xs space-y-1.5 border border-border">
              {email && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-text-primary font-semibold">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>{phone}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          )}

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

          {effectiveCtaEnabled && effectiveCtaLabel && (
            <div className="pt-2">
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
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{effectiveCtaLabel}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export const headerTopBarDefinition: ComponentDefinition<HeaderTopBarProps> = {
  id: "header.topbar.v1",
  name: "Top Bar + Main Header",
  category: "navigation",
  version: 1,
  schema: HeaderTopBarPropsSchema,
  defaults: HeaderTopBarPropsSchema.parse({}),
  component: HeaderTopBar,
  editor: {
    controls: [
      { propName: "brandName", label: "Business Name", type: "text" },
      { propName: "logoUrl", label: "Logo URL", type: "image" },
      { propName: "showTopBar", label: "Show Utility Top Bar", type: "switch" },
      { propName: "topBarBgColor", label: "Top Bar Background Color", type: "color" },
      { propName: "topBarTextColor", label: "Top Bar Text Color", type: "color" },
      { propName: "email", label: "Top Bar Email", type: "text" },
      { propName: "phone", label: "Top Bar Phone", type: "text" },
      { propName: "location", label: "Top Bar Location", type: "text" },
      { propName: "showSocials", label: "Show Social Icons", type: "switch" },
      { propName: "socialFacebook", label: "Facebook URL", type: "text" },
      { propName: "socialInstagram", label: "Instagram URL", type: "text" },
      { propName: "socialLinkedin", label: "LinkedIn URL", type: "text" },
      { propName: "socialYoutube", label: "YouTube URL", type: "text" },
      { propName: "showSearch", label: "Show Search Icon", type: "switch" },
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
      { propName: "stickyHeader", label: "Sticky Header on Scroll", type: "switch" },
      { propName: "desktopItemLimit", label: "Desktop Item Limit", type: "number" },
    ],
  },
};
