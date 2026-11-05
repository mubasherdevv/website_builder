import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WebsiteCrawlerEngine } from "@/lib/seo/audit/crawler";

export async function POST(
  request: Request,
  { params }: { params: { websiteId: string } }
) {
  try {
    const admin = createAdminClient();
    const crawler = new WebsiteCrawlerEngine(admin);

    // Optional options from request body
    let options = {};
    try {
      options = await request.json();
    } catch {
      // Empty body
    }

    // Execute audit crawl
    const result = await crawler.runAudit(params.websiteId, options);

    return NextResponse.json({
      success: true,
      auditId: result.audit.id,
      audit: result.audit,
      pages: result.pages,
      issues: result.issues,
    });
  } catch (error) {
    console.error("SEO Audit start failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run audit",
      },
      { status: 500 }
    );
  }
}

