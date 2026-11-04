import { describe, it, expect, beforeEach } from "vitest";
import { PublishingService } from "@/server/services/publishing.service";
import { localServiceTemplate } from "@/templates/definitions/local-service.template";
import { PageDocument } from "@/types/builder";

describe("Phase 11: Publishing Pipeline & Revisions", () => {
  beforeEach(() => {
    PublishingService._reset();
  });

  it("validates document integrity before publishing", () => {
    const validDoc: PageDocument = {
      ...localServiceTemplate.pages[0],
      page: {
        ...localServiceTemplate.pages[0].page,
        title: "Austin Plumbing Co.",
        slug: "/",
      },
    };

    const validation = PublishingService.validateBeforePublish(validDoc);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("fails pre-publish validation when page has no sections", () => {
    const emptyDoc: PageDocument = {
      ...localServiceTemplate.pages[0],
      sections: [],
    };

    const validation = PublishingService.validateBeforePublish(emptyDoc);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("Cannot publish an empty page. Add at least one section.");
  });

  it("fails pre-publish validation when page has an empty title", () => {
    const invalidDoc: PageDocument = {
      ...localServiceTemplate.pages[0],
      page: {
        ...localServiceTemplate.pages[0].page,
        title: "",
        slug: "/",
      },
    };

    const validation = PublishingService.validateBeforePublish(invalidDoc);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("Page title is required for publishing.");
  });

  it("creates an immutable snapshot revision and updates the published pointer", async () => {
    const doc: PageDocument = {
      ...localServiceTemplate.pages[0],
      page: {
        ...localServiceTemplate.pages[0].page,
        title: "Austin Elite Plumbing",
        slug: "/",
      },
    };

    const result = await PublishingService.publishPage(
      "site-1",
      "page-home",
      "austin-plumbing",
      doc,
      "user-1"
    );

    expect(result.success).toBe(true);
    expect(result.revisionId).toBeDefined();
    expect(result.publishedUrl).toContain("austin-plumbing.securesite.io");

    // Verify stored snapshot is marked published
    const published = PublishingService.getPublishedDocument("page-home");
    expect(published).not.toBeNull();
    expect(published?.page.status).toBe("published");
    expect(published?.page.title).toBe("Austin Elite Plumbing");

    // Verify revision history has 1 entry
    const revisions = PublishingService.getPageRevisions("page-home");
    expect(revisions).toHaveLength(1);
    expect(revisions[0].revisionNumber).toBe(1);
  });

  it("supports rollback to a prior immutable revision", async () => {
    const docV1: PageDocument = {
      ...localServiceTemplate.pages[0],
      page: { ...localServiceTemplate.pages[0].page, title: "Title Version 1", slug: "/" },
    };

    const docV2: PageDocument = {
      ...localServiceTemplate.pages[0],
      page: { ...localServiceTemplate.pages[0].page, title: "Title Version 2", slug: "/" },
    };

    // Publish V1
    const pub1 = await PublishingService.publishPage("site-1", "page-home", "austin", docV1);
    // Publish V2
    await PublishingService.publishPage("site-1", "page-home", "austin", docV2);

    expect(PublishingService.getPublishedDocument("page-home")?.page.title).toBe("Title Version 2");

    // Rollback to V1
    const rollback = await PublishingService.rollbackRevision("page-home", pub1.revisionId!);
    expect(rollback.success).toBe(true);

    // Published document is now back to V1
    expect(PublishingService.getPublishedDocument("page-home")?.page.title).toBe("Title Version 1");
  });
});
