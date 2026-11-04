import { describe, it, expect, beforeEach } from "vitest";
import {
  BlogManagerService,
  sanitizeBlogSlug,
  calculateReadingTime,
  computeBlogSEOHealth,
} from "@/lib/services/blog-manager.service";
import { StructuredRichTextJSON } from "@/types/blog";

describe("Phase 19: Complete Website Blog CMS & Architecture", () => {
  const siteA = "site_alpha_roofing";
  const siteB = "site_beta_plumbing";

  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  describe("1. Slug Sanitization & Reading Time Estimation", () => {
    it("sanitizes blog post slugs to clean URL-safe kebab-case format", () => {
      expect(sanitizeBlogSlug("5 Critical Spring Roofing Checks! (2026)")).toBe(
        "5-critical-spring-roofing-checks-2026"
      );
      expect(sanitizeBlogSlug("  ///Special Commercial Shingles///  ")).toBe(
        "special-commercial-shingles"
      );
      expect(sanitizeBlogSlug("")).toBe("untitled-post");
    });

    it("calculates accurate reading time in minutes based on block content word count", () => {
      const shortContent: StructuredRichTextJSON = {
        version: 1,
        blocks: [
          { id: "b1", type: "paragraph", text: "This is a quick two-sentence summary." },
        ],
      };
      expect(calculateReadingTime(shortContent)).toBe(1);

      // Generate ~600 words (approx 3 minutes reading time at 200 wpm)
      const words600 = new Array(600).fill("word").join(" ");
      const longContent: StructuredRichTextJSON = {
        version: 1,
        blocks: [{ id: "b1", type: "paragraph", text: words600 }],
      };
      expect(calculateReadingTime(longContent)).toBe(3);
    });
  });

  describe("2. Blog SEO Health Scoring Engine", () => {
    it("scores SEO status accurately based on title length, description length, and keyword presence", () => {
      // Missing
      expect(computeBlogSEOHealth()).toBe("missing");
      expect(computeBlogSEOHealth({ metaTitle: "", metaDescription: "" })).toBe("missing");

      // Warning: missing target focus keyword from title
      expect(
        computeBlogSEOHealth({
          metaTitle: "General Home Maintenance Checklist",
          metaDescription:
            "A comprehensive overview of inspecting roofs and cleaning gutters during summer storms in Texas.",
          focusKeyword: "roof inspection",
        })
      ).toBe("warning");

      // Good: proper length (25-70 chars title, 50-170 chars desc) and keyword present in both
      expect(
        computeBlogSEOHealth({
          metaTitle: "Certified Roof Inspection Checklist for Texas",
          metaDescription:
            "Schedule your preventative roof inspection with our certified local team to prevent storm water damage.",
          focusKeyword: "roof inspection",
        })
      ).toBe("good");
    });
  });

  describe("3. Post CRUD, Duplication & Tenant Isolation", () => {
    it("initializes default seeded blog posts and categories for a website", () => {
      const posts = BlogManagerService.getPosts(siteA);
      expect(posts.length).toBeGreaterThanOrEqual(2);
      expect(posts.some((p) => p.status === "published")).toBe(true);

      const cats = BlogManagerService.getCategories(siteA);
      expect(cats.length).toBeGreaterThanOrEqual(3);
    });

    it("creates a new blog post and enforces website-level slug uniqueness", () => {
      const res = BlogManagerService.createPost(siteA, {
        title: "Commercial Shingle Replacement",
        slug: "commercial-shingle-replacement",
        excerpt: "Guide to commercial shingle selection.",
        author: { name: "Marcus Vance", role: "Inspector" },
        status: "draft",
        seo: {
          metaTitle: "Commercial Shingle Replacement Guide",
          metaDescription: "Step by step guide for building managers replacing asphalt shingles.",
          focusKeyword: "shingle replacement",
        },
      });

      expect(res.success).toBe(true);
      expect(res.post?.slug).toBe("commercial-shingle-replacement");
      expect(res.post?.readingTimeMinutes).toBeGreaterThanOrEqual(1);

      // Duplicate slug on same website rejected
      const dup = BlogManagerService.createPost(siteA, {
        title: "Another Shingle Post",
        slug: "commercial-shingle-replacement",
      });
      expect(dup.success).toBe(false);
      expect(dup.error).toMatch(/already exists/i);

      // Same slug on different website allowed (Tenant Isolation)
      const resB = BlogManagerService.createPost(siteB, {
        title: "Commercial Shingle Replacement",
        slug: "commercial-shingle-replacement",
      });
      expect(resB.success).toBe(true);
      expect(resB.post?.slug).toBe("commercial-shingle-replacement");
    });

    it("duplicates posts cleanly with unique copy slugs and draft status", () => {
      const posts = BlogManagerService.getPosts(siteA);
      const original = posts[0];

      const dupRes = BlogManagerService.duplicatePost(siteA, original.id);
      expect(dupRes.success).toBe(true);
      expect(dupRes.post?.id).not.toBe(original.id);
      expect(dupRes.post?.title).toBe(`${original.title} (Copy)`);
      expect(dupRes.post?.slug).toBe(`${original.slug}-copy`);
      expect(dupRes.post?.status).toBe("draft");
      expect(dupRes.post?.publishedAt).toBeNull();
    });

    it("updates and toggles publication status cleanly", () => {
      const posts = BlogManagerService.getPosts(siteA);
      const post = posts[0];
      const initialStatus = post.status;

      const toggleRes = BlogManagerService.togglePublish(siteA, post.id);
      expect(toggleRes.success).toBe(true);
      expect(toggleRes.status).toBe(initialStatus === "published" ? "draft" : "published");
    });

    it("deletes a post correctly", () => {
      const newPost = BlogManagerService.createPost(siteA, {
        title: "Temporary Post",
        slug: "temporary-post",
      });
      expect(newPost.success).toBe(true);

      const delRes = BlogManagerService.deletePost(siteA, newPost.post!.id);
      expect(delRes.success).toBe(true);

      const found = BlogManagerService.getPostById(siteA, newPost.post!.id);
      expect(found).toBeNull();
    });
  });

  describe("4. Category and Tag Silo Integrity", () => {
    it("creates, updates, and protects categories from deletion while in use", () => {
      const newCat = BlogManagerService.createCategory(siteA, {
        name: "Metal Roofing",
        slug: "metal-roofing",
        description: "Standing seam metal roofing guides",
      });
      expect(newCat.success).toBe(true);
      const catId = newCat.category!.id;

      // Assign to a post
      const post = BlogManagerService.createPost(siteA, {
        title: "Metal Roof Advantages",
        slug: "metal-roof-advantages",
        categoryId: catId,
      });
      expect(post.success).toBe(true);

      // Attempting deletion while in use must fail
      const delFail = BlogManagerService.deleteCategory(siteA, catId);
      expect(delFail.success).toBe(false);
      expect(delFail.error).toMatch(/assigned to one or more/i);

      // Reassign or delete post, then deletion succeeds
      BlogManagerService.deletePost(siteA, post.post!.id);
      const delSuccess = BlogManagerService.deleteCategory(siteA, catId);
      expect(delSuccess.success).toBe(true);
    });

    it("creates tags and cascades deletion to remove tagIds from posts", () => {
      const tagRes = BlogManagerService.createTag(siteA, "Flashing");
      expect(tagRes.success).toBe(true);
      const tagId = tagRes.tag!.id;

      const post = BlogManagerService.createPost(siteA, {
        title: "Chimney Flashing Fixes",
        slug: "chimney-flashing-fixes",
        tagIds: [tagId],
      });
      expect(post.post?.tagIds).toContain(tagId);

      // Delete tag
      BlogManagerService.deleteTag(siteA, tagId);
      const reloadedPost = BlogManagerService.getPostById(siteA, post.post!.id);
      expect(reloadedPost?.tagIds).not.toContain(tagId);
    });
  });

  describe("5. Scheduled Publishing Engine", () => {
    it("auto-publishes scheduled posts whose scheduledAt timestamp has passed", () => {
      const pastTime = new Date(Date.now() - 60000).toISOString(); // 1 minute ago

      const schedPost = BlogManagerService.createPost(siteA, {
        title: "Scheduled Release Post",
        slug: "scheduled-release-post",
        status: "scheduled",
        scheduledAt: pastTime,
      });
      expect(schedPost.post?.status).toBe("scheduled");

      // Run evaluation
      const updatedCount = BlogManagerService.evaluateScheduledPosts(siteA);
      expect(updatedCount).toBeGreaterThanOrEqual(1);

      const evaluated = BlogManagerService.getPostById(siteA, schedPost.post!.id);
      expect(evaluated?.status).toBe("published");
      expect(evaluated?.publishedAt).toBeTruthy();
      expect(evaluated?.scheduledAt).toBeNull();
    });
  });
});

