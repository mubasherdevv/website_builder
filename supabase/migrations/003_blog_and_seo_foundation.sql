-- ============================================================================
-- Phase 5 & 6: Blog CMS & SEO Engine Foundation
-- Migration: 003_blog_and_seo_foundation.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Blog Categories Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id TEXT PRIMARY KEY,
    website_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    seo_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(website_id, slug)
);

-- ----------------------------------------------------------------------------
-- 2. Blog Posts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    website_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT DEFAULT '',
    content JSONB NOT NULL DEFAULT '{"version": 1, "blocks": []}'::jsonb,
    featured_image TEXT DEFAULT '',
    featured_image_alt TEXT DEFAULT '',
    image_caption TEXT DEFAULT '',
    author JSONB NOT NULL DEFAULT '{"id": "author_1", "name": "Author"}'::jsonb,
    category_id TEXT,
    tag_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    reading_time_minutes INTEGER NOT NULL DEFAULT 1,
    seo JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo_status TEXT NOT NULL DEFAULT 'missing' CHECK (seo_status IN ('good', 'warning', 'critical', 'missing')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(website_id, slug)
);

-- ----------------------------------------------------------------------------
-- 3. Website SEO Settings Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_seo (
    website_id TEXT PRIMARY KEY,
    sitemap_enabled BOOLEAN NOT NULL DEFAULT true,
    include_blog_in_sitemap BOOLEAN NOT NULL DEFAULT true,
    custom_robots_rules JSONB NOT NULL DEFAULT '[{"userAgent": "*", "allow": ["/"], "disallow": ["/dashboard/", "/admin/", "/editor/", "/api/"]}]'::jsonb,
    google_search_console_verification TEXT DEFAULT '',
    bing_webmaster_verification TEXT DEFAULT '',
    default_meta_title TEXT DEFAULT '',
    default_meta_description TEXT DEFAULT '',
    default_og_image TEXT DEFAULT '',
    redirects JSONB NOT NULL DEFAULT '[]'::jsonb,
    schema_configs JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. Indexes for Performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_blog_categories_website ON public.blog_categories(website_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_website ON public.blog_posts(website_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(website_id, status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(website_id, slug);

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_seo ENABLE ROW LEVEL SECURITY;

-- Anonymous and public users can read published blog posts and categories
CREATE POLICY "Public read access for published blog posts"
    ON public.blog_posts
    FOR SELECT
    USING (status = 'published');

CREATE POLICY "Public read access for blog categories"
    ON public.blog_categories
    FOR SELECT
    USING (true);

-- Authenticated users or site members can view, insert, update, delete
CREATE POLICY "Full access to blog categories for authenticated users"
    ON public.blog_categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Full access to blog posts for authenticated users"
    ON public.blog_posts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Full access to website seo for authenticated users"
    ON public.website_seo
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Public read for sitemap / robots / site renderer
CREATE POLICY "Public read access for website seo"
    ON public.website_seo
    FOR SELECT
    USING (true);

