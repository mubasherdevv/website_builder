# SecureSite Studio — Supabase Environment & Setup Guide

This document explains how to set up, configure, and maintain Supabase for both Local and Production environments.

---

## 1. Environment Variables Configuration

Copy `.env.example` to `.env.local` for local development:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PLATFORM_DOMAIN=localhost:3000
```

> **Security Rule:** `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_` and is strictly forbidden from client components.

---

## 2. Applying Database Migrations

### Method A: Supabase Dashboard (Recommended for Cloud)
1. Go to your Supabase Project Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open the **SQL Editor** from the left navigation menu.
3. Open `supabase/migrations/003_phase1_database_foundation.sql`.
4. Paste the entire SQL script and click **Run**.
5. Verify in **Table Editor** that the following tables are created with RLS enabled:
   - `profiles`
   - `organizations`
   - `organization_members`
   - `websites`
   - `website_members`
   - `pages`
   - `page_revisions`
   - `forms`
   - `form_submissions`

### Method B: Supabase CLI (Local Development)
```bash
# Login to Supabase CLI
npx supabase login

# Link your local repo to remote project
npx supabase link --project-ref your-project-id

# Push migrations to the database
npx supabase db push
```

---

## 3. Database Health Check Endpoint

You can test connectivity and schema cache status by querying:

```http
GET /api/health/database
```

Response when connected and migrations are active:
```json
{
  "status": "healthy",
  "connected": true,
  "latencyMs": 42,
  "sampleCount": 0,
  "timestamp": "2026-11-04T23:45:00.000Z"
}
```

Response when Supabase credentials are valid but migrations have not yet been run:
```json
{
  "status": "pending_migration",
  "connected": true,
  "latencyMs": 55,
  "message": "Supabase connection verified, but database migration 001_initial_schema.sql has not been executed yet."
}
```

---

## 4. Multi-Tenant Role-Based Access Control (RBAC)

- **Owner / Admin:** Can create, edit, publish, and delete websites and pages.
- **Editor:** Can edit pages, drafts, forms, and media.
- **Author:** Can write and edit blog posts.
- **Viewer:** Read-only access to drafts and website configurations.
- **Public:** Only permitted to read `published` websites and submit active forms.

