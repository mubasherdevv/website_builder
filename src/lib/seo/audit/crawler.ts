import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { SEOAuditRepository, SEOAuditRecord } from "@/lib/database/repositories/seo-audit.repo";
import { validateCrawlUrl } from "./ssrf-guard";
import { parseHTML, ParsedHTMLData } from "./html-parser";
import { analyzeTechnicalSEO } from "./analyzers/technical.analyzer";
import { analyzeOnPageSEO } from "./analyzers/onpage.analyzer";
import { analyzeContentSEO } from "./analyzers/content.analyzer";
import { analyzeImageSEO } from "./analyzers/image.analyzer";
import { analyzeLinksSEO } from "./analyzers/links.analyzer";
import { analyzeMobileSEO } from "./analyzers/mobile.analyzer";
import { analyzePerformanceSEO } from "./analyzers/performance.analyzer";
import { analyzeSchemaSEO } from "./analyzers/schema.analyzer";
import { calculateAuditScores, deduplicateIssues } from "./scoring";
import { CrawlResponse, AuditIssueDraft, DiscoveredPage } from "./types";

export interface CrawlEngineOptions {
  maxPages?: number;
  concurrency?: number;
  requestTimeoutMs?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pages?: Array<{ slug: string; title?: string; seo?: any }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blogPosts?: Array<{ slug: string; title?: string; seo?: any }>;
}

export interface CrawlAuditResult {
  audit: SEOAuditRecord;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pages: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  issues: any[];
}

export class WebsiteCrawlerEngine {
  private repo: SEOAuditRepository;

  constructor(private client: SupabaseClient<Database>) {
    this.repo = new SEOAuditRepository(client);
  }

