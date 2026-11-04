-- SecureSite Studio: Row Level Security (RLS) Policies
-- Enforces multi-tenant isolation per STACK.md Section 12

-- Enable RLS across all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_super_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check website membership
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

-- 1. Profiles Policies
CREATE POLICY "Users can read and update their own profile"
    ON public.profiles FOR ALL
    USING (id = auth.uid() OR public.is_super_admin());

-- 2. Organizations Policies
CREATE POLICY "Org members can read their organization"
    ON public.organizations FOR SELECT
    USING (
        id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
        OR public.is_super_admin()
    );

CREATE POLICY "Org owners can update their organization"
    ON public.organizations FOR UPDATE
    USING (owner_id = auth.uid() OR public.is_super_admin());

-- 3. Websites Policies
CREATE POLICY "Public can view published websites"
    ON public.websites FOR SELECT
    USING (status = 'published');

CREATE POLICY "Members can view their websites"
    ON public.websites FOR SELECT
    USING (public.has_website_access(id));

CREATE POLICY "Admins can update their websites"
    ON public.websites FOR UPDATE
    USING (public.has_website_access(id, ARRAY['admin']));

-- 4. Pages Policies
CREATE POLICY "Public can view published pages"
    ON public.pages FOR SELECT
    USING (status = 'published');

CREATE POLICY "Members can view and edit pages"
    ON public.pages FOR ALL
    USING (public.has_website_access(website_id, ARRAY['admin', 'editor']));

-- 5. Page Revisions Policies (Private to authorized editors only)
CREATE POLICY "Authorized editors can manage revisions"
    ON public.page_revisions FOR ALL
    USING (
        page_id IN (
            SELECT p.id FROM public.pages p
            WHERE public.has_website_access(p.website_id, ARRAY['admin', 'editor'])
        )
    );

-- 6. Templates Policies
CREATE POLICY "Everyone can view public templates"
    ON public.templates FOR SELECT
    USING (is_public = TRUE OR public.is_super_admin());

CREATE POLICY "Only Super Admins can manage templates"
    ON public.templates FOR ALL
    USING (public.is_super_admin());

-- 7. Media Assets Policies
CREATE POLICY "Public can view media assets of published sites"
    ON public.media_assets FOR SELECT
    USING (
        website_id IN (SELECT id FROM public.websites WHERE status = 'published')
        OR public.has_website_access(website_id)
    );

CREATE POLICY "Members can upload and delete media"
    ON public.media_assets FOR ALL
    USING (public.has_website_access(website_id, ARRAY['admin', 'editor']));

-- 8. SEO Metadata Policies
CREATE POLICY "Public can read SEO metadata of published pages"
    ON public.seo_metadata FOR SELECT
    USING (
        website_id IN (SELECT id FROM public.websites WHERE status = 'published')
        OR public.has_website_access(website_id)
    );

CREATE POLICY "Members can manage SEO metadata"
    ON public.seo_metadata FOR ALL
    USING (public.has_website_access(website_id, ARRAY['admin', 'editor']));

-- 9. Domains Policies
CREATE POLICY "Members can view and manage domains"
    ON public.domains FOR ALL
    USING (public.has_website_access(website_id, ARRAY['admin']));

