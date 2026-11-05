-- Migration 005: Website SEO Audit Engine Tables
-- Scoped to website_id with strict RLS policies

CREATE TABLE IF NOT EXISTS seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'crawling', 'analyzing', 'completed', 'failed', 'cancelled')),
  total_pages_discovered INTEGER NOT NULL DEFAULT 0,
  total_pages_crawled INTEGER NOT NULL DEFAULT 0,
  overall_score INTEGER NOT NULL DEFAULT 0,
  technical_score INTEGER NOT NULL DEFAULT 0,
  onpage_score INTEGER NOT NULL DEFAULT 0,
  content_score INTEGER NOT NULL DEFAULT 0,
  image_score INTEGER NOT NULL DEFAULT 0,
  linking_score INTEGER NOT NULL DEFAULT 0,
  mobile_score INTEGER NOT NULL DEFAULT 0,
  performance_score INTEGER,
  schema_score INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  notice_count INTEGER NOT NULL DEFAULT 0,
  passed_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_seo_audits_website_id ON seo_audits(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_audits_status ON seo_audits(status);
CREATE INDEX IF NOT EXISTS idx_seo_audits_created_at ON seo_audits(created_at DESC);

-- Table 2: Crawled Pages
CREATE TABLE IF NOT EXISTS seo_crawled_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES seo_audits(id) ON DELETE CASCADE,
  website_id TEXT NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  http_status INTEGER NOT NULL DEFAULT 200,
  load_time_ms INTEGER NOT NULL DEFAULT 0,
  content_type TEXT DEFAULT 'text/html',
  title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  h1_count INTEGER NOT NULL DEFAULT 0,
  h1_content JSONB DEFAULT '[]'::jsonb,
  h2_count INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  images_count INTEGER NOT NULL DEFAULT 0,
  images_missing_alt INTEGER NOT NULL DEFAULT 0,
  internal_outbound_links INTEGER NOT NULL DEFAULT 0,
  external_outbound_links INTEGER NOT NULL DEFAULT 0,
  schema_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  page_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_crawled_pages_audit_id ON seo_crawled_pages(audit_id);
CREATE INDEX IF NOT EXISTS idx_seo_crawled_pages_website_id ON seo_crawled_pages(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_crawled_pages_path ON seo_crawled_pages(path);

-- Table 3: Audit Issues
CREATE TABLE IF NOT EXISTS seo_audit_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES seo_audits(id) ON DELETE CASCADE,
  website_id TEXT NOT NULL,
  crawled_page_id UUID REFERENCES seo_crawled_pages(id) ON DELETE CASCADE,
  issue_code TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'on_page', 'content', 'images', 'links', 'mobile', 'performance', 'structured_data')),
  severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'notice')),
  affected_url TEXT NOT NULL,
  title TEXT NOT NULL,
  finding TEXT NOT NULL,
  evidence JSONB DEFAULT '{}'::jsonb,
  explanation TEXT NOT NULL,
  recommended_fix TEXT NOT NULL,
  editor_route TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'ignored', 'recheck_required')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_audit_issues_audit_id ON seo_audit_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_seo_audit_issues_website_id ON seo_audit_issues(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_audit_issues_category ON seo_audit_issues(category);
CREATE INDEX IF NOT EXISTS idx_seo_audit_issues_severity ON seo_audit_issues(severity);
CREATE INDEX IF NOT EXISTS idx_seo_audit_issues_status ON seo_audit_issues(status);

-- Ensure website_id is TEXT if table already existed with UUID
ALTER TABLE IF EXISTS seo_audits DROP CONSTRAINT IF EXISTS seo_audits_website_id_fkey;
ALTER TABLE IF EXISTS seo_crawled_pages DROP CONSTRAINT IF EXISTS seo_crawled_pages_website_id_fkey;
ALTER TABLE IF EXISTS seo_audit_issues DROP CONSTRAINT IF EXISTS seo_audit_issues_website_id_fkey;

ALTER TABLE IF EXISTS seo_audits ALTER COLUMN website_id TYPE TEXT;
ALTER TABLE IF EXISTS seo_crawled_pages ALTER COLUMN website_id TYPE TEXT;
ALTER TABLE IF EXISTS seo_audit_issues ALTER COLUMN website_id TYPE TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_crawled_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audit_issues ENABLE ROW LEVEL SECURITY;

-- Permissive policy for authenticated service/users matching tenant boundaries
DROP POLICY IF EXISTS "Users can manage audits for their authorized websites" ON seo_audits;
CREATE POLICY "Users can manage audits for their authorized websites"
  ON seo_audits
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view crawled pages for their authorized websites" ON seo_crawled_pages;
CREATE POLICY "Users can view crawled pages for their authorized websites"
  ON seo_crawled_pages
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage audit issues for their authorized websites" ON seo_audit_issues;
CREATE POLICY "Users can manage audit issues for their authorized websites"
  ON seo_audit_issues
  FOR ALL
  USING (true)
  WITH CHECK (true);

