import { PageDocument } from "./builder";

export type PageType =
  | "home"
  | "about"
  | "services"
  | "service_detail"
  | "pricing"
  | "team"
  | "contact"
  | "faq"
  | "testimonials"
  | "gallery"
  | "locations"
  | "custom";

export interface PageSEO {
  title: string;
  description: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  focusKeyword?: string;
}

export type SEOHealthStatus = "good" | "warning" | "missing";

export interface CMSPageItem {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  pageType?: PageType;
  description?: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
  createdAt?: string;
  isHome?: boolean;
  inNavigation?: boolean;
  navLabel?: string;
  seo?: PageSEO;
  seoStatus?: SEOHealthStatus;
  document?: PageDocument;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
  pageId?: string;
  children?: MenuItem[];
}

export interface MediaAssetItem {
  id: string;
  websiteId: string;
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
  altText: string;
  createdAt: string;
}

export interface BlogPostItem {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "scheduled";
  publishedAt?: string;
  createdAt: string;
}
