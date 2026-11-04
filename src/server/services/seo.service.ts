import { SEOMetadata, SitemapEntry } from "@/types/seo";
import { CMSPageItem } from "@/types/cms";
import { stripTrailingSlash, normalizeSlug } from "@/lib/utils/url";

/**
 * Escapes characters that are reserved in XML
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Technical SEO Engine
 * PRD.md Section 11: Technical SEO, XML Sitemaps, Robots.txt, and LocalBusiness JSON-LD
 */
export class SEOService {
  /**
   * Generates Schema.org LocalBusiness JSON-LD structure
   */
  public static generateLocalBusinessSchema(
    meta: Partial<SEOMetadata> & { title: string; description?: string }
  ): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: meta.businessName || meta.title,
      description: meta.description,
      telephone: meta.telephone || undefined,
      address: meta.address
        ? {
            "@type": "PostalAddress",
            streetAddress: meta.address,
          }
        : undefined,
      priceRange: meta.priceRange || "$$",
      openingHours: meta.openingHours || "Mo-Sa 08:00-18:00",
      url: meta.canonicalUrl || undefined,
      image: meta.ogImageUrl || undefined,
    };
  }

  /**
   * Generates valid XML sitemap string.
   * PRD.md Section 11: Draft pages MUST NEVER appear in public sitemaps.
   */
  public static generateXmlSitemap(
    baseUrl: string,
    pages: (CMSPageItem & { noIndex?: boolean })[]
  ): string {
    const cleanBaseUrl = stripTrailingSlash(baseUrl);
    const publishedPages = pages.filter(
      (p) => p.status === "published" && !p.noIndex
    );

    const entries: SitemapEntry[] = publishedPages.map((page) => {
      const slug = normalizeSlug(page.slug);
      const path = slug === "/" ? "" : slug;
      return {
        url: escapeXml(`${cleanBaseUrl}${path}`),
        lastModified: new Date().toISOString().split("T")[0],
        changeFrequency: page.isHome ? "daily" : "weekly",
        priority: page.isHome ? 1.0 : 0.8,
      };
    });

    const urlTags = entries
      .map(
        (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastModified}</lastmod>
    <changefreq>${e.changeFrequency}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`
      )
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;
  }

  /**
   * Generates standard compliant robots.txt string
   */
  public static generateRobotsTxt(baseUrl: string, noIndexSite = false): string {
    const sitemapUrl = `${stripTrailingSlash(baseUrl)}/sitemap.xml`;

    if (noIndexSite) {
      return `User-agent: *
Disallow: /

Sitemap: ${sitemapUrl}
`;
    }

    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${sitemapUrl}
`;
  }
}
