import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SEOAuditRepository } from "@/lib/database/repositories/seo-audit.repo";

export async function GET(
  request: Request,
  { params }: { params: { websiteId: string } }
) {
  try {
    const admin = createAdminClient();
    const repo = new SEOAuditRepository(admin);

    const audit = await repo.getLatestAudit(params.websiteId);
    if (!audit) {
      return NextResponse.json({
        success: true,
        audit: null,
        pages: [],
        issues: [],
      });
    }

    const pages = await repo.listCrawledPages(audit.id);
    const issues = await repo.listIssues(audit.id);

    return NextResponse.json({
      success: true,
      audit,
      pages,
      issues,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load latest audit" },
      { status: 500 }
    );
  }
}

