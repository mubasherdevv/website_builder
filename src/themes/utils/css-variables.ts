import { ThemeConfig } from "@/types/builder";

/**
 * Converts validated ThemeConfig tokens into CSS variable declarations
 * STACK.md Section 6: Themes are validated token configurations, not unrestricted CSS
 */
export function themeToCssVariables(theme: ThemeConfig): Record<string, string> {
  const c = theme.colors;
  const t = theme.typography;
  const r = theme.radius;
  const s = theme.spacing;
  const b = theme.buttons;
  const sh = theme.shadows;

  const vars: Record<string, string> = {
    // Brand Colors
    "--color-primary": c.primary,
    "--color-primary-hover": c.primaryHover,
    "--color-primary-soft": c.primarySoft,
    "--color-secondary": c.secondary || "#063B2E",
    "--color-accent": c.accent || "#12A875",

    // Background Colors
    "--color-app-bg": c.pageBackground || c.appBackground || "#F5F9F6",
    "--color-page-bg": c.pageBackground || c.appBackground || "#F5F9F6",
    "--color-surface": c.cardBackground || c.surface || "#FFFFFF",
    "--color-section-bg": c.sectionBackground || "#FFFFFF",
    "--color-card-bg": c.cardBackground || "#FFFFFF",
    "--color-alt-section-bg": c.alternateSectionBackground || "#EDF4EF",
    "--color-footer-bg": c.footerBackground || "#063B2E",

    // Text Colors
    "--color-text-primary": c.textPrimary,
    "--color-text-secondary": c.textSecondary,
    "--color-text-muted": c.textMuted,
    "--color-heading": c.heading || "#172B24",
    "--color-link": c.link || "#087A55",

    // Interactive Colors
    "--btn-primary-bg": c.buttonPrimaryBg || c.primary,
    "--btn-primary-text": c.buttonPrimaryText || "#FFFFFF",
    "--btn-secondary-bg": c.buttonSecondaryBg || "#FFFFFF",
    "--btn-secondary-text": c.buttonSecondaryText || "#172B24",
    "--btn-hover-bg": c.buttonHoverBg || c.primaryHover,
    "--btn-border": c.buttonBorder || c.primary,

    // UI Colors
    "--color-border": c.border,
    "--color-divider": c.divider || "#E1EAE4",
    "--color-input-bg": c.inputBg || "#FFFFFF",
    "--color-input-border": c.inputBorder || "#E1EAE4",
    "--color-input-text": c.inputText || "#172B24",
    "--color-input-placeholder": c.inputPlaceholder || "#8E9F96",
    "--color-icon": c.icon || "#087A55",

    // Radius Tokens
    "--radius-card": r.card,
    "--radius-button": b?.radius || r.button,
    "--radius-input": r.input || "8px",

    // Typography
    "--font-sans": t.bodyFont || t.fontFamily || "Inter",
    "--font-heading": t.headingFont || t.fontFamily || "Inter",
    "--font-weight-heading": String(t.headingWeight || 700),
    "--font-weight-body": String(t.bodyWeight || 400),
    "--line-height-body": t.lineHeight || "1.5",
    "--letter-spacing": t.letterSpacing || "-0.01em",

    // Spacing
    "--spacing-section-y": s.sectionY,
    "--spacing-container-x": s.containerX,
  };

  // Optional Buttons
  if (b?.height) vars["--btn-height"] = b.height;
  if (b?.paddingX) vars["--btn-padding-x"] = b.paddingX;
  if (b?.fontSize) vars["--btn-font-size"] = b.fontSize;
  if (b?.borderWidth) vars["--btn-border-width"] = b.borderWidth;

  // Optional Shadows
  if (sh?.preset) {
    switch (sh.preset) {
      case "none":
        vars["--shadow-card"] = "none";
        break;
      case "subtle":
        vars["--shadow-card"] = "0 1px 3px rgba(0,0,0,0.04)";
        break;
      case "soft":
        vars["--shadow-card"] = "0 4px 12px rgba(0,0,0,0.06)";
        break;
      case "medium":
        vars["--shadow-card"] = "0 8px 24px rgba(0,0,0,0.09)";
        break;
      case "elevated":
        vars["--shadow-card"] = "0 16px 36px rgba(0,0,0,0.12)";
        break;
    }
  } else if (sh?.card) {
    vars["--shadow-card"] = sh.card;
  } else {
    vars["--shadow-card"] = "0 1px 4px rgba(0,0,0,0.05)";
  }

  return vars;
}

/**
 * Format variables into an inline CSS style string for <style> or style prop
 */
export function themeToStyleString(theme: ThemeConfig): string {
  const vars = themeToCssVariables(theme);
  return Object.entries(vars)
    .map(([key, val]) => `${key}: ${val};`)
    .join(" ");
}
