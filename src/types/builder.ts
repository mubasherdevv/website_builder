/**
 * Core type definitions for SecureSite Studio Builder
 * Architecture follows PRD.md Section 2 and STACK.md Section 5
 */

export type NodeStatus = "draft" | "published" | "archived";

export interface PageMeta {
  id: string;
  title: string;
  slug: string;
  status: NodeStatus;
  description?: string;
  websiteId?: string;
}

export interface SectionStyle {
  background?: "surface" | "brand" | "muted" | "transparent";
  paddingY?: "none" | "compact" | "normal" | "spacious";
  paddingX?: "none" | "compact" | "normal" | "spacious";
  alignment?: "left" | "center" | "right";
  customClassName?: string;
}

export interface SectionNode<TProps = Record<string, unknown>> {
  id: string;
  componentId: string;
  componentVersion: number;
  props: TProps;
  style?: SectionStyle;
  children?: SectionNode[];
}

export interface PageDocument {
  schemaVersion: number;
  page: PageMeta;
  sections: SectionNode[];
}

/**
 * Complete Global Design System Colors
 */
export interface ThemeColors {
  // Brand Colors
  primary: string;
  primaryHover: string;
  primarySoft: string;
  secondary?: string;
  accent?: string;

  // Background Colors
  appBackground: string;
  pageBackground?: string;
  sectionBackground?: string;
  cardBackground?: string;
  alternateSectionBackground?: string;
  footerBackground?: string;
  surface: string;

  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  heading?: string;
  link?: string;

  // Interactive Colors
  buttonPrimaryBg?: string;
  buttonPrimaryText?: string;
  buttonSecondaryBg?: string;
  buttonSecondaryText?: string;
  buttonHoverBg?: string;
  buttonBorder?: string;

  // UI Colors
  border: string;
  divider?: string;
  inputBg?: string;
  inputBorder?: string;
  inputText?: string;
  inputPlaceholder?: string;
  icon?: string;
}

/**
 * Complete Global Typography Tokens
 */
export interface ThemeTypography {
  fontFamily: string;
  headingFont?: string;
  bodyFont?: string;
  h1Size?: string;
  h2Size?: string;
  h3Size?: string;
  bodySize?: string;
  headingWeight: number;
  bodyWeight: number;
  lineHeight?: string;
  letterSpacing?: string;
}

/**
 * Global Button Settings
 */
export interface ThemeButtons {
  height?: string;
  paddingX?: string;
  radius?: string;
  fontSize?: string;
  fontWeight?: number;
  borderWidth?: string;
}

/**
 * Global Radius Tokens
 */
export interface ThemeRadius {
  card: string;
  button: string;
  input?: string;
}

/**
 * Global Spacing Tokens
 */
export interface ThemeSpacing {
  sectionY: string;
  containerX: string;
  cardGap?: string;
}

/**
 * Global Shadow Presets
 */
export interface ThemeShadows {
  card?: string;
  preset?: "none" | "subtle" | "soft" | "medium" | "elevated";
}

/**
 * Consolidated Theme Configuration & Design System
 */
export interface ThemeConfig {
  themeVersion: number;
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  radius: ThemeRadius;
  spacing: ThemeSpacing;
  buttons?: ThemeButtons;
  shadows?: ThemeShadows;
}
