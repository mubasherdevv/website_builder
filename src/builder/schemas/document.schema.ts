import { z } from "zod";

/**
 * Regex for stable node IDs: letters, numbers, hyphens, underscores
 */
export const NodeIdRegex = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Regex for component IDs: e.g. hero.split.v1, header.simple.v1
 */
export const ComponentIdRegex = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.v[0-9]+$/;

/**
 * Helper to build safe strings without script tags or javascript: URIs
 */
export const createSafeString = (min = 0, max = 500) =>
  z
    .string()
    .min(min)
    .max(max)
    .refine(
      (val) => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(val),
      { message: "Script tags are forbidden" }
    )
    .refine(
      (val) => !/javascript:/gi.test(val),
      { message: "javascript: URIs are forbidden" }
    );

export const PageMetaSchema = z.object({
  id: z.string().regex(NodeIdRegex, "Invalid page ID"),
  title: createSafeString(1, 120),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^(\/|\/[a-z0-9]+(-[a-z0-9]+)*)*$/, "Invalid URL slug format"),
  status: z.enum(["draft", "published", "archived"]),
  description: createSafeString(0, 300).optional(),
});

export const SectionStyleSchema = z.object({
  background: z.enum(["surface", "brand", "muted", "transparent"]).optional(),
  paddingY: z.enum(["none", "compact", "normal", "spacious"]).optional(),
  paddingX: z.enum(["none", "compact", "normal", "spacious"]).optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  customClassName: createSafeString(0, 100).optional(),
});

// Recursive section node schema
export type SectionNodeInput = {
  id: string;
  componentId: string;
  componentVersion: number;
  props: Record<string, unknown>;
  style?: z.infer<typeof SectionStyleSchema>;
  children?: SectionNodeInput[];
};

export const SectionNodeSchema: z.ZodType<SectionNodeInput> = z.lazy(() =>
  z.object({
    id: z.string().regex(NodeIdRegex, "Invalid section node ID"),
    componentId: z
      .string()
      .regex(ComponentIdRegex, "Invalid component ID format (e.g. hero.split.v1)"),
    componentVersion: z.number().int().positive(),
    props: z.record(z.unknown()),
    style: SectionStyleSchema.optional(),
    children: z.array(SectionNodeSchema).optional(),
  })
);

export const PageDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  page: PageMetaSchema,
  sections: z.array(SectionNodeSchema),
});

export type PageDocumentValidated = z.infer<typeof PageDocumentSchema>;
export type SectionNodeValidated = z.infer<typeof SectionNodeSchema>;
export type PageMetaValidated = z.infer<typeof PageMetaSchema>;

/**
 * Validates a raw JSON document, returning either success data or detailed error map
 */
export function validatePageDocument(data: unknown): {
  success: boolean;
  data?: PageDocumentValidated;
  error?: string;
  details?: z.ZodIssue[];
} {
  const result = PageDocumentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
    details: result.error.errors,
  };
}
