import { AuditIssueDraft } from "./types";
import { IssueCategory } from "@/lib/database/repositories/seo-audit.repo";

export interface CategoryScoreResult {
  score: number;
  errorCount: number;
  warningCount: number;
  noticeCount: number;
}

export interface FullAuditScoreSummary {
  overallScore: number;
  technicalScore: number;
  onpageScore: number;
  contentScore: number;
  imageScore: number;
  linkingScore: number;
  mobileScore: number;
  performanceScore: number | null;
  schemaScore: number;
  errorCount: number;
  warningCount: number;
  noticeCount: number;
  passedCount: number;
}

export function calculateAuditScores(
  allIssues: AuditIssueDraft[],
  totalPagesCrawled: number
): FullAuditScoreSummary {
  // Deduplicate issues by (issueCode + affectedUrl)
  const uniqueIssues = deduplicateIssues(allIssues);

  const byCategory = (cat: IssueCategory): AuditIssueDraft[] =>
    uniqueIssues.filter((i) => i.category === cat);

  const calcCategoryScore = (issues: AuditIssueDraft[]): CategoryScoreResult => {
    let penalty = 0;
    let errorCount = 0;
    let warningCount = 0;
    let noticeCount = 0;

    for (const issue of issues) {
      if (issue.severity === "error") {
        penalty += 15;
        errorCount++;
      } else if (issue.severity === "warning") {
        penalty += 5;
        warningCount++;
      } else if (issue.severity === "notice") {
        penalty += 2;
        noticeCount++;
      }
    }

    // Floor at 0, ceiling at 100
    const rawScore = Math.max(0, 100 - penalty);
    return { score: rawScore, errorCount, warningCount, noticeCount };
  };

  const tech = calcCategoryScore(byCategory("technical"));
  const onpage = calcCategoryScore(byCategory("on_page"));
  const content = calcCategoryScore(byCategory("content"));
  const image = calcCategoryScore(byCategory("images"));
  const link = calcCategoryScore(byCategory("links"));
  const mobile = calcCategoryScore(byCategory("mobile"));
  const perf = calcCategoryScore(byCategory("performance"));
  const schema = calcCategoryScore(byCategory("structured_data"));

  // Weighted overall calculation:
  // Technical: 25%, On-Page: 25%, Links: 15%, Content: 15%, Images: 10%, Schema: 10%
  const overall = Math.round(
    tech.score * 0.25 +
    onpage.score * 0.25 +
    link.score * 0.15 +
    content.score * 0.15 +
    image.score * 0.10 +
    schema.score * 0.10
  );

  const totalErrors =
    tech.errorCount + onpage.errorCount + content.errorCount + image.errorCount +
    link.errorCount + mobile.errorCount + perf.errorCount + schema.errorCount;

  const totalWarnings =
    tech.warningCount + onpage.warningCount + content.warningCount + image.warningCount +
    link.warningCount + mobile.warningCount + perf.warningCount + schema.warningCount;

  const totalNotices =
    tech.noticeCount + onpage.noticeCount + content.noticeCount + image.noticeCount +
    link.noticeCount + mobile.noticeCount + perf.noticeCount + schema.noticeCount;

  // Passed checks estimate: 12 standard checks per crawled page minus issues found
  const theoreticalChecks = Math.max(totalPagesCrawled * 12, 12);
  const passedCount = Math.max(0, theoreticalChecks - (totalErrors + totalWarnings));

  return {
    overallScore: Math.max(0, Math.min(100, overall)),
    technicalScore: tech.score,
    onpageScore: onpage.score,
    contentScore: content.score,
    imageScore: image.score,
    linkingScore: link.score,
    mobileScore: mobile.score,
    performanceScore: perf.score,
    schemaScore: schema.score,
    errorCount: totalErrors,
    warningCount: totalWarnings,
    noticeCount: totalNotices,
    passedCount,
  };
}

export function deduplicateIssues(issues: AuditIssueDraft[]): AuditIssueDraft[] {
  const seen = new Set<string>();
  const deduped: AuditIssueDraft[] = [];

  for (const issue of issues) {
    const key = `${issue.issueCode}::${issue.affectedUrl}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(issue);
    }
  }

  return deduped;
}

