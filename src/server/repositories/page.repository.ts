import { PageDocument } from "@/types/builder";
import { validatePageDocument } from "@/builder/schemas/document.schema";
import { generateEntityId } from "@/lib/utils/id";
import { NotFoundError, ValidationError } from "@/server/errors";

export interface PageRecord {
  id: string;
  website_id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  draft_revision_id: string | null;
  published_revision_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageRevisionRecord {
  id: string;
  page_id: string;
  revision_number: number;
  document: PageDocument;
  created_by?: string;
  created_at: string;
}

/**
 * In-memory Page repository
 * Mirrors Supabase SQL schema semantics with strong type validation and atomic revision pointers.
 */
export class PageRepository {
  private pages = new Map<string, PageRecord>();
  private revisions = new Map<string, PageRevisionRecord>();

  /**
   * Private helper to fetch all revisions for a specific page
   */
  private findRevisionsByPageId(pageId: string): PageRevisionRecord[] {
    const results: PageRevisionRecord[] = [];
    this.revisions.forEach((rev) => {
      if (rev.page_id === pageId) {
        results.push(rev);
      }
    });
    return results;
  }

  public async createPage(
    websiteId: string,
    title: string,
    slug: string,
    initialDoc: PageDocument,
    userId?: string
  ): Promise<{ page: PageRecord; revision: PageRevisionRecord }> {
    const validation = validatePageDocument(initialDoc);
    if (!validation.success) {
      throw new ValidationError(`Cannot persist invalid page document: ${validation.error}`);
    }

    const pageId = generateEntityId("page");
    const revisionId = generateEntityId("rev");
    const now = new Date().toISOString();

    const revision: PageRevisionRecord = {
      id: revisionId,
      page_id: pageId,
      revision_number: 1,
      document: validation.data as PageDocument,
      created_by: userId,
      created_at: now,
    };

    const page: PageRecord = {
      id: pageId,
      website_id: websiteId,
      title,
      slug,
      status: "draft",
      draft_revision_id: revisionId,
      published_revision_id: null,
      created_at: now,
      updated_at: now,
    };

    this.revisions.set(revisionId, revision);
    this.pages.set(pageId, page);

    return { page, revision };
  }

  public async saveDraftRevision(
    pageId: string,
    doc: PageDocument,
    userId?: string
  ): Promise<PageRevisionRecord> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new NotFoundError("Page", pageId);
    }

    const validation = validatePageDocument(doc);
    if (!validation.success) {
      throw new ValidationError(`Cannot persist invalid page document: ${validation.error}`);
    }

    const existingRevs = this.findRevisionsByPageId(pageId);
    const nextRevisionNumber = existingRevs.length + 1;
    const revisionId = generateEntityId("rev");
    const now = new Date().toISOString();

    const newRevision: PageRevisionRecord = {
      id: revisionId,
      page_id: pageId,
      revision_number: nextRevisionNumber,
      document: validation.data as PageDocument,
      created_by: userId,
      created_at: now,
    };

    this.revisions.set(revisionId, newRevision);

    page.draft_revision_id = revisionId;
    page.updated_at = now;
    this.pages.set(pageId, page);

    return newRevision;
  }

  /**
   * Atomic Publish: validates revision and swaps published_revision_id
   * PRD.md Section 5.5 & STACK.md Section 10
   */
  public async publishPage(pageId: string, revisionId?: string): Promise<PageRecord> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new NotFoundError("Page", pageId);
    }

    const targetRevId = revisionId ?? page.draft_revision_id;
    if (!targetRevId) {
      throw new ValidationError("No draft revision to publish");
    }

    const revision = this.revisions.get(targetRevId);
    if (!revision) {
      throw new NotFoundError("Revision", targetRevId);
    }

    const validation = validatePageDocument(revision.document);
    if (!validation.success) {
      throw new ValidationError(`Publish validation failed: ${validation.error}`);
    }

    page.published_revision_id = targetRevId;
    page.status = "published";
    page.updated_at = new Date().toISOString();
    this.pages.set(pageId, page);

    return page;
  }

  /**
   * Rollback: Restores a previous published revision
   */
  public async rollbackToRevision(pageId: string, targetRevisionId: string): Promise<PageRecord> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new NotFoundError("Page", pageId);
    }

    const revision = this.revisions.get(targetRevisionId);
    if (!revision || revision.page_id !== pageId) {
      throw new ValidationError(
        `Invalid rollback target: revision ${targetRevisionId} does not belong to page ${pageId}`
      );
    }

    page.published_revision_id = targetRevisionId;
    page.updated_at = new Date().toISOString();
    this.pages.set(pageId, page);

    return page;
  }

  public async getPage(pageId: string): Promise<PageRecord | null> {
    return this.pages.get(pageId) ?? null;
  }

  public async getRevision(revisionId: string): Promise<PageRevisionRecord | null> {
    return this.revisions.get(revisionId) ?? null;
  }

  public async listPageRevisions(pageId: string): Promise<PageRevisionRecord[]> {
    return this.findRevisionsByPageId(pageId).sort(
      (a, b) => b.revision_number - a.revision_number
    );
  }
}
