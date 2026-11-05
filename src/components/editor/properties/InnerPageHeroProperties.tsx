"use client";

import React, { useState } from "react";
import { InnerPageHeroProps } from "@/components/website/hero/InnerPageHero";
import {
  FileText,
  Compass,
  Image as ImageIcon,
  Palette,
  Smartphone,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Slash,
} from "lucide-react";

interface InnerPageHeroPropertiesProps {
  props: Record<string, unknown>;
  onUpdate: (newProps: Record<string, unknown>) => void;
  onResetDefaults?: () => void;
}

export const InnerPageHeroProperties: React.FC<InnerPageHeroPropertiesProps> = ({
  props,
  onUpdate,
  onResetDefaults,
}) => {
  const [activeHeroTab, setActiveHeroTab] = useState<
    "content" | "breadcrumb" | "background" | "layout" | "responsive"
  >("content");

  const heroProps: InnerPageHeroProps = {
    title: (props.title as string) || "Page Title",
    subtitle: (props.subtitle as string) || "",
    eyebrow: (props.eyebrow as string) || "",
    primaryCtaLabel: (props.primaryCtaLabel as string) || "",
    primaryCtaHref: (props.primaryCtaHref as string) || "",
    secondaryCtaLabel: (props.secondaryCtaLabel as string) || "",
    secondaryCtaHref: (props.secondaryCtaHref as string) || "",
    showBreadcrumb: props.showBreadcrumb !== undefined ? Boolean(props.showBreadcrumb) : true,
    hideBreadcrumbOnImageBg: Boolean(props.hideBreadcrumbOnImageBg),
    breadcrumbSeparator: (props.breadcrumbSeparator as "chevron" | "slash" | "arrow") || "chevron",
    breadcrumbAlignment: (props.breadcrumbAlignment as "left" | "center" | "right") || "center",
    bgType: (props.bgType as "image" | "color" | "gradient") || "image",
    bgImageUrl:
      (props.bgImageUrl as string) ||
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80",
    bgMobileImageUrl: (props.bgMobileImageUrl as string) || "",
    bgPosition: (props.bgPosition as "center" | "top" | "bottom" | "left" | "right") || "center",
    bgSize: (props.bgSize as "cover" | "contain") || "cover",
    overlayColor: (props.overlayColor as string) || "#062B21",
    overlayOpacity: props.overlayOpacity !== undefined ? Number(props.overlayOpacity) : 75,
    bgColor: (props.bgColor as string) || "#063B2E",
    alignment: (props.alignment as "left" | "center" | "right") || "center",
    verticalAlignment: (props.verticalAlignment as "top" | "center" | "bottom") || "center",
    heightPreset:
      (props.heightPreset as "small" | "medium" | "large" | "viewport" | "custom") || "medium",
    customHeightPx: props.customHeightPx ? Number(props.customHeightPx) : 380,
    contentMaxWidth: (props.contentMaxWidth as "narrow" | "normal" | "wide" | "full") || "normal",
    paddingY: (props.paddingY as "compact" | "normal" | "spacious") || "normal",
    headingSize: (props.headingSize as "sm" | "md" | "lg" | "xl") || "lg",
    textColor: (props.textColor as string) || "",
    borderRadius: (props.borderRadius as "none" | "sm" | "md" | "lg" | "xl" | "2xl") || "none",
    useGlobalDefaults: props.useGlobalDefaults !== undefined ? Boolean(props.useGlobalDefaults) : true,
  };

  const updateProp = (key: string, value: unknown) => {
    onUpdate({
      ...props,
      [key]: value,
      useGlobalDefaults: false, // User made an explicit override
    });
  };

  const imagePresets = [
    {
      name: "Roofing Commercial",
      url: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80",
    },
    {
      name: "Modern Architecture",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
    },
    {
      name: "Suburban Residential",
      url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80",
    },
    {
      name: "Business Skyline",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 5 Dedicated Tabs for Inner Page Hero */}
      <div className="grid grid-cols-5 border border-border rounded-xl bg-surface-subtle p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveHeroTab("content")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold transition-colors ${
            activeHeroTab === "content"
              ? "bg-brand text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Content Tab"
        >
          <FileText className="w-3.5 h-3.5 mb-0.5" />
          <span>Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHeroTab("breadcrumb")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold transition-colors ${
            activeHeroTab === "breadcrumb"
              ? "bg-brand text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Breadcrumb Tab"
        >
          <Compass className="w-3.5 h-3.5 mb-0.5" />
          <span>Breadcrumb</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHeroTab("background")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold transition-colors ${
            activeHeroTab === "background"
              ? "bg-brand text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Background Tab"
        >
          <ImageIcon className="w-3.5 h-3.5 mb-0.5" />
          <span>Background</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHeroTab("layout")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold transition-colors ${
            activeHeroTab === "layout"
              ? "bg-brand text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Layout Tab"
        >
          <Palette className="w-3.5 h-3.5 mb-0.5" />
          <span>Layout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHeroTab("responsive")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold transition-colors ${
            activeHeroTab === "responsive"
              ? "bg-brand text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Responsive Tab"
        >
          <Smartphone className="w-3.5 h-3.5 mb-0.5" />
          <span>Mobile</span>
        </button>
      </div>

      {/* Reset to Global Defaults indicator */}
      {!heroProps.useGlobalDefaults && (
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface-subtle text-xs text-text-secondary">
          <span className="text-[11px]">Has custom overrides</span>
          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>
      )}

      {/* Tab 1: Content */}
      {activeHeroTab === "content" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Eyebrow Badge (Optional)
            </label>
            <input
              type="text"
              value={heroProps.eyebrow || ""}
              onChange={(e) => updateProp("eyebrow", e.target.value)}
              placeholder="e.g. AUSTIN, TEXAS SPECIALIST"
              className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Page Heading (H1) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={heroProps.title}
              onChange={(e) => updateProp("title", e.target.value)}
              className="w-full text-xs p-2 font-bold rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={heroProps.subtitle || ""}
              onChange={(e) => updateProp("subtitle", e.target.value)}
              placeholder="Brief description below title..."
              className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Call-to-Action Buttons</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Primary Label
                </label>
                <input
                  type="text"
                  value={heroProps.primaryCtaLabel || ""}
                  onChange={(e) => updateProp("primaryCtaLabel", e.target.value)}
                  placeholder="e.g. Get a Quote"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Primary URL
                </label>
                <input
                  type="text"
                  value={heroProps.primaryCtaHref || ""}
                  onChange={(e) => updateProp("primaryCtaHref", e.target.value)}
                  placeholder="/contact"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Secondary Label
                </label>
                <input
                  type="text"
                  value={heroProps.secondaryCtaLabel || ""}
                  onChange={(e) => updateProp("secondaryCtaLabel", e.target.value)}
                  placeholder="e.g. Call (512) 555-0199"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Secondary URL
                </label>
                <input
                  type="text"
                  value={heroProps.secondaryCtaHref || ""}
                  onChange={(e) => updateProp("secondaryCtaHref", e.target.value)}
                  placeholder="tel:5125550199"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Breadcrumbs */}
      {activeHeroTab === "breadcrumb" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
            <div>
              <p className="text-xs font-semibold text-text-primary">Show Breadcrumbs</p>
              <p className="text-[11px] text-text-secondary">Display hierarchical links on top of banner</p>
            </div>
            <input
              type="checkbox"
              checked={heroProps.showBreadcrumb}
              onChange={(e) => updateProp("showBreadcrumb", e.target.checked)}
              className="w-4 h-4 text-brand rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
            <div>
              <p className="text-xs font-semibold text-text-primary">Hide on Image Background</p>
              <p className="text-[11px] text-text-secondary">Automatically hides when background is an image</p>
            </div>
            <input
              type="checkbox"
              checked={heroProps.hideBreadcrumbOnImageBg}
              onChange={(e) => updateProp("hideBreadcrumbOnImageBg", e.target.checked)}
              className="w-4 h-4 text-brand rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Breadcrumb Separator
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateProp("breadcrumbSeparator", "chevron")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  heroProps.breadcrumbSeparator === "chevron"
                    ? "border-brand bg-brand-soft text-brand font-bold"
                    : "border-border bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Chevron</span>
              </button>

              <button
                type="button"
                onClick={() => updateProp("breadcrumbSeparator", "slash")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  heroProps.breadcrumbSeparator === "slash"
                    ? "border-brand bg-brand-soft text-brand font-bold"
                    : "border-border bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <Slash className="w-3.5 h-3.5" />
                <span>Slash</span>
              </button>

              <button
                type="button"
                onClick={() => updateProp("breadcrumbSeparator", "arrow")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  heroProps.breadcrumbSeparator === "arrow"
                    ? "border-brand bg-brand-soft text-brand font-bold"
                    : "border-border bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Arrow</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Breadcrumb Alignment
            </label>
            <select
              value={heroProps.breadcrumbAlignment}
              onChange={(e) => updateProp("breadcrumbAlignment", e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab 3: Background */}
      {activeHeroTab === "background" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Background Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateProp("bgType", "image")}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  heroProps.bgType === "image"
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-surface text-text-secondary"
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => updateProp("bgType", "color")}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  heroProps.bgType === "color"
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-surface text-text-secondary"
                }`}
              >
                Solid Color
              </button>
              <button
                type="button"
                onClick={() => updateProp("bgType", "gradient")}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  heroProps.bgType === "gradient"
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-surface text-text-secondary"
                }`}
              >
                Gradient
              </button>
            </div>
          </div>

          {heroProps.bgType === "image" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={heroProps.bgImageUrl}
                  onChange={(e) => updateProp("bgImageUrl", e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                />
              </div>

              {/* Quick Image Presets */}
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Curated Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {imagePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateProp("bgImageUrl", preset.url)}
                      className={`text-left p-2 rounded-lg border text-[11px] truncate transition-colors ${
                        heroProps.bgImageUrl === preset.url
                          ? "border-brand bg-brand-soft text-brand font-bold"
                          : "border-border bg-surface hover:bg-surface-subtle"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Image Position
                  </label>
                  <select
                    value={heroProps.bgPosition}
                    onChange={(e) => updateProp("bgPosition", e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Image Size
                  </label>
                  <select
                    value={heroProps.bgSize}
                    onChange={(e) => updateProp("bgSize", e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                  >
                    <option value="cover">Cover (Fill)</option>
                    <option value="contain">Contain</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-primary">
                    Dark Overlay Opacity
                  </label>
                  <span className="text-xs font-mono font-bold text-brand">
                    {heroProps.overlayOpacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={heroProps.overlayOpacity}
                  onChange={(e) => updateProp("overlayOpacity", Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />

                <div className="flex items-center gap-2 pt-1">
                  <label className="text-xs text-text-secondary">Overlay Color:</label>
                  <input
                    type="color"
                    value={heroProps.overlayColor}
                    onChange={(e) => updateProp("overlayColor", e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border border-border"
                  />
                  <span className="text-xs font-mono text-text-primary">
                    {heroProps.overlayColor}
                  </span>
                </div>
              </div>
            </div>
          )}

          {heroProps.bgType === "color" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Solid Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={heroProps.bgColor || "#063B2E"}
                  onChange={(e) => updateProp("bgColor", e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={heroProps.bgColor || "#063B2E"}
                  onChange={(e) => updateProp("bgColor", e.target.value)}
                  className="w-32 text-xs p-2 rounded-lg border border-border font-mono"
                />
              </div>
            </div>
          )}

          {heroProps.bgType === "gradient" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-primary">
                Gradient Direction
              </label>
              <select
                value={props.bgGradient ? (props.bgGradient as Record<string, string>).direction : "to-br"}
                onChange={(e) =>
                  updateProp("bgGradient", {
                    from: (props.bgGradient as Record<string, string>)?.from || "#063B2E",
                    to: (props.bgGradient as Record<string, string>)?.to || "#0D5744",
                    direction: e.target.value,
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="to-br">To Bottom-Right</option>
                <option value="to-r">To Right</option>
                <option value="to-b">To Bottom</option>
                <option value="to-bl">To Bottom-Left</option>
                <option value="to-t">To Top</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Layout & Style */}
      {activeHeroTab === "layout" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Banner Height
            </label>
            <select
              value={heroProps.heightPreset}
              onChange={(e) => updateProp("heightPreset", e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
            >
              <option value="small">Small (~240px)</option>
              <option value="medium">Medium (~360px)</option>
              <option value="large">Large (~480px)</option>
              <option value="viewport">Full Viewport (70-85vh)</option>
              <option value="custom">Custom Height (px)</option>
            </select>
          </div>

          {heroProps.heightPreset === "custom" && (
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Custom Height in Pixels
              </label>
              <input
                type="number"
                min="180"
                max="900"
                value={heroProps.customHeightPx || 380}
                onChange={(e) => updateProp("customHeightPx", Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Content Max-Width
            </label>
            <select
              value={heroProps.contentMaxWidth}
              onChange={(e) => updateProp("contentMaxWidth", e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
            >
              <option value="narrow">Narrow (max-w-2xl)</option>
              <option value="normal">Normal (max-w-3xl)</option>
              <option value="wide">Wide (max-w-5xl)</option>
              <option value="full">Full Container (max-w-7xl)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Text Alignment
              </label>
              <select
                value={heroProps.alignment}
                onChange={(e) => updateProp("alignment", e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Heading Size
              </label>
              <select
                value={heroProps.headingSize}
                onChange={(e) => updateProp("headingSize", e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="sm">SM</option>
                <option value="md">MD</option>
                <option value="lg">LG (Default)</option>
                <option value="xl">XL (Display)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Responsive */}
      {activeHeroTab === "responsive" && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-border bg-surface-subtle text-xs text-text-secondary leading-relaxed">
            Mobile &amp; tablet views automatically preserve readability with responsive typography scaling, touch-friendly breadcrumb wrapping, and overlay contrast.
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Optional Mobile Background Image
            </label>
            <input
              type="text"
              value={heroProps.bgMobileImageUrl || ""}
              onChange={(e) => updateProp("bgMobileImageUrl", e.target.value)}
              placeholder="e.g. Portrait optimized image URL"
              className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Vertical Padding
            </label>
            <select
              value={heroProps.paddingY}
              onChange={(e) => updateProp("paddingY", e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
            >
              <option value="compact">Compact (py-8 sm:py-12)</option>
              <option value="normal">Normal (py-12 sm:py-20)</option>
              <option value="spacious">Spacious (py-20 sm:py-28)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

