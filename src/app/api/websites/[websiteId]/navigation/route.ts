import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NavigationRepository } from "@/lib/database/repositories/navigation.repo";

export async function GET(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const websiteId = params.websiteId;
    const client = await createServerSupabaseClient();
    const repo = new NavigationRepository(client);

    const menus = await repo.getMenusByWebsite(websiteId);
    return NextResponse.json({ success: true, menus });
  } catch (error: unknown) {
    console.error("Failed to fetch navigation menus:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch navigation menus" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const websiteId = params.websiteId;
    const body = await request.json();
    const client = await createServerSupabaseClient();
    const repo = new NavigationRepository(client);

    const menu = await repo.saveMenu({
      ...body,
      websiteId,
    });

    return NextResponse.json({ success: true, menu });
  } catch (error: unknown) {
    console.error("Failed to save navigation menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save navigation menu" },
      { status: 500 }
    );
  }
}

