import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AIProviderRepository } from "@/lib/database/repositories/ai-provider.repo";
import { decryptCredential } from "@/lib/security/encryption";
import { getProviderInstance } from "@/lib/ai/providers";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = createAdminClient();
    const repo = new AIProviderRepository(admin);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users } = await (admin as any).auth.admin.listUsers();
    const userId = users?.users?.[0]?.id || "00000000-0000-0000-0000-000000000000";

    let provider = await repo.getProviderById(params.id, userId);
    if (!provider) {
      provider = await repo.getProviderById(params.id);
    }
    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    const decryptedKey = decryptCredential(provider.encrypted_api_key);
    const adapter = getProviderInstance(provider.provider_type);

    const testRes = await adapter.testConnection(
      decryptedKey,
      provider.base_url,
      provider.selected_model
    );

    const connection_status = testRes.success ? "connected" : "failed";
    const last_error = testRes.success ? null : testRes.error || "Connection test failed";
    const last_tested_at = new Date().toISOString();

    await repo.updateProvider(params.id, provider.user_id || userId, {
      connection_status,
      last_error,
      last_tested_at,
    });

    return NextResponse.json({
      success: testRes.success,
      latencyMs: testRes.latencyMs,
      modelsFound: testRes.modelsFound,
      error: last_error,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Test failed" },
      { status: 500 }
    );
  }
}

