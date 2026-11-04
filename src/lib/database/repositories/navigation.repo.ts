import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/types/database";
import { WebsiteMenu, NavigationSettings, NavigationItem } from "@/types/navigation";
import { handleDatabaseError } from "@/lib/database/errors";

export class NavigationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getMenusByWebsite(websiteId: string): Promise<WebsiteMenu[]> {
    try {
      const { data, error } = await this.client
        .from("navigation_menus")
        .select("*")
        .eq("website_id", websiteId)
        .order("created_at", { ascending: true });

      if (error) throw handleDatabaseError(error);
      if (!data) return [];

      return data.map((row) => ({
        id: row.id,
        websiteId: row.website_id,
        name: row.name,
        location: row.location as WebsiteMenu["location"],
        isPublished: row.is_published,
        settings: (row.settings as unknown as NavigationSettings) || {},
        items: (row.items as unknown as NavigationItem[]) || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async getMenuById(menuId: string): Promise<WebsiteMenu | null> {
    try {
      const { data, error } = await this.client
        .from("navigation_menus")
        .select("*")
        .eq("id", menuId)
        .maybeSingle();

      if (error) throw handleDatabaseError(error);
      if (!data) return null;

      return {
        id: data.id,
        websiteId: data.website_id,
        name: data.name,
        location: data.location as WebsiteMenu["location"],
        isPublished: data.is_published,
        settings: (data.settings as unknown as NavigationSettings) || {},
        items: (data.items as unknown as NavigationItem[]) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async saveMenu(menu: WebsiteMenu): Promise<WebsiteMenu> {
    try {
      const now = new Date().toISOString();
      const payload = {
        id: menu.id,
        website_id: menu.websiteId,
        name: menu.name,
        location: menu.location,
        is_published: menu.isPublished ?? true,
        settings: menu.settings as unknown as Json,
        items: (menu.items || []) as unknown as Json,
        updated_at: now,
      };

      const { data, error } = await this.client
        .from("navigation_menus")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) throw handleDatabaseError(error);

      return {
        id: data.id,
        websiteId: data.website_id,
        name: data.name,
        location: data.location as WebsiteMenu["location"],
        isPublished: data.is_published,
        settings: (data.settings as unknown as NavigationSettings) || {},
        items: (data.items as unknown as NavigationItem[]) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async deleteMenu(menuId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from("navigation_menus")
        .delete()
        .eq("id", menuId);

      if (error) throw handleDatabaseError(error);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }
}
