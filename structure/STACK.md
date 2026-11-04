# SecureSite Studio --- Technical Stack & Architecture

**Version:** 1.0\
**Architecture style:** Multi-tenant SaaS, modular monolith first,
approved-component rendering.

------------------------------------------------------------------------

## 1. Recommended Stack

  -----------------------------------------------------------------------
  Layer                   Recommendation          Responsibility
  ----------------------- ----------------------- -----------------------
  Web application         Next.js App Router +    Dashboard, editor
                          React                   shell, public pages

  Language                TypeScript              Type safety across
                                                  application

  Styling                 Tailwind CSS + CSS      UI styling and theme
                          variables               tokens

  UI primitives           shadcn/ui + Radix UI    Accessible dashboard
                                                  controls

  Forms                   React Hook Form + Zod   Form state and
                                                  validation

  Page configuration      Zod                     Validate JSON before
  validation                                      persistence/rendering

  Drag and drop           dnd-kit                 Reorder and insert
                                                  editor nodes

  Editor foundation       Custom editor           Visual editing
                          initially; evaluate     experience
                          Puck                    

  Database                Supabase PostgreSQL     Multi-tenant relational
                                                  data

  Authentication          Supabase Auth           User identity and
                                                  sessions

  Authorization           Server-side policy      Tenant/resource access
                          layer + PostgreSQL RLS  

  File storage            Supabase Storage        Images and documents
                          initially               

  Background jobs         Managed queue or        AI, image processing,
                          Redis-backed worker     publishing
                          when needed             

  AI                      Provider adapter around Structured website
                          selected LLM API        proposals

  Email                   Transactional email     Verification and
                          provider adapter        notifications

  Payments                Payment provider        Plans and subscriptions
                          integration             

  Testing                 Vitest + React Testing  Unit, component, and
                          Library + Playwright    end-to-end tests

  Monitoring              Error reporting +       Production diagnostics
                          structured logs         

  CI/CD                   GitHub Actions +        Checks and deployment
                          deployment platform     
  -----------------------------------------------------------------------

**Important:** Start with a modular Next.js application. Do not
introduce a separate NestJS backend, Redis, microservices, or multiple
databases until a measured requirement justifies them.

## 2. Core Architecture Principle

The platform must separate **what the system can render** from **what a
specific website wants to display**.

-   React components define what is possible.
-   Component schemas define valid properties.
-   Component Registry maps stable component IDs to approved
    implementations.
-   JSON page documents define which components appear, their order,
    content, and supported settings.
-   Theme configuration defines global design tokens.
-   Renderer turns validated page documents into React output.
-   Editor updates the page document, not arbitrary application source
    code.

One platform codebase can render many independent website templates. A
new template usually needs configuration and content, not a new Next.js
application. A genuinely new layout or capability may require a new
approved React component.

## 3. High-Level Request Flow

### Editor flow

1.  Browser requests the editor route.
2.  Server authenticates the user.
3.  Server verifies website membership and permission.
4.  Server loads the website, selected page draft, theme, and component
    version.
5.  Page JSON is validated.
6.  Editor renders the page through the shared renderer.
7.  User changes a component setting or moves a section.
8.  Editor updates local document state.
9.  Autosave sends a validated document revision to the server.
10. Server checks authorization, schema version, and revision conflict.
11. Server persists the new draft revision.

### Public website flow

1.  Visitor requests a website domain and path.
2.  Domain resolver maps the hostname to an active website.
3.  Server loads the latest published page version.
4.  Server validates/loads the stored document and theme.
5.  Renderer outputs approved React components.
6.  SEO metadata and canonical URL are applied.
7.  Page is delivered with caching where safe.

The public renderer must never load draft content by default.

## 4. Component Registry

Each component must have: - Stable ID, e.g. `hero.split.v1`. -
Human-readable name and category. - React implementation. - Zod settings
schema. - Default settings. - Editor property metadata. -
Version/compatibility policy. - Optional thumbnail or preview metadata.

Example conceptual definition:

``` ts
type ComponentDefinition<TSettings> = {
  id: string;
  label: string;
  category: string;
  version: number;
  schema: ZodSchema<TSettings>;
  defaults: TSettings;
  component: React.ComponentType<TSettings>;
  editor?: {
    controls: PropertyControlDefinition[];
  };
};
```

Example registry:

``` ts
export const componentRegistry = {
  "hero.split.v1": HeroSplit,
  "header.simple.v1": HeaderSimple,
  "services.grid.v1": ServicesGrid,
  "testimonials.cards.v1": TestimonialsCards,
  "footer.simple.v1": FooterSimple,
} as const;
```

Use explicit registration and schemas. Do not dynamically import
arbitrary file paths supplied by JSON. A stored component ID must
resolve only to a registered, approved component.

