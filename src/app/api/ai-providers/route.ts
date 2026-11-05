import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AIProviderRepository } from "@/lib/database/repositories/ai-provider.repo";
import { encryptCredential, maskApiKey, decryptCredential } from "@/lib/security/encryption";
import { getProviderInstance } from "@/lib/ai/providers";

export async function GET() {
  try {
    const admin = createAdminClient();
    const repo = new AIProviderRepository(admin);

    let userId = "00000000-0000-0000-0000-000000000000";
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: users } = await (admin as any).auth.admin.listUsers();
      if (users?.users?.[0]?.id) {
        userId = users.users[0].id;
      }
    } catch {
      // Fallback
    }

    const providers = await repo.listUserProviders(userId);

    // Never return decrypted credentials to client! Return masked representations
    const safeProviders = providers.map((p) => {
      let maskedKey = "••••••••";
      try {
        if (p.encrypted_api_key) {
          const decrypted = decryptCredential(p.encrypted_api_key);
          maskedKey = maskApiKey(decrypted);
        }
      } catch {
        maskedKey = "••••••••";
      }

      return {
        id: p.id,
        provider_type: p.provider_type,
        provider_name: p.provider_name,
        masked_api_key: maskedKey,
        base_url: p.base_url,
        selected_model: p.selected_model,
        default_model: p.default_model,
        enabled: p.enabled,
        connection_status: p.connection_status,
        last_tested_at: p.last_tested_at,
        last_error: p.last_error,
        created_at: p.created_at,
      };
    });

    return NextResponse.json({ success: true, providers: safeProviders });
  } catch (error) {
    console.warn("GET /api/ai-providers warning:", error);
    return NextResponse.json({ success: true, providers: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider_type, provider_name, api_key, base_url, selected_model, default_model } = body;

    if (!provider_type || !provider_name || !api_key || !selected_model) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: provider_type, provider_name, api_key, selected_model" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const repo = new AIProviderRepository(admin);

    let userId = "00000000-0000-0000-0000-000000000000";
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: users } = await (admin as any).auth.admin.listUsers();
      if (users?.users?.[0]?.id) {
        userId = users.users[0].id;
      }
    } catch {
      // Fallback
    }

    // Encrypt credential before writing to database
    const encrypted_api_key = encryptCredential(api_key.trim());

    // Test connection initially
    let connection_status: "connected" | "failed" | "untested" = "untested";
    let last_error: string | null = null;
    let last_tested_at: string | null = null;

    try {
      const adapter = getProviderInstance(provider_type);
      const testRes = await adapter.testConnection(api_key.trim(), base_url, selected_model);
      last_tested_at = new Date().toISOString();
      if (testRes.success) {
        connection_status = "connected";
      } else {
        connection_status = "failed";
        last_error = testRes.error || "Connection test failed";
      }
    } catch (testErr) {
      connection_status = "failed";
      last_error = testErr instanceof Error ? testErr.message : "Test failed";
    }

    const created = await repo.createProvider({
      user_id: userId,
      provider_type,
      provider_name,
      encrypted_api_key,
      base_url: base_url || null,
      selected_model,
      default_model: !!default_model,
      enabled: true,
      connection_status,
      last_tested_at,
      last_error,
    });

    return NextResponse.json({
      success: true,
      provider: {
        id: created.id,
        provider_type: created.provider_type,
        provider_name: created.provider_name,
        masked_api_key: maskApiKey(api_key),
        base_url: created.base_url,
        selected_model: created.selected_model,
        default_model: created.default_model,
        enabled: created.enabled,
        connection_status: created.connection_status,
        last_tested_at: created.last_tested_at,
        last_error: created.last_error,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create provider" },
      { status: 500 }
    );
  }
}
