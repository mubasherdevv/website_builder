import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SEOAuditRepository, IssueStatus } from "@/lib/database/repositories/seo-audit.repo";

export async function PATCH(
  request: Request,
  { params }: { params: { websiteId: string; issueId: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !["open", "fixed", "ignored", "recheck_required"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    const admin = createAdminClient();
    const repo = new SEOAuditRepository(admin);

    const updated = await repo.updateIssueStatus(params.issueId, status as IssueStatus);

    return NextResponse.json({
      success: true,
      issue: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update issue" },
      { status: 500 }
    );
  }
}

