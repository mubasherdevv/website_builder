import { describe, it, expect } from "vitest";
import { PageRepository } from "@/server/repositories/page.repository";
import { WebsiteRepository } from "@/server/repositories/website.repository";
import { PageDocument } from "@/types/builder";
import { modernPurplePreset, cleanTealPreset } from "@/themes/presets";

describe("Database Repositories & Revision Architecture", () => {
  const sampleDoc: PageDocument = {
    schemaVersion: 1,
    page: { id: "p1", title: "Home", slug: "/", status: "draft" },
    sections: [
      {
        id: "s1",
        componentId: "header.simple.v1",
        componentVersion: 1,
        props: { brandName: "Austin Roofing" },
      },
    ],
  };

  it("creates a page with initial draft revision #1", async () => {
    const repo = new PageRepository();
    const { page, revision } = await repo.createPage("site_1", "Home", "/", sampleDoc, "user_1");

    expect(page.id).toBeTruthy();
    expect(page.status).toBe("draft");
    expect(page.draft_revision_id).toBe(revision.id);
    expect(page.published_revision_id).toBeNull();
    expect(revision.revision_number).toBe(1);
    expect(revision.document.page.title).toBe("Home");
  });

  it("saves subsequent draft revisions with incrementing revision numbers", async () => {
    const repo = new PageRepository();
    const { page } = await repo.createPage("site_1", "Home", "/", sampleDoc);

    const doc2: PageDocument = {
      ...sampleDoc,
      sections: [
        {
          id: "s1",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: { brandName: "Austin Roofing Pro Updated" },
        },
      ],
    };

    const rev2 = await repo.saveDraftRevision(page.id, doc2, "user_1");
    expect(rev2.revision_number).toBe(2);

    const updatedPage = await repo.getPage(page.id);
    expect(updatedPage?.draft_revision_id).toBe(rev2.id);
    expect(updatedPage?.published_revision_id).toBeNull();

    const revisions = await repo.listPageRevisions(page.id);
    expect(revisions.length).toBe(2);
    expect(revisions[0].revision_number).toBe(2);
    expect(revisions[1].revision_number).toBe(1);
  });

  it("rejects persisting corrupted or malicious JSON into page revisions", async () => {
    const repo = new PageRepository();
    const { page } = await repo.createPage("site_1", "Home", "/", sampleDoc);

    const maliciousDoc = {
      schemaVersion: 1,
      page: { id: "p1", title: "<script>alert('xss')</script>", slug: "/", status: "draft" },
      sections: [],
    } as unknown as PageDocument;

    await expect(repo.saveDraftRevision(page.id, maliciousDoc)).rejects.toThrow(
      "Cannot persist invalid page document"
    );
  });

  it("atomically publishes a page and allows rollback to earlier revision", async () => {
    const repo = new PageRepository();
    const { page, revision: rev1 } = await repo.createPage("site_1", "Home", "/", sampleDoc);

    // Draft 2
    const doc2: PageDocument = {
      ...sampleDoc,
      sections: [
        {
          id: "s1",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: { brandName: "Version 2 Content" },
        },
      ],
    };
    const rev2 = await repo.saveDraftRevision(page.id, doc2);

    // Publish current draft (rev2)
    const published = await repo.publishPage(page.id);
    expect(published.status).toBe("published");
    expect(published.published_revision_id).toBe(rev2.id);

    // Rollback to rev1
    const rolledBack = await repo.rollbackToRevision(page.id, rev1.id);
    expect(rolledBack.published_revision_id).toBe(rev1.id);
  });

  it("WebsiteRepository handles creation, unique subdomains, and theme updates", async () => {
    const repo = new WebsiteRepository();
    const site = await repo.createWebsite("org_1", "Austin Roofing", "austin-roof", modernPurplePreset);

    expect(site.id).toBeTruthy();
    expect(site.subdomain).toBe("austin-roof");
    expect(site.status).toBe("draft");

    // Prevent duplicate subdomain
    await expect(
      repo.createWebsite("org_2", "Duplicate Site", "austin-roof", modernPurplePreset)
    ).rejects.toThrow('Subdomain "austin-roof" is already taken');

    // Retrieve by subdomain
    const fetched = await repo.getWebsiteBySubdomain("austin-roof");
    expect(fetched?.id).toBe(site.id);

    // Update Theme
    const updatedSite = await repo.updateTheme(site.id, cleanTealPreset);
    expect(updatedSite.theme_config.id).toBe(cleanTealPreset.id);

    // Update Status
    const publishedSite = await repo.updateStatus(site.id, "published");
    expect(publishedSite.status).toBe("published");
  });
});

