import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/types/database";
import { PageDocument } from "@/types/builder";
import {
  handleDatabaseError,
  NotFoundError,
  ValidationError,
} from "@/lib/database/errors";

export type PageRow = Database["public"]["Tables"]["pages"]["Row"];
export type PageRevisionRow = Database["public"]["Tables"]["page_revisions"]["Row"];

export class PageRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * List all pages belonging to a website
   */
  async listPagesByWebsite(websiteId: string): Promise<PageRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("pages")
      .select("*")
      .eq("website_id", websiteId)
      .order("created_at", { ascending: true });

    if (error) handleDatabaseError(error, "Failed to list website pages");
    return (data as PageRow[]) || [];
  }

  /**
   * Get page by ID along with its active draft/published document revision
   */
  async getPageWithRevision(
    pageId: string,
    revisionType: "draft" | "published" = "draft"
  ): Promise<{ page: PageRow; document: PageDocument | null }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: page, error } = await (this.client as any)
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .maybeSingle();

    if (error) handleDatabaseError(error, "Failed to fetch page");
    if (!page) throw new NotFoundError("Page", pageId);

    const typedPage = page as PageRow;

    const targetRevId =
      revisionType === "published"
        ? typedPage.published_revision_id || typedPage.draft_revision_id
        : typedPage.draft_revision_id;

    if (!targetRevId) {
      return { page: typedPage, document: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rev, error: revError } = await (this.client as any)
      .from("page_revisions")
      .select("*")
      .eq("id", targetRevId)
      .maybeSingle();

    if (revError) handleDatabaseError(revError, "Failed to fetch page revision");

    return {
      page: typedPage,
      document: ((rev as PageRevisionRow)?.document as unknown as PageDocument) || null,
    };
  }

  /**
   * Save a new document revision for a page (Draft mode)
   */
  async savePageDraft(
    pageId: string,
    document: PageDocument,
    userId?: string
  ): Promise<PageRevisionRow> {
    // Ensure the page exists before creating a revision
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: page, error: pageError } = await (this.client as any)
      .from("pages")
      .select("id")
      .eq("id", pageId)
      .maybeSingle();

    if (pageError) handleDatabaseError(pageError, "Failed to verify page exists");
    if (!page) throw new NotFoundError("Page", pageId);

    // Get latest revision count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error: countError } = await (this.client as any)
      .from("page_revisions")
      .select("*", { count: "exact", head: true })
      .eq("page_id", pageId);

    if (countError) handleDatabaseError(countError, "Failed to count revisions");

    const nextRevNum = (count || 0) + 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newRev, error: revError } = await (this.client as any)
      .from("page_revisions")
      .insert({
        page_id: pageId,
        revision_number: nextRevNum,
        document: document as unknown as Json,
        created_by: userId || null,
      })
      .select()
      .single();

    if (revError) handleDatabaseError(revError, "Failed to create page revision");

    const typedRev = newRev as PageRevisionRow;

    // Update draft revision pointer on page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (this.client as any)
      .from("pages")
      .update({
        draft_revision_id: typedRev.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId);

    if (updateError) handleDatabaseError(updateError, "Failed to update page draft pointer");

    return typedRev;
  }

  /**
   * Publish active draft revision to production
   */
  async publishPage(pageId: string): Promise<PageRow> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: page, error } = await (this.client as any)
      .from("pages")
      .select("id, draft_revision_id")
      .eq("id", pageId)
      .maybeSingle();

    if (error) handleDatabaseError(error, "Failed to fetch page");
    if (!page) throw new NotFoundError("Page", pageId);

    if (!page.draft_revision_id) {
      throw new ValidationError(
        `No draft revision found for page "${pageId}". Save the page as a draft before publishing.`
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedPage, error: updateError } = await (this.client as any)
      .from("pages")
      .update({
        published_revision_id: page.draft_revision_id,
        status: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId)
      .select()
      .single();

    if (updateError) handleDatabaseError(updateError, "Failed to publish page");
    return updatedPage as PageRow;
  }

  /**
   * Create a new page with initial document revision
   */
  async createPage(
    websiteId: string,
    title: string,
    slug: string,
    initialDocument?: PageDocument
  ): Promise<{ page: PageRow; revision?: PageRevisionRow }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: page, error } = await (this.client as any)
      .from("pages")
      .insert({
        website_id: websiteId,
        title,
        slug,
        status: "draft",
      })
      .select()
      .single();

    if (error) handleDatabaseError(error, "Failed to create page");

    const typedPage = page as PageRow;

    let rev: PageRevisionRow | undefined;
    if (initialDocument) {
      rev = await this.savePageDraft(typedPage.id, initialDocument);
    }

    return { page: typedPage, revision: rev };
  }

  /**
   * Delete a page and cascade its revisions
   */
  async deletePage(pageId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.client as any).from("pages").delete().eq("id", pageId);
    if (error) handleDatabaseError(error, "Failed to delete page");
  }
}
