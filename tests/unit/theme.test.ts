import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  validateThemeConfig,
  HexColorRegex,
} from "@/themes/schemas/theme.schema";
import {
  getThemePreset,
  listThemePresets,
  modernPurplePreset,
  cleanTealPreset,
} from "@/themes/presets";
import { themeToCssVariables, themeToStyleString } from "@/themes/utils/css-variables";
import { ThemeProvider, useWebsiteTheme } from "@/themes/ThemeProvider";

describe("Theme System & Token Engine", () => {
  it("validates all built-in presets against ThemeConfigSchema", () => {
    const presets = listThemePresets();
    expect(presets.length).toBeGreaterThanOrEqual(3);

    for (const preset of presets) {
      const res = validateThemeConfig(preset);
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe(preset.id);
    }
  });

  it("converts ThemeConfig into valid CSS variables object", () => {
    const cssVars = themeToCssVariables(modernPurplePreset);
    expect(cssVars["--color-primary"]).toBe("#6D3BFF");
    expect(cssVars["--radius-card"]).toBe("16px");
    expect(cssVars["--font-sans"]).toBe("Inter");

    const styleStr = themeToStyleString(modernPurplePreset);
    expect(styleStr).toContain("--color-primary: #6D3BFF;");
    expect(styleStr).toContain("--radius-card: 16px;");
  });

  it("validates hex color regex correctly", () => {
    expect(HexColorRegex.test("#6D3BFF")).toBe(true);
    expect(HexColorRegex.test("#fff")).toBe(true);
    expect(HexColorRegex.test("#000000ff")).toBe(true);
    expect(HexColorRegex.test("red")).toBe(false);
    expect(HexColorRegex.test("rgb(0,0,0)")).toBe(false);
    expect(HexColorRegex.test("#12")).toBe(false);
  });

  it("rejects theme config with invalid color formats", () => {
    const invalidTheme = {
      ...modernPurplePreset,
      colors: {
        ...modernPurplePreset.colors,
        primary: "purple", // invalid, must be hex
      },
    };

    const res = validateThemeConfig(invalidTheme);
    expect(res.success).toBe(false);
    expect(res.error).toContain("colors.primary: Invalid hex color format");
  });

  it("returns fallback preset for unknown preset IDs", () => {
    const fallback = getThemePreset("non-existent-theme-id");
    expect(fallback.id).toBe(modernPurplePreset.id);
  });

  it("renders ThemeProvider and provides theme context to children", () => {
    const TestConsumer = () => {
      const theme = useWebsiteTheme();
      return React.createElement("div", { "data-testid": "theme-name" }, theme.name);
    };

    render(
      React.createElement(
        ThemeProvider,
        { theme: cleanTealPreset },
        React.createElement(TestConsumer, null)
      )
    );

    const el = screen.getByTestId("theme-name");
    expect(el.textContent).toBe(cleanTealPreset.name);
  });
});
