import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageRepository } from "@/lib/database/repositories/page.repo";
import { PageDocument } from "@/types/builder";
import { NotFoundError, ValidationError, handleDatabaseError } from "@/lib/database/errors";

interface RouteParams {
  params: {
    websiteId: string;
    pageId: string;
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves websiteId if it is a subdomain or slug into its UUID.
 */
async function resolveWebsiteId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  websiteId: string
): Promise<string> {
  if (UUID_REGEX.test(websiteId)) {
    return websiteId;
  }

  const cleanSub = websiteId.replace(/\.securesite\.io$/, "").replace(/\.localhost.*$/, "");
  const { data: site } = await admin
    .from("websites")
    .select("id")
    .or(`subdomain.eq.${cleanSub},subdomain.eq.${websiteId},custom_domain.eq.${cleanSub},custom_domain.eq.${websiteId}`)
    .maybeSingle();

  if (site) return site.id;
  return websiteId;
}

/**
 * Frontend slug (jaise "home" ya "page_home") ko database UUID mein resolve karta hai.
 * Database mein home page ka slug "/" hota hai.
 */
async function resolvePageId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  websiteId: string,
  pageId: string
): Promise<string> {
  const actualWebsiteId = await resolveWebsiteId(admin, websiteId);

  if (UUID_REGEX.test(pageId)) {
    return pageId;
  }

  // Try exact slug candidates
  const slugCandidates: string[] = [pageId];

  // Frontend may send "page_home" — strip "page_" prefix
  if (pageId.startsWith("page_")) {
    slugCandidates.push(pageId.slice("page_".length));
  }

  // Home page variants in database: "/" or ""
  if (pageId === "home" || pageId === "page_home" || pageId === "index") {
    slugCandidates.push("/", "");
  }

  if (!pageId.startsWith("/")) {
    slugCandidates.push(`/${pageId}`);
  }

  for (const slug of slugCandidates) {
    const { data: page, error } = await admin
      .from("pages")
      .select("id")
      .eq("website_id", actualWebsiteId)
      .eq("slug", slug)
      .maybeSingle();

    if (error) handleDatabaseError(error, "Failed to resolve page slug");
    if (page) return page.id;
  }

  // Fallback: If looking for home, find any page with slug = "/"
  if (pageId === "home" || pageId === "page_home") {
    const { data: homePage } = await admin
      .from("pages")
      .select("id")
      .eq("website_id", actualWebsiteId)
      .eq("slug", "/")
      .maybeSingle();
    if (homePage) return homePage.id;
  }

  throw new NotFoundError("Page", pageId);
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { pageId, websiteId } = params;
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get("mode") as "draft" | "published") || "draft";

    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const resolvedPageId = await resolvePageId(admin, websiteId, pageId);
    const data = await repo.getPageWithRevision(resolvedPageId, mode);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Page not found" },
      { status: 404 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { pageId, websiteId } = params;
    const body = await request.json();
    const { document, userId } = body as { document: PageDocument; userId?: string };

    if (!document || !document.sections) {
      return NextResponse.json(
        { success: false, error: "Valid PageDocument is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const resolvedPageId = await resolvePageId(admin, websiteId, pageId);
    const revision = await repo.savePageDraft(resolvedPageId, document, userId);
    return NextResponse.json({ success: true, revision });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 400 }
      );
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { pageId, websiteId } = params;
    const body = await request.json().catch(() => ({}));
    const { document } = body as { document?: PageDocument };
    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const resolvedPageId = await resolvePageId(admin, websiteId, pageId);

    // Agar koi draft revision nahi hai, to pehle document ko draft ke roop mein save karein.
    // Isse alag se "Save Draft" button ki zaroorat nahi padti — sirf Publish click karne se kaam chal jayega.
    if (document) {
      await repo.savePageDraft(resolvedPageId, document);
    }

    const page = await repo.publishPage(resolvedPageId);
    return NextResponse.json({ success: true, page });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 400 }
      );
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to publish page" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { pageId, websiteId } = params;
    const admin = createAdminClient();
    const repo = new PageRepository(admin);

    const resolvedPageId = await resolvePageId(admin, websiteId, pageId);
    await repo.deletePage(resolvedPageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 400 }
      );
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete page" },
      { status: 500 }
    );
  }
}

