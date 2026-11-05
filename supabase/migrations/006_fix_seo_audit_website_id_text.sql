-- Migration 006: Convert website_id from UUID to TEXT on SEO Audit tables
-- to support string website IDs and slugs (e.g. 'my-site-1') alongside UUIDs

-- 1. Drop foreign key constraints on website_id if they exist
ALTER TABLE IF EXISTS public.seo_audits DROP CONSTRAINT IF EXISTS seo_audits_website_id_fkey;
ALTER TABLE IF EXISTS public.seo_crawled_pages DROP CONSTRAINT IF EXISTS seo_crawled_pages_website_id_fkey;
ALTER TABLE IF EXISTS public.seo_audit_issues DROP CONSTRAINT IF EXISTS seo_audit_issues_website_id_fkey;

-- 2. Convert website_id to TEXT
ALTER TABLE IF EXISTS public.seo_audits ALTER COLUMN website_id TYPE TEXT;
ALTER TABLE IF EXISTS public.seo_crawled_pages ALTER COLUMN website_id TYPE TEXT;
ALTER TABLE IF EXISTS public.seo_audit_issues ALTER COLUMN website_id TYPE TEXT;

-- 3. Ensure indexes exist on website_id
CREATE INDEX IF NOT EXISTS idx_seo_audits_website_id ON public.seo_audits(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_crawled_pages_website_id ON public.seo_crawled_pages(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_audit_issues_website_id ON public.seo_audit_issues(website_id);

