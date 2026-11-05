import { ParsedHTMLData } from "../html-parser";
import { CrawlResponse, AuditIssueDraft } from "../types";

export function analyzeOnPageSEO(
  crawl: CrawlResponse,
  parsed: ParsedHTMLData,
  websiteId: string
): AuditIssueDraft[] {
  const issues: AuditIssueDraft[] = [];

  // 1. Title Tag
  if (!parsed.title) {
    issues.push({
      issueCode: "MISSING_TITLE_TAG",
      category: "on_page",
      severity: "error",
      affectedUrl: crawl.url,
      title: "Missing <title> tag",
      finding: "The page does not contain a <title> tag.",
      evidence: { title: null },
      explanation: "Title tags are one of the most critical on-page ranking factors and determine the search result snippet headline.",
      recommendedFix: "Add a descriptive, relevant title in your page SEO settings.",
      editorRoute: `/websites/${websiteId}/seo`,
    });
  } else {
    if (parsed.titleLength < 30) {
      issues.push({
        issueCode: "TITLE_TOO_SHORT",
        category: "on_page",
        severity: "warning",
        affectedUrl: crawl.url,
        title: `Title tag is too short (${parsed.titleLength} characters)`,
        finding: `Current title "${parsed.title}" is under the recommended 30-60 character threshold.`,
        evidence: { title: parsed.title, length: parsed.titleLength },
        explanation: "Short titles miss valuable keyword relevance and click-through opportunities.",
        recommendedFix: "Expand the title with target secondary keywords and your business name (aim for 50-60 characters).",
        editorRoute: `/websites/${websiteId}/seo`,
      });
    } else if (parsed.titleLength > 65) {
      issues.push({
        issueCode: "TITLE_TOO_LONG",
        category: "on_page",
        severity: "notice",
        affectedUrl: crawl.url,
        title: `Title tag may truncate in search results (${parsed.titleLength} characters)`,
        finding: `Current title "${parsed.title}" exceeds 65 characters.`,
        evidence: { title: parsed.title, length: parsed.titleLength },
        explanation: "Google search snippets typically truncate titles longer than 60-65 characters or ~600px display width.",
        recommendedFix: "Shorten your title to keep primary keywords visible in search results without truncation.",
        editorRoute: `/websites/${websiteId}/seo`,
      });
    }
  }

  // 2. Meta Description
  if (!parsed.metaDescription) {
    issues.push({
      issueCode: "MISSING_META_DESCRIPTION",
      category: "on_page",
      severity: "warning",
      affectedUrl: crawl.url,
      title: "Missing meta description",
      finding: "No meta description tag was found on this page.",
      evidence: { metaDescription: null },
      explanation: "Meta descriptions provide the summary text below your search result title, driving user CTR.",
      recommendedFix: "Write an engaging 140-160 character description summarizing the page value proposition.",
      editorRoute: `/websites/${websiteId}/seo`,
    });
  } else {
    if (parsed.descriptionLength < 70) {
      issues.push({
        issueCode: "META_DESCRIPTION_TOO_SHORT",
        category: "on_page",
        severity: "notice",
        affectedUrl: crawl.url,
        title: `Meta description is short (${parsed.descriptionLength} characters)`,
        finding: `Description is ${parsed.descriptionLength} characters (recommended: 120-160).`,
        evidence: { metaDescription: parsed.metaDescription, length: parsed.descriptionLength },
        explanation: "Short descriptions may be replaced by Google with arbitrary page text excerpts.",
        recommendedFix: "Expand the description to ~140-160 characters with clear call to actions.",
        editorRoute: `/websites/${websiteId}/seo`,
      });
    } else if (parsed.descriptionLength > 165) {
      issues.push({
        issueCode: "META_DESCRIPTION_TOO_LONG",
        category: "on_page",
        severity: "notice",
        affectedUrl: crawl.url,
        title: `Meta description may truncate (${parsed.descriptionLength} characters)`,
        finding: `Description is ${parsed.descriptionLength} characters (exceeds ~160 character standard limit).`,
        evidence: { metaDescription: parsed.metaDescription, length: parsed.descriptionLength },
        explanation: "Long descriptions will be cut off with an ellipsis in Google search results.",
        recommendedFix: "Keep key points and calls to action within the first 155 characters.",
        editorRoute: `/websites/${websiteId}/seo`,
      });
    }
  }

  // 3. H1 Heading Checks
  if (parsed.h1List.length === 0) {
    issues.push({
      issueCode: "MISSING_H1_HEADING",
      category: "on_page",
      severity: "error",
      affectedUrl: crawl.url,
      title: "Missing H1 heading on page",
      finding: "No <h1> element was found in the page markup.",
      evidence: { h1Count: 0 },
      explanation: "Search engines and screen readers rely on the primary H1 heading to understand the central subject of the page.",
      recommendedFix: "Add a prominent H1 heading with your primary keyword in the hero section.",
      editorRoute: `/websites/${websiteId}/pages`,
    });
  } else if (parsed.h1List.length > 1) {
    issues.push({
      issueCode: "MULTIPLE_H1_HEADINGS",
      category: "on_page",
      severity: "warning",
      affectedUrl: crawl.url,
      title: `Multiple H1 headings detected (${parsed.h1List.length} found)`,
      finding: `Found ${parsed.h1List.length} <h1> tags: [${parsed.h1List.slice(0, 3).map((h) => `"${h}"`).join(", ")}]`,
      evidence: { h1List: parsed.h1List },
      explanation: "Having multiple H1 tags can dilute topical focus and confuses heading hierarchy.",
      recommendedFix: "Keep a single H1 for the page title, and downgrade secondary section headers to H2 or H3.",
      editorRoute: `/websites/${websiteId}/pages`,
    });
  }

  // 4. OpenGraph Social Tags
  if (!parsed.ogTitle || !parsed.ogDescription) {
    issues.push({
      issueCode: "MISSING_OPEN_GRAPH_TAGS",
      category: "on_page",
      severity: "notice",
      affectedUrl: crawl.url,
      title: "Incomplete Open Graph social tags",
      finding: `Missing social sharing meta tags: ${!parsed.ogTitle ? "og:title " : ""}${!parsed.ogDescription ? "og:description" : ""}`,
      evidence: { ogTitle: parsed.ogTitle, ogDescription: parsed.ogDescription },
      explanation: "Open Graph tags control how links display with rich previews when shared on LinkedIn, Facebook, Slack, etc.",
      recommendedFix: "Configure OpenGraph title, description, and social share image in page SEO settings.",
      editorRoute: `/websites/${websiteId}/seo`,
    });
  }

  return issues;
}

