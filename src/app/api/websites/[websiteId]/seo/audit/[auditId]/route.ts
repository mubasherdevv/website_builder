import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SEOAuditRepository, IssueCategory, IssueSeverity, IssueStatus } from "@/lib/database/repositories/seo-audit.repo";

export async function GET(
  request: Request,
  { params }: { params: { websiteId: string; auditId: string } }
) {
  try {
    const admin = createAdminClient();
    const repo = new SEOAuditRepository(admin);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as IssueCategory | undefined;
    const severity = searchParams.get("severity") as IssueSeverity | undefined;
    const status = searchParams.get("status") as IssueStatus | undefined;

    const audit = await repo.getAuditById(params.auditId);
    if (!audit) {
      return NextResponse.json({ success: false, error: "Audit not found" }, { status: 404 });
    }

    const pages = await repo.listCrawledPages(params.auditId);
    const issues = await repo.listIssues(params.auditId, { category, severity, status });

    return NextResponse.json({
      success: true,
      audit,
      pages,
      issues,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load audit" },
      { status: 500 }
    );
  }
}

