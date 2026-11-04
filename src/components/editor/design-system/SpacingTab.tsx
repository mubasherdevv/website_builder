"use client";

import React from "react";
import { ThemeSpacing } from "@/types/builder";

interface SpacingTabProps {
  spacing: ThemeSpacing;
  onChange: (updated: ThemeSpacing) => void;
}

export const SpacingTab: React.FC<SpacingTabProps> = ({ spacing, onChange }) => {
  const updateField = (key: keyof ThemeSpacing, val: string) => {
    onChange({
      ...spacing,
      [key]: val,
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">
          Layout Spacing & Grid Gaps
        </h4>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Section Vertical Spacing</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {spacing.sectionY}
              </span>
            </div>
            <select
              value={spacing.sectionY}
              onChange={(e) => updateField("sectionY", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="48px">48px (Tight)</option>
              <option value="64px">64px (Compact)</option>
              <option value="80px">80px (Standard SaaS)</option>
              <option value="96px">96px (Airy)</option>
              <option value="120px">120px (Spacious Hero)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Container Horizontal Padding</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {spacing.containerX}
              </span>
            </div>
            <select
              value={spacing.containerX}
              onChange={(e) => updateField("containerX", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="16px">16px (Compact)</option>
              <option value="24px">24px (Standard)</option>
              <option value="32px">32px (Spacious)</option>
              <option value="48px">48px (Wide Margin)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Card Grid Gap</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {spacing.cardGap || "24px"}
              </span>
            </div>
            <select
              value={spacing.cardGap || "24px"}
              onChange={(e) => updateField("cardGap", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="16px">16px (Tight)</option>
              <option value="20px">20px (Compact)</option>
              <option value="24px">24px (Standard)</option>
              <option value="32px">32px (Relaxed)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

