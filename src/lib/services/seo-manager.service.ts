import {
  SEORedirect,
  SEOSchemaConfig,
  SEOTechnicalSettings,
  SEOAuditIssue,
} from "@/types/seo";
import { CMSPageItem } from "@/types/cms";
import { BlogPost } from "@/types/blog";
import { PagesManagerService } from "./pages-manager.service";
import { BlogManagerService } from "./blog-manager.service";
import { generateEntityId } from "@/lib/utils/id";
import { stripTrailingSlash, normalizeSlug } from "@/lib/utils/url";

const STORAGE_KEY_PREFIX = "website_";

export class SEOManagerService {
  /**
   * Technical Settings Management
   */
  public static getTechnicalSettings(websiteId: string): SEOTechnicalSettings {
    if (typeof window === "undefined") {
      return this.getDefaultTechnicalSettings(websiteId);
    }
    const key = `${STORAGE_KEY_PREFIX}${websiteId}_seo_settings`;
    const data = localStorage.getItem(key);
    if (!data) {
      const def = this.getDefaultTechnicalSettings(websiteId);
      this.saveTechnicalSettings(websiteId, def);
      return def;
    }
    try {
      return JSON.parse(data);
    } catch {
      return this.getDefaultTechnicalSettings(websiteId);
    }
  }

