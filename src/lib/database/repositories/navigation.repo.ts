import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/types/database";
import { WebsiteMenu, NavigationSettings, NavigationItem } from "@/types/navigation";
import { handleDatabaseError } from "@/lib/database/errors";

type NavigationMenuRow = Database["public"]["Tables"]["navigation_menus"]["Row"];

export class NavigationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getMenusByWebsite(websiteId: string): Promise<WebsiteMenu[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("navigation_menus")
        .select("*")
        .eq("website_id", websiteId)
        .order("created_at", { ascending: true });

      if (error) throw handleDatabaseError(error);
      if (!data) return [];

      return (data as NavigationMenuRow[]).map((row) => ({
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("navigation_menus")
        .select("*")
        .eq("id", menuId)
        .maybeSingle();

      if (error) throw handleDatabaseError(error);
      if (!data) return null;

      const row = data as NavigationMenuRow;
      return {
        id: row.id,
        websiteId: row.website_id,
        name: row.name,
        location: row.location as WebsiteMenu["location"],
        isPublished: row.is_published,
        settings: (row.settings as unknown as NavigationSettings) || {},
        items: (row.items as unknown as NavigationItem[]) || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("navigation_menus")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) throw handleDatabaseError(error);

      const row = data as NavigationMenuRow;
      return {
        id: row.id,
        websiteId: row.website_id,
        name: row.name,
        location: row.location as WebsiteMenu["location"],
        isPublished: row.is_published,
        settings: (row.settings as unknown as NavigationSettings) || {},
        items: (row.items as unknown as NavigationItem[]) || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async deleteMenu(menuId: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.client as any)
        .from("navigation_menus")
        .delete()
        .eq("id", menuId);

      if (error) throw handleDatabaseError(error);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }
}
