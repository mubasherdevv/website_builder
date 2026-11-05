import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AIProviderRepository, AIProviderRow } from "@/lib/database/repositories/ai-provider.repo";
import { encryptCredential } from "@/lib/security/encryption";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new AIProviderRepository(admin);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users } = await (admin as any).auth.admin.listUsers();
    const userId = users?.users?.[0]?.id || "00000000-0000-0000-0000-000000000000";

    const updates: Partial<AIProviderRow> = {};
    if (body.provider_name) updates.provider_name = body.provider_name;
    if (body.selected_model) updates.selected_model = body.selected_model;
    if (body.base_url !== undefined) updates.base_url = body.base_url || null;
    if (body.default_model !== undefined) updates.default_model = !!body.default_model;
    if (body.enabled !== undefined) updates.enabled = !!body.enabled;

    if (body.api_key && body.api_key.trim()) {
      updates.encrypted_api_key = encryptCredential(body.api_key.trim());
      updates.connection_status = "untested";
    }

    const updated = await repo.updateProvider(params.id, userId, updates);

    return NextResponse.json({
      success: true,
      provider: {
        id: updated.id,
        provider_type: updated.provider_type,
        provider_name: updated.provider_name,
        base_url: updated.base_url,
        selected_model: updated.selected_model,
        default_model: updated.default_model,
        enabled: updated.enabled,
        connection_status: updated.connection_status,
        last_tested_at: updated.last_tested_at,
        last_error: updated.last_error,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update provider" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = createAdminClient();
    const repo = new AIProviderRepository(admin);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users } = await (admin as any).auth.admin.listUsers();
    const userId = users?.users?.[0]?.id || "00000000-0000-0000-0000-000000000000";

    await repo.deleteProvider(params.id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete provider" },
      { status: 500 }
    );
  }
}

