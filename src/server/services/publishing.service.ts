import { PageDocument } from "@/types/builder";
import { validatePageDocument } from "@/builder/schemas/document.schema";
import { generateRevisionId } from "@/lib/utils/id";
import { buildPublishedUrl } from "@/lib/utils/url";

export interface PublishValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PublishResult {
  success: boolean;
  revisionId?: string;
  publishedUrl?: string;
  publishedAt?: string;
  errors?: string[];
}

export interface StoredRevision {
  id: string;
  pageId: string;
  websiteId: string;
  revisionNumber: number;
  document: PageDocument;
  createdById?: string;
  createdAt: string;
}

/**
 * Publishing Pipeline Service
 * PRD.md Section 8 & Section 10:
 * - Validates document, SEO, and assets before publishing
 * - Creates an immutable snapshot revision
 * - Atomically updates published revision pointer
 * - Supports instant rollback to any prior revision
 */
export class PublishingService {
  private static revisionsStore = new Map<string, StoredRevision[]>();
  private static publishedPointers = new Map<string, string>(); // pageId -> revisionId

  /**
   * Pre-publish integrity check
   */
  public static validateBeforePublish(document: PageDocument): PublishValidationResult {
    const errors: string[] = [];

    // 1. Zod schema validation
    const schemaCheck = validatePageDocument(document);
    if (!schemaCheck.success) {
      errors.push(schemaCheck.error ?? "Invalid page document structure");
    }

    // 2. Minimum content check: page must have at least one section
    if (!document.sections || document.sections.length === 0) {
      errors.push("Cannot publish an empty page. Add at least one section.");
    }

    // 3. SEO title check
    if (!document.page?.title?.trim()) {
      errors.push("Page title is required for publishing.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Publish a page revision atomically
   */
  public static async publishPage(
    websiteId: string,
    pageId: string,
    subdomain: string,
    document: PageDocument,
    userId?: string
  ): Promise<PublishResult> {
    const validation = this.validateBeforePublish(document);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const pageRevisions = this.revisionsStore.get(pageId) ?? [];
    const nextRevisionNumber = pageRevisions.length + 1;
    const revisionId = generateRevisionId(pageId, nextRevisionNumber);

    // Deep clone document to create immutable snapshot
    const snapshot: PageDocument = JSON.parse(JSON.stringify(document));
    if (snapshot.page) {
      snapshot.page.status = "published";
    }

    const revision: StoredRevision = {
      id: revisionId,
      pageId,
      websiteId,
      revisionNumber: nextRevisionNumber,
      document: snapshot,
      createdById: userId,
      createdAt: new Date().toISOString(),
    };

    // Store immutable revision
    pageRevisions.push(revision);
    this.revisionsStore.set(pageId, pageRevisions);

    // Atomically point published pointer to this revision
    this.publishedPointers.set(pageId, revisionId);

    const slug = snapshot.page?.slug ?? "/";
    const publishedUrl = buildPublishedUrl(subdomain, slug);

    return {
      success: true,
      revisionId,
      publishedUrl,
      publishedAt: revision.createdAt,
    };
  }

  /**
   * Rollback a page to a specific prior revision
   */
  public static async rollbackRevision(
    pageId: string,
    targetRevisionId: string
  ): Promise<PublishResult> {
    const pageRevisions = this.revisionsStore.get(pageId) ?? [];
    const targetRevision = pageRevisions.find((r) => r.id === targetRevisionId);

    if (!targetRevision) {
      return {
        success: false,
        errors: [`Target revision ${targetRevisionId} not found for page ${pageId}`],
      };
    }

    // Point published pointer to target revision
    this.publishedPointers.set(pageId, targetRevisionId);

    return {
      success: true,
      revisionId: targetRevisionId,
      publishedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieve the currently published revision document for public rendering
   */
  public static getPublishedDocument(pageId: string): PageDocument | null {
    const publishedRevId = this.publishedPointers.get(pageId);
    if (!publishedRevId) return null;

    const pageRevisions = this.revisionsStore.get(pageId) ?? [];
    const rev = pageRevisions.find((r) => r.id === publishedRevId);
    return rev ? rev.document : null;
  }

  /**
   * Get all revisions for revision history UI
   */
  public static getPageRevisions(pageId: string): StoredRevision[] {
    return this.revisionsStore.get(pageId) ?? [];
  }

  /**
   * Reset store (for testing)
   */
  public static _reset(): void {
    this.revisionsStore.clear();
    this.publishedPointers.clear();
  }
}
