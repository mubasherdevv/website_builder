"use client";

import React from "react";
import { ThemeTypography } from "@/types/builder";
import { AllowedFonts } from "@/themes/schemas/theme.schema";

interface TypographyTabProps {
  typography: ThemeTypography;
  onChange: (updated: ThemeTypography) => void;
}

export const TypographyTab: React.FC<TypographyTabProps> = ({
  typography,
  onChange,
}) => {
  const updateField = <K extends keyof ThemeTypography>(
    key: K,
    val: ThemeTypography[K]
  ) => {
    onChange({
      ...typography,
      [key]: val,
    });
  };

  return (
    <div className="space-y-5">
      {/* Font Family Selection */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">
          Font Families
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Heading Font Family
            </label>
            <select
              value={typography.headingFont || typography.fontFamily || "Inter"}
              onChange={(e) => updateField("headingFont", e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:border-brand"
            >
              {AllowedFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Body Font Family
            </label>
            <select
              value={typography.bodyFont || typography.fontFamily || "Inter"}
              onChange={(e) => {
                updateField("bodyFont", e.target.value);
                updateField("fontFamily", e.target.value);
              }}
              className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:border-brand"
            >
              {AllowedFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Font Sizes */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">
          Typography Scale
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              H1 Heading Size
            </label>
            <select
              value={typography.h1Size || "48px"}
              onChange={(e) => updateField("h1Size", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="36px">36px (Compact)</option>
              <option value="42px">42px (Standard)</option>
              <option value="48px">48px (Large)</option>
              <option value="56px">56px (Display)</option>
              <option value="64px">64px (Hero)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              H2 Section Title
            </label>
            <select
              value={typography.h2Size || "36px"}
              onChange={(e) => updateField("h2Size", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="28px">28px</option>
              <option value="32px">32px</option>
              <option value="36px">36px</option>
              <option value="40px">40px</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              H3 Card Title
            </label>
            <select
              value={typography.h3Size || "24px"}
              onChange={(e) => updateField("h3Size", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Body Text Size
            </label>
            <select
              value={typography.bodySize || "16px"}
              onChange={(e) => updateField("bodySize", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="14px">14px</option>
              <option value="15px">15px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
            </select>
          </div>
        </div>
      </div>

      {/* Weights & Spacing */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">
          Font Weights & Metrics
        </h4>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Heading Weight</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {typography.headingWeight}
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="900"
              step="100"
              value={typography.headingWeight}
              onChange={(e) => updateField("headingWeight", Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Body Weight</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {typography.bodyWeight}
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="600"
              step="100"
              value={typography.bodyWeight}
              onChange={(e) => updateField("bodyWeight", Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Line Height
              </label>
              <select
                value={typography.lineHeight || "1.5"}
                onChange={(e) => updateField("lineHeight", e.target.value)}
                className="w-full px-2 py-1 text-xs rounded border border-border bg-surface text-text-primary"
              >
                <option value="1.3">1.3 (Compact)</option>
                <option value="1.4">1.4 (Tight)</option>
                <option value="1.5">1.5 (Normal)</option>
                <option value="1.65">1.65 (Relaxed)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Letter Spacing
              </label>
              <select
                value={typography.letterSpacing || "-0.01em"}
                onChange={(e) => updateField("letterSpacing", e.target.value)}
                className="w-full px-2 py-1 text-xs rounded border border-border bg-surface text-text-primary"
              >
                <option value="-0.02em">-0.02em (Tight)</option>
                <option value="-0.01em">-0.01em (Subtle)</option>
                <option value="0">0 (Normal)</option>
                <option value="0.02em">+0.02em (Wide)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

