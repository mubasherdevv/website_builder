import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import {
  CreateWebsiteSchema,
  UpdateWebsiteSchema,
} from "@/lib/database/schemas/database.schema";
import {
  handleDatabaseError,
  NotFoundError,
  ValidationError,
} from "@/lib/database/errors";

export type WebsiteRow = Database["public"]["Tables"]["websites"]["Row"];
export type WebsiteInsert = Database["public"]["Tables"]["websites"]["Insert"];
export type WebsiteUpdate = Database["public"]["Tables"]["websites"]["Update"];

export class WebsiteRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * Get a single website by ID. Enforces RLS via the provided client.
   */
  async getById(websiteId: string): Promise<WebsiteRow> {
    const { data, error } = await this.client
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .maybeSingle();

    if (error) handleDatabaseError(error, "Failed to retrieve website");
    if (!data) throw new NotFoundError("Website", websiteId);

    return data;
  }

  /**
   * Get website by subdomain (e.g. for routing or checking availability).
   */
  async getBySubdomain(subdomain: string): Promise<WebsiteRow | null> {
    const { data, error } = await this.client
      .from("websites")
      .select("*")
      .eq("subdomain", subdomain)
      .maybeSingle();

    if (error) handleDatabaseError(error, "Failed to retrieve website by subdomain");
    return data;
  }

  /**
   * Get all websites accessible by the authenticated user.
   */
  async listUserWebsites(): Promise<WebsiteRow[]> {
    const { data, error } = await this.client
      .from("websites")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) handleDatabaseError(error, "Failed to list user websites");
    return data || [];
  }

  /**
   * Create a new website with validated input.
   */
  async create(input: unknown): Promise<WebsiteRow> {
    const validation = CreateWebsiteSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        "Invalid website creation data",
        validation.error.flatten()
      );
    }

    const { organizationId, name, subdomain, customDomain, themeConfig, status } =
      validation.data;

    const payload: WebsiteInsert = {
      organization_id: organizationId,
      name,
      subdomain,
      custom_domain: customDomain || null,
      theme_config: themeConfig as Database["public"]["Tables"]["websites"]["Insert"]["theme_config"],
      status,
    };

    const { data, error } = await this.client
      .from("websites")
      .insert(payload)
      .select()
      .single();

    if (error) handleDatabaseError(error, "Failed to create website");
    return data;
  }

  /**
   * Update an existing website with validated input.
   */
  async update(websiteId: string, input: unknown): Promise<WebsiteRow> {
    const validation = UpdateWebsiteSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        "Invalid website update data",
        validation.error.flatten()
      );
    }

    const updatePayload: WebsiteUpdate = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from("websites")
      .update(updatePayload)
      .eq("id", websiteId)
      .select()
      .single();

    if (error) handleDatabaseError(error, "Failed to update website");
    return data;
  }

  /**
   * Delete website by ID.
   */
  async delete(websiteId: string): Promise<void> {
    const { error } = await this.client
      .from("websites")
      .delete()
      .eq("id", websiteId);

    if (error) handleDatabaseError(error, "Failed to delete website");
  }
}

