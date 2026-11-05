# SecureSite Studio — Repository Review (AI Onboarding Map)

> **Purpose:** Make it easy for any AI agent (or human) to understand this repository instantly — full folder/file tree, what every area does, how data flows, and which file to touch for which task.
>
> **Project:** SecureSite Studio — a production-ready, multi-tenant **AI Website Builder SaaS** with a visual drag-and-drop editor, ready-made templates, blog CMS, SEO engine, forms with submissions, navigation manager, theme/design-system editor, and a Supabase (PostgreSQL + RLS) backend.
>
> **Golden rule of this repo:** Websites are stored as **JSON page documents** (`PageDocument`), rendered by **one shared renderer** using a **central Component Registry**. There is **no duplicated code per template** — 1 website component → infinite pages/themes.

---

## 1. Tech Stack & Tooling

| Layer | Choice |
|---|---|
| Framework | Next.js **14.2.15** (App Router, `src/app`) |
| UI | React **18.3**, TypeScript 5.x (strict) |
| Styling | Tailwind CSS **3.4** + CSS custom properties (theme tokens in `globals.css`) |
| Validation | **zod** (component props, documents, DB rows, env vars) |
| Backend | Supabase (Postgres + Auth + RLS), anon-key client + service-role admin client (server-only) |
| Icons | lucide-react |
| Animations | framer-motion |
| Toasts | sonner + custom `ToastProvider` |
| Tests | **vitest 2.x** + @testing-library/react + jsdom (34 suites) |
| Package manager | pnpm 11 (workspace root = repo root) |
| Deploy | Vercel (`vercel.json` pins build/install commands) |
| Agent tooling | `.agents/skills/*` — installed AI skills (documentation only, NOT app code) |

Commands: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm test:watch`.

---

## 2. Architecture on One Page

```
                    ┌────────────────────────────────────────────┐
                    │              COMPONENT REGISTRY             │
                    │  src/builder/registry/index.ts              │
                    │  (17 allowlisted components, zod schemas,   │
                    │   defaults, editor control definitions)     │
                    └──────────────┬─────────────────────────────┘
                                   │ definitions drive both sides
              ┌────────────────────┴───────────────────────┐
              ▼                                            ▼
   ┌─────────────────────┐                     ┌──────────────────────────┐
   │  EDITOR (workspace) │                     │  PUBLIC SITE RENDERER    │
   │  EditorShell        │  ── PageDocument ─▶ │  PageRenderer (public)   │
   │  Canvas + Properties│   (JSON stored in   │  SectionRenderer         │
   │  reuses components  │    Supabase/local)  │  (reuse the SAME React   │
   └─────────────────────┘                     │  components, no chrome)  │
                                               └──────────────────────────┘