  public static saveTechnicalSettings(
    websiteId: string,
    settings: SEOTechnicalSettings
  ): void {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}${websiteId}_seo_settings`;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  public static getDefaultTechnicalSettings(websiteId: string): SEOTechnicalSettings {
    return {
      websiteId,
      sitemapEnabled: true,
      includeBlogInSitemap: true,
      customRobotsRules: [
        {
          userAgent: "*",
          allow: ["/"],
          disallow: ["/dashboard/", "/admin/", "/editor/", "/api/"],
        },
      ],
      googleSearchConsoleVerification: "",
      bingWebmasterVerification: "",
      defaultTitleTemplate: "%title% | SecureSite",
      fallbackOgImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    };
  }

  /**
   * Redirect Management
   */
  public static getRedirects(websiteId: string): SEORedirect[] {
    if (typeof window === "undefined") {
      return this.getInitialDefaultRedirects(websiteId);
    }
    const key = `${STORAGE_KEY_PREFIX}${websiteId}_seo_redirects`;
    const data = localStorage.getItem(key);
    if (!data) {
      const initial = this.getInitialDefaultRedirects(websiteId);
      this.saveRedirects(websiteId, initial);
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return this.getInitialDefaultRedirects(websiteId);
    }
  }

  public static saveRedirects(websiteId: string, redirects: SEORedirect[]): void {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}${websiteId}_seo_redirects`;
    localStorage.setItem(key, JSON.stringify(redirects));
  }

  public static getInitialDefaultRedirects(websiteId: string): SEORedirect[] {
    return [
      {
        id: "redir_old_services",
        websiteId,
        sourcePath: "/our-services",
        destinationPath: "/services",
        statusCode: 301,
        isActive: true,
        notes: "Migrated from legacy website URL structure",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Validates a redirect entry for loops, self-references, and duplicates
   */
  public static validateRedirect(
    websiteId: string,
    redirect: Omit<SEORedirect, "id" | "createdAt" | "updatedAt">,
    excludeId?: string
  ): { valid: boolean; error?: string } {
    const src = redirect.sourcePath.trim();
    const dest = redirect.destinationPath.trim();

    if (!src) return { valid: false, error: "Source path is required" };
    if (!dest) return { valid: false, error: "Destination path is required" };

    if (!src.startsWith("/")) {
      return { valid: false, error: "Source path must start with a forward slash (/)" };
    }

    if (src === dest) {
      return { valid: false, error: "Self-redirect: source and destination cannot be identical" };
    }

    const existing = this.getRedirects(websiteId).filter((r) => r.id !== excludeId);

    // Duplicate check
    const duplicate = existing.find((r) => r.sourcePath.toLowerCase() === src.toLowerCase());
    if (duplicate) {
      return {
        valid: false,
        error: `A redirect already exists for source path "${src}"`,
      };
    }

    // Direct loop check: e.g. dest already redirects to src
    const reverse = existing.find(
      (r) => r.sourcePath.toLowerCase() === dest.toLowerCase() && r.destinationPath.toLowerCase() === src.toLowerCase()
    );
    if (reverse) {
      return {
        valid: false,
        error: `Redirect loop detected: "${dest}" already redirects back to "${src}"`,
      };
    }

    // Extended chain loop check (e.g. A -> B -> C -> A)
    const visited = new Set<string>([src.toLowerCase()]);
    let currentTarget = dest.toLowerCase();

    while (currentTarget) {
      if (visited.has(currentTarget)) {
        return {
          valid: false,
          error: `Circular redirect chain detected leading back to "${currentTarget}"`,
        };
      }
      visited.add(currentTarget);
      const nextHop = existing.find((r) => r.sourcePath.toLowerCase() === currentTarget);
      if (nextHop) {
        currentTarget = nextHop.destinationPath.toLowerCase();
      } else {
        break;
      }
    }

    return { valid: true };
  }

  public static addRedirect(
    websiteId: string,
    redirect: Omit<SEORedirect, "id" | "createdAt" | "updatedAt">
  ): { success: boolean; redirect?: SEORedirect; error?: string } {
    const validation = this.validateRedirect(websiteId, redirect);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const list = this.getRedirects(websiteId);
    const newEntry: SEORedirect = {
      ...redirect,
      id: generateEntityId("redir"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newEntry);
    this.saveRedirects(websiteId, list);
    return { success: true, redirect: newEntry };
  }

  public static updateRedirect(
    websiteId: string,
    id: string,
    updates: Partial<Omit<SEORedirect, "id" | "websiteId" | "createdAt">>
  ): { success: boolean; error?: string } {
    const list = this.getRedirects(websiteId);
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, error: "Redirect not found" };

    const merged = { ...list[idx], ...updates };
    const validation = this.validateRedirect(websiteId, merged, id);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    list[idx] = {
      ...merged,
      updatedAt: new Date().toISOString(),
    };
    this.saveRedirects(websiteId, list);
    return { success: true };
  }

  public static deleteRedirect(websiteId: string, id: string): void {
    const list = this.getRedirects(websiteId).filter((r) => r.id !== id);
    this.saveRedirects(websiteId, list);
  }

  /**
   * Schema Markup Configurations
   */
  public static getSchemaConfigs(websiteId: string): SEOSchemaConfig[] {
    if (typeof window === "undefined") {
      return this.getDefaultSchemaConfigs(websiteId);
    }
    const key = `${STORAGE_KEY_PREFIX}${websiteId}_seo_schemas`;
    const data = localStorage.getItem(key);
    if (!data) {
      const def = this.getDefaultSchemaConfigs(websiteId);
      this.saveSchemaConfigs(websiteId, def);
      return def;
    }
    try {
      return JSON.parse(data);
    } catch {
      return this.getDefaultSchemaConfigs(websiteId);
    }
  }

  public static saveSchemaConfigs(websiteId: string, configs: SEOSchemaConfig[]): void {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}${websiteId}_seo_schemas`;
    localStorage.setItem(key, JSON.stringify(configs));
  }

  public static getDefaultSchemaConfigs(websiteId: string): SEOSchemaConfig[] {
    return [
      {
        id: "schema_local_business",
        websiteId,
        schemaType: "LocalBusiness",
        isActive: true,
        name: "Austin Pro Roofing",
        legalName: "Austin Pro Roofing & Restoration LLC",
        url: `https://${websiteId}.securesite.io`,
        telephone: "(512) 555-0199",
        email: "contact@austinproroofing.com",
        address: {
          street: "701 Brazos St",
          city: "Austin",
          state: "TX",
          postalCode: "78701",
          country: "US",
        },
        priceRange: "$$",
        openingHours: ["Mo-Sa 07:00-19:00"],
        sameAs: [
          "https://facebook.com/austinproroofing",
          "https://instagram.com/austinproroofing",
        ],
      },
      {
        id: "schema_org",
        websiteId,
        schemaType: "Organization",
        isActive: true,
        name: "Austin Pro Roofing",
        url: `https://${websiteId}.securesite.io`,
        logoUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&h=200&q=80",
      },
    ];
  }

  /**
   * Dynamic XML Sitemap Generator
   * Output verified RFC / sitemaps.org compliant XML.
   */
  public static generateSitemapXml(
    baseUrl: string,
    pages: CMSPageItem[],
    posts: BlogPost[] = []
  ): string {
    const cleanBaseUrl = stripTrailingSlash(baseUrl);
    const publishedPages = pages.filter(
      (p) => p.status === "published" && !p.seo?.noIndex
    );
    const publishedPosts = posts.filter(
      (p) => p.status === "published" && !p.seo?.noIndex
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of publishedPages) {
      const slug = normalizeSlug(page.slug);
      const loc = slug === "/" ? cleanBaseUrl : `${cleanBaseUrl}${slug}`;
      const lastmod = page.updatedAt ? new Date(page.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      const priority = page.isHome || slug === "/" ? "1.0" : "0.8";
      const changefreq = page.isHome || slug === "/" ? "daily" : "weekly";

      xml += `  <url>\n`;
      xml += `    <loc>${this.escapeXml(loc)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const post of publishedPosts) {
      const postSlug = normalizeSlug(post.slug);
      const loc = `${cleanBaseUrl}/blog${postSlug.startsWith("/") ? postSlug : `/${postSlug}`}`;
      const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

      xml += `  <url>\n`;
      xml += `    <loc>${this.escapeXml(loc)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Dynamic Robots.txt Generator
   */
  public static generateRobotsTxt(baseUrl: string, settings?: SEOTechnicalSettings): string {
    const cleanBaseUrl = stripTrailingSlash(baseUrl);
    const rules = settings?.customRobotsRules && settings.customRobotsRules.length > 0
      ? settings.customRobotsRules
      : [
          {
            userAgent: "*",
            allow: ["/"],
            disallow: ["/dashboard/", "/admin/", "/editor/", "/api/"],
          },
        ];

    let output = "";
    for (const r of rules) {
      output += `User-agent: ${r.userAgent}\n`;
      if (r.allow && r.allow.length > 0) {
        for (const a of r.allow) output += `Allow: ${a}\n`;
      }
      if (r.disallow && r.disallow.length > 0) {
        for (const d of r.disallow) output += `Disallow: ${d}\n`;
      }
      output += "\n";
    }

    output += `Sitemap: ${cleanBaseUrl}/sitemap.xml\n`;
    return output;
  }

  /**
   * JSON-LD Structured Data Builder
   */
  public static generateJsonLd(config: SEOSchemaConfig): Record<string, unknown> {
    const base: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": config.schemaType,
    };

    if (config.schemaType === "Organization" || config.schemaType === "LocalBusiness") {
      if (config.name) base.name = config.name;
      if (config.legalName) base.legalName = config.legalName;
      if (config.url) base.url = config.url;
      if (config.logoUrl) base.logo = config.logoUrl;
      if (config.telephone) base.telephone = config.telephone;
      if (config.email) base.email = config.email;
      if (config.address) {
        base.address = {
          "@type": "PostalAddress",
          streetAddress: config.address.street,
          addressLocality: config.address.city,
          addressRegion: config.address.state,
          postalCode: config.address.postalCode,
          addressCountry: config.address.country,
        };
      }
      if (config.schemaType === "LocalBusiness") {
        if (config.priceRange) base.priceRange = config.priceRange;
        if (config.openingHours && config.openingHours.length > 0) {
          base.openingHours = config.openingHours;
        }
      }
      if (config.sameAs && config.sameAs.length > 0) {
        base.sameAs = config.sameAs;
      }
    } else if (config.schemaType === "FAQPage" && config.faqItems) {
      base.mainEntity = config.faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }));
    }

    return base;
  }

  /**
   * Comprehensive SEO Audit Engine
   */
  public static runSEOAudit(websiteId: string): SEOAuditIssue[] {
    const pages = PagesManagerService.getPages(websiteId);
    const posts = BlogManagerService.getPosts(websiteId);
    const schemas = this.getSchemaConfigs(websiteId);

    const issues: SEOAuditIssue[] = [];

    // Title & description duplicate check maps
    const titleMap = new Map<string, string[]>();
    const descMap = new Map<string, string[]>();

    // 1. Audit Pages
    pages.forEach((page) => {
      const seo = page.seo;
      const title = (seo?.title || page.title || "").trim();
      const desc = (seo?.description || "").trim();

      // Missing Title
      if (!title) {
        issues.push({
          id: `audit_missing_title_${page.id}`,
          severity: "critical",
          category: "meta",
          title: "Missing SEO Title",
          description: `Page "${page.title}" (${page.slug}) does not have an SEO title.`,
          pageId: page.id,
          pageTitle: page.title,
          pageSlug: page.slug,
          recommendation: "Provide a unique, descriptive title between 30 and 60 characters.",
          fixActionUrl: `/websites/${websiteId}/seo?tab=pages&editPageId=${page.id}`,
        });
      } else {
        if (title.length < 20) {
          issues.push({
            id: `audit_short_title_${page.id}`,
            severity: "warning",
            category: "meta",
            title: "Title Too Short",
            description: `Title for "${page.title}" is only ${title.length} characters (recommended 30-60).`,
            pageId: page.id,
            pageTitle: page.title,
            pageSlug: page.slug,
            recommendation: "Expand the title with primary keywords and brand name.",
            fixActionUrl: `/websites/${websiteId}/seo?tab=pages&editPageId=${page.id}`,
          });
        } else if (title.length > 70) {
          issues.push({
            id: `audit_long_title_${page.id}`,
            severity: "warning",
            category: "meta",
            title: "Title May Truncate in Google SERP",
            description: `Title for "${page.title}" is ${title.length} characters, which may be truncated in search results.`,
            pageId: page.id,
            pageTitle: page.title,
            pageSlug: page.slug,
            recommendation: "Shorten title to under 60-65 characters.",
            fixActionUrl: `/websites/${websiteId}/seo?tab=pages&editPageId=${page.id}`,
          });
        }

        // Check duplicate titles
        const lowerTitle = title.toLowerCase();
        const existing = titleMap.get(lowerTitle) || [];
        existing.push(page.title);
        titleMap.set(lowerTitle, existing);
      }

      // Missing Description
      if (!desc) {
        issues.push({
          id: `audit_missing_desc_${page.id}`,
          severity: "critical",
          category: "meta",
          title: "Missing Meta Description",
          description: `Page "${page.title}" (${page.slug}) has no meta description.`,
          pageId: page.id,
          pageTitle: page.title,
          pageSlug: page.slug,
          recommendation: "Add an engaging meta description between 120 and 160 characters.",
          fixActionUrl: `/websites/${websiteId}/seo?tab=pages&editPageId=${page.id}`,
        });
      } else {
        if (desc.length < 50) {
          issues.push({
            id: `audit_short_desc_${page.id}`,
            severity: "warning",
            category: "meta",
            title: "Meta Description Too Short",
            description: `Description for "${page.title}" is only ${desc.length} characters (optimal 120-160).`,
            pageId: page.id,
            pageTitle: page.title,
            pageSlug: page.slug,
            recommendation: "Expand description with clear benefits and call to action.",
            fixActionUrl: `/websites/${websiteId}/seo?tab=pages&editPageId=${page.id}`,
          });
        } else if (desc.length > 170) {
          issues.push({
            id: `audit_long_desc_${page.id}`,
            severity: "info",
            category: "meta",
            title: "Meta Description Too Long",
            description: `Description for "${page.title}" is ${desc.length} characters and may be cut off.`,
            pageId: page.id,
            pageTitle: page.title,
            pageSlug: page.slug,
            recommendation: "Trim description to approximately 155 characters.",
            fixActionUrl: `/websites/${websiteId}/seo?tab=pages&editPageId=${page.id}`,
          });
        }

        const lowerDesc = desc.toLowerCase();
        const existing = descMap.get(lowerDesc) || [];
        existing.push(page.title);
        descMap.set(lowerDesc, existing);
      }

      // Missing Canonical
      if (!seo?.canonicalUrl && page.status === "published") {
        issues.push({
          id: `audit_missing_canonical_${page.id}`,
          severity: "info",
          category: "technical",
          title: "Custom Canonical URL Not Set",
          description: `Page "${page.title}" relies on the default fallback canonical URL.`,
          pageId: page.id,
          pageTitle: page.title,
          pageSlug: page.slug,
          recommendation: "Specify an explicit canonical URL if this page has parameterized variations.",
          fixActionUrl: `/websites/${websiteId}/seo?tab=pages&editPageId=${page.id}`,
        });
      }

      // Noindex warning for published pages
      if (seo?.noIndex && page.status === "published") {
        issues.push({
          id: `audit_noindex_warning_${page.id}`,
          severity: "warning",
          category: "indexing",
          title: "Published Page Set to Noindex",
          description: `Page "${page.title}" is published but instructs search engines not to index it.`,
          pageId: page.id,
          pageTitle: page.title,
          pageSlug: page.slug,
          recommendation: "Verify whether this page should be hidden from search engine results.",
          fixActionUrl: `/websites/${websiteId}/seo?tab=pages&editPageId=${page.id}`,
        });
      }

      // Section-level checks (e.g. H1 count or images)
      if (page.document?.sections) {
        const heroSections = page.document.sections.filter((s) => s.componentId.includes("hero"));
        if (heroSections.length > 1) {
          issues.push({
            id: `audit_multiple_h1_${page.id}`,
            severity: "warning",
            category: "content",
            title: "Multiple Hero/H1 Sections Detected",
            description: `Page "${page.title}" has ${heroSections.length} hero sections. Having more than one H1 heading can dilute keyword focus.`,
            pageId: page.id,
            pageTitle: page.title,
            pageSlug: page.slug,
            recommendation: "Ensure each page has a single primary H1 heading.",
            fixActionUrl: `/websites/${websiteId}/editor/${page.id}`,
          });
        }
      }
    });

    // Duplicate titles & descriptions
    titleMap.forEach((pageList, title) => {
      if (pageList.length > 1) {
        issues.push({
          id: `audit_dup_title_${title.slice(0, 15)}`,
          severity: "critical",
          category: "meta",
          title: "Duplicate SEO Title",
          description: `Title "${title}" is shared across ${pageList.length} pages: ${pageList.join(", ")}.`,
          recommendation: "Give every page a unique title to avoid keyword cannibalization.",
          fixActionUrl: `/websites/${websiteId}/seo?tab=pages`,
        });
      }
    });

    descMap.forEach((pageList, desc) => {
      if (pageList.length > 1) {
        issues.push({
          id: `audit_dup_desc_${desc.slice(0, 15)}`,
          severity: "warning",
          category: "meta",
          title: "Duplicate Meta Description",
          description: `The exact meta description is reused across ${pageList.length} pages: ${pageList.join(", ")}.`,
          recommendation: "Write unique meta descriptions tailored to each page's specific content.",
          fixActionUrl: `/websites/${websiteId}/seo?tab=pages`,
        });
      }
    });

    // 2. Audit Blog Posts
    posts.forEach((post) => {
      if (post.status === "published") {
        if (!post.seo?.metaTitle && !post.title) {
          issues.push({
            id: `audit_blog_missing_title_${post.id}`,
            severity: "critical",
            category: "meta",
            title: "Missing Blog SEO Title",
            description: `Blog post "${post.title}" does not have an SEO title.`,
            recommendation: "Set a compelling title for search results.",
            fixActionUrl: `/websites/${websiteId}/seo?tab=blog`,
          });
        }
        if (!post.featuredImageAlt) {
          issues.push({
            id: `audit_blog_img_alt_${post.id}`,
            severity: "warning",
            category: "content",
            title: "Missing Image Alt Text",
            description: `Featured image for blog post "${post.title}" is missing descriptive alt text.`,
            recommendation: "Add descriptive alt text to improve accessibility and image SEO.",
            fixActionUrl: `/websites/${websiteId}/seo?tab=blog`,
          });
        }
      }
    });

    // 3. Schema Check
    const activeSchemas = schemas.filter((s) => s.isActive);
    if (activeSchemas.length === 0) {
      issues.push({
        id: "audit_no_schema",
        severity: "warning",
        category: "schema",
        title: "No Active Structured Data (Schema)",
        description: "Your website does not have any active Schema.org markup enabled.",
        recommendation: "Enable Organization or LocalBusiness schema to qualify for rich snippets.",
        fixActionUrl: `/websites/${websiteId}/seo?tab=schema`,
      });
    }

    return issues;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

