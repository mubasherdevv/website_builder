import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogPostRow, mapBlogPostRow } from "@/lib/database/repositories/blog.repo";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const site = searchParams.get("site");

    const admin = createAdminClient();

    // Query blog post by slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any).from("blog_posts").select("*").eq("slug", slug);
    if (site) {
      query = query.eq("website_id", site);
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Article not found in database" },
        { status: 404 }
      );
    }

    const row = data as BlogPostRow;
    const post = mapBlogPostRow(row);

    // Category
    let category = null;
    if (row.category_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: catData } = await (admin as any)
        .from("blog_categories")
        .select("*")
        .eq("id", row.category_id)
        .maybeSingle();
      if (catData) category = catData;
    }

    // Related posts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: relatedData } = await (admin as any)
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image, published_at")
      .eq("website_id", row.website_id)
      .eq("status", "published")
      .neq("id", row.id)
      .limit(3);

    return NextResponse.json({
      success: true,
      post,
      category,
      relatedPosts: relatedData || [],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load article" },
      { status: 500 }
    );
  }
}

