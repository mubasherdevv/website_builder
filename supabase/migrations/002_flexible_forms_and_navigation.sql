-- ==============================================================================
-- SecureSite Studio — Migration 002: Flexible Forms, Submissions & Navigation
-- ==============================================================================

-- 1. Drop the RLS policies that depend on the website_id column FIRST
DROP POLICY IF EXISTS "Members can view and manage submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Members can manage website forms" ON public.forms;
DROP POLICY IF EXISTS "Public can view active forms" ON public.forms;
DROP POLICY IF EXISTS "Public can submit forms" ON public.form_submissions;

-- 2. Drop Foreign Key Constraints on forms and submissions to allow string slugs (e.g. 'my-site-1')
ALTER TABLE IF EXISTS public.form_submissions DROP CONSTRAINT IF EXISTS form_submissions_website_id_fkey;
ALTER TABLE IF EXISTS public.forms DROP CONSTRAINT IF EXISTS forms_website_id_fkey;

-- 3. Convert website_id to TEXT on forms and submissions
ALTER TABLE IF EXISTS public.form_submissions ALTER COLUMN website_id TYPE TEXT;
ALTER TABLE IF EXISTS public.forms ALTER COLUMN website_id TYPE TEXT;

-- 4. Re-create RLS policies for forms and form_submissions
CREATE POLICY "Public can view active forms"
    ON public.forms FOR SELECT
    USING (status = 'active');

CREATE POLICY "Members can manage website forms"
    ON public.forms FOR ALL
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can view and manage submissions"
    ON public.form_submissions FOR ALL
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can submit forms"
    ON public.form_submissions FOR INSERT
    WITH CHECK (true);

-- 5. Create Navigation Menus Table
CREATE TABLE IF NOT EXISTS public.navigation_menus (
    id TEXT PRIMARY KEY,
    website_id TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_nav_menus_website ON public.navigation_menus(website_id);

-- 6. Enable RLS on navigation_menus
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published navigation menus" ON public.navigation_menus;
CREATE POLICY "Public can view published navigation menus"
    ON public.navigation_menus FOR SELECT
    USING (is_published = true);

DROP POLICY IF EXISTS "Authenticated users can manage navigation menus" ON public.navigation_menus;
CREATE POLICY "Authenticated users can manage navigation menus"
    ON public.navigation_menus FOR ALL
    USING (auth.uid() IS NOT NULL);
