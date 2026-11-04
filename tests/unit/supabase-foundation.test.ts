import { describe, it, expect, vi } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import {
  CreateWebsiteSchema,
  UpdateWebsiteSchema,
  WebsiteMemberSchema,
  ProfileUpdateSchema,
} from "@/lib/database/schemas/database.schema";
import {
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  handleDatabaseError,
} from "@/lib/database/errors";
import { WebsiteRepository } from "@/lib/database/repositories/website.repo";
import { ProfileRepository } from "@/lib/database/repositories/profile.repo";

describe("Phase 1: Supabase Database Foundation", () => {
  describe("Zod Validation Schemas", () => {
    it("validates valid website creation input", () => {
      const validWebsite = {
        organizationId: "11111111-1111-1111-1111-111111111111",
        name: "My Awesome Business",
        subdomain: "my-awesome-business",
        themeConfig: { primaryColor: "#10b981" },
        status: "draft",
      };

      const result = CreateWebsiteSchema.safeParse(validWebsite);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Awesome Business");
        expect(result.data.subdomain).toBe("my-awesome-business");
      }
    });

    it("rejects invalid subdomain format", () => {
      const invalidWebsite = {
        organizationId: "11111111-1111-1111-1111-111111111111",
        name: "Bad Subdomain Site",
        subdomain: "Bad Subdomain!@#",
      };

      const result = CreateWebsiteSchema.safeParse(invalidWebsite);
      expect(result.success).toBe(false);
    });

    it("validates website member roles", () => {
      const validMember = {
        websiteId: "22222222-2222-2222-2222-222222222222",
        userId: "33333333-3333-3333-3333-333333333333",
        role: "editor",
      };

      const result = WebsiteMemberSchema.safeParse(validMember);
      expect(result.success).toBe(true);

      const invalidMember = { ...validMember, role: "super-owner" };
      const invalidResult = WebsiteMemberSchema.safeParse(invalidMember);
      expect(invalidResult.success).toBe(false);
    });

    it("validates profile updates", () => {
      const validProfile = {
        fullName: "Jane Doe",
        avatarUrl: "https://example.com/avatar.png",
      };
      const result = ProfileUpdateSchema.safeParse(validProfile);
      expect(result.success).toBe(true);

      const invalidProfile = { avatarUrl: "not-a-valid-url" };
      const invalidResult = ProfileUpdateSchema.safeParse(invalidProfile);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("Database Error Handling", () => {
    it("instantiates custom database error hierarchy correctly", () => {
      const notFound = new NotFoundError("Website", "site-123");
      expect(notFound.name).toBe("NotFoundError");
      expect(notFound.code).toBe("NOT_FOUND");
      expect(notFound.message).toContain("site-123");

      const unauth = new UnauthorizedError();
      expect(unauth.name).toBe("UnauthorizedError");
      expect(unauth.code).toBe("UNAUTHORIZED");

      const validation = new ValidationError("Missing field", { field: "name" });
      expect(validation.name).toBe("ValidationError");
      expect(validation.details).toEqual({ field: "name" });
    });

    it("converts unknown errors to DatabaseError", () => {
      expect(() => {
        handleDatabaseError({ message: "Postgres connection timeout", code: "57P01" });
      }).toThrowError(DatabaseError);
    });
  });

  describe("Repository Layer Contracts", () => {
    it("throws NotFoundError when website does not exist", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient<Database>;

      const repo = new WebsiteRepository(mockSupabase);
      await expect(repo.getById("non-existent-id")).rejects.toThrow(NotFoundError);
    });

    it("validates input before calling insert in WebsiteRepository", async () => {
      const mockSupabase = {
        from: vi.fn(),
      } as unknown as SupabaseClient<Database>;

      const repo = new WebsiteRepository(mockSupabase);
      await expect(
        repo.create({
          name: "Invalid",
          // missing organizationId and subdomain
        })
      ).rejects.toThrow(ValidationError);

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("retrieves user profile when present", async () => {
      const fakeProfile = {
        id: "user-1",
        full_name: "John Doe",
        avatar_url: null,
        is_super_admin: false,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: fakeProfile, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient<Database>;

      const repo = new ProfileRepository(mockSupabase);
      const profile = await repo.getById("user-1");
      expect(profile.full_name).toBe("John Doe");
      expect(profile.id).toBe("user-1");
    });
  });
});
