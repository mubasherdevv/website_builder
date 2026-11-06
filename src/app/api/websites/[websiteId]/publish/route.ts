import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError, ValidationError } from "@/lib/database/errors";

interface RouteParams {
  params: {
    websiteId: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { websiteId } = params;
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: website, error: websiteError } = await (admin as any)
      .from("websites")
      .select("id, status")
      .eq("id", websiteId)
      .maybeSingle();

    if (websiteError) throw websiteError;
    if (!website) throw new NotFoundError("Website", websiteId);

    // Get all pages for this website
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pages, error: pagesError } = await (admin as any)
      .from("pages")
      .select("id, draft_revision_id, status")
      .eq("website_id", websiteId);

    if (pagesError) throw pagesError;

    if (!pages || pages.length === 0) {
      throw new ValidationError(`No pages found for website "${websiteId}"`);
    }

    // Publish all pages that have a draft revision
    const results = [];
    const errors = [];

    for (const page of pages) {
      if (!page.draft_revision_id) {
        errors.push({
          pageId: page.id,
          error: "No draft revision to publish",
        });
        continue;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (admin as any)
          .from("pages")
          .update({
            published_revision_id: page.draft_revision_id,
            status: "published",
            updated_at: new Date().toISOString(),
          })
          .eq("id", page.id);

        if (updateError) throw updateError;

        results.push({
          pageId: page.id,
          status: "published",
        });
      } catch (err) {
        errors.push({
          pageId: page.id,
          error: err instanceof Error ? err.message : "Failed to publish page",
        });
      }
    }

    // Update website status to published if all pages published successfully
    if (errors.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from("websites")
        .update({ status: "published", updated_at: new Date().toISOString() })
        .eq("id", websiteId);
    }

    return NextResponse.json({
      success: errors.length === 0,
      websiteId,
      websiteStatus: errors.length === 0 ? "published" : "partial",
      published: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 404 }
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to publish website" },
      { status: 500 }
    );
  }
}
