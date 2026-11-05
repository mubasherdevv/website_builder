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

    const audits = await repo.listAudits(params.websiteId, 15);

    return NextResponse.json({
      success: true,
      audits,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load audit history" },
      { status: 500 }
    );
  }
}

