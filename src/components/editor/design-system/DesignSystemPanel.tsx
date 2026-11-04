"use client";

import React, { useState } from "react";
import { ThemeConfig } from "@/types/builder";
import { listThemePresets, emeraldForestPreset } from "@/themes/presets";
import { ColorsTab } from "./ColorsTab";
import { TypographyTab } from "./TypographyTab";
import { ButtonsTab } from "./ButtonsTab";
import { BordersRadiusTab } from "./BordersRadiusTab";
import { SpacingTab } from "./SpacingTab";
import { ShadowsTab } from "./ShadowsTab";
import {
  Palette,
  Type,
  MousePointer,
  Square,
  Maximize2,
  Layers,
  RotateCcw,
  Sparkles,
  Check,
  Copy,
} from "lucide-react";

interface DesignSystemPanelProps {
  theme: ThemeConfig;
  onChange: (updatedTheme: ThemeConfig) => void;
}

type SubTab = "colors" | "typography" | "buttons" | "radius" | "spacing" | "shadows";

export const DesignSystemPanel: React.FC<DesignSystemPanelProps> = ({
  theme,
  onChange,
}) => {
  const [subTab, setSubTab] = useState<SubTab>("colors");
  const [copiedNotification, setCopiedNotification] = useState(false);

  const presets = listThemePresets();

  const handleApplyPreset = (presetId: string) => {
    const selected = presets.find((p) => p.id === presetId);
    if (selected) {
      onChange(structuredClone(selected));
    }
  };

  const handleResetColors = () => {
    onChange({
      ...theme,
      colors: structuredClone(emeraldForestPreset.colors),
    });
  };

  const handleResetAll = () => {
    onChange(structuredClone(emeraldForestPreset));
  };

  const handleDuplicateTheme = () => {
    const dup: ThemeConfig = {
      ...structuredClone(theme),
      id: `theme-custom-${Math.random().toString(36).substring(2, 7)}`,
      name: `${theme.name} (Custom Copy)`,
    };
    onChange(dup);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const navItems: Array<{ id: SubTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "buttons", label: "Buttons", icon: MousePointer },
    { id: "radius", label: "Borders & Radius", icon: Square },
    { id: "spacing", label: "Spacing", icon: Maximize2 },
    { id: "shadows", label: "Shadows", icon: Layers },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs">
      {/* Top Controls: Preset Selector & Quick Actions */}
      <div className="p-3 border-b border-border bg-surface-subtle space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand" />
            Theme Preset
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDuplicateTheme}
              className="p-1 rounded text-text-muted hover:text-brand hover:bg-surface transition-colors"
              title="Duplicate & Save Theme"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              className="p-1 rounded text-text-muted hover:text-brand hover:bg-surface transition-colors"
              title="Reset Entire Design System to Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <select
          value={theme.id}
          onChange={(e) => handleApplyPreset(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:border-brand font-medium"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Segmented Sub-Tab Bar (Horizontal Scrollable) */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-surface overflow-x-auto scrollbar-none shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSubTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-btn text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-brand text-white shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Sub-Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {subTab === "colors" && (
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-border/50">
              <span className="text-[11px] font-bold text-text-muted">Global Palette</span>
              <button
                type="button"
                onClick={handleResetColors}
                className="text-[10px] font-semibold text-brand hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset Colors</span>
              </button>
            </div>
            <ColorsTab
              colors={theme.colors}
              onChange={(updatedColors) =>
                onChange({
                  ...theme,
                  colors: updatedColors,
                })
              }
            />
          </div>
        )}

        {subTab === "typography" && (
          <TypographyTab
            typography={theme.typography}
            onChange={(updatedTypo) =>
              onChange({
                ...theme,
                typography: updatedTypo,
              })
            }
          />
        )}

        {subTab === "buttons" && (
          <ButtonsTab
            buttons={theme.buttons || {}}
            onChange={(updatedButtons) =>
              onChange({
                ...theme,
                buttons: updatedButtons,
              })
            }
          />
        )}

        {subTab === "radius" && (
          <BordersRadiusTab
            radius={theme.radius}
            onChange={(updatedRadius) =>
              onChange({
                ...theme,
                radius: updatedRadius,
              })
            }
          />
        )}

        {subTab === "spacing" && (
          <SpacingTab
            spacing={theme.spacing}
            onChange={(updatedSpacing) =>
              onChange({
                ...theme,
                spacing: updatedSpacing,
              })
            }
          />
        )}

        {subTab === "shadows" && (
          <ShadowsTab
            shadows={theme.shadows}
            onChange={(updatedShadows) =>
              onChange({
                ...theme,
                shadows: updatedShadows,
              })
            }
          />
        )}
      </div>
    </div>
  );
};

