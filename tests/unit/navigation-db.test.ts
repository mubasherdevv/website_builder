import { describe, it, expect, vi, beforeEach } from "vitest";
import { NavigationRepository } from "@/lib/database/repositories/navigation.repo";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

describe("NavigationRepository", () => {
  let mockSupabase: Record<string, unknown>;
  let repo: NavigationRepository;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    };
    repo = new NavigationRepository(mockSupabase as unknown as SupabaseClient<Database>);
  });

  it("should retrieve menus by website", async () => {
    const mockMenus = [
      {
        id: "menu_header",
        website_id: "site_test",
        name: "Main Header Menu",
        location: "header",
        is_published: true,
        settings: {},
        items: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockMenus, error: null }),
    };

    (mockSupabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const result = await repo.getMenusByWebsite("site_test");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("menu_header");
    expect(result[0].location).toBe("header");
    expect(result[0].isPublished).toBe(true);
  });
});

