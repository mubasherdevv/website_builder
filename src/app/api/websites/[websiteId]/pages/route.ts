import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageRepository } from "@/lib/database/repositories/page.repo";
import { PageDocument } from "@/types/builder";

interface RouteParams {
  params: {
    websiteId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { websiteId } = params;
    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const pages = await repo.listPagesByWebsite(websiteId);
    return NextResponse.json({ success: true, pages });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to list pages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { websiteId } = params;
    const body = await request.json();
    const { title, slug, initialDocument } = body as {
      title: string;
      slug: string;
      initialDocument?: PageDocument;
    };

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const result = await repo.createPage(websiteId, title, slug, initialDocument);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create page" },
      { status: 500 }
    );
  }
}

