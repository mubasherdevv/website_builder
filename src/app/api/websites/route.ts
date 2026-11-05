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

    let organizationId = body.organizationId;
    if (!organizationId) {
      // Auto-resolve or create an organization for seamless onboarding
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingOrg } = await (admin as any)
        .from("organizations")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existingOrg?.id) {
        organizationId = existingOrg.id;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newOrg } = await (admin as any)
          .from("organizations")
          .insert({ name: "Personal Workspace", slug: "workspace-" + Date.now() })
          .select("id")
          .single();
        organizationId = newOrg?.id;
      }
    }

    const website = await repo.create({
      ...body,
      organizationId,
    });
    return NextResponse.json({ success: true, website }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create website" },
      { status: 400 }
    );
  }
}

