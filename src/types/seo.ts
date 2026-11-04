import { z } from "zod";

export type TwitterCardType = "summary" | "summary_large_image" | "app" | "player";

export interface SEORobotsDirectives {
  noIndex: boolean;
  noFollow: boolean;
  noArchive?: boolean;
  noSnippet?: boolean;
}

export const SEORobotsSchema = z.object({
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  noArchive: z.boolean().default(false),
  noSnippet: z.boolean().default(false),
});

export const SEOMetadataSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(300),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  focusKeyword: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  twitterCard: z.enum(["summary", "summary_large_image", "app", "player"]).optional().default("summary_large_image"),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().url().optional().or(z.literal("")),
  noIndex: z.boolean().optional().default(false),
  noFollow: z.boolean().optional().default(false),
  noArchive: z.boolean().optional().default(false),
  noSnippet: z.boolean().optional().default(false),
  businessName: z.string().optional(),
  telephone: z.string().optional(),
  address: z.string().optional(),
  priceRange: z.string().optional(),
  openingHours: z.string().optional(),
});

export type SEOMetadata = z.infer<typeof SEOMetadataSchema>;
export type SEOMetadataInput = z.input<typeof SEOMetadataSchema>;

export type SEORedirectStatusCode = 301 | 302;

export interface SEORedirect {
  id: string;
  websiteId: string;
  sourcePath: string;
  destinationPath: string;
  statusCode: SEORedirectStatusCode;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SEOSchemaType =
  | "Organization"
  | "LocalBusiness"
  | "WebSite"
  | "WebPage"
  | "Article"
  | "BlogPosting"
  | "BreadcrumbList"
  | "FAQPage";

export interface SEOSchemaConfig {
  id: string;
  websiteId: string;
  schemaType: SEOSchemaType;
  isActive: boolean;
  name?: string;
  legalName?: string;
  url?: string;
  logoUrl?: string;
  telephone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  priceRange?: string;
  openingHours?: string[];
  sameAs?: string[]; // Social links
  faqItems?: { question: string; answer: string }[];
}

export type SEOAuditSeverity = "critical" | "warning" | "info";

export interface SEOAuditIssue {
  id: string;
  severity: SEOAuditSeverity;
  category: "meta" | "content" | "indexing" | "technical" | "schema";
  title: string;
  description: string;
  pageId?: string;
  pageTitle?: string;
  pageSlug?: string;
  recommendation: string;
  fixActionUrl?: string;
}

export interface SEOTechnicalSettings {
  websiteId: string;
  sitemapEnabled: boolean;
  includeBlogInSitemap: boolean;
  customRobotsRules: {
    userAgent: string;
    allow: string[];
    disallow: string[];
  }[];
  googleSearchConsoleVerification?: string;
  bingWebmasterVerification?: string;
  defaultTitleTemplate: string; // e.g. "%title% | %site_name%"
  fallbackOgImage?: string;
}

export interface GeneratedRobotsTxt {
  rules: {
    userAgent: string;
    allow?: string[];
    disallow?: string[];
  }[];
  sitemapUrl: string;
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}
