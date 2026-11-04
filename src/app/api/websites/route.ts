import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WebsiteRepository } from "@/lib/database/repositories/website.repo";

export async function GET() {
  try {
    const admin = createAdminClient();
    const repo = new WebsiteRepository(admin);

    const websites = await repo.listUserWebsites();
    return NextResponse.json({ success: true, websites });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to list websites" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new WebsiteRepository(admin);

    const website = await repo.create(body);
    return NextResponse.json({ success: true, website }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create website" },
      { status: 400 }
    );
  }
}

