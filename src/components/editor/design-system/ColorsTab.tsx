"use client";

import React from "react";
import { ThemeColors } from "@/types/builder";
import { ColorPickerItem } from "./ColorPickerItem";
import { emeraldForestPreset } from "@/themes/presets";

interface ColorsTabProps {
  colors: ThemeColors;
  onChange: (updated: ThemeColors) => void;
  onResetGroup?: (group: string) => void;
}

export const ColorsTab: React.FC<ColorsTabProps> = ({ colors, onChange }) => {
  const defaults = emeraldForestPreset.colors;

  const updateColor = (key: keyof ThemeColors, val: string) => {
    onChange({
      ...colors,
      [key]: val,
    });
  };

  const resetColor = (key: keyof ThemeColors) => {
    if (defaults[key]) {
      updateColor(key, defaults[key]!);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Brand Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Brand Colors
          </h4>
          <span className="text-[10px] text-text-muted">Primary palette</span>
        </div>
        <div className="space-y-1">
          <ColorPickerItem
            label="Primary Color"
            description="Main brand actions, highlights & primary buttons"
            value={colors.primary}
            defaultValue={defaults.primary}
            onChange={(v) => updateColor("primary", v)}
            onReset={() => resetColor("primary")}
          />
          <ColorPickerItem
            label="Secondary Color"
            description="Deep contrasting headers, footers & dark accents"
            value={colors.secondary || defaults.secondary || "#063B2E"}
            defaultValue={defaults.secondary || "#063B2E"}
            onChange={(v) => updateColor("secondary", v)}
            onReset={() => resetColor("secondary")}
          />
          <ColorPickerItem
            label="Accent Color"
            description="Feature highlights, sparkles & success pills"
            value={colors.accent || defaults.accent || "#12A875"}
            defaultValue={defaults.accent || "#12A875"}
            onChange={(v) => updateColor("accent", v)}
            onReset={() => resetColor("accent")}
          />
        </div>
      </div>

      {/* 2. Background Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Background Colors
          </h4>
          <span className="text-[10px] text-text-muted">Surface layers</span>
        </div>
        <div className="space-y-1">
          <ColorPickerItem
            label="Page Background"
            description="Base canvas background behind all sections"
            value={colors.pageBackground || colors.appBackground}
            defaultValue={defaults.pageBackground || defaults.appBackground}
            onChange={(v) => {
              updateColor("pageBackground", v);
              updateColor("appBackground", v);
            }}
            onReset={() => resetColor("pageBackground")}
          />
          <ColorPickerItem
            label="Section Background"
            description="Standard content block background"
            value={colors.sectionBackground || defaults.sectionBackground || "#FFFFFF"}
            defaultValue={defaults.sectionBackground || "#FFFFFF"}
            onChange={(v) => updateColor("sectionBackground", v)}
            onReset={() => resetColor("sectionBackground")}
          />
          <ColorPickerItem
            label="Card Background"
            description="Features, reviews & content card containers"
            value={colors.cardBackground || colors.surface}
            defaultValue={defaults.cardBackground || defaults.surface}
            onChange={(v) => {
              updateColor("cardBackground", v);
              updateColor("surface", v);
            }}
            onReset={() => resetColor("cardBackground")}
          />
          <ColorPickerItem
            label="Alternate Section Background"
            description="Alternating zebra section styling"
            value={colors.alternateSectionBackground || defaults.alternateSectionBackground || "#EDF4EF"}
            defaultValue={defaults.alternateSectionBackground || "#EDF4EF"}
            onChange={(v) => updateColor("alternateSectionBackground", v)}
            onReset={() => resetColor("alternateSectionBackground")}
          />
          <ColorPickerItem
            label="Footer Background"
            description="Bottom navigation & copyright section"
            value={colors.footerBackground || defaults.footerBackground || "#063B2E"}
            defaultValue={defaults.footerBackground || "#063B2E"}
            onChange={(v) => updateColor("footerBackground", v)}
            onReset={() => resetColor("footerBackground")}
          />
        </div>
      </div>

      {/* 3. Text Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Text Colors
          </h4>
          <span className="text-[10px] text-text-muted">Readability</span>
        </div>
        <div className="space-y-1">
          <ColorPickerItem
            label="Heading Color"
            description="H1, H2, H3 section and hero titles"
            value={colors.heading || colors.textPrimary}
            defaultValue={defaults.heading || defaults.textPrimary}
            onChange={(v) => updateColor("heading", v)}
            onReset={() => resetColor("heading")}
          />
          <ColorPickerItem
            label="Primary Text"
            description="Main body paragraphs and descriptions"
            value={colors.textPrimary}
            defaultValue={defaults.textPrimary}
            onChange={(v) => updateColor("textPrimary", v)}
            onReset={() => resetColor("textPrimary")}
          />
          <ColorPickerItem
            label="Secondary Text"
            description="Subtitle lines, helper texts & tags"
            value={colors.textSecondary}
            defaultValue={defaults.textSecondary}
            onChange={(v) => updateColor("textSecondary", v)}
            onReset={() => resetColor("textSecondary")}
          />
          <ColorPickerItem
            label="Muted Text"
            description="Timestamps, hints & placeholder labels"
            value={colors.textMuted}
            defaultValue={defaults.textMuted}
            onChange={(v) => updateColor("textMuted", v)}
            onReset={() => resetColor("textMuted")}
          />
          <ColorPickerItem
            label="Link Color"
            description="Hyperlinks & breadcrumbs"
            value={colors.link || defaults.link || colors.primary}
            defaultValue={defaults.link || defaults.primary}
            onChange={(v) => updateColor("link", v)}
            onReset={() => resetColor("link")}
          />
        </div>
      </div>

      {/* 4. Interactive Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Interactive Colors
          </h4>
          <span className="text-[10px] text-text-muted">Buttons & hover</span>
        </div>
        <div className="space-y-1">
          <ColorPickerItem
            label="Primary Button Background"
            value={colors.buttonPrimaryBg || defaults.buttonPrimaryBg || colors.primary}
            defaultValue={defaults.buttonPrimaryBg || defaults.primary}
            onChange={(v) => updateColor("buttonPrimaryBg", v)}
            onReset={() => resetColor("buttonPrimaryBg")}
          />
          <ColorPickerItem
            label="Primary Button Text"
            value={colors.buttonPrimaryText || defaults.buttonPrimaryText || "#FFFFFF"}
            defaultValue={defaults.buttonPrimaryText || "#FFFFFF"}
            onChange={(v) => updateColor("buttonPrimaryText", v)}
            onReset={() => resetColor("buttonPrimaryText")}
          />
          <ColorPickerItem
            label="Secondary Button Background"
            value={colors.buttonSecondaryBg || defaults.buttonSecondaryBg || "#FFFFFF"}
            defaultValue={defaults.buttonSecondaryBg || "#FFFFFF"}
            onChange={(v) => updateColor("buttonSecondaryBg", v)}
            onReset={() => resetColor("buttonSecondaryBg")}
          />
          <ColorPickerItem
            label="Secondary Button Text"
            value={colors.buttonSecondaryText || defaults.buttonSecondaryText || colors.textPrimary}
            defaultValue={defaults.buttonSecondaryText || defaults.textPrimary}
            onChange={(v) => updateColor("buttonSecondaryText", v)}
            onReset={() => resetColor("buttonSecondaryText")}
          />
          <ColorPickerItem
            label="Button Hover Background"
            value={colors.buttonHoverBg || defaults.buttonHoverBg || colors.primaryHover}
            defaultValue={defaults.buttonHoverBg || defaults.primaryHover}
            onChange={(v) => updateColor("buttonHoverBg", v)}
            onReset={() => resetColor("buttonHoverBg")}
          />
          <ColorPickerItem
            label="Button Border"
            value={colors.buttonBorder || defaults.buttonBorder || colors.primary}
            defaultValue={defaults.buttonBorder || defaults.primary}
            onChange={(v) => updateColor("buttonBorder", v)}
            onReset={() => resetColor("buttonBorder")}
          />
        </div>
      </div>

      {/* 5. UI Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            UI Colors
          </h4>
          <span className="text-[10px] text-text-muted">Controls & borders</span>
        </div>
        <div className="space-y-1">
          <ColorPickerItem
            label="Border Color"
            value={colors.border}
            defaultValue={defaults.border}
            onChange={(v) => updateColor("border", v)}
            onReset={() => resetColor("border")}
          />
          <ColorPickerItem
            label="Divider Color"
            value={colors.divider || defaults.divider || colors.border}
            defaultValue={defaults.divider || defaults.border}
            onChange={(v) => updateColor("divider", v)}
            onReset={() => resetColor("divider")}
          />
          <ColorPickerItem
            label="Input Background"
            value={colors.inputBg || defaults.inputBg || "#FFFFFF"}
            defaultValue={defaults.inputBg || "#FFFFFF"}
            onChange={(v) => updateColor("inputBg", v)}
            onReset={() => resetColor("inputBg")}
          />
          <ColorPickerItem
            label="Input Border"
            value={colors.inputBorder || defaults.inputBorder || colors.border}
            defaultValue={defaults.inputBorder || defaults.border}
            onChange={(v) => updateColor("inputBorder", v)}
            onReset={() => resetColor("inputBorder")}
          />
          <ColorPickerItem
            label="Input Text"
            value={colors.inputText || defaults.inputText || colors.textPrimary}
            defaultValue={defaults.inputText || defaults.textPrimary}
            onChange={(v) => updateColor("inputText", v)}
            onReset={() => resetColor("inputText")}
          />
          <ColorPickerItem
            label="Input Placeholder"
            value={colors.inputPlaceholder || defaults.inputPlaceholder || colors.textMuted}
            defaultValue={defaults.inputPlaceholder || defaults.textMuted}
            onChange={(v) => updateColor("inputPlaceholder", v)}
            onReset={() => resetColor("inputPlaceholder")}
          />
          <ColorPickerItem
            label="Icon Color"
            value={colors.icon || defaults.icon || colors.primary}
            defaultValue={defaults.icon || defaults.primary}
            onChange={(v) => updateColor("icon", v)}
            onReset={() => resetColor("icon")}
          />
        </div>
      </div>
    </div>
  );
};

