import { z } from "zod";

/**
 * Validates hex colors: #RGB, #RRGGBB, or #RRGGBBAA
 */
export const HexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/;

export const HexColorSchema = z
  .string()
  .regex(HexColorRegex, "Invalid hex color format (e.g. #087A55)");

export const ThemeColorsSchema = z.object({
  // Brand Colors
  primary: HexColorSchema,
  primaryHover: HexColorSchema,
  primarySoft: HexColorSchema,
  secondary: HexColorSchema.optional(),
  accent: HexColorSchema.optional(),

  // Background Colors
  appBackground: HexColorSchema,
  pageBackground: HexColorSchema.optional(),
  sectionBackground: HexColorSchema.optional(),
  cardBackground: HexColorSchema.optional(),
  alternateSectionBackground: HexColorSchema.optional(),
  footerBackground: HexColorSchema.optional(),
  surface: HexColorSchema,

  // Text Colors
  textPrimary: HexColorSchema,
  textSecondary: HexColorSchema,
  textMuted: HexColorSchema,
  heading: HexColorSchema.optional(),
  link: HexColorSchema.optional(),

  // Interactive Colors
  buttonPrimaryBg: HexColorSchema.optional(),
  buttonPrimaryText: HexColorSchema.optional(),
  buttonSecondaryBg: HexColorSchema.optional(),
  buttonSecondaryText: HexColorSchema.optional(),
  buttonHoverBg: HexColorSchema.optional(),
  buttonBorder: HexColorSchema.optional(),

  // UI Colors
  border: HexColorSchema,
  divider: HexColorSchema.optional(),
  inputBg: HexColorSchema.optional(),
  inputBorder: HexColorSchema.optional(),
  inputText: HexColorSchema.optional(),
  inputPlaceholder: HexColorSchema.optional(),
  icon: HexColorSchema.optional(),
});

export const AllowedFonts = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Geist",
  "Playfair Display",
  "Plus Jakarta Sans",
  "System",
] as const;

export const ThemeTypographySchema = z.object({
  fontFamily: z.string().default("Inter"),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  h1Size: z.string().regex(/^\d+(px|rem)$/).optional(),
  h2Size: z.string().regex(/^\d+(px|rem)$/).optional(),
  h3Size: z.string().regex(/^\d+(px|rem)$/).optional(),
  bodySize: z.string().regex(/^\d+(px|rem)$/).optional(),
  headingWeight: z.number().int().min(400).max(900).default(700),
  bodyWeight: z.number().int().min(300).max(700).default(400),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
});

export const ThemeButtonsSchema = z.object({
  height: z.string().regex(/^\d+(px|rem)$/).optional(),
  paddingX: z.string().regex(/^\d+(px|rem)$/).optional(),
  radius: z.string().regex(/^\d+(px|rem)$/).optional(),
  fontSize: z.string().regex(/^\d+(px|rem)$/).optional(),
  fontWeight: z.number().int().min(400).max(900).optional(),
  borderWidth: z.string().regex(/^\d+px$/).optional(),
});

export const ThemeRadiusSchema = z.object({
  card: z.string().regex(/^\d+(px|rem)$/, "Invalid radius format (e.g. 16px)").default("16px"),
  button: z.string().regex(/^\d+(px|rem)$/, "Invalid radius format (e.g. 10px)").default("10px"),
  input: z.string().regex(/^\d+(px|rem)$/).optional(),
});

export const ThemeSpacingSchema = z.object({
  sectionY: z.string().regex(/^\d+(px|rem)$/, "Invalid spacing format (e.g. 80px)").default("80px"),
  containerX: z.string().regex(/^\d+(px|rem)$/, "Invalid spacing format (e.g. 24px)").default("24px"),
  cardGap: z.string().regex(/^\d+(px|rem)$/).optional(),
});

export const ThemeShadowsSchema = z.object({
  card: z.string().optional(),
  preset: z.enum(["none", "subtle", "soft", "medium", "elevated"]).optional(),
});

export const ThemeConfigSchema = z.object({
  themeVersion: z.number().int().default(1),
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(100),
  colors: ThemeColorsSchema,
  typography: ThemeTypographySchema,
  radius: ThemeRadiusSchema,
  spacing: ThemeSpacingSchema,
  buttons: ThemeButtonsSchema.optional(),
  shadows: ThemeShadowsSchema.optional(),
});

export type ThemeConfigValidated = z.infer<typeof ThemeConfigSchema>;

export function validateThemeConfig(data: unknown): {
  success: boolean;
  data?: ThemeConfigValidated;
  error?: string;
} {
  const result = ThemeConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
  };
}
