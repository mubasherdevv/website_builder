import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FormRepository } from "@/lib/database/repositories/form.repo";

export async function GET(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const websiteId = params.websiteId;
    const client = await createServerSupabaseClient();
    const repo = new FormRepository(client);

    const forms = await repo.getFormsByWebsite(websiteId);
    return NextResponse.json({ success: true, forms });
  } catch (error: unknown) {
    console.error("Failed to fetch forms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch forms" },
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
    const repo = new FormRepository(client);

    const form = await repo.saveForm({
      ...body,
      websiteId,
    });

    return NextResponse.json({ success: true, form });
  } catch (error: unknown) {
    console.error("Failed to save form:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save form" },
      { status: 500 }
    );
  }
}

