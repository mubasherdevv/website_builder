import { IssueCategory, IssueSeverity } from "@/lib/database/repositories/seo-audit.repo";

export interface DiscoveredPage {
  url: string;
  path: string;
  source: "inventory" | "sitemap" | "crawler";
}

export interface CrawlResponse {
  url: string;
  path: string;
  httpStatus: number;
  contentType: string;
  loadTimeMs: number;
  html: string;
  redirects?: string[];
  error?: string;
}

export interface AuditIssueDraft {
  issueCode: string;
  category: IssueCategory;
  severity: IssueSeverity;
  affectedUrl: string;
  title: string;
  finding: string;
  evidence: Record<string, unknown>;
  explanation: string;
  recommendedFix: string;
  editorRoute?: string | null;
}

export interface PageAnalysisResult {
  pageScore: number;
  issues: AuditIssueDraft[];
  passedChecks: number;
}

