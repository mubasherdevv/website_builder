import { ParsedHTMLData } from "../html-parser";
import { CrawlResponse, AuditIssueDraft } from "../types";

export function analyzeLinksSEO(
  crawl: CrawlResponse,
  parsed: ParsedHTMLData,
  websiteId: string,
  brokenLinksMap?: Map<string, string> // destinationUrl -> error/404
): AuditIssueDraft[] {
  const issues: AuditIssueDraft[] = [];

  const internalLinks = parsed.links.filter((l) => !l.isExternal);
  const emptyAnchorLinks = parsed.links.filter((l) => !l.text || l.text.trim().length === 0);

  // 1. Broken Internal Links
  if (brokenLinksMap) {
    const pageBrokenLinks: Array<{ href: string; text: string }> = [];
    for (const link of internalLinks) {
      if (brokenLinksMap.has(link.href)) {
        pageBrokenLinks.push({ href: link.href, text: link.text || "[No text]" });
      }
    }

    if (pageBrokenLinks.length > 0) {
      issues.push({
        issueCode: "BROKEN_INTERNAL_LINK",
        category: "links",
        severity: "error",
        affectedUrl: crawl.url,
        title: `${pageBrokenLinks.length} broken internal link${pageBrokenLinks.length > 1 ? "s" : ""} on page`,
        finding: `Links pointing to non-existent or failing internal pages: [${pageBrokenLinks.map((l) => `${l.href} ("${l.text}")`).join(", ")}]`,
        evidence: { brokenLinks: pageBrokenLinks },
        explanation: "Broken internal links stop user navigation and trap search engine crawlers, damaging crawl efficiency.",
        recommendedFix: "Update or remove the broken links on this page to point to valid active pages.",
        editorRoute: `/websites/${websiteId}/pages`,
      });
    }
  }

  // 2. Empty Anchor Text
  if (emptyAnchorLinks.length > 0) {
    issues.push({
      issueCode: "EMPTY_ANCHOR_TEXT",
      category: "links",
      severity: "warning",
      affectedUrl: crawl.url,
      title: `${emptyAnchorLinks.length} link${emptyAnchorLinks.length > 1 ? "s" : ""} with empty anchor text`,
      finding: `Found ${emptyAnchorLinks.length} <a> tags with no anchor text or screen-readable description.`,
      evidence: { count: emptyAnchorLinks.length, samples: emptyAnchorLinks.slice(0, 3).map((l) => l.href) },
      explanation: "Anchor text provides critical context about the destination page to both users and search engines.",
      recommendedFix: "Provide descriptive text or add aria-label attributes to icon-only links.",
      editorRoute: `/websites/${websiteId}/pages`,
    });
  }

  // 3. Excessive Links (>100)
  if (internalLinks.length > 100) {
    issues.push({
      issueCode: "EXCESSIVE_OUTBOUND_LINKS",
      category: "links",
      severity: "notice",
      affectedUrl: crawl.url,
      title: `High number of internal links (${internalLinks.length} links)`,
      finding: `Page contains ${internalLinks.length} links, which may dilute link equity.`,
      evidence: { count: internalLinks.length },
      explanation: "Pages with hundreds of links can feel cluttered and dilute the PageRank passed to key destination pages.",
      recommendedFix: "Streamline footer and sidebar menus to focus on primary conversion and navigation paths.",
      editorRoute: `/websites/${websiteId}/navigation`,
    });
  }

  return issues;
}

