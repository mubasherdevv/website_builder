import { z } from "zod";
import { SEOHealthStatus } from "./cms";

export type BlogPublishStatus = "draft" | "published" | "scheduled" | "archived";

export interface BlogAuthor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface BlogCategory {
  id: string;
  websiteId: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface BlogTag {
  id: string;
  websiteId: string;
  name: string;
  slug: string;
  createdAt: string;
}

export type RichTextBlockType =
  | "heading"
  | "paragraph"
  | "blockquote"
  | "list"
  | "image"
  | "table"
  | "code"
  | "youtube"
  | "divider";

export interface RichTextBlock {
  id: string;
  type: RichTextBlockType;
  level?: 1 | 2 | 3; // for headings
  ordered?: boolean; // for lists
  items?: string[]; // for list items
  text?: string;
  url?: string; // image or youtube url
  alt?: string;
  caption?: string;
  language?: string; // code language
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface StructuredRichTextJSON {
  version: 1;
  blocks: RichTextBlock[];
}

export interface BlogPostSEO {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl?: string;
  noIndex: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface BlogPost {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: StructuredRichTextJSON;
  featuredImage: string;
  featuredImageAlt?: string;
  imageCaption?: string;
  author: BlogAuthor;
  categoryId?: string;
  tagIds: string[];
  status: BlogPublishStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  readingTimeMinutes: number;
  seo: BlogPostSEO;
  seoStatus: SEOHealthStatus;
  createdAt: string;
  updatedAt: string;
}

export const BlogPostSchema = z.object({
  id: z.string(),
  websiteId: z.string(),
  title: z.string().min(1, "Post title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string(),
  featuredImage: z.string(),
  status: z.enum(["draft", "published", "scheduled", "archived"]),
  readingTimeMinutes: z.number().nonnegative(),
});

