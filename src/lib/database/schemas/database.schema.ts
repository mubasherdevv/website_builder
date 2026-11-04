import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name must be at least 1 character").max(100).optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().nullable(),
});

export const CreateWebsiteSchema = z.object({
  organizationId: z.string().uuid("Organization ID must be a valid UUID"),
  name: z.string().min(2, "Website name must be at least 2 characters").max(80),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  customDomain: z.string().max(253).optional().nullable(),
  themeConfig: z.record(z.unknown()).default({}),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const UpdateWebsiteSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  subdomain: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  customDomain: z.string().max(253).optional().nullable(),
  themeConfig: z.record(z.unknown()).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const WebsiteMemberSchema = z.object({
  websiteId: z.string().uuid("Website ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  role: z.enum(["admin", "editor", "author", "viewer"]),
});

export const CreatePageSchema = z.object({
  websiteId: z.string().uuid("Website ID must be a valid UUID"),
  title: z.string().min(1, "Title is required").max(120),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^\/?[a-z0-9-_/]*$/, "Slug must be valid path characters"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const UpdatePageSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  slug: z
    .string()
    .regex(/^\/?[a-z0-9-_/]*$/)
    .optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  draftRevisionId: z.string().uuid().optional().nullable(),
  publishedRevisionId: z.string().uuid().optional().nullable(),
});