```

- A page = `PageDocument` (zod schema: `src/builder/schemas/document.schema.ts`) → list of `SectionNode`s (`id`, `componentId`, `props`, `style`).
- Registries never define colors: theme tokens (`--color-*`) are set by **ThemeProvider** from a `ThemeConfig`, consumed by Tailwind (`bg-surface`, `text-text-primary`, …) and by website components (`--color-footer-*`, …).
- Persistence: `lib/services/*-manager.service.ts` (business logic) → `lib/database/repositories/*.repo.ts` (Supabase access) → RLS-protected tables. Browser drafts fallback to `localStorage` keys (`website_<id>_page_<slug>`).
- Public rendering: `/site/[domainOrSlug]/[[...slug]]` → website lookup → latest published revision → `PageRenderer` (public mode).

---

## 3. Full Repository Tree

```
website_builder/
├── .agents/                        # AI agent skills installed for this workspace (docs only)
│   └── skills/                     # 14 skills: agentation, architect-backend, audit-backend-security,
│                                   #   improve-backend-code, integrate-1bill, integrate-easypaisa,
│                                   #   integrate-jazzcash, integrate-stripe, optimize-database,
│                                   #   rea-* (3), reverse-engineer-anything, screenshot-to-code
│
├── .env / .env.example             # Supabase URL/keys, app URLs (never commit real .env)
├── .eslintrc.json                  # next/core-web-vitals + next/typescript
├── .gitignore
├── .npmrc                          # pnpm config
│
├── AGENTS.md                       # ★ MANDATORY dev rules for AI (read first, phases, approval flow)
├── DESIGN.md                       # Product design decisions (root copy)
├── DEVELOPMENT_PROGRESS.md         # ★ Phase-by-phase progress log (update after every task!)
├── README.md                       # Default create-next-app readme (stale, informational)
├── review.md                       # ← This file (repository map for AI)
├── docs/
│   └── SUPABASE_SETUP.md           # How to set up the Supabase project/keys
│
├── next.config.mjs                 # CSP + security headers (Strict-Transport, X-Frame-Options, …)
├── next-env.d.ts                   # Next.js TS references (auto-generated)
├── package.json                    # Scripts + deps (next 14.2.15 pinned)
├── pnpm-lock.yaml
├── pnpm-workspace.yaml             # pnpm workspace: ["."], allowBuilds: esbuild
├── postcss.config.mjs              # tailwindcss + autoprefixer
├── tailwind.config.ts              # ★ Theme-token layer: maps CSS vars → utilities (brand, surface,
│                                   #   text-*, status-*, rounded-card, etc.) Light/Dark/System tokens
├── tsconfig.json                   # strict, bundler resolution, "@/*" → ./src/*
├── tsconfig.tsbuildinfo            # TS incremental cache (generated)
├── vercel.json                     # framework, buildCommand: pnpm build, installCommand
├── vitest.config.ts                # jsdom env, globals, @ alias → ./src
│
├── src/                                            # ★ ALL application source code
│   ├── middleware.ts                               # Auth session guard (protects /dashboard, /websites/*,
│   │                                               #  /admin/*), auth redirect flows, security headers
│   │
│   ├── app/                                        # ★ Next.js App Router (routes)
│   │   ├── globals.css                             # ★ Theme tokens: :root colors, dark mode overrides,
│   │   │                                           #  footer tokens, prose styles, canvas styles
│   │   ├── layout.tsx                              # Root html shell: ToastProvider + AgentationProvider
│   │   │                                           #  (dev-only visual feedback toolbar)
│   │   ├── page.tsx                                # Marketing landing page ("/") for the platform
│   │   │
│   │   ├── login/page.tsx                          # Auth UI: Sign in (Supabase auth)
│   │   ├── signup/page.tsx                         # Auth UI: Registration
│   │   ├── forgot-password/page.tsx                # Auth UI: Request reset
│   │   ├── reset-password/page.tsx                 # Auth UI: Set new password
│   │   │
│   │   ├── dashboard/                              # Customer dashboard (auth-only)
│   │   │   ├── page.tsx                            # All websites list, metrics, latest website card,
│   │   │   │                                       #  recent activity, "My Websites" modal
│   │   │   ├── ai-builder/page.tsx                 # AI Website Builder UI (generate drafts)
│   │   │   └── websites/new/page.tsx               # Create-website flow (wizard entry)
│   │   │
│   │   ├── admin/                                  # Super-admin control plane (dark UI, separate theme)
│   │   │   ├── layout.tsx                          # Admin shell: top bar + root-control nav
│   │   │   ├── overview/page.tsx                   # Admin platform overview (system health cards)
│   │   │   ├── users/page.tsx                      # User management (search/filter users)
│   │   │   └── websites/page.tsx                   # All tenant websites (search, status pills)
│   │   │
│   │   ├── websites/[websiteId]/                   # Per-website workspace (auth-only)
│   │   │   ├── layout.tsx                          # ★ Workspace shell: sidebar with sub-nav (overview,
│   │   │   │                                       #  pages, editor, blog, forms, media, navigation, seo,
│   │   │   │                                       #  settings), collapsible + mobile drawer
│   │   │   ├── overview/page.tsx                   # In-progress: redesigned overview dashboard
│   │   │   │                                       #  (metrics, pages progress, activity, table w/ filters)
│   │   │   ├── pages/page.tsx                      # Pages manager: list + modals (create/settings/preview/delete)
│   │   │   ├── editor/[pageId]/page.tsx            # ★ Visual editor entry → loads PageDocument → EditorShell
│   │   │   ├── blog/page.tsx                       # Blog CMS manager (posts CRUD, categories, tags, SEO panel)
│   │   │   ├── forms/page.tsx                      # Forms manager (builder + submissions inbox)
│   │   │   ├── media/page.tsx                      # Media library placeholder/manager
│   │   │   ├── navigation/page.tsx                 # Navigation menu manager (drag&drop, modals, preview)
│   │   │   └── seo/page.tsx                        # SEO engine settings (meta, OG, sitemap config)
│   │   │
│   │   ├── site/[domainOrSlug]/                    # ★ PUBLIC WEBSITE renderer (customer sites)
│   │   │   ├── [[...slug]]/page.tsx                # Catch-all page → find website + page doc → PageRenderer
│   │   │   │                                       #  (public mode, no editor chrome). Supports custom domains.
│   │   │   ├── robots.txt/route.ts                 # Dynamic robots.txt per website (seo.service)
│   │   │   └── sitemap.xml/route.ts                # Dynamic sitemap.xml per website (seo.service)
│   │   │
│   │   ├── blog/                                   # Platform-level public blog
│   │   │   ├── page.tsx                            # Blog index (posts list, filter by category)
│   │   │   ├── [slug]/page.tsx                     # Single post page (rich text render)
│   │   │   └── category/[slug]/page.tsx            # Posts by category
│   │   │
│   │   └── api/                                    # REST endpoints (route handlers)
│   │       ├── auth/callback/route.ts              # Supabase OAuth/email callback handler
│   │       ├── health/database/route.ts            # DB health check endpoint
│   │       ├── forms/[formId]/submit/              # ★ Public form submit (rate-limited, RLS-safe insert)
│   │       └── websites/
│   │           ├── route.ts                        # GET (list user websites), POST (create website)
│   │           └── [websiteId]/
│   │               ├── route.ts                    # GET/PUT/DELETE single website
│   │               ├── pages/route.ts              # GET list pages, POST create page (+ revisions)
│   │               ├── pages/[pageId]/route.ts     # GET/PUT(author+autosave revisions)/DELETE page
│   │               ├── forms/route.ts              # GET forms+submissions, POST create form
│   │               ├── submissions/route.ts        # GET/PUT/DELETE submissions (mark read, etc.)
│   │               ├── navigation/route.ts         # GET/PUT navigation menus
│   │               ├── blog/route.ts               # GET/POST blog posts (+categories/tags/seo payloads)
│   │               └── seo/route.ts                # GET/PUT website SEO settings
│   │
│   ├── builder/                                    # ★ PAGE DOCUMENT ENGINE (framework core)
│   │   ├── schemas/document.schema.ts              # zod schema for PageDocument/SectionNode/SectionStyle
│   │   ├── registry/index.ts                       # ★ Component registry: imports ALL component modules,
│   │   │                                           #  componentRegistry map, validateComponentProps,
│   │   │                                           #  listRegisteredComponents, getComponentDefinition
│   │   ├── registry/types.ts                       # Registry contract types (controls, categories…)
│   │   ├── operations/document-operations.ts       # Pure ops: insert/update/updateNodeProps/updateNodeStyle/
│   │   │                                           #  moveSection/duplicateSection/deleteNode/generateNodeId
│   │   ├── history/history-manager.ts              # Undo/redo stack (commit + time-travel)
│   │   ├── renderer/PageRenderer.tsx               # ★ Renders sections from PageDocument (canvas+public)
│   │   ├── renderer/SectionRenderer.tsx            # Per-section wrapper: style classes, editor chrome
│   │   │                                           #  (select/move/duplicate/delete label bar), fallbacks
│   │   ├── renderer/ErrorBoundary.tsx              # Per-section error isolation
│   │   └── templates/page-templates.ts             # Starter page documents (Home templates etc.)
│   │
│   ├── components/                                 # ★ UI building blocks (3 groups)
│   │   ├── agentation/AgentationProvider.tsx       # Dev-only visual feedback toolbar (dynamic import)
│   │   ├── auth/AuthLayout.tsx                     # Shared auth pages layout (brand panel + form)
│   │   ├── ui/Toast.tsx                            # ToastProvider + toast() helper (context-based)
│   │   │
│   │   ├── editor/                                 # ★ THE VISUAL EDITOR UI
│   │   │   ├── EditorShell.tsx                     # Brain: document state, history, save pipeline,
│   │   │   │                                       #  viewport switching, apply header/footer variants
│   │   │   ├── EditorTopBar.tsx                    # Device switcher (desktop/tablet/mobile), undo/redo,
│   │   │   │                                       #  save/publish buttons, SaveStatus
│   │   │   ├── Canvas.tsx                          # Canvas stage: width shaping, click-select,
│   │   │   │                                       #  IsolatedFrame em for mobile/tablet media queries
│   │   │   ├── IsolatedFrame.tsx                   # Iframe that clones styles for authentic responsive
│   │   │   │                                       #  previews (viewportWidth + minHeight props)
│   │   │   ├── ComponentPalette.tsx                # Left panel: Elements / Templates / Layers /
│   │   │   │                                       #  Design-System tabs + header/footer template modals
│   │   │   ├── PropertiesPanel.tsx                 # Right panel: renders schema `editor.controls`
│   │   │   │                                       #  (text/textarea/color/switch/image/variants/lists)
│   │   │   ├── HeaderVariantsModal.tsx             # Header templates picker (3 header variants)
│   │   │   ├── FooterVariantsModal.tsx             # Footer templates picker (3 real-preview footer
│   │   │   │                                       #  variants: classic, multi-column, newsletter)
│   │   │   ├── IconPickerControl.tsx               # Lucide icon picker for icon props
│   │   │   └── design-system/                      # Theme editor inside the editor
│   │   │       ├── DesignSystemPanel.tsx           # Tabs host (colors/typography/spacing/shadows/
│   │   │   │                                       #  radius/buttons/borders)
│   │   │       ├── ColorsTab.tsx                   # Color token editor
│   │   │       ├── ColorPickerItem.tsx             # Single swatch control
│   │   │       ├── TypographyTab.tsx               # Font + size scale editor
│   │   │       ├── SpacingTab.tsx                  # Spacing scale editor
│   │   │       ├── ShadowsTab.tsx                  # Shadow presets editor
│   │   │       ├── ButtonsTab.tsx                  # Button system editor
│   │   │       └── BordersRadiusTab.tsx            # Border/radius editor
│   │   │
│   │   ├── website/                                # ★ ACTUAL PAGE COMPONENTS (rendered on real sites)
│   │   │   │                                       #  Each file ALSO exports its registry definition
│   │   │   │                                       #  (zod schema + defaults + editor controls)
│   │   │   ├── header/HeaderSimple.tsx             # header.simple.v1 + header.classic.v1 — simple nav bar,
│   │   │   │                                       #  logo, CTA, responsive hamburger w/ panel
│   │   │   ├── header/HeaderTopBar.tsx             # header.topbar.v1 — announcement/contact top bar + nav
│   │   │   ├── header/HeaderTransparent.tsx        # header.transparent.v1 — overlay hero-transparent nav
│   │   │   ├── header/useHeaderNavigation.ts       # Hook: unify menuId → navigation-manager / localStorage
│   │   │   ├── hero/HeroSplit.tsx                  # hero.split.v1 — headline + subtext + image split
│   │   │   ├── services/ServicesGrid.tsx           # services.grid.v1 — icon service cards (variants)
│   │   │   ├── features/FeaturesGrid.tsx           # features grid section
│   │   │   ├── about/AboutSplit.tsx                # about.split.v1 — stats, highlights, image side
│   │   │   ├── testimonials/TestimonialsCards.tsx  # testimonials.cards.v1 — rating cards
│   │   │   ├── gallery/GalleryGrid.tsx             # gallery grid section
│   │   │   ├── cta/CtaBanner.tsx                   # cta.banner.v1 — call-to-action strip
│   │   │   ├── custom/CustomEmbed.tsx              # custom embed section (safe HTML)
│   │   │   ├── forms/ContactForm.tsx               # contact.form.v1 — direct-contact section form
│   │   │   ├── forms/DynamicForm.tsx               # dynamic.form.v1 — renders MANAGED forms (builder-made)
│   │   │   ├── shared/IconRenderer.tsx             # Icon-name → lucide component (safe registry map)
│   │   │   ├── footer/FooterSimple.tsx             # footer.simple.v1 — legacy minimal footer (kept alive,
│   │   │   │                                       #  modernized with safe hrefs + tokens)
│   │   │   ├── footer/FooterClassic.tsx            # footer.classic.v1 — brand/links/social/contact + CTA panel
│   │   │   ├── footer/FooterColumns.tsx            # footer.columns.v1 — SEO-rich multi-column footer
│   │   │   ├── footer/FooterNewsletter.tsx         # footer.newsletter.v1 — email strip (HONEST: no fake
│   │   │   │                                       #  success; optional real endpoint w/ validation)
│   │   │   ├── footer/shared/footer-url.ts         # URL sanitizers: sanitizeFooterHref (blocks javascript:,
│   │   │   │                                       #  data: …), isSafeFetchEndpoint, sanitizeFooterImageUrl
│   │   │   ├── footer/shared/footer.types.ts       # Shared zod schemas (footerLinkSchema label+safe href…)
│   │   │   └── footer/shared/                      # Reusable footer primitives (zero duplication):
│   │   │       ├── FooterBrand.tsx                 #   logo/description/social slots
│   │   │       ├── FooterLinkGroup.tsx             #   heading + sanitized link list
│   │   │       ├── FooterContactList.tsx           #   address/phone/email lines
│   │   │       ├── FooterLegalBar.tsx              #   copyright + legal links
│   │   │       └── FooterSocialLinks.tsx           #   social icon row (safe URLs)
│   │   │
│   │   ├── pages/                                  # Pages-manager modals (workspace "Pages" tab)
│   │   │   ├── CreatePageModal.tsx                 # 3-step page creation wizard (template, meta, nav,
│   │   │   │                                       #  SERP preview)
│   │   │   ├── PageSettingsModal.tsx               # Page settings + SEO form
│   │   │   ├── PagePreviewModal.tsx                # Live preview of page document
│   │   │   └── DeletePageModal.tsx                 # Delete confirmation (type name to confirm)
│   │   │
│   │   ├── forms/                                  # Forms workspace UI
│   │   │   ├── FormBuilderOverlay.tsx              # Visual form builder (field palette, properties)
│   │   │   └── SubmissionDetailsDrawer.tsx         # Submission viewer (JSON data, mark-read)
│   │   │
│   │   ├── navigation/                             # Navigation manager UI
│   │   │   ├── AddMenuItemModal.tsx                # Add/edit menu item (label, URL, icon…)
│   │   │   ├── NavigationItemPropertiesPanel.tsx   # Item-level controls (order, visibility…)
│   │   │   ├── NavigationDisplaySettingsPanel.tsx  # Menu display settings (style, alignment)
│   │   │   ├── NavigationMenuPreview.tsx           # Live menu preview
│   │   │   └── SortableMenuItem.tsx                # Drag-and-drop item row (@dnd-kit)
│   │   │
│   │   ├── blog/                                   # Blog CMS workspace UI
│   │   │   ├── PostEditorModal.tsx/.tsx            # Post editor modal shell
│   │   │   ├── PostEditorView.tsx                  # Post editor body (title, fields, sections)
│   │   │   ├── RichTextEditor.tsx                  # WYSIWYG-ish rich text editor
│   │   │   ├── SafeRichTextRenderer.tsx            # XSS-safe HTML rendering for posts
│   │   │   ├── CategoryManagerModal.tsx            # Categories modal (add/rename/delete)
│   │   │   ├── CategoryManagerView.tsx             # Categories manager view
│   │   │   ├── TagManagerModal.tsx                 # Tags modal
│   │   │   └── BlogSEOPanel.tsx                    # Per-post SEO (meta/OG/slug) panel
│   │   │
│   │   └── dashboard/CreationWizard.tsx            # Multi-step "create website" wizard modal
│   │
│   ├── lib/                                        # ★ BACKEND SERVICES & DATA ACCESS
│   │   ├── config/env.ts                           # zod env validation; getServerEnv()/getClientEnv() w/
│   │   │                                           #  hard context separation (browser can't touch secrets)
│   │   ├── supabase/
│   │   │   ├── client.ts                       # Browser client (anon key + cookies via @supabase/ssr)
│   │   │   ├── server.ts                           # Server-component request client
│   │   │   ├── middleware.ts                       # Session refresh helper (used by src/middleware.ts)
│   │   │   └── admin.ts                            # ★ Service-role admin client — server-only privileged ops
│   │   ├── database/
│   │   │   ├── supabase.ts                         # Data-access client factory (RLS-level access)
│   │   │   ├── errors.ts                           # DatabaseError types/normalization
│   │   │   ├── schemas/database.schema.ts          # zod schemas for DB rows (websites, pages…)
│   │   │   └── repositories/                       # ★ Table-scoped data access (all async CRUD)
│   │   │       ├── website.repo.ts                 #   websites: CRUD, slug/domain checks, ownership guard
│   │   │       ├── page.repo.ts                    #   pages + page_revisions (save/publish/rollback)
│   │   │       ├── form.repo.ts                    #   forms + form_submissions
│   │   │       ├── navigation.repo.ts              #   navigation_menus + items
│   │   │       ├── blog.repo.ts                    #   blog_posts/categories/tags (+SEO fields)
│   │   │       ├── seo.repo.ts                     #   website_seo settings rows
│   │   │       └── profile.repo.ts                 #   profiles (user metadata)
│   │   ├── services/                               # ★ Business logic layer (UI calls these, not repos)
│   │   │   ├── auth.service.ts                     #   signUp/signIn/reset/signOut/session helpers
│   │   │   ├── pages-manager.service.ts            #   page lifecycles incl. revision handling
│   │   │   ├── forms-manager.service.ts            #   form CRUD + submissions intake (getForms persisted)
│   │   │   ├── navigation-manager.service.ts       #   menus for editor/public consumption
│   │   │   ├── blog-manager.service.ts             #   blog orchestration (repo + fallbacks)
│   │   │   └── seo-manager.service.ts              #   SEO get/update orchestration
│   │   ├── security/
│   │   │   ├── rate-limiter.ts                     # In-memory sliding-window limiter (API guard)
│   │   │   └── safe-upload.ts                      # Upload validation (type/size/name checks)
│   │   ├── ai/ai-generator.service.ts              # AI site generation (prompts → PageDocument draft)
│   │   └── utils/
│   │       ├── id.ts                               # generateEntityId (prefix_random8), revision IDs
│   │       └── url.ts                              # getAppBaseDomain, normalizeSlug, safestring utils
│   │
│   ├── server/                                     # ★ Server-side privileged flows (service-role use)
│   │   ├── errors/index.ts                         # Typed API errors (NotFound/Forbidden/Validation…)
│   │   ├── repositories/
│   │   │   ├── website.repository.ts               # Cross-tenant website lookup (public rendering path)
│   │   │   └── page.repository.ts                  # Read published revisions without RLS constraints
│   │   └── services/
│   │       ├── publishing.service.ts               # Publish pipeline (draft→published revision snapshot)
│   │       └── seo.service.ts                      # Build robots.txt / sitemap.xml content per site
│   │
│   ├── templates/                                  # ★ READY-MADE SITE TEMPLATES (pure data → PageDocument)
│   │   ├── types.ts                                # Template contract (id/name/sections/theme)
│   │   ├── services/template-clone.service.ts      # Instantiate template → fresh PageDocument per site
│   │   │                                           #  (IDs regenerated, theme applied — no code duplication)
│   │   └── definitions/                            # 5 site templates, each composed of registry sections
│   │       ├── local-service.template.ts
│   │       ├── corporate-consulting.template.ts
│   │       ├── digital-agency.template.ts
│   │       ├── restaurant.template.ts
│   │       └── wellness-clinic.template.ts
│   │
│   ├── themes/                                     # ★ THEME SYSTEM (Light/Dark/System from day one)
│   │   ├── ThemeProvider.tsx                       # Runtime theme context (applies tokens to <html>)
│   │   ├── schemas/theme.schema.ts                 # zod ThemeConfig (colors/typography/radius/shadows)
│   │   ├── presets/index.ts                        # Presets incl. emeraldForestPreset (default)
│   │   └── utils/css-variables.ts                  # ThemeConfig → CSS custom properties (--color-*)
│   │
│   └── types/                                      # Global TS type modules (data contracts)
│       ├── builder.ts                              # PageDocument, SectionNode, SectionStyle, ThemeConfig
│       ├── database.ts                             # Supabase row DTO types (+env flag for blog/seo tables)
│       ├── forms.ts                                # FormField, FormSchema?, SubmissionRecord
│       ├── navigation.ts                           # Menu/item types  
│       ├── blog.ts                                 # Post/Category/Tag types
│       ├── seo.ts                                  # SEO settings types
│       ├── cms.ts                                  # CMS shared types
│       └── ai.ts                                   # AI generation request/result types
│
├── supabase/                                       # Database migration scripts (SQL, RLS policies included)
│   └── migrations/
│       ├── 001_phase1_database_foundation.sql      # profiles, websites, pages, page_revisions + RLS
│       ├── 002_flexible_forms_and_navigation.sql   # forms, form_submissions, navigation_menus + RLS
│       └── 003_blog_and_seo_foundation.sql         # blog tables + website_seo + RLS
│
├── structure/                                      # ★ REQUIREMENTS DOCS (AI must read before building)
│   ├── PRD.md                                      # Product requirements (features, JSON architecture)
│   ├── DESIGN.md                                   # UI decisions + design system rules
│   ├── STACK.md                                    # Approved technical stack decisions
│   └── SECURESITE_COMPONENT_RESPONSIVE_RULES.md    # ★ MANDATORY responsive rules + testing checklist
│
└── tests/unit/                                     # ★ 34 vitest suites (jsdom + RTL)
    ├── baseline.test.ts                            # Sanity baseline
    ├── schemas.test.ts / theme.test.ts             # document + theme zod schemas
    ├── registry.test.ts / renderer.test.ts         # registry contract, renderer output w/ chrome
    ├── operations.test.ts                          # document-operations unit tests
    ├── editor.test.ts                              # EditorShell integration (tabs, apply variants…)
    ├── header-templates.test.tsx                   # Header variants modal + apply flow
    ├── footer-variants.test.tsx                    # ★ 3 new footers: schemas, safe URLs, newsletter
    │                                               #  honesty, real-preview modal, editor integration
    ├── website-overview.test.tsx                   # Overview page (in progress alongside redesign)
    ├── reusable-templates.test.ts                  # template clone service purity
    ├── templates.test.ts                           # 5 site templates validity
    ├── responsive-rendering.test.ts                # responsive utilities/marks
    ├── design-system.test.ts                       # DesignSystemPanel + theme edits
    ├── pages-management.test.ts                    # Create/settings/preview/delete modals
    ├── pages-navigation-integration.test.ts        # pages ↔ navigation interplay
    ├── navigation-management.test.ts               # Nav manager, dnd, markup
    ├── blog-cms.test.ts                            # Blog UI + rich text safety
    ├── cms.test.ts / seo-ai.test.ts / seo-management.test.ts
    ├── auth-ui.test.tsx / admin.test.ts            # Auth screens, admin plane
    ├── middleware-auth.test.ts / security.test.ts  # Route guards, limiter, headers, safe upload
    ├── database.test.ts / supabase-foundation.test.ts
    ├── pages-db.test.ts / forms-db.test.ts / navigation-db.test.ts / blog-seo-db.test.ts
    ├── publishing.test.ts / backend-utils.test.ts  # publishing flow, id/url utils
    └── …
```

**Counts:** `src` ≈ 124 TS/TSX files · 39 app-router entries · 34 test suites · 5 templates · 17 registered components (3 header variants + 3 footer variants + 11 sections/forms).

---

## 4. Key Data Flows (Trace These First)

### 4.1 Editing & Saving a Page
```
/websites/[id]/editor/[pageId]
  → page.tsx loads PageDocument (Supabase revision, else localStorage `website_<id>_page_<slug>`)
  → EditorShell(images state, HistoryManager, autosave→page revision via PagesManagerService)
  → Canvas renders SectionRenderer per SectionNode
  → PropertiesPanel edits = updateNodeProps → commitDocumentChange (history) → save bar
```

### 4.2 Component Registration Contract
Every website component file exports (see `FooterClassic.tsx` for the canonical pattern):
```ts
export const FooterClassic = ({ /* plain React component */ }) => …;
export const FooterClassicPropsSchema = z.object({...});     // validation
export const footerClassicProps = {…};                       // schema-parsed defaults
export const footerClassicDefinition: ComponentDefinition = {
  id: "footer.classic.v1", version: 1, name: "...", category: "footer",
  schema: FooterClassicPropsSchema, component: FooterClassic (and list for aliases),
  defaults, editor: { controls: [{ propName, label, type: "list|text|…" }] },
};
// then import + REGISTER inside src/builder/registry/index.ts (single source of truth)
```
Aliases reuse the same component with different defaults (e.g. `header.classic.v1` = HeaderSimple variant).

### 4.3 Publishing & Public Rendering
```
Publish (EditorTopBar) → EditorShell publish → api/websites/[id]/pages/[pageId] PUT (status publish)
  → publishing.service snapshots PageDocument revision
