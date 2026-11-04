-- ==============================================================================
-- SecureSite Studio — Phase 1: Complete Database Foundation Schema & RLS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Organization Members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (organization_id, user_id)
);

-- 5. Websites Table
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subdomain TEXT NOT NULL UNIQUE,
    custom_domain TEXT UNIQUE,
    theme_config JSONB DEFAULT '{}'::jsonb NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_websites_org ON public.websites(organization_id);
CREATE INDEX IF NOT EXISTS idx_websites_subdomain ON public.websites(subdomain);
CREATE INDEX IF NOT EXISTS idx_websites_custom_domain ON public.websites(custom_domain);

-- 6. Website Members
CREATE TABLE IF NOT EXISTS public.website_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'author', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (website_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_website_members_user ON public.website_members(user_id);

-- 7. Pages Table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    draft_revision_id UUID,
    published_revision_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (website_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_pages_website ON public.pages(website_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(website_id, slug);

-- 8. Page Revisions Table (Snapshots of Document JSON)
CREATE TABLE IF NOT EXISTS public.page_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    document JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (page_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_page_revisions_page ON public.page_revisions(page_id);

-- Add revision pointers foreign keys
ALTER TABLE public.pages
    DROP CONSTRAINT IF EXISTS fk_draft_rev,
    DROP CONSTRAINT IF EXISTS fk_published_rev;

ALTER TABLE public.pages
    ADD CONSTRAINT fk_draft_rev FOREIGN KEY (draft_revision_id) REFERENCES public.page_revisions(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_published_rev FOREIGN KEY (published_revision_id) REFERENCES public.page_revisions(id) ON DELETE SET NULL;

-- 9. Forms & Submissions Tables
CREATE TABLE IF NOT EXISTS public.forms (
    id TEXT PRIMARY KEY,
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive')),
    fields JSONB DEFAULT '[]'::jsonb NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forms_website ON public.forms(website_id);

CREATE TABLE IF NOT EXISTS public.form_submissions (
    id TEXT PRIMARY KEY,
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    form_id TEXT NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'read', 'replied', 'archived')),
    ip_address TEXT,
    user_agent TEXT,
    notes JSONB DEFAULT '[]'::jsonb NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_form ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_website ON public.form_submissions(website_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Helper Function: Super Admin Check
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_super_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Website Access Check
CREATE OR REPLACE FUNCTION public.has_website_access(p_website_id UUID, p_roles TEXT[] DEFAULT ARRAY['admin', 'editor', 'author', 'viewer'])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.website_members
        WHERE website_id = p_website_id
          AND user_id = auth.uid()
          AND role = ANY(p_roles)
    ) OR EXISTS (
        SELECT 1 FROM public.websites w
        JOIN public.organization_members om ON om.organization_id = w.organization_id
        WHERE w.id = p_website_id
          AND om.user_id = auth.uid()
          AND om.role IN ('owner', 'admin')
    ) OR public.is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read/update own profile" ON public.profiles;
CREATE POLICY "Users can read/update own profile"
    ON public.profiles FOR ALL
    USING (id = auth.uid() OR public.is_super_admin());

-- Websites Policies
DROP POLICY IF EXISTS "Public can view published websites" ON public.websites;
CREATE POLICY "Public can view published websites"
    ON public.websites FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Members can view their websites" ON public.websites;
CREATE POLICY "Members can view their websites"
    ON public.websites FOR SELECT
    USING (public.has_website_access(id));

DROP POLICY IF EXISTS "Admins can update their websites" ON public.websites;
CREATE POLICY "Admins can update their websites"
    ON public.websites FOR UPDATE
    USING (public.has_website_access(id, ARRAY['admin']));

DROP POLICY IF EXISTS "Admins can delete their websites" ON public.websites;
CREATE POLICY "Admins can delete their websites"
    ON public.websites FOR DELETE
    USING (public.has_website_access(id, ARRAY['admin']));

-- Pages Policies
DROP POLICY IF EXISTS "Public can view published pages" ON public.pages;
CREATE POLICY "Public can view published pages"
    ON public.pages FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Members can view and edit pages" ON public.pages;
CREATE POLICY "Members can view and edit pages"
    ON public.pages FOR ALL
    USING (public.has_website_access(website_id, ARRAY['admin', 'editor']));

-- Forms Policies
DROP POLICY IF EXISTS "Members can manage website forms" ON public.forms;
CREATE POLICY "Members can manage website forms"
    ON public.forms FOR ALL
    USING (public.has_website_access(website_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS "Public can view active forms" ON public.forms;
CREATE POLICY "Public can view active forms"
    ON public.forms FOR SELECT
    USING (status = 'active');

-- Submissions Policies (Private to authorized users only)
DROP POLICY IF EXISTS "Members can view and manage submissions" ON public.form_submissions;
CREATE POLICY "Members can view and manage submissions"
    ON public.form_submissions FOR ALL
    USING (public.has_website_access(website_id, ARRAY['admin', 'editor']));

-- ==============================================================================
-- AUTOMATED USER CREATION TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, is_super_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

