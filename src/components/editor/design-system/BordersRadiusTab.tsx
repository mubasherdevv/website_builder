"use client";

import React from "react";
import { ThemeRadius } from "@/types/builder";

interface BordersRadiusTabProps {
  radius: ThemeRadius;
  onChange: (updated: ThemeRadius) => void;
}

export const BordersRadiusTab: React.FC<BordersRadiusTabProps> = ({
  radius,
  onChange,
}) => {
  const updateField = (key: keyof ThemeRadius, val: string) => {
    onChange({
      ...radius,
      [key]: val,
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">
          Corner Radii
        </h4>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Card Radius</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {radius.card}
              </span>
            </div>
            <select
              value={radius.card}
              onChange={(e) => updateField("card", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="0px">0px (Sharp)</option>
              <option value="6px">6px (Subtle)</option>
              <option value="12px">12px (Smooth)</option>
              <option value="16px">16px (Standard Rounded)</option>
              <option value="24px">24px (Soft Elevated)</option>
              <option value="32px">32px (Curved)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Button Radius</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {radius.button}
              </span>
            </div>
            <select
              value={radius.button}
              onChange={(e) => updateField("button", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="0px">0px (Sharp)</option>
              <option value="6px">6px (Subtle)</option>
              <option value="10px">10px (Standard)</option>
              <option value="16px">16px (Card Match)</option>
              <option value="9999px">9999px (Pill Shape)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Input Field Radius</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {radius.input || "8px"}
              </span>
            </div>
            <select
              value={radius.input || "8px"}
              onChange={(e) => updateField("input", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="0px">0px (Sharp)</option>
              <option value="4px">4px (Subtle)</option>
              <option value="8px">8px (Standard)</option>
              <option value="12px">12px (Soft)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Radius Comparison Preview */}
      <div className="p-4 rounded-xl border border-border bg-surface-subtle space-y-3">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
          Shape Preview
        </span>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div
            style={{ borderRadius: radius.card }}
            className="p-3 bg-surface border border-border shadow-xs"
          >
            <span className="text-[10px] font-semibold text-text-secondary">Card Shape</span>
          </div>
          <div
            style={{ borderRadius: radius.input || "8px" }}
            className="p-3 bg-surface border border-border shadow-xs"
          >
            <span className="text-[10px] font-semibold text-text-secondary">Input Shape</span>
          </div>
        </div>
      </div>
    </div>
  );
};

