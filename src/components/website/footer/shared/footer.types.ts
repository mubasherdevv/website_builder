import { z } from "zod";

const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;
const SAFE_HREF_RE = /^(\/(?!\/)[^\u0000-\u001F\s]*|#[A-Za-z0-9_-]*|https?:\/\/|mailto:|tel:)/i;

export const safeFooterHrefSchema = z
  .string()
  .trim()
  .max(500, "Link must be 500 characters or fewer.")
  .refine(
    (value) => !CONTROL_CHARS_RE.test(value) && (value === "" || SAFE_HREF_RE.test(value)),
    "Use a relative path, #anchor, or http/https/mailto/tel URL."
  );

export const optionalFooterUrlSchema = z
  .string()
  .trim()
  .max(500, "URL must be 500 characters or fewer.")
  .refine(
    (value) =>
      value === "" ||
      (!CONTROL_CHARS_RE.test(value) &&
        (/^\/(?!\/)[^\u0000-\u001F\s]*$/.test(value) || /^https?:\/\//i.test(value))),
    "Use a relative path or http/https URL."
  )
  .default("");

export const optionalFetchEndpointSchema = z
  .string()
  .trim()
  .max(500, "Newsletter endpoint must be 500 characters or fewer.")
  .refine(
    (value) =>
      value === "" ||
      (!CONTROL_CHARS_RE.test(value) &&
        (/^\/(?!\/)[^\u0000-\u001F\s]*$/.test(value) || /^https?:\/\//i.test(value))),
    "Use a relative API path or http/https URL."
  )
  .default("");

export const footerLinkSchema = z.object({
  label: z.string().trim().min(1, "Link label is required.").max(80),
  href: safeFooterHrefSchema,
});

export type FooterLink = z.infer<typeof footerLinkSchema>;

export const footerSocialLinksFields = {
  facebookUrl: optionalFooterUrlSchema,
  instagramUrl: optionalFooterUrlSchema,
  linkedinUrl: optionalFooterUrlSchema,
  youtubeUrl: optionalFooterUrlSchema,
} as const;
