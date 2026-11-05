import { ParsedHTMLData } from "../html-parser";
import { CrawlResponse, AuditIssueDraft } from "../types";

export function analyzeTechnicalSEO(
  crawl: CrawlResponse,
  parsed: ParsedHTMLData,
  websiteId: string
): AuditIssueDraft[] {
  const issues: AuditIssueDraft[] = [];

  // 1. HTTP Status Code
  if (crawl.httpStatus >= 400 && crawl.httpStatus < 500) {
    issues.push({
      issueCode: "HTTP_CLIENT_ERROR",
      category: "technical",
      severity: "error",
      affectedUrl: crawl.url,
      title: `Page returned HTTP ${crawl.httpStatus} Client Error`,
      finding: `Server returned a client error response (${crawl.httpStatus}).`,
      evidence: { httpStatus: crawl.httpStatus },
      explanation: "Broken links and 404 pages disrupt user journeys and waste search engine crawl budget.",
      recommendedFix: "Check if the page was deleted, rename the URL, or setup a 301 redirect to an active destination.",
      editorRoute: `/websites/${websiteId}/pages`,
    });
  } else if (crawl.httpStatus >= 500) {
    issues.push({
      issueCode: "HTTP_SERVER_ERROR",
      category: "technical",
      severity: "error",
      affectedUrl: crawl.url,
      title: `Page returned HTTP ${crawl.httpStatus} Server Error`,
      finding: `Server returned an error status (${crawl.httpStatus}).`,
      evidence: { httpStatus: crawl.httpStatus },
      explanation: "Server errors prevent crawlers from indexing content.",
      recommendedFix: "Inspect application logs or check database availability.",
      editorRoute: `/websites/${websiteId}/overview`,
    });
  }

  // 2. HTTPS Usage
  if (crawl.url.startsWith("http://")) {
    issues.push({
      issueCode: "INSECURE_HTTP_PROTOCOL",
      category: "technical",
      severity: "warning",
      affectedUrl: crawl.url,
      title: "Page serves unencrypted HTTP instead of HTTPS",
      finding: "The URL protocol is unencrypted 'http://'.",
      evidence: { protocol: "http" },
      explanation: "HTTPS is a confirmed Google security signal and required for secure user interaction.",
      recommendedFix: "Ensure your primary custom domain has SSL enabled and redirects all HTTP traffic to HTTPS.",
      editorRoute: `/websites/${websiteId}/domains`,
    });
  }

  // 3. Canonical Tag
  if (!parsed.canonicalUrl) {
    issues.push({
      issueCode: "MISSING_CANONICAL_TAG",
      category: "technical",
      severity: "warning",
      affectedUrl: crawl.url,
      title: "Missing canonical link tag",
      finding: "No <link rel='canonical'> tag was found in the page header.",
      evidence: { canonicalUrl: null },
      explanation: "Canonical tags tell search engines the authoritative URL to avoid duplicate content penalties.",
      recommendedFix: "Add a canonical URL tag matching the primary page path in your page SEO settings.",
      editorRoute: `/websites/${websiteId}/seo`,
    });
  } else {
    // Check if relative
    if (!parsed.canonicalUrl.startsWith("http://") && !parsed.canonicalUrl.startsWith("https://")) {
      issues.push({
        issueCode: "RELATIVE_CANONICAL_URL",
        category: "technical",
        severity: "warning",
        affectedUrl: crawl.url,
        title: "Canonical URL is relative instead of absolute",
        finding: `Found relative canonical URL: "${parsed.canonicalUrl}".`,
        evidence: { canonicalUrl: parsed.canonicalUrl },
        explanation: "Search engines require absolute canonical URLs including protocol and domain name.",
        recommendedFix: "Update the canonical URL in SEO settings to use full https:// format.",
        editorRoute: `/websites/${websiteId}/seo`,
      });
    }
  }

  // 4. Robots Meta Tag (Noindex detection)
  if (parsed.robotsMeta && parsed.robotsMeta.toLowerCase().includes("noindex")) {
    issues.push({
      issueCode: "PAGE_MARKED_NOINDEX",
      category: "technical",
      severity: "notice",
      affectedUrl: crawl.url,
      title: "Page contains 'noindex' directive",
      finding: `Robots meta tag contains noindex directive: "${parsed.robotsMeta}".`,
      evidence: { robotsMeta: parsed.robotsMeta },
      explanation: "A 'noindex' tag instructs Google not to display this page in organic search results.",
      recommendedFix: "If this page is intended for public search visibility, remove the noindex setting in SEO management.",
      editorRoute: `/websites/${websiteId}/seo`,
    });
  }

  // 5. HTML lang attribute
  if (!parsed.htmlLang) {
    issues.push({
      issueCode: "MISSING_HTML_LANG",
      category: "technical",
      severity: "notice",
      affectedUrl: crawl.url,
      title: "Missing HTML language attribute",
      finding: "The <html> element does not specify a lang attribute.",
      evidence: { htmlLang: null },
      explanation: "The lang attribute assists screen readers and regional search localization engines.",
      recommendedFix: "Set the website language (e.g., lang='en') in global site settings.",
      editorRoute: `/websites/${websiteId}/settings`,
    });
  }

  // 6. Viewport Metadata
  if (!parsed.viewportMeta) {
    issues.push({
      issueCode: "MISSING_VIEWPORT_TAG",
      category: "technical",
      severity: "error",
      affectedUrl: crawl.url,
      title: "Missing mobile viewport meta tag",
      finding: "No <meta name='viewport'> tag was found in HTML head.",
      evidence: { viewportMeta: null },
      explanation: "Without a viewport tag, mobile devices render pages at desktop width, failing mobile usability checks.",
      recommendedFix: "Ensure <meta name='viewport' content='width=device-width, initial-scale=1'> is included in document head.",
      editorRoute: `/websites/${websiteId}/settings`,
    });
  }

  return issues;
}

