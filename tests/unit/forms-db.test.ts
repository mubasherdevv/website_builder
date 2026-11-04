import { describe, it, expect, vi, beforeEach } from "vitest";
import { FormRepository } from "@/lib/database/repositories/form.repo";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

describe("FormRepository", () => {
  let mockSupabase: Record<string, unknown>;
  let repo: FormRepository;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    };
    repo = new FormRepository(mockSupabase as unknown as SupabaseClient<Database>);
  });

  it("should fetch forms for a given website", async () => {
    const mockForms = [
      {
        id: "form_1",
        website_id: "site_test",
        name: "Contact Us",
        type: "contact",
        status: "active",
        fields: [],
        settings: {},
        submissions_count: 5,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockForms, error: null }),
    };

    (mockSupabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const result = await repo.getFormsByWebsite("site_test");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("form_1");
    expect(result[0].name).toBe("Contact Us");
    expect(result[0].submissionsCount).toBe(5);
  });

  it("should create a submission and return mapped FormSubmission entity", async () => {
    const mockSubmissionRow = {
      id: "sub_123",
      form_id: "form_1",
      website_id: "site_test",
      form_name: "Contact Us",
      data: { fullName: "Jane Doe", email: "jane@test.com" },
      status: "new",
      submitted_at: "2026-01-01T00:00:00Z",
      ip_address: "127.0.0.1",
      user_agent: "TestBrowser",
      notes: [],
    };

    const getFormChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: "form_1",
          website_id: "site_test",
          name: "Contact Us",
          type: "contact",
          status: "active",
          fields: [],
          settings: {},
          submissions_count: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    };

    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockSubmissionRow, error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    (mockSupabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === "forms") return getFormChain;
      return insertChain;
    });

    const submission = await repo.createSubmission(
      "site_test",
      "form_1",
      { fullName: "Jane Doe", email: "jane@test.com" },
      { ip: "127.0.0.1", userAgent: "TestBrowser" }
    );

    expect(submission.id).toBe("sub_123");
    expect(submission.formName).toBe("Contact Us");
    expect(submission.data.fullName).toBe("Jane Doe");
  });
});
