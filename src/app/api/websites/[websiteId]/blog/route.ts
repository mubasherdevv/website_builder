import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogRepository } from "@/lib/database/repositories/blog.repo";
import { BlogPost, BlogCategory } from "@/types/blog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveEffectiveWebsiteId(admin: any, websiteId: string): Promise<string> {
  const { data: site } = await admin
    .from("websites")
    .select("id")
    .eq("id", websiteId)
    .maybeSingle();

  if (site) return site.id;

  const { data: latestSite } = await admin
    .from("websites")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latestSite?.id || websiteId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const admin = createAdminClient();
    const repo = new BlogRepository(admin);
    const websiteId = await resolveEffectiveWebsiteId(admin, params.websiteId);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "posts" | "categories" | "all"

    if (type === "categories") {
      const categories = await repo.getCategoriesByWebsite(websiteId);
      return NextResponse.json({ success: true, categories });
    }

    if (type === "posts") {
      const posts = await repo.getPostsByWebsite(websiteId);
      return NextResponse.json({ success: true, posts });
    }

    // Default: Return both
    const [posts, categories] = await Promise.all([
      repo.getPostsByWebsite(websiteId),
      repo.getCategoriesByWebsite(websiteId),
    ]);

    return NextResponse.json({ success: true, posts, categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch blog data";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const admin = createAdminClient();
    const repo = new BlogRepository(admin);
    const websiteId = await resolveEffectiveWebsiteId(admin, params.websiteId);

    const body = await request.json();
    const { action, post, category, id } = body;

    if (action === "save_post") {
      if (!post || !post.title || !post.slug) {
        return NextResponse.json(
          { success: false, error: "Title and slug are required" },
          { status: 400 }
        );
      }
      const savedPost = await repo.savePost({
        ...post,
        websiteId,
      } as BlogPost);
      return NextResponse.json({ success: true, post: savedPost });
    }

    if (action === "delete_post") {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Post ID is required" },
          { status: 400 }
        );
      }
      await repo.deletePost(id);
      return NextResponse.json({ success: true });
    }

    if (action === "save_category") {
      if (!category || !category.name || !category.slug) {
        return NextResponse.json(
          { success: false, error: "Category name and slug are required" },
          { status: 400 }
        );
      }
      const savedCategory = await repo.saveCategory({
        ...category,
        websiteId,
      } as BlogCategory);
      return NextResponse.json({ success: true, category: savedCategory });
    }

    if (action === "delete_category") {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Category ID is required" },
          { status: 400 }
        );
      }
      await repo.deleteCategory(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process blog request";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
