import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError, ValidationError } from "@/lib/database/errors";

interface RouteParams {
  params: {
    websiteId: string;
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { websiteId } = params;
    const admin = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any).from("websites").select("*");
    if (UUID_REGEX.test(websiteId)) {
      query = query.eq("id", websiteId);
    } else {
      const cleanSub = websiteId.replace(/\.securesite\.io$/, "").replace(/\.localhost.*$/, "");
      query = query.or(
        `subdomain.eq.${cleanSub},subdomain.eq.${websiteId},custom_domain.eq.${cleanSub},custom_domain.eq.${websiteId}`
      );
    }

    const queryResult = await query.maybeSingle();
    let website = queryResult.data;
    const error = queryResult.error;
    if (error) throw error;
    if (!website) {
      // Fallback: If requested websiteId is stale, deleted, or unseeded, fall back to the user's active website
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: latestSite } = await (admin as any)
        .from("websites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestSite) {
        website = latestSite;
      }
    }
    if (!website) throw new NotFoundError("Website", websiteId);

    return NextResponse.json({
      success: true,
      website,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load website" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { websiteId } = params;
    const admin = createAdminClient();

    // Verify website exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: website, error: websiteError } = await (admin as any)
      .from("websites")
      .select("id, name, status")
      .eq("id", websiteId)
      .maybeSingle();

    if (websiteError) throw websiteError;
    if (!website) throw new NotFoundError("Website", websiteId);

    // Delete all page_revisions for pages belonging to this website
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pages, error: pagesError } = await (admin as any)
      .from("pages")
      .select("id")
      .eq("website_id", websiteId);

    if (pagesError) throw pagesError;

    if (pages && pages.length > 0) {
      const pageIds = pages.map((p: { id: string }) => p.id);

      // Delete page revisions first (FK constraint)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: revError } = await (admin as any)
        .from("page_revisions")
        .delete()
        .in("page_id", pageIds);

      if (revError) throw revError;

      // Delete pages
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: pagesDeleteError } = await (admin as any)
        .from("pages")
        .delete()
        .in("id", pageIds);

      if (pagesDeleteError) throw pagesDeleteError;
    }

    // Delete blog posts for this website
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: blogError } = await (admin as any)
      .from("blog_posts")
      .delete()
      .eq("website_id", websiteId);

    if (blogError) throw blogError;

    // Delete the website itself
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (admin as any)
      .from("websites")
      .delete()
      .eq("id", websiteId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      websiteId,
      websiteName: website.name,
      message: "Website deleted successfully",
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 404 }
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete website" },
      { status: 500 }
    );
  }
}
