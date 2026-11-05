import { ParsedHTMLData } from "../html-parser";
import { CrawlResponse, AuditIssueDraft } from "../types";

export function analyzeMobileSEO(
  crawl: CrawlResponse,
  parsed: ParsedHTMLData,
  websiteId: string
): AuditIssueDraft[] {
  const issues: AuditIssueDraft[] = [];

  // 1. Mobile Viewport Check
  if (!parsed.viewportMeta) {
    issues.push({
      issueCode: "MOBILE_VIEWPORT_MISSING",
      category: "mobile",
      severity: "error",
      affectedUrl: crawl.url,
      title: "Mobile viewport configuration missing",
      finding: "No viewport tag detected for responsive rendering.",
      evidence: { viewportMeta: null },
      explanation: "Mobile-first indexing requires a responsive viewport tag so the page adapts to smartphone screen widths.",
      recommendedFix: "Ensure <meta name='viewport' content='width=device-width, initial-scale=1'> is in document head.",
      editorRoute: `/websites/${websiteId}/settings`,
    });
  } else if (!parsed.viewportMeta.includes("width=device-width")) {
    issues.push({
      issueCode: "MOBILE_VIEWPORT_NOT_RESPONSIVE",
      category: "mobile",
      severity: "warning",
      affectedUrl: crawl.url,
      title: "Non-standard viewport configuration",
      finding: `Viewport tag ("${parsed.viewportMeta}") does not declare width=device-width.`,
      evidence: { viewportMeta: parsed.viewportMeta },
      explanation: "Failing to set width=device-width can cause browsers to assume a fixed layout width, resulting in horizontal scrolling.",
      recommendedFix: "Update the viewport meta tag to standard responsive syntax.",
      editorRoute: `/websites/${websiteId}/settings`,
    });
  }

  return issues;
}