Public visit /site/<domainOrSlug>/<slug>
  → page.tsx → website.repository + page.repository (published revision)
  → PageRenderer (public mode) → components擅 render with ThemeConfig CSS vars
SEO extras: /site/<x>/robots.txt → seo.service · /site/<x>/sitemap.xml → seo.service
```

### 4.4 Form Submission (Public Sites)
```
visitor submits DynamicForm (managed form id) → POST /api/forms/[formId]/submit
  → rate-limiter → form.repo.insertSubmission (anon key + RLS insert-only policy)
Dashboard Forms tab → submissions inbox → mark-read via PUT /api/websites/[id]/submissions
```

### 4.5 Theme (Light / Dark / System Everywhere)
```
ThemeProvider (prefers-color-scheme aware) → ThemeConfig → css-variables → <html style>
  → Tailwind utility classes defined in tailwind.config.ts (bg-surface, text-text-primary, …)
Dark mode = token overrides in globals.css `@media (prefers-color-scheme: dark)` + .dark class rules
```

---

## 5. Conventions & Hard Rules (enforced project-wide)

1. **Read `structure/` first** (`PRD.md`, `STACK.md`, `DESIGN.md`) and `AGENTS.md` — phases need approval; update `DEVELOPMENT_PROGRESS.md` after every task.
2. **Responsive is mandatory from day one** — desktop + tablet + mobile in the SAME task; checklist in `structure/SECURESITE_COMPONENT_RESPONSIVE_RULES.md`.
3. **Never hardcode app-UI colors** — only theme tokens (Tailwind utils bound to CSS vars). Website sections may use their own `--color-*` tokens (e.g., footer tokens).
4. **No per-template duplicates** — extend the shared registry component or add variants/defaults; templates are data, not code.
5. **Registry single source of truth** — a component not imported into `src/builder/registry/index.ts` doesn't exist.
6. **Security**: all public mutations go through API routes with zod validation + rate limiter; service-role key only under `src/server` and `lib/supabase/admin.ts`; `sanitizeFooterHref`-style URL whitelisting for any injected link/image.
7. **URL-safe html output** — blog rich text must render through `SafeRichTextRenderer`.
8. **Naming**: registry IDs `category.name.vN` (`header.simple.v1`); node IDs `sec_x`; file name = component name PascalCase.

---

## 6. "I Want To…" Navigation Cheatsheet

| Task | Start here |
|---|---|
| Add NEW website section type | new file in `components/website/<category>/` → export definition → register in `builder/registry/index.ts` |
| Modify an existing section | `components/website/...` file: schema + defaults + component + editor controls |
| Add header/footer template variant | new component file + `*VariantsModal.tsx` entry + palette dedupe list |
| Editor behaviours (save/undo/publish) | `components/editor/EditorShell.tsx`, `builder/history/history-manager.ts` |
| Page actions / modals | `components/pages/*.tsx` (`src/app/websites/[id]/pages/page.tsx`) |
| Forms logic / submissions | `services/forms-manager.service.ts`, `api/forms/[formId]/submit`, `repo form.repo.ts` |
| Navigation menus | `services/navigation-manager.service.ts`, `components/navigation/*` |
| Blog CMS | `components/blog/*`, `services/blog-manager.service.ts`, `api/…/blog` |
| SEO settings / sitemaps | `services/seo-manager.service.ts`, `server/services/seo.service.ts` |
| Public site rendering | `app/site/[domainOrSlug]/[[...slug]]/page.tsx` + `builder/renderer/*` |
| Themes & design system | `themes/*`, `app/globals.css`, `tailwind.config.ts`, `components/editor/design-system/*` |
| DB schema changes | `supabase/migrations/00X_*.sql` + `types/database.ts` + `repo` + zod `database.schema.ts` |
| Auth / route protection | `middleware.ts`, `lib/supabase/middleware.ts`, `services/auth.service.ts` |
| Tests for a feature | `tests/unit/<feature>.test.ts(x)` — follow existing patterns (RTL + zod checks) |

---

## 7. Current State Snapshot (for session-onboarding)

- **Phases 0–26 complete** — details and task lists in `DEVELOPMENT_PROGRESS.md`. Latest: three ready-made footer templates (Classic / Multi-Column / Newsletter) with a real-preview variants modal, full test coverage.
- **Test suite:** 34 vitest suites (`pnpm test`); footer-variants suite = 18 tests (schemas, safe URLs, newsletter honesty, modal, editor integration).
- **In progress at review time:** `websites/[websiteId]/overview/page.tsx` redesign (new `website-overview.test.tsx`) — see its two pending ESLint notes if lint is red.
- **Tab system:** editor palette has Elements / Templates / Layers / Design-System tabs; header + footer template cards open accessible modals with REAL component previews (desktop direct; tablet/mobile via IsolatedFrame).
- **The diagrams above reflect actual code, not aspirations** — all listed components are registered and covered by tests except admin pages (visual-only plane without DB wiring) and `media` page (placeholder/manager under activation).

---

*Generated for AI onboarding — keep this file updated when folder structure meaningfully changes (new top-level module, deactivated component registry ids, or moved data flows).*
