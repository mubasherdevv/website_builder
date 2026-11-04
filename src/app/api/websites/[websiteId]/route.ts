import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WebsiteRepository } from "@/lib/database/repositories/website.repo";

interface RouteParams {
  params: {
    websiteId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { websiteId } = params;
    const admin = createAdminClient();
    const repo = new WebsiteRepository(admin);

    const website = await repo.getById(websiteId);
    return NextResponse.json({ success: true, website });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Website not found" },
      { status: 404 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { websiteId } = params;
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new WebsiteRepository(admin);

    const website = await repo.update(websiteId, body);
    return NextResponse.json({ success: true, website });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update website" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { websiteId } = params;
    const admin = createAdminClient();
    const repo = new WebsiteRepository(admin);

    await repo.delete(websiteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete website" },
      { status: 500 }
    );
  }
}

