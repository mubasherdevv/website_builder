"use client";

import React, { useState } from "react";
import { WebsiteMenu } from "@/types/navigation";
import {
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
  Menu as MenuIcon,
  X,
  ChevronRight,
} from "lucide-react";

interface NavigationMenuPreviewProps {
  menu: WebsiteMenu;
  websiteName?: string;
  onClose: () => void;
}

export const NavigationMenuPreview: React.FC<NavigationMenuPreviewProps> = ({
  menu,
  websiteName = "Austin Pro Roofing",
  onClose,
}) => {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedMobileParentIds, setExpandedMobileParentIds] = useState<string[]>([]);

  const settings = menu.settings;

  // Filter visible items
  const activeItems = menu.items.filter((item) => {
    if (!item.enabled) return false;
    if (device === "desktop" && !item.visibility.desktop) return false;
    if (device === "tablet" && !item.visibility.tablet) return false;
    if (device === "mobile" && !item.visibility.mobile) return false;
    return true;
  });

  // Calculate overflow for desktop
  const maxItems = settings.maxVisibleTopLevelItems || 6;
  const visibleDesktopItems =
    settings.overflowBehavior === "more_dropdown" && activeItems.length > maxItems
      ? activeItems.slice(0, maxItems)
      : activeItems;
  const overflowItems =
    settings.overflowBehavior === "more_dropdown" && activeItems.length > maxItems
      ? activeItems.slice(maxItems)
      : [];

  const toggleMobileParent = (id: string) => {
    setExpandedMobileParentIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface-subtle overflow-hidden">
      {/* Top Preview Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-primary">Live Navigation Preview</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {menu.name} ({menu.location})
          </span>
        </div>

        {/* Device Mode Switcher */}
        <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => {
              setDevice("desktop");
              setMobileDrawerOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${device === "desktop"
              ? "bg-surface shadow-xs text-primary font-bold"
              : "text-text-muted hover:text-text-primary"
              }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDevice("tablet");
              setMobileDrawerOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${device === "tablet"
              ? "bg-surface shadow-xs text-primary font-bold"
              : "text-text-muted hover:text-text-primary"
              }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDevice("mobile");
              setMobileDrawerOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${device === "mobile"
              ? "bg-surface shadow-xs text-primary font-bold"
              : "text-text-muted hover:text-text-primary"
              }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-subtle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-start justify-center">
        {device === "desktop" && (
          <div className="w-full max-w-6xl bg-surface rounded-xl border border-border shadow-md overflow-visible min-h-[400px]">
            {/* Desktop Header */}
            <header
              className="w-full border-b border-border px-6 py-4 flex items-center justify-between relative bg-surface z-20"
              style={{
                fontSize: `${settings.fontSize}px`,
                fontWeight: settings.fontWeight,
              }}
            >
              {/* Brand Logo */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-primary tracking-tight">
                  {websiteName}
                </span>
              </div>

              {/* Navigation Bar */}
              <nav
                className="flex items-center flex-1 px-6"
                style={{
                  gap: `${settings.itemSpacing}px`,
                  justifyContent:
                    settings.alignment === "left"
                      ? "flex-start"
                      : settings.alignment === "center"
                      ? "center"
                      : "flex-end",
                }}
              >
                {visibleDesktopItems.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isOpen = openDropdownId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative group"
                      onMouseEnter={() => {
                        if (settings.dropdownTrigger === "hover") setOpenDropdownId(item.id);
                      }}
                      onMouseLeave={() => {
                        if (settings.dropdownTrigger === "hover") setOpenDropdownId(null);
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (settings.dropdownTrigger === "click" || hasChildren) {
                            setOpenDropdownId(isOpen ? null : item.id);
                          }
                        }}
                        className={`flex items-center gap-1 py-1 text-text-primary hover:text-primary transition-colors cursor-pointer ${item.isBroken ? "text-status-danger" : ""
                          }`}
                      >
                        <span>{item.label}</span>
                        {hasChildren && (
                          <ChevronDown className="w-3.5 h-3.5 text-text-muted transition-transform group-hover:rotate-180" />
                        )}
                      </button>

                      {/* Dropdown Menu */}
                      {hasChildren && (
                        <div
                          className={`absolute top-full left-0 mt-1 py-1.5 bg-surface rounded-md border border-border shadow-${settings.dropdownShadow} z-30 transition-all ${
                            isOpen
                              ? "block"
                              : settings.dropdownTrigger === "hover"
                              ? "hidden group-hover:block"
                              : "hidden"
                          }`}
                          style={{
                            width: `${settings.dropdownWidth}px`,
                            borderRadius: `${settings.dropdownBorderRadius}px`,
                          }}
                        >
                          {item.children!.map((sub) => {
                            const subHasChildren = sub.children && sub.children.length > 0;
                            return (
                              <div key={sub.id} className="relative group/sub">
                                <div className="flex items-center justify-between px-3 py-2 text-xs text-text-primary hover:bg-surface-subtle hover:text-primary transition-colors cursor-pointer">
                                  <span>{sub.label}</span>
                                  {subHasChildren && <ChevronRight className="w-3 h-3 text-text-muted" />}
                                </div>

                                {/* Level 3 Nested Submenu */}
                                {subHasChildren && (
                                  <div
                                    className="absolute left-full top-0 ml-1 py-1 bg-surface rounded-md border border-border shadow-md hidden group-hover/sub:block"
                                    style={{ width: `${settings.dropdownWidth}px` }}
                                  >
                                    {sub.children!.map((nested) => (
                                      <div
                                        key={nested.id}
                                        className="px-3 py-1.5 text-xs text-text-primary hover:bg-surface-subtle hover:text-primary"
                                      >
                                        {nested.label}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* More Dropdown for Overflow */}
                {overflowItems.length > 0 && (
                  <div
                    className="relative group"
                    onMouseEnter={() => setOpenDropdownId("overflow")}
                    onMouseLeave={() => setOpenDropdownId(null)}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1 py-1 text-text-secondary hover:text-primary font-medium"
                    >
                      <span>More</span>
                      <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                    </button>

                    <div
                      className={`absolute top-full right-0 mt-1 py-1.5 bg-surface rounded-md border border-border shadow-${settings.dropdownShadow} z-30 ${openDropdownId === "overflow" ? "block" : "hidden"
                        }`}
                      style={{ width: `${settings.dropdownWidth}px` }}
                    >
                      {overflowItems.map((over) => (
                        <div
                          key={over.id}
                          className="px-3 py-1.5 text-xs text-text-primary hover:bg-surface-subtle hover:text-primary cursor-pointer"
                        >
                          {over.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </nav>

              {/* Right CTA */}
              {settings.ctaButtonEnabled && (
                <div className="shrink-0">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-btn bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary-hover transition-colors"
                  >
                    {settings.ctaButtonLabel || "Get a Quote"}
                  </button>
                </div>
              )}
            </header>

            {/* Dummy hero preview content */}
            <div className="p-12 text-center bg-surface-subtle/40">
              <h2 className="text-xl font-bold text-text-primary">
                Austin&apos;s Premier Roofing Specialists
              </h2>
              <p className="text-xs text-text-secondary max-w-md mx-auto mt-2">
                This is how your assigned navigation menu renders across the top of your published pages.
              </p>
            </div>
          </div>
        )}

        {(device === "tablet" || device === "mobile") && (
          <div
            className={`bg-surface rounded-2xl border-4 border-border shadow-2xl overflow-hidden relative ${device === "tablet" ? "w-[640px] min-h-[500px]" : "w-[360px] min-h-[580px]"
              }`}
          >
            {/* Mobile Header Bar */}
            <header className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
              <span className="font-bold text-sm text-primary tracking-tight">
                {websiteName}
              </span>

              <button
                type="button"
                onClick={() => setMobileDrawerOpen((prev) => !prev)}
                className="p-1.5 rounded-md border border-border bg-surface-subtle text-text-primary"
              >
                {mobileDrawerOpen ? <X className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
              </button>
            </header>

            {/* Mobile Navigation Drawer / Overlay */}
            {mobileDrawerOpen && (
              <div
                className={`absolute inset-x-0 bottom-0 top-[49px] bg-surface z-40 p-4 overflow-y-auto flex flex-col justify-between ${settings.mobileStyle === "drawer_left"
                  ? "border-r border-border max-w-[85%]"
                  : settings.mobileStyle === "drawer_right"
                    ? "border-l border-border ml-auto max-w-[85%]"
                    : "w-full"
                  }`}
              >
                <nav className="space-y-1">
                  {activeItems.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedMobileParentIds.includes(item.id);

                    return (
                      <div key={item.id} className="border-b border-border/50 py-1">
                        <div
                          className="flex items-center justify-between py-2 text-xs font-medium text-text-primary cursor-pointer"
                          onClick={() => {
                            if (hasChildren && settings.accordionDropdowns) {
                              toggleMobileParent(item.id);
                            }
                          }}
                        >
                          <span>{item.label}</span>
                          {hasChildren && (
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""
                                }`}
                            />
                          )}
                        </div>

                        {/* Accordion Subitems */}
                        {hasChildren && isExpanded && (
                          <div className="pl-3 py-1 space-y-1 bg-surface-subtle/50 rounded-md my-1">
                            {item.children!.map((sub) => (
                              <div
                                key={sub.id}
                                className="py-1 text-[11px] text-text-secondary hover:text-primary"
                              >
                                {sub.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* Mobile CTA */}
                {settings.mobileCtaEnabled && (
                  <div className="pt-4 border-t border-border mt-6">
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-btn bg-primary text-white text-xs font-semibold shadow-xs"
                    >
                      {settings.mobileCtaLabel || "Get a Quote"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Body placeholder */}
            <div className="p-6 text-center text-text-muted">
              <p className="text-xs">
                {mobileDrawerOpen
                  ? "Mobile navigation drawer is open."
                  : "Tap the hamburger button to test the mobile menu behavior."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
