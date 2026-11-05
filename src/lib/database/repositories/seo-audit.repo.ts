import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type AuditStatus = "pending" | "crawling" | "analyzing" | "completed" | "failed" | "cancelled";
export type IssueCategory =
  | "technical"
  | "on_page"
  | "content"
  | "images"
  | "links"
  | "mobile"
  | "performance"
  | "structured_data";
export type IssueSeverity = "error" | "warning" | "notice";
export type IssueStatus = "open" | "fixed" | "ignored" | "recheck_required";

export interface SEOAuditRecord {
  id: string;
  website_id: string;
  status: AuditStatus;
  total_pages_discovered: number;
  total_pages_crawled: number;
  overall_score: number;
  technical_score: number;
  onpage_score: number;
  content_score: number;
  image_score: number;
  linking_score: number;
  mobile_score: number;
  performance_score: number | null;
  schema_score: number;
  error_count: number;
  warning_count: number;
  notice_count: number;
  passed_count: number;
  duration_ms: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface SEOCrawledPageRecord {
  id: string;
  audit_id: string;
  website_id: string;
  url: string;
  path: string;
  http_status: number;
  load_time_ms: number;
  content_type: string;
  title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  h1_count: number;
  h1_content: string[];
  h2_count: number;
  word_count: number;
  images_count: number;
  images_missing_alt: number;
  internal_outbound_links: number;
  external_outbound_links: number;
  schema_types: string[];
  page_score: number;
  created_at: string;
}

export interface SEOAuditIssueRecord {
  id: string;
  audit_id: string;
  website_id: string;
  crawled_page_id: string | null;
  issue_code: string;
  category: IssueCategory;
  severity: IssueSeverity;
  affected_url: string;
  title: string;
  finding: string;
  evidence: Record<string, unknown>;
  explanation: string;
  recommended_fix: string;
  editor_route: string | null;
  status: IssueStatus;
  created_at: string;
}

export class SEOAuditRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * Create a new audit run in pending state
   */
  async createAudit(websiteId: string): Promise<SEOAuditRecord> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("seo_audits")
      .insert({
        website_id: websiteId,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create SEO audit: ${error.message}`);
    }
    return data as SEOAuditRecord;
  }

  /**
   * Update audit progress or completion metrics
   */
  async updateAudit(auditId: string, updates: Partial<SEOAuditRecord>): Promise<SEOAuditRecord> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("seo_audits")
      .update(updates)
      .eq("id", auditId)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update SEO audit: ${error.message}`);
    }
    return data as SEOAuditRecord;
  }

  /**
   * Get latest audit for a website
   */
  async getLatestAudit(websiteId: string): Promise<SEOAuditRecord | null> {
    try {
      // Prioritize completed audits so failed/pending runs don't mask valid results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: completed, error: cErr } = await (this.client as any)
        .from("seo_audits")
        .select("*")
        .eq("website_id", websiteId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cErr && completed) {
        return completed as SEOAuditRecord;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("seo_audits")
        .select("*")
        .eq("website_id", websiteId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return (data as SEOAuditRecord) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get specific audit by ID
   */
  async getAuditById(auditId: string): Promise<SEOAuditRecord | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("seo_audits")
        .select("*")
        .eq("id", auditId)
        .maybeSingle();

      if (error) return null;
      return (data as SEOAuditRecord) || null;
    } catch {
      return null;
    }
  }

  /**
   * List historical audits for a website
   */
  async listAudits(websiteId: string, limit = 10): Promise<SEOAuditRecord[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("seo_audits")
        .select("*")
        .eq("website_id", websiteId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) return [];
      return (data as SEOAuditRecord[]) || [];
    } catch {
      return [];
    }
  }

  /**
   * Insert crawled pages in batch
   */
  async insertCrawledPages(pages: Omit<SEOCrawledPageRecord, "id" | "created_at">[]): Promise<SEOCrawledPageRecord[]> {
    if (pages.length === 0) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("seo_crawled_pages")
      .insert(pages)
      .select("*");

    if (error) {
      throw new Error(`Failed to insert crawled pages: ${error.message}`);
    }
    return (data as SEOCrawledPageRecord[]) || [];
  }

  /**
   * List crawled pages for an audit
   */
  async listCrawledPages(auditId: string): Promise<SEOCrawledPageRecord[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("seo_crawled_pages")
        .select("*")
        .eq("audit_id", auditId)
        .order("path", { ascending: true });

      if (error) return [];
      return (data as SEOCrawledPageRecord[]) || [];
    } catch {
      return [];
    }
  }

  /**
   * Insert audit issues in batch
   */
  async insertIssues(issues: Omit<SEOAuditIssueRecord, "id" | "created_at">[]): Promise<SEOAuditIssueRecord[]> {
    if (issues.length === 0) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("seo_audit_issues")
      .insert(issues)
      .select("*");

    if (error) {
      throw new Error(`Failed to insert audit issues: ${error.message}`);
    }
    return (data as SEOAuditIssueRecord[]) || [];
  }

  /**
   * List issues for an audit with optional category or severity filters
   */
  async listIssues(
    auditId: string,
    filters?: { category?: IssueCategory; severity?: IssueSeverity; status?: IssueStatus }
  ): Promise<SEOAuditIssueRecord[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (this.client as any).from("seo_audit_issues").select("*").eq("audit_id", auditId);

      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.severity) query = query.eq("severity", filters.severity);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query.order("severity", { ascending: true });
      if (error) return [];
      return (data as SEOAuditIssueRecord[]) || [];
    } catch {
      return [];
    }
  }

  /**
   * Update single issue status
   */
  async updateIssueStatus(issueId: string, status: IssueStatus): Promise<SEOAuditIssueRecord> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("seo_audit_issues")
      .update({ status })
      .eq("id", issueId)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update issue status: ${error.message}`);
    }
    return data as SEOAuditIssueRecord;
  }
}

