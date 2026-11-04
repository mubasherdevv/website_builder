import { describe, it, expect, vi } from "vitest";
import { BlogRepository } from "@/lib/database/repositories/blog.repo";
import { SeoRepository } from "@/lib/database/repositories/seo.repo";
import { BlogPost, BlogCategory } from "@/types/blog";
import { FullWebsiteSEO } from "@/lib/database/repositories/seo.repo";

describe("Blog and SEO Database Repositories", () => {
  const samplePost: BlogPost = {
    id: "post_test_1",
    websiteId: "test_website_123",
    title: "10 Roof Inspection Tips",
    slug: "10-roof-inspection-tips",
    excerpt: "Quick inspection tips for homeowners.",
    content: { version: 1, blocks: [] },
    featuredImage: "https://example.com/img.jpg",
    author: { id: "a1", name: "Inspector Jane" },
    tagIds: ["tag1"],
    status: "published",
    publishedAt: new Date().toISOString(),
    scheduledAt: null,
    readingTimeMinutes: 3,
    seo: {
      metaTitle: "10 Roof Inspection Tips",
      metaDescription: "Quick inspection tips for homeowners.",
      focusKeyword: "roof inspection",
      noIndex: false,
    },
    seoStatus: "good",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleCategory: BlogCategory = {
    id: "cat_test_1",
    websiteId: "test_website_123",
    name: "Maintenance",
    slug: "maintenance",
    createdAt: new Date().toISOString(),
  };

  describe("BlogRepository", () => {
    it("maps rows and manages posts correctly", async () => {
      const mockClient: any = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: samplePost.id,
                website_id: samplePost.websiteId,
                title: samplePost.title,
                slug: samplePost.slug,
                excerpt: samplePost.excerpt,
                content: samplePost.content,
                featured_image: samplePost.featuredImage,
                author: samplePost.author,
                category_id: null,
                tag_ids: samplePost.tagIds,
                status: samplePost.status,
                published_at: samplePost.publishedAt,
                scheduled_at: null,
                reading_time_minutes: samplePost.readingTimeMinutes,
                seo: samplePost.seo,
                seo_status: samplePost.seoStatus,
                created_at: samplePost.createdAt,
                updated_at: samplePost.updatedAt,
              },
            ],
            error: null,
          }),
          upsert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: samplePost.id,
                  website_id: samplePost.websiteId,
                  title: samplePost.title,
                  slug: samplePost.slug,
                  excerpt: samplePost.excerpt,
                  content: samplePost.content,
                  featured_image: samplePost.featuredImage,
                  author: samplePost.author,
                  category_id: null,
                  tag_ids: samplePost.tagIds,
                  status: samplePost.status,
                  published_at: samplePost.publishedAt,
                  scheduled_at: null,
                  reading_time_minutes: samplePost.readingTimeMinutes,
                  seo: samplePost.seo,
                  seo_status: samplePost.seoStatus,
                  created_at: samplePost.createdAt,
                  updated_at: samplePost.updatedAt,
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const repo = new BlogRepository(mockClient);
      const posts = await repo.getPostsByWebsite("test_website_123");
      expect(posts.length).toBe(1);
      expect(posts[0].title).toBe("10 Roof Inspection Tips");
      expect(posts[0].seo.focusKeyword).toBe("roof inspection");

      const saved = await repo.savePost(samplePost);
      expect(saved.id).toBe(samplePost.id);
    });

    it("handles categories correctly", async () => {
      const mockClient: any = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: sampleCategory.id,
                website_id: sampleCategory.websiteId,
                name: sampleCategory.name,
                slug: sampleCategory.slug,
                description: null,
                seo_title: null,
                meta_description: null,
                created_at: sampleCategory.createdAt,
                updated_at: sampleCategory.createdAt,
              },
            ],
            error: null,
          }),
        }),
      };

      const repo = new BlogRepository(mockClient);
      const categories = await repo.getCategoriesByWebsite("test_website_123");
      expect(categories.length).toBe(1);
      expect(categories[0].name).toBe("Maintenance");
      expect(categories[0].slug).toBe("maintenance");
    });
  });

  describe("SeoRepository", () => {
    it("provides default SEO configuration when none exists", () => {
      const mockClient: any = {};
      const repo = new SeoRepository(mockClient);
      const def = repo.getDefaultSEO("site_1");

      expect(def.websiteId).toBe("site_1");
      expect(def.technicalSettings.sitemapEnabled).toBe(true);
      expect(def.technicalSettings.customRobotsRules.length).toBeGreaterThan(0);
      expect(def.redirects).toEqual([]);
    });

    it("loads and maps existing SEO settings from Supabase", async () => {
      const mockClient: any = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                website_id: "site_custom",
                sitemap_enabled: true,
                include_blog_in_sitemap: true,
                custom_robots_rules: [{ userAgent: "*", allow: ["/"], disallow: ["/admin/"] }],
                google_search_console_verification: "google-token-123",
                bing_webmaster_verification: "bing-token-456",
                default_meta_title: "%title% | Custom Site",
                default_og_image: "https://example.com/og.jpg",
                redirects: [],
                schema_configs: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      };

      const repo = new SeoRepository(mockClient);
      const res = await repo.getSEOByWebsite("site_custom");

      expect(res.websiteId).toBe("site_custom");
      expect(res.technicalSettings.googleSearchConsoleVerification).toBe("google-token-123");
      expect(res.technicalSettings.defaultTitleTemplate).toBe("%title% | Custom Site");
    });
  });
});

