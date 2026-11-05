import { CrawlResponse, AuditIssueDraft } from "../types";

export function analyzePerformanceSEO(
  crawl: CrawlResponse,
  websiteId: string
): AuditIssueDraft[] {
  const issues: AuditIssueDraft[] = [];

  // 1. Response Load Time / Server TTFB
  if (crawl.loadTimeMs > 2500) {
    issues.push({
      issueCode: "SLOW_PAGE_RESPONSE",
      category: "performance",
      severity: "error",
      affectedUrl: crawl.url,
      title: `Slow server response time (${crawl.loadTimeMs}ms)`,
      finding: `Page took ${crawl.loadTimeMs}ms to respond and deliver initial HTML (recommended: < 800ms).`,
      evidence: { loadTimeMs: crawl.loadTimeMs },
      explanation: "Slow server response time degrades Largest Contentful Paint (LCP) and increases bounce rates.",
      recommendedFix: "Optimize database queries, enable edge caching, and check hosting resource limits.",
      editorRoute: `/websites/${websiteId}/overview`,
    });
  } else if (crawl.loadTimeMs > 1200) {
    issues.push({
      issueCode: "MODERATE_PAGE_LATENCY",
      category: "performance",
      severity: "warning",
      affectedUrl: crawl.url,
      title: `Moderate response time (${crawl.loadTimeMs}ms)`,
      finding: `Page response took ${crawl.loadTimeMs}ms.`,
      evidence: { loadTimeMs: crawl.loadTimeMs },
      explanation: "Sub-second response times provide the best Core Web Vitals performance.",
      recommendedFix: "Review static page generation settings or verify database latency.",
      editorRoute: `/websites/${websiteId}/overview`,
    });
  }

  // 2. HTML Payload Size
  const htmlBytes = Buffer.byteLength(crawl.html || "", "utf8");
  const htmlKb = Math.round(htmlBytes / 1024);

  if (htmlKb > 300) {
    issues.push({
      issueCode: "LARGE_HTML_PAYLOAD",
      category: "performance",
      severity: "warning",
      affectedUrl: crawl.url,
      title: `Heavy HTML document size (${htmlKb} KB)`,
      finding: `Raw HTML size is ${htmlKb} KB (recommended: < 150 KB).`,
      evidence: { sizeKb: htmlKb },
      explanation: "Very large HTML files delay browser parsing, DOM construction, and increase memory usage on mobile devices.",
      recommendedFix: "Remove unnecessary inline data or base64 embedded images, and paginate long listings.",
      editorRoute: `/websites/${websiteId}/pages`,
    });
  }

  return issues;
}

