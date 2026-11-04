import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/types/database";
import { PageDocument } from "@/types/builder";
import {
  handleDatabaseError,
  NotFoundError,
} from "@/lib/database/errors";

export type PageRow = Database["public"]["Tables"]["pages"]["Row"];
export type PageRevisionRow = Database["public"]["Tables"]["page_revisions"]["Row"];

export class PageRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * List all pages belonging to a website
   */
  async listPagesByWebsite(websiteId: string): Promise<PageRow[]> {
    const { data, error } = await this.client
      .from("pages")
      .select("*")
      .eq("website_id", websiteId)
      .order("created_at", { ascending: true });

    if (error) handleDatabaseError(error, "Failed to list website pages");
    return data || [];
  }

  /**
   * Get page by ID along with its active draft/published document revision
   */
  async getPageWithRevision(
    pageId: string,
    revisionType: "draft" | "published" = "draft"
  ): Promise<{ page: PageRow; document: PageDocument | null }> {
    const { data: page, error } = await this.client
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .maybeSingle();

    if (error) handleDatabaseError(error, "Failed to fetch page");
    if (!page) throw new NotFoundError("Page", pageId);

    const targetRevId =
      revisionType === "published"
        ? page.published_revision_id || page.draft_revision_id
        : page.draft_revision_id;

    if (!targetRevId) {
      return { page, document: null };
    }

    const { data: rev, error: revError } = await this.client
      .from("page_revisions")
      .select("*")
      .eq("id", targetRevId)
      .maybeSingle();

    if (revError) handleDatabaseError(revError, "Failed to fetch page revision");

    return {
      page,
      document: (rev?.document as unknown as PageDocument) || null,
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
    // Get latest revision count
    const { count } = await this.client
      .from("page_revisions")
      .select("*", { count: "exact", head: true })
      .eq("page_id", pageId);

    const nextRevNum = (count || 0) + 1;

    const { data: newRev, error: revError } = await this.client
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

    // Update draft revision pointer on page
    const { error: updateError } = await this.client
      .from("pages")
      .update({
        draft_revision_id: newRev.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId);

    if (updateError) handleDatabaseError(updateError, "Failed to update page draft pointer");

    return newRev;
  }

  /**
   * Publish active draft revision to production
   */
  async publishPage(pageId: string): Promise<PageRow> {
    const { data: page, error } = await this.client
      .from("pages")
      .select("draft_revision_id")
      .eq("id", pageId)
      .single();

    if (error || !page?.draft_revision_id) {
      throw new NotFoundError("Draft revision for page", pageId);
    }

    const { data: updatedPage, error: updateError } = await this.client
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
    return updatedPage;
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
    const { data: page, error } = await this.client
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

    let rev: PageRevisionRow | undefined;
    if (initialDocument) {
      rev = await this.savePageDraft(page.id, initialDocument);
    }

    return { page, revision: rev };
  }

  /**
   * Delete a page and cascade its revisions
   */
  async deletePage(pageId: string): Promise<void> {
    const { error } = await this.client.from("pages").delete().eq("id", pageId);
    if (error) handleDatabaseError(error, "Failed to delete page");
  }
}
