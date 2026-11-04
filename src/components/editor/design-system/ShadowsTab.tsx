"use client";

import React from "react";
import { ThemeShadows } from "@/types/builder";

interface ShadowsTabProps {
  shadows?: ThemeShadows;
  onChange: (updated: ThemeShadows) => void;
}

const shadowOptions: Array<{
  id: "none" | "subtle" | "soft" | "medium" | "elevated";
  label: string;
  css: string;
  desc: string;
}> = [
  {
    id: "none",
    label: "None",
    css: "none",
    desc: "Flat minimalistic borders only",
  },
  {
    id: "subtle",
    label: "Subtle",
    css: "0 1px 3px rgba(0,0,0,0.04)",
    desc: "Gentle card separation",
  },
  {
    id: "soft",
    label: "Soft",
    css: "0 4px 12px rgba(0,0,0,0.06)",
    desc: "Modern SaaS floating feel",
  },
  {
    id: "medium",
    label: "Medium",
    css: "0 8px 24px rgba(0,0,0,0.09)",
    desc: "Distinct depth on hover",
  },
  {
    id: "elevated",
    label: "Elevated",
    css: "0 16px 36px rgba(0,0,0,0.12)",
    desc: "High-contrast card elevation",
  },
];

export const ShadowsTab: React.FC<ShadowsTabProps> = ({ shadows, onChange }) => {
  const currentPreset = shadows?.preset || "subtle";

  return (
    <div className="space-y-4">
      <div className="space-y-1 border-b border-border pb-2">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Global Elevation & Shadows
        </h4>
        <p className="text-[11px] text-text-muted">
          Choose the default elevation preset applied across all website cards.
        </p>
      </div>

      <div className="space-y-2.5">
        {shadowOptions.map((opt) => {
          const isSelected = currentPreset === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() =>
                onChange({
                  preset: opt.id,
                  card: opt.css,
                })
              }
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "border-brand bg-brand-soft/30 ring-1 ring-brand"
                  : "border-border bg-surface hover:bg-surface-subtle"
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary leading-tight">
                  {opt.label}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">{opt.desc}</p>
              </div>

              {/* Shadow Preview Box */}
              <div
                style={{
                  boxShadow: opt.css,
                }}
                className="w-12 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0"
              >
                <span className="text-[8px] font-mono text-gray-400">Aa</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

