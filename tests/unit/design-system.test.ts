import { describe, it, expect } from "vitest";
import {
  validateThemeConfig,
  ThemeConfigSchema,
  HexColorRegex,
} from "@/themes/schemas/theme.schema";
import {
  listThemePresets,
  getThemePreset,
  emeraldForestPreset,
  modernPurplePreset,
  cleanTealPreset,
  deepSlatePreset,
} from "@/themes/presets";
import {
  themeToCssVariables,
  themeToStyleString,
} from "@/themes/utils/css-variables";

describe("Global Design System & Custom Color Editor", () => {
  it("validates all 4 built-in theme presets with full design system tokens", () => {
    const presets = listThemePresets();
    expect(presets.length).toBeGreaterThanOrEqual(4);

    for (const preset of presets) {
      const result = validateThemeConfig(preset);
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(preset.id);
      expect(result.data?.colors.primary).toMatch(HexColorRegex);
      expect(result.data?.radius.card).toBeDefined();
      expect(result.data?.spacing.sectionY).toBeDefined();
    }
  });

  it("generates comprehensive CSS variables covering all design token groups", () => {
    const vars = themeToCssVariables(emeraldForestPreset);

    // Brand Colors
    expect(vars["--color-primary"]).toBe("#087A55");
    expect(vars["--color-primary-hover"]).toBe("#066747");
    expect(vars["--color-primary-soft"]).toBe("#DDF3E8");
    expect(vars["--color-secondary"]).toBe("#063B2E");
    expect(vars["--color-accent"]).toBe("#12A875");

    // Background Colors
    expect(vars["--color-page-bg"]).toBe("#F5F9F6");
    expect(vars["--color-card-bg"]).toBe("#FFFFFF");
    expect(vars["--color-alt-section-bg"]).toBe("#EDF4EF");
    expect(vars["--color-footer-bg"]).toBe("#063B2E");

    // Text & Links
    expect(vars["--color-heading"]).toBe("#172B24");
    expect(vars["--color-text-primary"]).toBe("#172B24");
    expect(vars["--color-text-secondary"]).toBe("#64756C");
    expect(vars["--color-link"]).toBe("#087A55");

    // Interactive & Buttons
    expect(vars["--btn-primary-bg"]).toBe("#087A55");
    expect(vars["--btn-primary-text"]).toBe("#FFFFFF");
    expect(vars["--btn-hover-bg"]).toBe("#066747");
    expect(vars["--radius-button"]).toBe("10px");

    // UI & Inputs
    expect(vars["--color-border"]).toBe("#E1EAE4");
    expect(vars["--color-input-bg"]).toBe("#FFFFFF");
    expect(vars["--color-icon"]).toBe("#087A55");

    // Typography & Shadows
    expect(vars["--font-sans"]).toBe("Inter");
    expect(vars["--font-heading"]).toBe("Inter");
    expect(vars["--shadow-card"]).toBe("0 1px 3px rgba(0,0,0,0.04)");
  });

  it("transforms validated theme into an executable inline CSS style string", () => {
    const styleString = themeToStyleString(emeraldForestPreset);
    expect(styleString).toContain("--color-primary: #087A55;");
    expect(styleString).toContain("--color-secondary: #063B2E;");
    expect(styleString).toContain("--color-page-bg: #F5F9F6;");
    expect(styleString).toContain("--radius-card: 16px;");
  });

  it("rejects invalid color inputs and preserves type safety", () => {
    const invalidTheme = {
      ...emeraldForestPreset,
      colors: {
        ...emeraldForestPreset.colors,
        primary: "not-a-color",
      },
    };

    const result = validateThemeConfig(invalidTheme);
    expect(result.success).toBe(false);
    expect(result.error).toContain("colors.primary: Invalid hex color format");
  });

  it("supports live theme preset switching without data loss", () => {
    const purple = getThemePreset("theme-modern-purple");
    expect(purple.id).toBe(modernPurplePreset.id);
    expect(purple.colors.primary).toBe("#6D3BFF");

    const teal = getThemePreset("theme-clean-teal");
    expect(teal.id).toBe(cleanTealPreset.id);
    expect(teal.colors.primary).toBe("#0D9488");

    const slate = getThemePreset("theme-deep-slate");
    expect(slate.id).toBe(deepSlatePreset.id);
    expect(slate.colors.primary).toBe("#EA580C");
  });

  it("handles shadow presets correctly across all elevations", () => {
    const elevated = {
      ...emeraldForestPreset,
      shadows: { preset: "elevated" as const },
    };
    const elevatedVars = themeToCssVariables(elevated);
    expect(elevatedVars["--shadow-card"]).toBe("0 16px 36px rgba(0,0,0,0.12)");

    const none = {
      ...emeraldForestPreset,
      shadows: { preset: "none" as const },
    };
    const noneVars = themeToCssVariables(none);
    expect(noneVars["--shadow-card"]).toBe("none");
  });

  it("verifies all 26 granular color tokens operate independently without unintended fallbacks", () => {
    // Test independent token overrides
    const customized = {
      ...emeraldForestPreset,
      colors: {
        ...emeraldForestPreset.colors,
        primary: "#111111",
        secondary: "#222222",
        accent: "#333333",
        pageBackground: "#444444",
        sectionBackground: "#555555",
        cardBackground: "#666666",
        alternateSectionBackground: "#777777",
        footerBackground: "#888888",
        heading: "#999999",
        textPrimary: "#AAAAAA",
        textSecondary: "#BBBBBB",
        textMuted: "#CCCCCC",
        link: "#DDDDDD",
        buttonPrimaryBg: "#EEEEEE",
        buttonPrimaryText: "#121212",
        buttonSecondaryBg: "#232323",
        buttonSecondaryText: "#343434",
        buttonHoverBg: "#454545",
        buttonBorder: "#565656",
        border: "#676767",
        divider: "#787878",
        inputBg: "#898989",
        inputBorder: "#9A9A9A",
        inputText: "#ABABAB",
        inputPlaceholder: "#BCBCBC",
        icon: "#CDCDCD",
      },
    };

    const vars = themeToCssVariables(customized);

    // 1. Brand Colors
    expect(vars["--color-primary"]).toBe("#111111");
    expect(vars["--color-secondary"]).toBe("#222222");
    expect(vars["--color-accent"]).toBe("#333333");

    // 2. Background Colors
    expect(vars["--color-page-bg"]).toBe("#444444");
    expect(vars["--color-section-bg"]).toBe("#555555");
    expect(vars["--color-card-bg"]).toBe("#666666");
    expect(vars["--color-alt-section-bg"]).toBe("#777777");
    expect(vars["--color-footer-bg"]).toBe("#888888"); // independent of secondary!

    // 3. Text Colors
    expect(vars["--color-heading"]).toBe("#999999"); // independent of textPrimary!
    expect(vars["--color-text-primary"]).toBe("#AAAAAA");
    expect(vars["--color-text-secondary"]).toBe("#BBBBBB");
    expect(vars["--color-text-muted"]).toBe("#CCCCCC");
    expect(vars["--color-link"]).toBe("#DDDDDD"); // independent of primary!

    // 4. Interactive Colors
    expect(vars["--btn-primary-bg"]).toBe("#EEEEEE"); // independent of primary!
    expect(vars["--btn-primary-text"]).toBe("#121212");
    expect(vars["--btn-secondary-bg"]).toBe("#232323");
    expect(vars["--btn-secondary-text"]).toBe("#343434");
    expect(vars["--btn-hover-bg"]).toBe("#454545");
    expect(vars["--btn-border"]).toBe("#565656");

    // 5. UI Colors
    expect(vars["--color-border"]).toBe("#676767");
    expect(vars["--color-divider"]).toBe("#787878"); // independent of border!
    expect(vars["--color-input-bg"]).toBe("#898989");
    expect(vars["--color-input-border"]).toBe("#9A9A9A"); // independent of border!
    expect(vars["--color-input-text"]).toBe("#ABABAB"); // independent of textPrimary!
    expect(vars["--color-input-placeholder"]).toBe("#BCBCBC"); // independent of textMuted!
    expect(vars["--color-icon"]).toBe("#CDCDCD"); // independent of primary!
  });
});

