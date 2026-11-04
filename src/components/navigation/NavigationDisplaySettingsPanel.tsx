"use client";

import React from "react";
import { NavigationDisplaySettings } from "@/types/navigation";
import {
  Sliders,
  Layout,
  Smartphone,
  Layers,
} from "lucide-react";

interface NavigationDisplaySettingsPanelProps {
  settings: NavigationDisplaySettings;
  onChange: (updated: NavigationDisplaySettings) => void;
}

export const NavigationDisplaySettingsPanel: React.FC<NavigationDisplaySettingsPanelProps> = ({
  settings,
  onChange,
}) => {
  const update = <K extends keyof NavigationDisplaySettings>(
    key: K,
    val: NavigationDisplaySettings[K]
  ) => {
    onChange({ ...settings, [key]: val });
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border overflow-y-auto">
      {/* Header */}
      <div className="p-3.5 border-b border-border bg-surface-subtle/50 shrink-0">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-primary" />
          <span>Display & Styling Settings</span>
        </h3>
        <p className="text-[11px] text-text-muted mt-0.5">
          Controls desktop, tablet, dropdown, overflow, and mobile presentation.
        </p>
      </div>

      <div className="p-3.5 space-y-5 text-xs">
        {/* Section 1: Desktop Navigation */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 text-primary">
            <Layout className="w-3.5 h-3.5" />
            <span>Desktop Layout</span>
          </h4>

          {/* Alignment */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Menu Alignment
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => update("alignment", align)}
                  className={`py-1.5 px-2 rounded border text-xs font-medium capitalize transition-colors ${settings.alignment === align
                    ? "bg-primary text-white border-primary"
                    : "bg-surface-subtle hover:bg-surface border-border text-text-secondary"
                    }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          {/* Spacing & Typography */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Item Spacing ({settings.itemSpacing}px)
              </label>
              <input
                type="range"
                min="12"
                max="48"
                step="4"
                value={settings.itemSpacing}
                onChange={(e) => update("itemSpacing", parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Font Size ({settings.fontSize}px)
              </label>
              <input
                type="range"
                min="12"
                max="18"
                step="1"
                value={settings.fontSize}
                onChange={(e) => update("fontSize", parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Font Weight
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(["normal", "medium", "semibold", "bold"] as const).map((weight) => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => update("fontWeight", weight)}
                  className={`py-1 text-[11px] rounded border capitalize ${settings.fontWeight === weight
                    ? "bg-primary text-white border-primary"
                    : "bg-surface-subtle border-border text-text-secondary"
                    }`}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>

          {/* Sticky Header & Transparent Header */}
          <div className="space-y-2 pt-1 border-t border-border">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[11px] font-medium text-text-secondary">
                Sticky Header on Scroll
              </span>
              <input
                type="checkbox"
                checked={settings.stickyHeader}
                onChange={(e) => update("stickyHeader", e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[11px] font-medium text-text-secondary">
                Transparent Header on Hero
              </span>
              <input
                type="checkbox"
                checked={settings.transparentHeader}
                onChange={(e) => update("transparentHeader", e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
            </label>
          </div>

          {/* Desktop CTA Button */}
          <div className="p-2.5 rounded-lg border border-border bg-surface-subtle/50 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[11px] font-bold text-text-primary">
                Header CTA Button
              </span>
              <input
                type="checkbox"
                checked={settings.ctaButtonEnabled}
                onChange={(e) => update("ctaButtonEnabled", e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              />
            </label>

            {settings.ctaButtonEnabled && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-text-secondary mb-0.5">Label</label>
                  <input
                    type="text"
                    value={settings.ctaButtonLabel || ""}
                    onChange={(e) => update("ctaButtonLabel", e.target.value)}
                    className="w-full px-2 py-1 rounded border border-border bg-surface text-text-primary text-[11px]"
                    placeholder="Get a Quote"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-secondary mb-0.5">Target Link</label>
                  <input
                    type="text"
                    value={settings.ctaButtonHref || ""}
                    onChange={(e) => update("ctaButtonHref", e.target.value)}
                    className="w-full px-2 py-1 rounded border border-border bg-surface text-text-primary text-[11px]"
                    placeholder="#contact"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Dropdown & Overflow Behavior */}
        <div className="space-y-3 pt-3 border-t border-border">
          <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 text-purple-600">
            <Layers className="w-3.5 h-3.5" />
            <span>Dropdown & Overflow</span>
          </h4>

          {/* Trigger method */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Dropdown Trigger
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update("dropdownTrigger", "hover")}
                className={`py-1.5 px-2 rounded border text-xs font-medium transition-colors ${settings.dropdownTrigger === "hover"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-surface-subtle border-border text-text-secondary"
                  }`}
              >
                Hover + Keyboard
              </button>
              <button
                type="button"
                onClick={() => update("dropdownTrigger", "click")}
                className={`py-1.5 px-2 rounded border text-xs font-medium transition-colors ${settings.dropdownTrigger === "click"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-surface-subtle border-border text-text-secondary"
                  }`}
              >
                Click / Tap
              </button>
            </div>
          </div>

          {/* Max visible top level items */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Max Visible Top-Level Items: <span className="font-mono text-primary">{settings.maxVisibleTopLevelItems}</span>
            </label>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={settings.maxVisibleTopLevelItems}
              onChange={(e) => update("maxVisibleTopLevelItems", parseInt(e.target.value, 10))}
              className="w-full accent-primary cursor-pointer"
            />
            <p className="text-[10px] text-text-muted mt-0.5">
              When menus exceed this number, excess items are placed inside an automatic &quot;More&quot; dropdown.
            </p>
          </div>

          {/* Overflow behavior */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Overflow Behavior
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update("overflowBehavior", "more_dropdown")}
                className={`py-1.5 px-2 rounded border text-xs font-medium transition-colors ${settings.overflowBehavior === "more_dropdown"
                  ? "bg-primary text-white border-primary"
                  : "bg-surface-subtle border-border text-text-secondary"
                  }`}
              >
                More Dropdown
              </button>
              <button
                type="button"
                onClick={() => update("overflowBehavior", "wrap")}
                className={`py-1.5 px-2 rounded border text-xs font-medium transition-colors ${settings.overflowBehavior === "wrap"
                  ? "bg-primary text-white border-primary"
                  : "bg-surface-subtle border-border text-text-secondary"
                  }`}
              >
                Wrap into Rows
              </button>
            </div>
          </div>

          {/* Dropdown styling */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Dropdown Width ({settings.dropdownWidth}px)
              </label>
              <input
                type="range"
                min="180"
                max="320"
                step="10"
                value={settings.dropdownWidth}
                onChange={(e) => update("dropdownWidth", parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Corner Radius ({settings.dropdownBorderRadius}px)
              </label>
              <input
                type="range"
                min="4"
                max="16"
                step="2"
                value={settings.dropdownBorderRadius}
                onChange={(e) => update("dropdownBorderRadius", parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Mobile Navigation */}
        <div className="space-y-3 pt-3 border-t border-border">
          <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 text-blue-600">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Navigation</span>
          </h4>

          {/* Mobile drawer style */}
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Mobile Presentation
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "drawer_right", label: "Right Drawer" },
                { id: "drawer_left", label: "Left Drawer" },
                { id: "fullscreen", label: "Full Screen" },
                { id: "dropdown", label: "Header Dropdown" },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => update("mobileStyle", style.id as NavigationDisplaySettings["mobileStyle"])}
                  className={`py-1.5 px-2 rounded border text-xs font-medium transition-colors ${settings.mobileStyle === style.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-surface-subtle border-border text-text-secondary"
                    }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion dropdowns toggle */}
          <label className="flex items-center justify-between cursor-pointer pt-1">
            <span className="text-[11px] font-medium text-text-secondary">
              Expandable Accordion Submenus
            </span>
            <input
              type="checkbox"
              checked={settings.accordionDropdowns}
              onChange={(e) => update("accordionDropdowns", e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-border cursor-pointer"
            />
          </label>

          {/* Mobile CTA toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[11px] font-medium text-text-secondary">
              Include CTA Button in Mobile Drawer
            </span>
            <input
              type="checkbox"
              checked={settings.mobileCtaEnabled}
              onChange={(e) => update("mobileCtaEnabled", e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-border cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
