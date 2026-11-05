-- ==============================================================================
-- Migration: 004_ai_providers_and_usage.sql
-- Description: Account-level AI Providers & Usage Tracking with AES encryption storage & RLS
-- ==============================================================================

-- 1. AI Providers Table
CREATE TABLE IF NOT EXISTS public.ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('openai', 'openrouter', 'gemini', 'custom')),
    provider_name TEXT NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    base_url TEXT,
    selected_model TEXT NOT NULL,
    default_model BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    connection_status TEXT DEFAULT 'untested' CHECK (connection_status IN ('untested', 'connected', 'failed')),
    last_tested_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_ai_providers_user_id ON public.ai_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_providers_default ON public.ai_providers(user_id, default_model) WHERE default_model = TRUE;

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI providers"
    ON public.ai_providers
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI providers"
    ON public.ai_providers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI providers"
    ON public.ai_providers
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI providers"
    ON public.ai_providers
    FOR DELETE
    USING (auth.uid() = user_id);

-- 2. AI Usage Logs Table
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
    provider_type TEXT NOT NULL,
    model TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics & auditing
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON public.ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_website ON public.ai_usage_logs(website_id);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI usage logs"
    ON public.ai_usage_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage logs"
    ON public.ai_usage_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

