import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export interface AIProviderRow {
  id: string;
  user_id: string;
  provider_type: "openai" | "openrouter" | "gemini" | "custom";
  provider_name: string;
  encrypted_api_key: string;
  base_url: string | null;
  selected_model: string;
  default_model: boolean;
  enabled: boolean;
  connection_status: "untested" | "connected" | "failed";
  last_tested_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLogRow {
  id: string;
  user_id: string | null;
  website_id: string | null;
  provider_type: string;
  model: string;
  operation_type: string;
  status: "success" | "failed";
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  error_message: string | null;
  created_at: string;
}

export class AIProviderRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * List all providers for a specific user (or all if dev fallback)
   */
  async listUserProviders(userId?: string): Promise<AIProviderRow[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (this.client as any).from("ai_providers").select("*");
      if (userId && userId !== "00000000-0000-0000-0000-000000000000") {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("created_at", { ascending: true });
      if (error) {
        console.warn("Could not list AI providers from DB:", error.message);
        return [];
      }
      return (data as AIProviderRow[]) || [];
    } catch (e) {
      console.warn("Failed to list AI providers:", e);
      return [];
    }
  }

  /**
   * Get provider by ID
   */
  async getProviderById(providerId: string, userId?: string): Promise<AIProviderRow | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (this.client as any).from("ai_providers").select("*").eq("id", providerId);
      if (userId && userId !== "00000000-0000-0000-0000-000000000000") {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.maybeSingle();
      if (error) {
        console.warn("Could not get AI provider by ID:", error.message);
        return null;
      }
      return (data as AIProviderRow) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get active default provider for user
   */
  async getDefaultProvider(userId?: string): Promise<AIProviderRow | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (this.client as any)
        .from("ai_providers")
        .select("*")
        .eq("enabled", true)
        .eq("default_model", true);

      if (userId && userId !== "00000000-0000-0000-0000-000000000000") {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) return data as AIProviderRow;

      // Fallback: any enabled provider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fallbackQuery = (this.client as any)
        .from("ai_providers")
        .select("*")
        .eq("enabled", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (userId && userId !== "00000000-0000-0000-0000-000000000000") {
        fallbackQuery = fallbackQuery.eq("user_id", userId);
      }

      const { data: anyEnabled } = await fallbackQuery.maybeSingle();
      return (anyEnabled as AIProviderRow) || null;
    } catch {
      return null;
    }
  }

  /**
   * Create new provider
   */
  async createProvider(payload: Omit<AIProviderRow, "id" | "created_at" | "updated_at">): Promise<AIProviderRow> {
    if (payload.default_model) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.client as any)
          .from("ai_providers")
          .update({ default_model: false })
          .eq("user_id", payload.user_id);
      } catch {
        // Ignore
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("ai_providers")
      .insert({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create AI provider: ${error.message}`);
    }
    return data as AIProviderRow;
  }

  /**
   * Update provider
   */
  async updateProvider(
    providerId: string,
    userId: string,
    updates: Partial<Omit<AIProviderRow, "id" | "user_id" | "created_at">>
  ): Promise<AIProviderRow> {
    if (updates.default_model) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.client as any)
          .from("ai_providers")
          .update({ default_model: false })
          .eq("user_id", userId);
      } catch {
        // Ignore
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("ai_providers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update AI provider: ${error.message}`);
    }
    return data as AIProviderRow;
  }

  /**
   * Delete provider
   */
  async deleteProvider(providerId: string, userId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.client as any)
      .from("ai_providers")
      .delete()
      .eq("id", providerId);

    if (error) {
      throw new Error(`Failed to delete AI provider: ${error.message}`);
    }
  }

  /**
   * Log AI token usage
   */
  async logUsage(log: Omit<AIUsageLogRow, "id" | "created_at">): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.client as any).from("ai_usage_logs").insert(log);
    } catch {
      // Logging should never crash core business flow
    }
  }
}
