import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/types/database";
import { BlogPost, BlogCategory } from "@/types/blog";
import { handleDatabaseError } from "@/lib/database/errors";

export type BlogCategoryRow = Database["public"]["Tables"]["blog_categories"]["Row"];
export type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

/**
 * Single source of truth for turning a `blog_posts` database row into the
 * app-level `BlogPost` shape. Nullable columns are normalised here so API
 * routes, server components and the repository cannot drift apart.
 */
export function mapBlogPostRow(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    websiteId: row.website_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    content: (row.content as unknown as BlogPost["content"]) || { version: 1, blocks: [] },
    featuredImage: row.featured_image || "",
    featuredImageAlt: row.featured_image_alt || undefined,
    imageCaption: row.image_caption || undefined,
    author: (row.author as unknown as BlogPost["author"]) || { id: "author_1", name: "Author" },
    categoryId: row.category_id || undefined,
    tagIds: (row.tag_ids as unknown as string[]) || [],
    status: row.status as BlogPost["status"],
    publishedAt: row.published_at,
    scheduledAt: row.scheduled_at,
    readingTimeMinutes: row.reading_time_minutes || 1,
    seo: (row.seo as unknown as BlogPost["seo"]) || {
      metaTitle: row.title,
      metaDescription: row.excerpt || "",
      focusKeyword: "",
      noIndex: false,
    },
    seoStatus: row.seo_status as BlogPost["seoStatus"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class BlogRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  // --- CATEGORIES ---

  async getCategoriesByWebsite(websiteId: string): Promise<BlogCategory[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("blog_categories")
        .select("*")
        .eq("website_id", websiteId)
        .order("name", { ascending: true });

      if (error) throw handleDatabaseError(error);
      if (!data) return [];

      return (data as BlogCategoryRow[]).map((row) => ({
        id: row.id,
        websiteId: row.website_id,
        name: row.name,
        slug: row.slug,
        description: row.description || undefined,
        seoTitle: row.seo_title || undefined,
        metaDescription: row.meta_description || undefined,
        createdAt: row.created_at,
      }));
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async saveCategory(category: BlogCategory): Promise<BlogCategory> {
    try {
      const now = new Date().toISOString();
      const payload = {
        id: category.id,
        website_id: category.websiteId,
        name: category.name,
        slug: category.slug,
        description: category.description || null,
        seo_title: category.seoTitle || null,
        meta_description: category.metaDescription || null,
        updated_at: now,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("blog_categories")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) throw handleDatabaseError(error);
      const row = data as BlogCategoryRow;

      return {
        id: row.id,
        websiteId: row.website_id,
        name: row.name,
        slug: row.slug,
        description: row.description || undefined,
        seoTitle: row.seo_title || undefined,
        metaDescription: row.meta_description || undefined,
        createdAt: row.created_at,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.client as any)
        .from("blog_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw handleDatabaseError(error);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // --- POSTS ---

  async getPostsByWebsite(
    websiteId: string,
    options?: { status?: BlogPost["status"]; limit?: number }
  ): Promise<BlogPost[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (this.client as any)
        .from("blog_posts")
        .select("*")
        .eq("website_id", websiteId)
        .order("created_at", { ascending: false });

      if (options?.status) {
        query = query.eq("status", options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw handleDatabaseError(error);
      if (!data) return [];

      return (data as BlogPostRow[]).map(this.mapRowToPost);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async getPostById(postId: string): Promise<BlogPost | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .maybeSingle();

      if (error) throw handleDatabaseError(error);
      if (!data) return null;

      return this.mapRowToPost(data as BlogPostRow);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async getPostBySlug(websiteId: string, slug: string): Promise<BlogPost | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("blog_posts")
        .select("*")
        .eq("website_id", websiteId)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw handleDatabaseError(error);
      if (!data) return null;

      return this.mapRowToPost(data as BlogPostRow);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async savePost(post: BlogPost): Promise<BlogPost> {
    try {
      const now = new Date().toISOString();
      const payload = {
        id: post.id,
        website_id: post.websiteId,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content as unknown as Json,
        featured_image: post.featuredImage || "",
        featured_image_alt: post.featuredImageAlt || "",
        image_caption: post.imageCaption || "",
        author: post.author as unknown as Json,
        category_id: post.categoryId || null,
        tag_ids: (post.tagIds || []) as unknown as Json,
        status: post.status,
        published_at: post.publishedAt || null,
        scheduled_at: post.scheduledAt || null,
        reading_time_minutes: post.readingTimeMinutes || 1,
        seo: (post.seo || {}) as unknown as Json,
        seo_status: post.seoStatus || "missing",
        updated_at: now,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("blog_posts")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) throw handleDatabaseError(error);
      return this.mapRowToPost(data as BlogPostRow);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.client as any)
        .from("blog_posts")
        .delete()
        .eq("id", postId);

      if (error) throw handleDatabaseError(error);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  private mapRowToPost(row: BlogPostRow): BlogPost {
    return mapBlogPostRow(row);
  }
}
