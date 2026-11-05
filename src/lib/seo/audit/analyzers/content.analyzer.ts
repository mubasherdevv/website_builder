import { ParsedHTMLData } from "../html-parser";
import { CrawlResponse, AuditIssueDraft } from "../types";

export function analyzeContentSEO(
  crawl: CrawlResponse,
  parsed: ParsedHTMLData,
  websiteId: string,
  targetKeyword?: string | null
): AuditIssueDraft[] {
  const issues: AuditIssueDraft[] = [];

  // 1. Thin Content Analysis
  const isBlog = crawl.path.startsWith("/blog/");
  const minWords = isBlog ? 300 : 150;

  if (parsed.wordCount < minWords) {
    issues.push({
      issueCode: "THIN_CONTENT",
      category: "content",
      severity: "warning",
      affectedUrl: crawl.url,
      title: `Low word count detected (${parsed.wordCount} words)`,
      finding: `Page contains only ${parsed.wordCount} words (recommended minimum: ${minWords} words).`,
      evidence: { wordCount: parsed.wordCount, minWords },
      explanation: "Pages with very thin content struggle to rank for competitive queries and provide less value to visitors.",
      recommendedFix: "Expand the page copy with detailed service descriptions, FAQ answers, or case studies in the visual builder.",
      editorRoute: `/websites/${websiteId}/pages`,
    });
  }

  // 2. Target Keyword Analysis (if configured in SEO settings)
  if (targetKeyword && targetKeyword.trim().length > 0) {
    const kw = targetKeyword.toLowerCase().trim();
    const bodyLower = parsed.textContent.toLowerCase();
    const titleLower = (parsed.title || "").toLowerCase();
    const h1Lower = parsed.h1List.map((h) => h.toLowerCase()).join(" ");

    // Check keyword in title
    if (!titleLower.includes(kw)) {
      issues.push({
        issueCode: "KEYWORD_MISSING_IN_TITLE",
        category: "content",
        severity: "warning",
        affectedUrl: crawl.url,
        title: `Target keyword not found in title tag`,
        finding: `Target keyword "${targetKeyword}" is missing from <title> ("${parsed.title || ""}").`,
        evidence: { targetKeyword, title: parsed.title },
        explanation: "Placing your primary target keyword near the beginning of your title tag strongly signals relevance.",
        recommendedFix: `Include "${targetKeyword}" naturally in your SEO title.`,
        editorRoute: `/websites/${websiteId}/seo`,
      });
    }

    // Check keyword in H1
    if (!h1Lower.includes(kw)) {
      issues.push({
        issueCode: "KEYWORD_MISSING_IN_H1",
        category: "content",
        severity: "notice",
        affectedUrl: crawl.url,
        title: `Target keyword not found in H1 heading`,
        finding: `Target keyword "${targetKeyword}" was not found in any H1 tag.`,
        evidence: { targetKeyword, h1List: parsed.h1List },
        explanation: "Aligning your primary H1 heading with your target keyword reinforces topical authority.",
        recommendedFix: `Incorporate "${targetKeyword}" into the main hero heading.`,
        editorRoute: `/websites/${websiteId}/pages`,
      });
    }

    // Keyword density check
    const kwRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = bodyLower.match(kwRegex);
    const count = matches ? matches.length : 0;
    const density = parsed.wordCount > 0 ? (count / parsed.wordCount) * 100 : 0;

    if (density > 3.5) {
      issues.push({
        issueCode: "KEYWORD_STUFFING_RISK",
        category: "content",
        severity: "warning",
        affectedUrl: crawl.url,
        title: `High keyword repetition risk (${density.toFixed(1)}% density)`,
        finding: `Target keyword "${targetKeyword}" appeared ${count} times in ${parsed.wordCount} words.`,
        evidence: { count, wordCount: parsed.wordCount, density },
        explanation: "Overusing a target keyword (keyword stuffing) can trigger algorithmic spam penalties.",
        recommendedFix: "Rewrite dense sections using natural synonyms, variations, and related semantic terms.",
        editorRoute: `/websites/${websiteId}/pages`,
      });
    }
  }

  // 3. Duplicate Headings check
  const allHeadings = [...parsed.h2List, ...parsed.h3List];
  const seenHeadings = new Set<string>();
  const duplicateHeadings: string[] = [];
  for (const h of allHeadings) {
    const normalized = h.toLowerCase().trim();
    if (seenHeadings.has(normalized)) {
      duplicateHeadings.push(h);
    } else {
      seenHeadings.add(normalized);
    }
  }

  if (duplicateHeadings.length > 0) {
    issues.push({
      issueCode: "DUPLICATE_SUBHEADINGS",
      category: "content",
      severity: "notice",
      affectedUrl: crawl.url,
      title: `Repeated subheadings found (${duplicateHeadings.length})`,
      finding: `Found duplicate heading text: [${duplicateHeadings.slice(0, 3).map((h) => `"${h}"`).join(", ")}]`,
      evidence: { duplicateHeadings },
      explanation: "Subheadings should uniquely guide readers and search engines to distinct subtopics on the page.",
      recommendedFix: "Give each section a unique descriptive subheading reflecting its specific content.",
      editorRoute: `/websites/${websiteId}/pages`,
    });
  }

  return issues;
}