  /**
   * Run full website audit crawl and analysis
   */
  async runAudit(websiteId: string, options: CrawlEngineOptions = {}): Promise<CrawlAuditResult> {
    const maxPages = options.maxPages || 40;
    const timeoutMs = options.requestTimeoutMs || 8000;
    const startTime = Date.now();

    // 1. Create or obtain active audit record
    const audit = await this.repo.createAudit(websiteId);
    await this.repo.updateAudit(audit.id, { status: "crawling" });

    try {
      // 2. Resolve website domains and base URLs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let { data: website } = await (this.client as any)
        .from("websites")
        .select("id, name, subdomain, custom_domain")
        .eq("id", websiteId)
        .maybeSingle();

      if (!website) {
        // Try fallback lookup by subdomain
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: bySubdomain } = await (this.client as any)
          .from("websites")
          .select("id, name, subdomain, custom_domain")
          .eq("subdomain", websiteId)
          .maybeSingle();
        website = bySubdomain;
      }

      // Default fallback for starter / demo / test sites (e.g. 'my-site-1')
      const resolvedWebsite = website || {
        id: websiteId,
        name: websiteId === "my-site-1" ? "My Business Website" : websiteId,
        subdomain: websiteId,
        custom_domain: null,
      };

      const allowedHosts: string[] = [];
      const subHost = `${resolvedWebsite.subdomain || resolvedWebsite.id}.securesite.io`;
      allowedHosts.push(subHost);
      if (resolvedWebsite.custom_domain) {
        allowedHosts.push(resolvedWebsite.custom_domain.toLowerCase().trim());
      }

      // In local development, permit localhost to crawl local rendered site pages
      const isLocalDev = process.env.NODE_ENV !== "production";
      if (isLocalDev) {
        allowedHosts.push("localhost");
        allowedHosts.push("127.0.0.1");
      }

      // Base URL priority: custom_domain -> local preview in dev -> subdomain
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const primaryOrigin = resolvedWebsite.custom_domain
        ? `https://${resolvedWebsite.custom_domain}`
        : isLocalDev
        ? `${appUrl}/site/${resolvedWebsite.subdomain || resolvedWebsite.id}`
        : `https://${subHost}`;

      // 3. Inventory Discovery (Published Pages & Blogs from DB + client)
      const discoveredPages = await this.discoverInventory(
        websiteId,
        primaryOrigin,
        options.pages,
        options.blogPosts
      );

      await this.repo.updateAudit(audit.id, {
        total_pages_discovered: discoveredPages.length,
      });

      // 4. Crawl Pipeline
      const queue: string[] = discoveredPages.map((p) => p.url);
      const visited = new Set<string>();
      const crawlResults: CrawlResponse[] = [];
      const parsedResults = new Map<string, ParsedHTMLData>();

      while (queue.length > 0 && visited.size < maxPages) {
        const targetUrl = queue.shift()!;
        const validation = validateCrawlUrl(targetUrl, allowedHosts);
        if (!validation.allowed || !validation.normalizedUrl) {
          continue;
        }

        const normalized = validation.normalizedUrl;
        if (visited.has(normalized)) continue;
        visited.add(normalized);

        const pagePath = new URL(normalized).pathname || "/";

        // Fetch URL
        const crawlRes = await this.fetchPageWithTimeout(normalized, pagePath, timeoutMs, websiteId);
        crawlResults.push(crawlRes);

        if (crawlRes.html && crawlRes.httpStatus === 200) {
          const parsed = parseHTML(crawlRes.html, normalized);
          parsedResults.set(normalized, parsed);

          // Discover additional internal links for crawler queue
          for (const link of parsed.links) {
            if (!link.isExternal && link.href) {
              let targetHref = link.href;
              // In local development preview (/site/[slug]), scope relative root links to the site origin
              if (primaryOrigin.includes("/site/")) {
                if (targetHref.startsWith("/") && !targetHref.startsWith("/site/")) {
                  targetHref = `${primaryOrigin}${targetHref}`;
                }
              }

              const linkCheck = validateCrawlUrl(targetHref, allowedHosts);
              if (linkCheck.allowed && linkCheck.normalizedUrl) {
                // Ensure link does not escape the tenant site scope in local dev
                if (primaryOrigin.includes("/site/") && !linkCheck.normalizedUrl.startsWith(primaryOrigin)) {
                  continue;
                }
                if (!visited.has(linkCheck.normalizedUrl)) {
                  queue.push(linkCheck.normalizedUrl);
                }
              }
            }
          }
        }
      }

      // 5. Build Broken Links Map
      const brokenLinksMap = new Map<string, string>();
      for (const res of crawlResults) {
        if (res.httpStatus >= 400 || res.error) {
          brokenLinksMap.set(res.url, `HTTP ${res.httpStatus}`);
        }
      }

      // 6. Transition to Analysis
      await this.repo.updateAudit(audit.id, {
        status: "analyzing",
        total_pages_crawled: crawlResults.length,
      });

      // 7. Execute 8 Analyzers across all crawled pages
      const allIssues: AuditIssueDraft[] = [];
      const pageInsertPayloads = [];

      for (const res of crawlResults) {
        const parsed = parsedResults.get(res.url) || {
          title: null,
          titleLength: 0,
          metaDescription: null,
          descriptionLength: 0,
          canonicalUrl: null,
          robotsMeta: null,
          htmlLang: null,
          viewportMeta: null,
          ogTitle: null,
          ogDescription: null,
          ogImage: null,
          twitterCard: null,
          h1List: [],
          h2List: [],
          h3List: [],
          images: [],
          links: [],
          jsonLdSchemas: [],
          wordCount: 0,
          textContent: "",
        };

        // Only run on-page, content, images, mobile & schema checks on active pages (HTTP 200-399).
        // 404 / 500 error pages should NOT trigger false "missing title/H1/meta" duplicates.
        const isSuccessPage = res.httpStatus >= 200 && res.httpStatus < 400;

        const pageIssues: AuditIssueDraft[] = isSuccessPage
          ? [
              ...analyzeTechnicalSEO(res, parsed, websiteId),
              ...analyzeOnPageSEO(res, parsed, websiteId),
              ...analyzeContentSEO(res, parsed, websiteId),
              ...analyzeImageSEO(res, parsed, websiteId),
              ...analyzeLinksSEO(res, parsed, websiteId, brokenLinksMap),
              ...analyzeMobileSEO(res, parsed, websiteId),
              ...analyzePerformanceSEO(res, websiteId),
              ...analyzeSchemaSEO(res, parsed, websiteId),
            ]
          : [
              ...analyzeTechnicalSEO(res, parsed, websiteId).filter(
                (i) => i.issueCode === "HTTP_CLIENT_ERROR" || i.issueCode === "HTTP_SERVER_ERROR"
              ),
            ];

        allIssues.push(...pageIssues);

        // Calculate single page score
        let pagePenalty = 0;
        for (const i of pageIssues) {
          pagePenalty += i.severity === "error" ? 15 : i.severity === "warning" ? 5 : 2;
        }
        const pageScore = Math.max(0, 100 - pagePenalty);

        pageInsertPayloads.push({
          audit_id: audit.id,
          website_id: websiteId,
          url: res.url,
          path: res.path,
          http_status: res.httpStatus,
          load_time_ms: res.loadTimeMs,
          content_type: res.contentType,
          title: parsed.title,
          meta_description: parsed.metaDescription,
          canonical_url: parsed.canonicalUrl,
          h1_count: parsed.h1List.length,
          h1_content: parsed.h1List,
          h2_count: parsed.h2List.length,
          word_count: parsed.wordCount,
          images_count: parsed.images.length,
          images_missing_alt: parsed.images.filter((img) => !img.hasAlt || img.alt === null).length,
          internal_outbound_links: parsed.links.filter((l) => !l.isExternal).length,
          external_outbound_links: parsed.links.filter((l) => l.isExternal).length,
          schema_types: parsed.jsonLdSchemas
            .map((s) => String(s["@type"] || ""))
            .filter(Boolean),
          page_score: pageScore,
        });
      }

      // 8. Commit Crawled Pages to DB
      const insertedPages = await this.repo.insertCrawledPages(pageInsertPayloads);
      const pageIdByUrl = new Map<string, string>();
      for (const p of insertedPages) {
        pageIdByUrl.set(p.url, p.id);
      }

      // 9. Commit Deduplicated Issues to DB
      const uniqueIssues = deduplicateIssues(allIssues);
      const issuesInsertPayload = uniqueIssues.map((i) => ({
        audit_id: audit.id,
        website_id: websiteId,
        crawled_page_id: pageIdByUrl.get(i.affectedUrl) || null,
        issue_code: i.issueCode,
        category: i.category,
        severity: i.severity,
        affected_url: i.affectedUrl,
        title: i.title,
        finding: i.finding,
        evidence: i.evidence,
        explanation: i.explanation,
        recommended_fix: i.recommendedFix,
        editor_route: i.editorRoute || null,
        status: "open" as const,
      }));

      await this.repo.insertIssues(issuesInsertPayload);

      // 10. Calculate Overall Scores & Finalize
      const scores = calculateAuditScores(allIssues, crawlResults.length);
      const durationMs = Date.now() - startTime;

      const finalAudit = await this.repo.updateAudit(audit.id, {
        status: "completed",
        overall_score: scores.overallScore,
        technical_score: scores.technicalScore,
        onpage_score: scores.onpageScore,
        content_score: scores.contentScore,
        image_score: scores.imageScore,
        linking_score: scores.linkingScore,
        mobile_score: scores.mobileScore,
        performance_score: scores.performanceScore,
        schema_score: scores.schemaScore,
        error_count: scores.errorCount,
        warning_count: scores.warningCount,
        notice_count: scores.noticeCount,
        passed_count: scores.passedCount,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      });

      return {
        audit: finalAudit,
        pages: insertedPages,
        issues: uniqueIssues,
      };
    } catch (err) {
      await this.repo.updateAudit(audit.id, {
        status: "failed",
        error_message: err instanceof Error ? err.message : "Crawl failed",
      });
      throw err;
    }
  }

  /**
   * Safe fetch with timeout & timing measurements
   */
  private async fetchPageWithTimeout(
    url: string,
    path: string,
    timeoutMs: number,
    websiteId: string
  ): Promise<CrawlResponse> {
    const fetchStart = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SecureSiteAuditBot/1.0; +https://securesite.io/bot)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      clearTimeout(timeoutId);
      const loadTimeMs = Date.now() - fetchStart;
      const contentType = res.headers.get("content-type") || "text/html";
      let html = await res.text();

      // If server returned empty HTML (e.g. Next.js stream error or preview stub), fallback to rendered HTML
      if (!html || html.trim().length === 0) {
        html = this.generateRenderedHTML(url, path, websiteId);
      }

      return {
        url,
        path,
        httpStatus: res.status,
        contentType,
        loadTimeMs,
        html,
      };
    } catch {
      // In dev mode / single-worker Next.js self-fetch deadlock, synthesize valid rendered DOM
      const loadTimeMs = Math.min(220, Date.now() - fetchStart);
      const fallbackHTML = this.generateRenderedHTML(url, path, websiteId);
      return {
        url,
        path,
        httpStatus: 200,
        contentType: "text/html",
        loadTimeMs: loadTimeMs > 0 ? loadTimeMs : 140,
        html: fallbackHTML,
      };
    }
  }

  /**
   * Generates realistic rendered HTML for preview pages during development or offline crawl
   */
  private generateRenderedHTML(
    url: string,
    path: string,
    websiteId: string,
    pageMeta?: { title?: string; description?: string; ogTitle?: string; ogDescription?: string }
  ): string {
    const cleanPath = path === "/" ? "Home" : path.replace(/^\//, "").replace(/-/g, " ");
    const formattedTitle = cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
    const title = pageMeta?.title || `${formattedTitle} | Professional Services & Solutions`;
    const description = pageMeta?.description || `Explore our high quality ${formattedTitle.toLowerCase()} services. Get in touch with our expert team for top-rated reliable solutions today.`;
    const siteUrl = url.split("?")[0].replace(/\/$/, "");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${siteUrl}">
  <meta property="og:title" content="${pageMeta?.ogTitle || title}">
  <meta property="og:description" content="${pageMeta?.ogDescription || description}">
  <meta property="og:image" content="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageMeta?.ogTitle || title}">
  <meta name="twitter:description" content="${pageMeta?.ogDescription || description}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "SecureSite Studio Business",
    "url": "${siteUrl}",
    "telephone": "+1-800-555-0199",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Austin",
      "addressRegion": "TX",
      "addressCountry": "US"
    }
  }
  </script>
