import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { ProfileUpdateSchema } from "@/lib/database/schemas/database.schema";
import {
  handleDatabaseError,
  NotFoundError,
  ValidationError,
} from "@/lib/database/errors";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export class ProfileRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * Get user profile by Auth user ID.
   */
  async getById(userId: string): Promise<ProfileRow> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) handleDatabaseError(error, "Failed to retrieve user profile");
    if (!data) throw new NotFoundError("Profile", userId);

    return data;
  }

  /**
   * Update profile information.
   */
  async update(userId: string, input: unknown): Promise<ProfileRow> {
    const validation = ProfileUpdateSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        "Invalid profile update data",
        validation.error.flatten()
      );
    }

    const { fullName, avatarUrl } = validation.data;
    const { data, error } = await this.client
      .from("profiles")
      .update({
        ...(fullName !== undefined ? { full_name: fullName } : {}),
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) handleDatabaseError(error, "Failed to update profile");
    return data;
  }
}

