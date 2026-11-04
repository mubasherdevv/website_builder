import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SeoRepository, FullWebsiteSEO } from "@/lib/database/repositories/seo.repo";

export async function GET(
  _request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const repo = new SeoRepository(supabase);
    const { websiteId } = params;

    const seo = await repo.getSEOByWebsite(websiteId);
    return NextResponse.json({ success: true, seo });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch SEO settings";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const repo = new SeoRepository(supabase);
    const { websiteId } = params;

    const body = await request.json();
    const { seo } = body;

    if (!seo) {
      return NextResponse.json(
        { success: false, error: "SEO configuration payload is required" },
        { status: 400 }
      );
    }

    const payload: FullWebsiteSEO = {
      ...seo,
      websiteId,
    };

    const saved = await repo.saveSEO(payload);
    return NextResponse.json({ success: true, seo: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save SEO configuration";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