## 5. JSON Page Document

Store a versioned document. Do not store executable JavaScript, JSX,
arbitrary imports, or server-side code in JSON.

Example:

``` json
{
  "schemaVersion": 1,
  "page": {
    "id": "page_home",
    "title": "Home",
    "slug": "/",
    "status": "draft"
  },
  "sections": [
    {
      "id": "section_header",
      "componentId": "header.simple.v1",
      "componentVersion": 1,
      "props": {
        "logoAlt": "Elite Plumbing",
        "navigationMenuId": "menu_main",
        "ctaLabel": "Get a Quote"
      },
      "style": {
        "background": "surface",
        "spacing": "compact"
      },
      "children": []
    },
    {
      "id": "section_hero",
      "componentId": "hero.split.v1",
      "componentVersion": 1,
      "props": {
        "eyebrow": "Local Plumbing Experts",
        "title": "Reliable Plumbing Services",
        "description": "Professional service for homes and businesses.",
        "buttonLabel": "Get a Free Quote",
        "imageAssetId": "asset_123"
      },
      "style": {
        "theme": "brand",
        "alignment": "left"
      },
      "children": []
    }
  ]
}
```

### JSON rules

-   Every node has a stable unique ID.
-   `componentId` must exist in the registry.
-   `props` must pass that component's schema.
-   Style values must use approved tokens or validated bounded values.
-   Child nesting must be explicitly supported by the component schema.
-   Unknown component IDs must produce a safe editor error/fallback, not
    execute code.
-   Add migrations when document schemas change.
-   Validate on both client and server; server validation is
    authoritative.
-   Keep page content separate from global website settings and from
    blog post records.

## 6. Theme System

A theme is a validated token configuration, not a separate codebase.

Example:

``` json
{
  "themeVersion": 1,
  "colors": {
    "primary": "#6D3BFF",
    "text": "#17152B",
    "surface": "#FFFFFF",
    "background": "#F7F7FB"
  },
  "typography": {
    "fontFamily": "Inter",
    "headingWeight": 700,
    "bodyWeight": 400
  },
  "radius": {
    "card": "16px",
    "button": "10px"
  },
  "spacing": {
    "sectionY": "72px",
    "containerX": "24px"
  }
}
```

Validate colors, font choices, spacing ranges, and radius values.
Convert theme tokens to CSS variables. Do not accept arbitrary CSS
strings or CSS injection.

## 7. Renderer

The renderer must: 1. Receive a validated page document. 2. Resolve each
component ID through the registry. 3. Validate component props. 4.
Render the matching React component. 5. Apply approved theme tokens and
layout settings. 6. Handle unsupported/migrating components safely. 7.
Preserve semantic HTML and accessibility.

Keep editor-only selection outlines and controls outside the public
production output. Prefer a renderer API that can operate in editor mode
and public mode without duplicating the page rendering logic.

## 8. Editor Architecture

Suggested modules:

-   `EditorShell`: top toolbar and panel layout.
-   `Canvas`: renders page document.
-   `ComponentPalette`: searchable approved components.
-   `SectionLibrary`: prebuilt section compositions.
-   `LayerTree`: nested page structure.
-   `PropertiesPanel`: schema-driven controls.
-   `PageNavigator`: page switching.
-   `ViewportControls`: desktop/tablet/mobile.
-   `HistoryManager`: undo/redo.
-   `AutosaveManager`: debounced save and retry.
-   `DocumentStore`: normalized page state and operations.
-   `EditorAdapter`: boundary around the chosen editor library.

### Editing operations

Use explicit operations such as: - `INSERT_NODE` - `UPDATE_NODE_PROPS` -
`UPDATE_NODE_STYLE` - `MOVE_NODE` - `DUPLICATE_NODE` - `DELETE_NODE` -
`REPLACE_NODE`

Each operation must be validated and must preserve stable IDs. Use
undo/redo history with bounded memory and checkpointing.

### Drag and drop

Use dnd-kit for component palette-to-canvas insertion and section
reordering. Dragging must not mutate the public page directly; it
updates the local draft document. Provide keyboard alternatives for
moving nodes.

### Autosave

-   Debounce frequent changes.
-   Display Saving / Saved / Unsaved / Error.
-   Use revision numbers or optimistic concurrency to prevent one editor
    tab silently overwriting another.
-   Retry transient failures safely.
-   Never show Saved until the server confirms persistence.

## 9. Multi-Tenant Data Model

Core tables: - `profiles` or user identity mapping - `organizations` -
`organization_members` - `websites` - `website_members` - `pages` -
`page_revisions` - `templates` - `template_versions` - `menus` -
`menu_items` - `posts` - `categories` - `tags` - `media_assets` -
`domains` - `seo_metadata` - `redirects` - `forms` -
`form_submissions` - `subscriptions` - `usage_records` - `audit_logs` -
`publishing_jobs`

