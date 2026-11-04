"use client";

import React from "react";
import { ThemeButtons } from "@/types/builder";

interface ButtonsTabProps {
  buttons: ThemeButtons;
  onChange: (updated: ThemeButtons) => void;
}

export const ButtonsTab: React.FC<ButtonsTabProps> = ({ buttons, onChange }) => {
  const updateField = <K extends keyof ThemeButtons>(
    key: K,
    val: ThemeButtons[K]
  ) => {
    onChange({
      ...buttons,
      [key]: val,
    });
  };

  return (
    <div className="space-y-5">
      {/* Dimensions & Sizing */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">
          Button Dimensions
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Button Height
            </label>
            <select
              value={buttons.height || "42px"}
              onChange={(e) => updateField("height", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="36px">36px (Compact)</option>
              <option value="40px">40px (Medium)</option>
              <option value="42px">42px (Standard)</option>
              <option value="48px">48px (Large)</option>
              <option value="54px">54px (Prominent)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Horizontal Padding
            </label>
            <select
              value={buttons.paddingX || "20px"}
              onChange={(e) => updateField("paddingX", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="14px">14px (Tight)</option>
              <option value="18px">18px (Normal)</option>
              <option value="20px">20px (Comfortable)</option>
              <option value="26px">26px (Spacious)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Border Radius
            </label>
            <select
              value={buttons.radius || "10px"}
              onChange={(e) => updateField("radius", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="0px">0px (Sharp)</option>
              <option value="6px">6px (Subtle)</option>
              <option value="10px">10px (Rounded)</option>
              <option value="16px">16px (Card Matched)</option>
              <option value="9999px">9999px (Pill)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Border Width
            </label>
            <select
              value={buttons.borderWidth || "1px"}
              onChange={(e) => updateField("borderWidth", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="0px">0px (None)</option>
              <option value="1px">1px (Subtle)</option>
              <option value="2px">2px (Strong)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Button Typography */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">
          Button Typography
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Label Font Size
            </label>
            <select
              value={buttons.fontSize || "14px"}
              onChange={(e) => updateField("fontSize", e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="13px">13px (Small)</option>
              <option value="14px">14px (Standard)</option>
              <option value="15px">15px (Medium)</option>
              <option value="16px">16px (Large)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Font Weight
            </label>
            <select
              value={String(buttons.fontWeight || 600)}
              onChange={(e) => updateField("fontWeight", Number(e.target.value))}
              className="w-full px-2.5 py-1 text-xs rounded-btn border border-border bg-surface text-text-primary"
            >
              <option value="500">500 (Medium)</option>
              <option value="600">600 (Semibold)</option>
              <option value="700">700 (Bold)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Button Style Preview Box */}
      <div className="p-4 rounded-xl border border-border bg-surface-subtle space-y-3">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
          Button Preview
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            style={{
              height: buttons.height || "42px",
              paddingLeft: buttons.paddingX || "20px",
              paddingRight: buttons.paddingX || "20px",
              borderRadius: buttons.radius || "10px",
              fontSize: buttons.fontSize || "14px",
              fontWeight: buttons.fontWeight || 600,
              borderWidth: buttons.borderWidth || "1px",
            }}
            className="bg-brand text-white border-brand hover:bg-brand-hover shadow-sm transition-all"
          >
            Primary Action
          </button>
          <button
            type="button"
            style={{
              height: buttons.height || "42px",
              paddingLeft: buttons.paddingX || "20px",
              paddingRight: buttons.paddingX || "20px",
              borderRadius: buttons.radius || "10px",
              fontSize: buttons.fontSize || "14px",
              fontWeight: buttons.fontWeight || 600,
              borderWidth: buttons.borderWidth || "1px",
            }}
            className="bg-surface text-text-primary border-border hover:bg-surface-subtle shadow-xs transition-all"
          >
            Secondary
          </button>
        </div>
      </div>
    </div>
  );
};

