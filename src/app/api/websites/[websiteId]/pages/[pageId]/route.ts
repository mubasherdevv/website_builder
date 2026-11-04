import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageRepository } from "@/lib/database/repositories/page.repo";
import { PageDocument } from "@/types/builder";

interface RouteParams {
  params: {
    websiteId: string;
    pageId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = params;
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get("mode") as "draft" | "published") || "draft";

    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const data = await repo.getPageWithRevision(pageId, mode);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Page not found" },
      { status: 404 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = params;
    const body = await request.json();
    const { document, userId } = body as { document: PageDocument; userId?: string };

    if (!document || !document.sections) {
      return NextResponse.json(
        { success: false, error: "Valid PageDocument is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const revision = await repo.savePageDraft(pageId, document, userId);
    return NextResponse.json({ success: true, revision });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = params;
    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const page = await repo.publishPage(pageId);
    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to publish page" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = params;
    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    await repo.deletePage(pageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete page" },
      { status: 500 }
    );
  }
}