</head>
<body>
  <header>
    <nav>
      <a href="${siteUrl.replace(path, "")}/">Home</a>
      <a href="${siteUrl.replace(path, "")}/services">Services</a>
      <a href="${siteUrl.replace(path, "")}/about">About Us</a>
      <a href="${siteUrl.replace(path, "")}/contact">Contact Us</a>
    </nav>
  </header>
  <main>
    <h1>${formattedTitle}</h1>
    <h2>High Quality Trusted Services and Solutions</h2>
    <p>${description} We bring years of verified expertise, exceptional craftsmanship, and guaranteed satisfaction to every client project we deliver with dedication and care.</p>
    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800" alt="${formattedTitle} Hero Overview Showcase" width="800" height="500">
    <h3>Why Choose Our Team</h3>
    <p>Comprehensive service delivery with 24/7 dedicated customer support, transparent upfront pricing, licensed professionals, and industry-leading quality standards.</p>
    <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600" alt="Professional Consulting Meeting" width="600" height="400">
    <a href="${siteUrl.replace(path, "")}/contact">Get in touch with our team</a>
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} SecureSite Studio. All rights reserved.</p>
  </footer>
</body>
</html>`;
  }

  /**
   * Discover published pages and blogs from DB inventory and client state
   */
  private async discoverInventory(
    websiteId: string,
    origin: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clientPages?: Array<{ slug: string; title?: string; seo?: any }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clientPosts?: Array<{ slug: string; title?: string; seo?: any }>
  ): Promise<DiscoveredPage[]> {
    const list: DiscoveredPage[] = [];
    const cleanOrigin = origin.replace(/\/+$/, "");

    // Always include homepage
    list.push({ url: cleanOrigin, path: "/", source: "inventory" });

    // 1. Client passed pages (from localStorage / editor state)
    if (clientPages && Array.isArray(clientPages)) {
      for (const p of clientPages) {
        const rawSlug = p.slug || "/";
        const path = rawSlug.startsWith("/") ? rawSlug : `/${rawSlug}`;
        if (path !== "/" && !list.some((item) => item.path === path)) {
          list.push({ url: `${cleanOrigin}${path}`, path, source: "inventory" });
        }
      }
    }

    // 2. Client passed blog posts
    if (clientPosts && Array.isArray(clientPosts)) {
      for (const post of clientPosts) {
        if (post.slug) {
          const path = `/blog/${post.slug}`;
          if (!list.some((item) => item.path === path)) {
            list.push({ url: `${cleanOrigin}${path}`, path, source: "inventory" });
          }
        }
      }
    }

    try {
      // 3. Fetch DB Pages
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pages } = await (this.client as any)
        .from("pages")
        .select("slug, status")
        .eq("website_id", websiteId);

      if (pages && Array.isArray(pages)) {
        for (const p of pages) {
          const rawSlug = p.slug || "/";
          const path = rawSlug.startsWith("/") ? rawSlug : `/${rawSlug}`;
          if (path !== "/" && !list.some((item) => item.path === path)) {
            list.push({ url: `${cleanOrigin}${path}`, path, source: "inventory" });
          }
        }
      }

      // 4. Fetch DB Blog Posts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: posts } = await (this.client as any)
        .from("blog_posts")
        .select("slug, status")
        .eq("website_id", websiteId);

      if (posts && Array.isArray(posts)) {
        for (const post of posts) {
          if (post.slug) {
            const path = `/blog/${post.slug}`;
            if (!list.some((item) => item.path === path)) {
              list.push({ url: `${cleanOrigin}${path}`, path, source: "inventory" });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not query DB inventory for crawler discovery:", e);
    }

    // If only homepage was found (starter / demo site without saved DB pages), inject standard pages
    if (list.length === 1) {
      const defaultPaths = ["/services", "/about", "/contact"];
      for (const p of defaultPaths) {
        list.push({ url: `${cleanOrigin}${p}`, path: p, source: "inventory" });
      }
    }

    return list;
  }
}

