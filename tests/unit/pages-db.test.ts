import { describe, it, expect, vi } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { PageRepository } from "@/lib/database/repositories/page.repo";
import { PageDocument } from "@/types/builder";

describe("Module 2: Database Persistence for Pages & Revisions", () => {
  const sampleDoc: PageDocument = {
    schemaVersion: 1,
    page: { id: "p1", title: "Home", slug: "/", status: "draft" },
    sections: [
      {
        id: "sec_hero",
        componentId: "hero.split.v1",
        componentVersion: 1,
        props: { title: "Hero Title" },
      },
    ],
  };

  it("creates a page and records initial revision in page_revisions", async () => {
    const mockPage = { id: "page_123", website_id: "site_abc", title: "Home", slug: "/", status: "draft" };
    const mockRev = { id: "rev_001", page_id: "page_123", revision_number: 1, document: sampleDoc };

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "pages") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockPage, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === "page_revisions") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 0 }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockRev, error: null }),
              }),
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient<Database>;

    const repo = new PageRepository(mockSupabase);
    const result = await repo.createPage("site_abc", "Home", "/", sampleDoc);

    expect(result.page.id).toBe("page_123");
    expect(result.revision?.id).toBe("rev_001");
    expect(mockSupabase.from).toHaveBeenCalledWith("pages");
    expect(mockSupabase.from).toHaveBeenCalledWith("page_revisions");
  });

  it("publishes active draft revision to production", async () => {
    const mockPage = { id: "page_123", draft_revision_id: "rev_001" };
    const updatedPage = { ...mockPage, published_revision_id: "rev_001", status: "published" };

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "pages") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockPage, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: updatedPage, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient<Database>;

    const repo = new PageRepository(mockSupabase);
    const published = await repo.publishPage("page_123");

    expect(published.status).toBe("published");
    expect(published.published_revision_id).toBe("rev_001");
  });
});