Every tenant-owned row must carry a tenant/website relationship that can
be checked. Use foreign keys, indexes, and RLS policies. Do not rely on
client-supplied IDs or hidden UI controls for security.

## 10. Draft and Published Versioning

Maintain separate draft and published references.

Recommended approach: - `pages` stores identity, slug, and current
revision pointers. - `page_revisions` stores immutable validated JSON
snapshots. - `draft_revision_id` points to current editable draft. -
`published_revision_id` points to the currently live version.

Publishing: 1. Validate all pages, routes, assets, menus, and SEO
configuration. 2. Create/identify a publish snapshot. 3. Build/activate
the new published version. 4. Update the published pointer only after
successful completion. 5. Preserve previous published version for
rollback.

A failed publish must not replace the currently live site with a broken
version.

## 11. Template Copying and Versioning

A template consists of: - Template metadata. - Template version. - Theme
tokens. - Page documents. - Menus. - Asset references or safe starter
assets.

When a user selects a template, create an independent website copy. The
copied website must not depend on mutable template records. Template
updates must never silently overwrite customer content.

## 12. Security Architecture

-   Server-side authentication and authorization on every protected
    operation.
-   PostgreSQL RLS as a second layer of tenant isolation.
-   Validate all request bodies with schemas.
-   Sanitize rich text and user-provided URLs.
-   Restrict iframe/embed sources to an allowlist.
-   Do not execute customer-supplied PHP/JS or arbitrary server code.
-   Do not dynamically import component paths from stored JSON.
-   Store secrets only in server-side environment/secrets management.
-   Protect uploads by MIME type, size, ownership, and safe storage
    rules.
-   Rate-limit authentication, AI, uploads, and publishing.
-   Log sensitive admin actions.
-   Use CSRF protections where applicable and secure cookie settings.
-   Test cross-tenant access denial explicitly.

## 13. Suggested Repository Structure

``` text
src/
  app/
    (marketing)/
    (auth)/
    dashboard/
    websites/[websiteId]/
      overview/
      pages/
      editor/[pageId]/
      templates/
      media/
      domains/
      seo/
      settings/
    admin/
    site/[domainOrSlug]/
  components/
    ui/
    dashboard/
    editor/
    website/
      header/
      hero/
      services/
      features/
      testimonials/
      faq/
      forms/
      footer/
  builder/
    registry/
    renderer/
    schemas/
    document/
    operations/
    history/
    adapters/
  themes/
    schemas/
    presets/
  templates/
    definitions/
  lib/
    auth/
    authorization/
    database/
    storage/
    validation/
    domains/
    publishing/
    ai/
  server/
    actions/
    services/
    repositories/
  types/
supabase/
  migrations/
  seed.sql
tests/
  unit/
  integration/
  e2e/
```

Adjust routing to the selected hosting/domain strategy. Keep domain
resolution and public website rendering isolated from dashboard
authorization logic.

## 14. Testing Strategy

### Unit tests

-   Component schemas.
-   Registry lookup.
-   JSON validation.
-   Theme validation.
-   Document operations.
-   Migrations.
-   URL and slug validation.

### Integration tests

-   Authorization policies.
-   RLS tenant isolation.
-   Draft save and revision creation.
-   Template copy independence.
-   Publishing and rollback.
-   Media ownership.

### End-to-end tests

-   Register/login.
-   Create website from template.
-   Add/edit/reorder/delete components.
-   Autosave and reload.
-   Preview.
-   Publish.
-   Verify published page.
-   Confirm another tenant cannot access private data.

## 15. Deployment Strategy

Environments: - Local development. - Staging. - Production.

Required: - Environment variables separated by environment. - Database
migrations in CI/CD. - Typecheck, lint, unit tests, and build before
deployment. - Preview deployments for review. - Error monitoring and
structured logs. - Backups and tested restore procedure. - Domain/HTTPS
provisioning with ownership verification.

## 16. Decisions to Make Before Production

These are explicit architecture decisions, not assumptions: 1. Whether
Puck is used as the editor foundation or the editor is fully custom. 2.
Hosting model for customer websites and wildcard subdomains. 3. Domain
routing and certificate automation provider. 4. Whether Supabase Storage
is sufficient or S3-compatible storage is required. 5. Background job
provider. 6. AI model/provider and usage pricing. 7. Payment provider
and supported countries. 8. Published website caching and deployment
model.

Do not block the first foundation sprint on all future infrastructure
decisions. Build the JSON model, registry, renderer, and one template
first.
