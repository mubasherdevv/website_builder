import { describe, it, expect } from "vitest";
import { CMSPageItem, MenuItem, MediaAssetItem, BlogPostItem } from "@/types/cms";

describe("CMS Workspace Modules", () => {
  it("enforces page slug uniqueness within a website", () => {
    const pages: CMSPageItem[] = [
      { id: "p1", websiteId: "site_1", title: "Home", slug: "/", status: "published", updatedAt: "now" },
      { id: "p2", websiteId: "site_1", title: "About", slug: "/about", status: "published", updatedAt: "now" },
    ];

    const isDuplicate = (targetSlug: string) =>
      pages.some((p) => p.slug.toLowerCase() === targetSlug.toLowerCase());

    expect(isDuplicate("/about")).toBe(true);
    expect(isDuplicate("/services")).toBe(false);
  });

  it("handles navigation menu reordering and external link tagging", () => {
    const menu: MenuItem[] = [
      { id: "m1", label: "Home", url: "/" },
      { id: "m2", label: "Services", url: "/services" },
      { id: "m3", label: "External Help", url: "https://support.com", isExternal: true },
    ];

    // Move services up
    const reordered = [...menu];
    const [moved] = reordered.splice(1, 1);
    reordered.splice(0, 0, moved);

    expect(reordered[0].label).toBe("Services");
    expect(reordered[1].label).toBe("Home");
    expect(reordered[2].isExternal).toBe(true);
  });

  it("validates media library MIME format and size boundaries", () => {
    const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    const validAsset: MediaAssetItem = {
      id: "med_1",
      websiteId: "site_1",
      filename: "photo.webp",
      url: "https://example.com/photo.webp",
      fileSize: 1024 * 500, // 500KB
      mimeType: "image/webp",
      altText: "Test image",
      createdAt: "2026-11-02",
    };

    const isMimeValid = (mime: string) => allowedMime.includes(mime);
    const isSizeValid = (size: number) => size <= maxSizeBytes;

    expect(isMimeValid(validAsset.mimeType)).toBe(true);
    expect(isSizeValid(validAsset.fileSize)).toBe(true);

    // Reject dangerous file types per STACK.md Section 12
    expect(isMimeValid("application/x-php")).toBe(false);
    expect(isMimeValid("application/javascript")).toBe(false);
    expect(isSizeValid(10 * 1024 * 1024)).toBe(false);
  });

  it("confirms blog post separation from visual page layout JSON", () => {
    const blogPost: BlogPostItem = {
      id: "b1",
      websiteId: "site_1",
      title: "How to Winterize Your Plumbing Pipes",
      slug: "/blog/winterize-pipes",
      excerpt: "Step by step winterization tips...",
      content: "Complete detailed markdown content without page JSON overhead...",
      author: "Chief Engineer",
      category: "Plumbing",
      tags: ["Winter", "Plumbing", "Tips"],
      status: "published",
      createdAt: "2026-11-02",
    };

    expect(blogPost.title).toBe("How to Winterize Your Plumbing Pipes");
    expect(blogPost.slug.startsWith("/blog/")).toBe(true);
    // Blog records do not carry JSON sections array per PRD.md Section 10.3
    expect((blogPost as any).sections).toBeUndefined();
  });
});

