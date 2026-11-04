# SecureSite Studio --- Product Requirements Document

**Version:** 1.1\
**Product type:** Multi-tenant AI Website Builder & CMS SaaS\
**Status:** Product and implementation specification\
**Primary interface:** Next.js web application\
**Core principle:** One platform codebase, reusable React components,
versioned JSON page documents, theme tokens, and a shared renderer.

------------------------------------------------------------------------

# 1. Product Vision

SecureSite Studio enables business owners, freelancers, agencies, and
developers to create, customize, publish, and manage professional
websites without maintaining separate codebases for every website.

Users can: - Start from a professionally designed template. - Generate a
website draft with AI. - Build pages with an Elementor-like visual
editor. - Add, remove, reorder, duplicate, and configure approved
components. - Create additional pages that inherit the website's design
system. - Manage content, navigation, media, blog posts, SEO, domains,
and publishing. - Manage multiple websites from one account/workspace.

The platform owner has a separate Super Admin area for users, websites,
templates, subscriptions, usage, security, and platform operations.

## 1.1 Product promise

**Build, customize, and manage multiple professional websites from one
secure, AI-assisted platform.**

The product must prioritize usability, security, performance,
maintainability, and predictable publishing. Never claim that any
platform is completely hack-proof or that search rankings are
guaranteed.

# 2. Product Architecture --- Non-Negotiable Foundation

This section captures the agreed architecture and must guide all
implementation work.

## 2.1 One codebase, many websites

Multiple website designs do **not** require a separate Next.js project
or codebase for every customer website.

The platform has: 1. A shared Next.js application. 2. A reusable React
component library. 3. A centralized Component Registry. 4. Component
settings schemas. 5. A Theme System. 6. A versioned JSON-based page
document format. 7. A shared Page Renderer. 8. A Visual Editor that
updates the JSON document. 9. A publishing system that publishes a
validated revision.

A website template is primarily a configuration/data package composed of
pages, component IDs, settings, theme tokens, navigation, content, and
asset references.

A new template can normally be created by composing existing components
and settings. If a new design or behavior cannot be represented by
current components, developers add a new approved React component,
schema, registry entry, and editor controls.

## 2.2 The core rule

> Code defines what is possible. JSON defines what to display. The
> editor changes the JSON. The renderer displays the website.

-   React code defines component behavior and structure.
-   Zod schemas define valid component properties and document
    structure.
-   Registry maps a stable component ID to its approved React component.
-   JSON defines component order, content, settings, and supported
    layout options.
-   Theme tokens define global colors, typography, spacing, and design
    defaults.
-   Renderer converts the validated document into React output.
-   Editor provides controls to safely update the document.

JSON is not a replacement for React, CSS, or Next.js. It is the
structured data layer between the editor and the renderer.

## 2.3 Example page document

The exact schema may evolve, but the implementation must support this
concept:

``` json
{
  "schemaVersion": 1,
  "page": {
    "id": "home",
    "title": "Home",
    "slug": "/",
    "status": "draft"
  },
  "sections": [
    {
      "id": "header-1",
      "componentId": "header.simple.v1",
      "componentVersion": 1,
      "props": {
        "logoAlt": "Example Business",
        "ctaLabel": "Contact Us"
      },
      "style": {
        "variant": "light"
      },
      "children": []
    },
    {
      "id": "hero-1",
      "componentId": "hero.split.v1",
      "componentVersion": 1,
      "props": {
        "title": "Professional Services You Can Trust",
        "description": "Quality service for local customers.",
        "buttonLabel": "Get a Quote"
      },
      "style": {
        "alignment": "left",
        "background": "surface"
      },
      "children": []
    }
  ]
}
```

Rules: - Each node has a stable unique ID. - Component IDs must resolve
through an explicit allowlisted registry. - Every component's props must
validate against its schema. - JSON must never contain executable code,
JSX, arbitrary imports, or server-side scripts. - Style settings must
use approved tokens and validated values. - Documents must include a
schema version and have a migration strategy. - Server-side validation
is authoritative. - Unknown components must fail safely and provide a
recoverable editor message.

## 2.4 Component Registry

Each registered component must include: - Stable ID such as
`hero.split.v1`. - Display name and category. - React component
implementation. - Zod props schema. - Default props. - Editor control
metadata. - Component version and compatibility policy. - Optional
preview thumbnail.

Example conceptual registry:

``` ts
export const componentRegistry = {
  "header.simple.v1": HeaderSimple,
  "hero.split.v1": HeroSplit,
  "services.grid.v1": ServicesGrid,
  "testimonials.cards.v1": TestimonialsCards,
  "footer.simple.v1": FooterSimple
};
```

Never allow JSON to specify an arbitrary import path. A user can only
select components that have been registered and approved by the
platform.

## 2.5 Theme System

Every website has a theme configuration that controls: - Brand colors. -
Typography and font choices. - Heading/body weights. - Content width. -
Section spacing. - Button styles. - Border radius. - Shadows. -
Background/surface tokens. - Responsive design defaults.

Themes must be data-driven and validated. Apply them through CSS
variables or a controlled theme provider. Do not accept unrestricted CSS
strings.

## 2.6 Shared Renderer

The renderer must: 1. Receive a validated page document and theme. 2.
Resolve each component ID through the registry. 3. Validate component
props. 4. Render the matching React component. 5. Apply approved theme
and style tokens. 6. Support editor mode and public mode. 7. Handle
unsupported component versions safely. 8. Produce semantic and
accessible HTML.

The editor canvas and published website must use the same component
implementation and rendering rules wherever possible. Editor-only
selection borders and controls must not appear on the public website.

------------------------------------------------------------------------

# 3. Target Users and Roles

## 3.1 Target audience

-   Small and local businesses.
-   Freelancers.
-   Web developers.
-   Digital marketing and SEO agencies.
-   Startups.
-   Bloggers and content creators.
-   Businesses with multiple locations or service pages.

## 3.2 Roles

-   **Super Admin:** platform-level control.
-   **Organization Owner:** owns an organization and its websites.
-   **Website Owner/Admin:** manages a website and permissions.
-   **Editor:** edits pages, navigation, and permitted content.
-   **Author:** creates and manages permitted blog content.
-   **Viewer:** read-only access.

Authorization must be enforced on the server and database, not only by
hiding interface elements.

# 4. Product Scope and Release Boundaries

## 4.1 MVP

The MVP should deliver one complete, reliable path from account creation
to a published template-based website.

MVP includes: - Authentication and account recovery. - Website creation
wizard. - Template gallery and independent template copying. - Component
registry and JSON renderer. - Initial reusable component library. -
Visual editor with add, select, edit, reorder, duplicate, delete. -
Draft autosave and revision history. - Pages and navigation
management. - Basic blog CMS. - Media library. - Theme/global design
settings. - Basic SEO settings and sitemap. - Preview and publishing. -
Platform subdomain support. - Custom domain workflow, subject to
infrastructure readiness. - Basic customer dashboard. - Basic Super
Admin dashboard. - Tenant isolation, audit logs, backups, usage limits.

## 4.2 Post-MVP

-   Advanced AI editing and multi-step AI workflows.
-   E-commerce.
-   Membership websites.
-   Advanced analytics.
-   Agency client workspaces.
-   Third-party integrations and webhooks.
-   Advanced form automation.
-   Multilingual management.
-   Developer APIs.
-   Approved third-party component marketplace.

Arbitrary server-side plugins and unrestricted customer code execution
are excluded from the initial product.

# 5. Main User Journeys

## 5.1 Create a website from a template

1.  User registers and verifies email.
2.  User clicks **Create Website**.
3.  User enters website name and business category.
4.  User chooses a template.
5.  Platform displays a preview and included pages.
6.  User confirms template.
7.  Platform creates an independent copy of the template.
8.  User enters the website workspace.
9.  User edits content and design.
10. User previews the website.
11. User publishes when ready.

Acceptance: - Website starts as draft. - Template copy is independent. -
Original template updates never overwrite the customer website. - User
cannot access another tenant's website.

## 5.2 Generate a website with AI

1.  User selects AI Website Generator.
2.  User provides business name, type, description, services,
    location/contact details, tone, and preferred style.
3.  User chooses desired pages.
4.  Backend checks permission and usage allowance.
5.  AI returns a structured proposal using supported component IDs and
    schemas.
6.  Backend validates the proposal.
7.  User previews the proposed website.
8.  User can regenerate or adjust the prompt.
9.  User approves the proposal.
10. Platform saves it as a draft website.
11. User edits it in the visual editor.
12. User publishes manually.

Acceptance: - AI cannot write arbitrary code or choose unregistered
components. - AI output is validated before persistence. - User approval
is required before applying generated changes. - AI generation never
silently publishes a website.

## 5.3 Edit an existing website

1.  User opens Websites.
2.  User selects a website.
3.  User selects a page.
4.  Editor loads the current draft revision; if no draft exists, it
    initializes from the current published revision.
5.  User selects a component in the canvas or layer tree.
6.  Properties panel displays only controls supported by that component
    schema.
7.  User edits text, image, layout, or style.
8.  Local document state updates.
9.  Autosave persists a new draft revision.
10. User previews and publishes.

Acceptance: - Editing changes the JSON page document, not React source
code. - The renderer immediately reflects valid local changes. - Save
status is visible. - Failed saves are recoverable. - Published website
remains unchanged until publish succeeds.

## 5.4 Add a new page

1.  User opens Pages.
2.  User selects Create Page.
3.  User chooses blank page or a page layout/template.
4.  Platform creates a page document with the website's theme.
5.  User adds sections/components.
6.  User sets title and slug.
7.  User configures SEO.
8.  User saves draft and publishes when ready.

Acceptance: - Page slug is unique within the website. - Page uses the
same component registry and theme system. - Page can be added to a
navigation menu. - Draft page is not included in the public sitemap.

## 5.5 Publish and rollback

1.  User clicks Publish.
2.  Server validates page documents, components, assets, routes, menus,
    and SEO settings.
3.  Platform creates a publish snapshot.
4.  Publishing system prepares the new live version.
5.  New published version becomes active only after success.
6.  User sees a clear success state and public URL.
7.  Authorized user can restore a previous published revision.

Acceptance: - Failed publishing never destroys the working live
version. - Draft content stays private. - Publish failures are logged
and visible. - Rollback is possible.

# 6. Application Information Architecture

## 6.1 Public marketing website

Required pages: - Home - Features - Templates - Pricing - Security -
Documentation - About - Contact - Login - Registration - Privacy
Policy - Terms of Service

Homepage should explain the builder, show a working/accurate product
demo, show template examples, explain AI generation and managed
publishing, and use a clear CTA.

## 6.2 Customer dashboard

Main navigation: - Dashboard - Websites - Website Builder - Templates -
AI Website Generator - Media Library - Domains - Users & Team - Settings

The website-builder-only dashboard must focus on website creation and
management. Do not add SEO ranking charts, backlink analytics, keyword
research, or unrelated marketing widgets to this dashboard. SEO is
available within the website workspace.

Dashboard overview: - Total Websites - Total Pages - Templates
Available - Storage Used - AI Website Builder banner - Your Websites
list - Quick Actions - Recent Activity

Quick actions: - Create New Website - Use a Template - Generate with
AI - Edit Website - Connect Domain - Publish Website

Metrics and activity must come from real data. Do not hardcode fake
values as live metrics.

## 6.3 Website workspace

-   Overview
-   Pages
-   Navigation / Menus
-   Blog
-   Media
-   Forms
-   SEO
-   Domains
-   Publishing
-   Revisions
-   Website Settings
-   Team / Permissions

## 6.4 Super Admin

Separate navigation: - Overview - Users - Websites - Templates -
Subscriptions - Usage - Security Center - Audit Logs - Platform Settings

# 7. Website Creation Wizard

Required inputs: - Website name. - Business category. - Website
description. - Template or AI generation choice. - Business contact
information. - Logo (optional). - Brand colors (optional). - Default
language. - Time zone. - Platform subdomain.

Flow: 1. Name and category. 2. Template or AI. 3. Business details. 4.
Branding. 5. Review and create.

Optional fields may be skipped. The platform creates a draft website. It
must not become public until explicitly published, except for an
authorized private preview.

# 8. Visual Website Builder --- Detailed Requirements

## 8.1 Editor layout

### Top toolbar

-   Back to website.
-   Website name.
-   Page selector.
-   Undo.
-   Redo.
-   Save state.
-   Desktop/tablet/mobile viewport.
-   Preview.
-   Publish.
-   Page settings.

### Left sidebar

Tabs: - Elements - Sections - Layers - Pages

Elements are searchable and grouped by category. Sections are reusable
prebuilt compositions. Layers show page hierarchy. Pages allow page
navigation and creation.

### Center canvas

-   Actual rendered page.
-   Selectable components.
-   Drag-and-drop insertion.
-   Reorder sections.
-   Drop indicators.
-   Duplicate/delete controls.
-   Responsive viewport preview.
-   Empty-page insertion state.

### Right properties panel

Context-sensitive controls: - Content. - Layout. - Style. -
Advanced/responsive.

Controls must be generated from component editor metadata/schema. Do not
expose arbitrary JavaScript or unrestricted CSS in the MVP.

## 8.2 Initial component library

### Basic

-   Heading
-   Paragraph
-   Rich Text
-   Image
-   Button
-   Icon
-   Video Embed
-   Divider
-   Spacer
-   Container
-   Columns
-   Lists

### Business

-   Header
-   Hero
-   Services Grid
-   Features
-   Pricing
-   Testimonials
-   Team
-   FAQ
-   Statistics
-   Logo Strip
-   CTA
-   Contact Form
-   Map Embed
-   Footer

### Advanced (incremental)

-   Tabs
-   Accordion
-   Gallery
-   Carousel
-   Blog Listing
-   Related Posts
-   Product Cards
-   Search Bar
-   Navigation Menu

Start with a small reliable set. Do not build every component before the
renderer and editor operations work.

## 8.3 Editing requirements

-   Add component.
-   Select component.
-   Edit component properties.
-   Move/reorder component.
-   Duplicate component.
-   Delete component.
-   Undo/redo.
-   Autosave.
-   Responsive preview.
-   Save reusable section.
-   Preview page.
-   Validate before save/publish.
-   Recover from failed save.
-   Preserve stable node IDs.

## 8.4 Component definition requirements

Every component must have: - Stable component ID. - Version. - React
implementation. - Zod props schema. - Default settings. - Editor control
definitions. - Responsive behavior. - Accessible output. - Unit tests.

A component is not complete merely because it looks correct in a static
screenshot. It must render from JSON and expose supported editor
controls.

# 9. Template Management

Categories: - Local Service Business - Digital Marketing Agency -
Restaurant - Portfolio - SaaS Landing Page - Consulting - Personal
Brand - Professional Services

Each template can include: - Multiple page documents. - Navigation
configuration. - Global header/footer. - Theme tokens. -
Section/component arrangements. - Responsive styling. - Default SEO
metadata. - Placeholder content and assets. - Thumbnail and preview. -
Template version.

Admin template workflow: 1. Create template draft. 2. Add pages and
sections using the same builder. 3. Configure theme. 4. Preview
desktop/tablet/mobile. 5. Validate component IDs, props, links, and
assets. 6. Save draft. 7. Publish to template gallery.

Customer workflow: 1. Select template. 2. Preview. 3. Confirm use. 4.
Platform creates independent copy. 5. Customer edits copy. 6. Customer
publishes.

Template updates must never silently overwrite customer websites.

# 10. CMS Requirements

## 10.1 Pages Manager

-   Create/edit/duplicate pages.
-   Page title and slug.
-   Draft/published/unpublished status.
-   Schedule publishing.
-   Preview.
-   Revision restore.
-   Per-page SEO settings.
-   Unique slug per website.

## 10.2 Navigation Manager

-   Multiple menus.
-   Add page/custom link.
-   Reorder.
-   Nested submenu.
-   Rename labels.
-   Hide/show items.
-   Approved link targets.
-   Desktop/mobile preview.
-   Validate parent-child hierarchy.

## 10.3 Blog Manager

-   Create/edit posts.
-   Draft/published/scheduled statuses.
-   Categories and tags.
-   Featured image.
-   Author.
-   Publication date.
-   Slug.
-   SEO metadata.
-   Blog listing and post templates.
-   Pagination.
-   Revision history.

Blog content is stored as content records, not duplicated inside page
layout JSON. A Blog Listing component queries authorized published
posts.

## 10.4 Media Library

-   Upload images/documents.
-   Search/filter.
-   File metadata.
-   Alt text.
-   Preview.
-   File size and MIME validation.
-   Website-level permissions.
-   Image optimization.
-   Safe deletion checks.

Uploaded files must never execute as server-side code.

## 10.5 Forms

MVP: - Contact form component. - Configurable fields. - Required
validation. - Submission storage. - Email notification. - Spam
prevention. - Submission management.

Protect submissions with authorization, retention rules, and secure
logging.

# 11. SEO Management

SEO is part of each website workspace.

## Global SEO

-   Website name.
-   Default title template.
-   Default meta description.
-   Default social image.
-   Default robots directives.

## Per-page SEO

-   SEO title.
-   Meta description.
-   Slug.
-   Canonical URL.
-   Index/noindex.
-   Open Graph metadata.
-   Social image.
-   Structured data.

## Technical SEO

-   XML sitemap.
-   Robots.txt.
-   Canonical validation.
-   Redirect manager.
-   Broken-link checks.
-   Image alt text.
-   Structured data generation.
-   Published-page status.
-   Search Console integration when configured.

Draft pages must not appear in public sitemaps. Avoid duplicate
canonical URLs. Do not promise ranking or indexing outcomes.

# 12. AI Website Assistant

AI features: - Generate initial website structure. - Suggest pages and
sections. - Generate website copy. - Draft blog posts. - Suggest SEO
title and meta description. - Rewrite selected text. - Suggest alternate
layouts. - Recommend palettes. - Suggest image concepts. - Explain
accessibility/design improvements.

Workflow: 1. User submits prompt. 2. Backend authenticates and
authorizes. 3. Usage limit is checked. 4. AI returns structured proposal
using approved component IDs. 5. Backend validates JSON against schemas
and allowed values. 6. User previews proposal. 7. User approves. 8.
Platform saves a draft revision. 9. User edits and publishes.

AI must not receive unrestricted database credentials or execute
generated code. AI changes require user approval before applying.

# 13. Domains and Publishing

## Domains

-   Platform subdomains.
-   Custom domain connection.
-   Domain ownership verification.
-   DNS guidance.
-   HTTPS provisioning and renewal monitoring.
-   Domain status.
-   Disconnect workflow.

Prevent unauthorized domain claims. Verify ownership before activating a
domain.

## Publishing

-   Website can be published independently.
-   Draft changes remain private.
-   Validate configuration before publishing.
-   Failed publishing does not replace working live version.
-   Keep version history and rollback.
-   Show status and errors.
-   Enforce HTTPS on supported production domains.

# 14. Customer Dashboard Requirements

Display: - Website name and status. - Domain status. - Published/draft
page counts. - Recent edits. - Publishing activity. - Storage usage. -
AI usage. - Subscription status. - Security notifications. - Quick
actions.

Quick actions: - Edit Website. - Create Page. - Write Blog Post. -
Customize Navigation. - Manage SEO. - Connect Domain. - Preview. -
Publish. - Manage Team.

Only show resources the current user is authorized to access.

# 15. Super Admin Requirements

## Overview

-   Total users.
-   Active users.
-   Total/published/draft websites.
-   Verified domains.
-   Active subscriptions.
-   Storage and AI usage.
-   Publishing failures.
-   Security alerts.
-   Service health.

## User management

-   Search/filter.
-   Account status.
-   Owned websites.
-   Suspension controls.
-   Recovery support.
-   Audit history.
-   Usage/subscription details.

## Website management

-   Search all websites.
-   Owner details.
-   Publishing/domain status.
-   Storage/usage.
-   Deployment failures.
-   Abuse suspension and restoration workflows.

## Subscription management

-   Plans and quotas.
-   Subscription state.
-   Billing events.
-   Trials and cancellations.
-   Invoices/payment-provider state.

## Security center

-   Authentication events.
-   Failed login alerts.
-   Sensitive account changes.
-   Admin audit logs.
-   Dependency alerts.
-   Domain verification failures.
-   Abuse reports.
-   Backup/recovery status.

Admin access to customer content must be limited to legitimate
operational/support needs and audited.

# 16. Authentication and Authorization

-   Email/password registration.
-   Email verification.
-   Login/logout.
-   Account recovery.
-   Revocable sessions.
-   MFA support; mandatory for Super Admin.
-   Profile and password management.
-   Active session review.
-   Backend authorization on every protected resource.
-   Rate limiting on authentication and recovery.

Permissions must be enforced by server-side policy and database
controls, not UI visibility alone.

# 17. Multi-Tenant Data Model

Required entities: - users/profiles - organizations -
organization_members - websites - website_members - pages -
page_revisions - templates - template_versions - menus - menu_items -
posts - categories - tags - post_tags - media_assets - domains -
seo_metadata - redirects - forms - form_submissions - subscriptions -
usage_records - audit_logs - backups - publishing_jobs

Rules: - Stable primary identifiers. - Foreign-key constraints. -
Consistent timestamps. - Ownership/tenant relationship on every tenant
resource. - Unique page slugs within a website. - Independent template
versions. - Validated JSON page configuration. - Never use IDs as
authorization by themselves. - Define deletion and retention behavior.

# 18. Security Requirements

-   Secure session management.
-   MFA for privileged accounts.
-   Appropriate password hashing.
-   Rate limits.
-   Secure account recovery.
-   Role-based and object-level access control.
-   RLS where applicable.
-   Input validation and output encoding.
-   Rich-text sanitization.
-   CSRF protection where applicable.
-   Secure cookies.
-   Content Security Policy.
-   Injection protection.
-   Dependency scanning.
-   Safe uploads.
-   Secret rotation.
-   Encryption in transit and appropriate encryption at rest.
-   Audit logs.
-   Automated backups and tested restoration.

Do not permit arbitrary customer PHP, unrestricted server-side
JavaScript, or arbitrary plugin execution in the MVP. Third-party
integrations must use approved APIs and scoped permissions.

# 19. Non-Functional Requirements

## Performance

-   Dashboard navigation should feel responsive.
-   Editor remains usable on typical modern devices.
-   Published pages optimized for fast delivery.
-   Images resized/optimized.
-   Expensive operations run asynchronously.

## Reliability

-   Failed saves recoverable.
-   Publishing failure does not corrupt live version.
-   Backups restorable.
-   Jobs support safe retries.
-   Critical failures monitored.

## Accessibility

-   Keyboard-accessible editor controls.
-   Appropriate contrast.
-   Semantic HTML.
-   Accessible form labels.
-   Alt text.
-   Screen-reader-friendly navigation.

## Compatibility

-   Responsive published websites.
-   Modern desktop/mobile browsers.
-   Cross-device dashboard.
-   Valid HTML.
-   Progressive enhancement where practical.

## Scalability

-   Stateless services where practical.
-   Background jobs for expensive tasks.
-   CDN/edge caching for public assets.
-   Database indexing and connection management.
-   Per-tenant quotas.

# 20. Subscription Model

### Free

-   Platform subdomain.
-   Limited websites/pages.
-   Basic templates.
-   Limited storage.
-   Basic SEO controls.

### Starter

-   Custom domain support.
-   More pages.
-   Additional templates.
-   Standard publishing.

### Pro

-   AI credits.
-   Advanced visual editing.
-   Blog and SEO tools.
-   Revision history.
-   Higher limits.

### Agency

-   Multiple client websites.
-   Team permissions.
-   Shared templates.
-   Centralized client management.
-   Higher limits.

Pricing must be decided using infrastructure, AI, support, and market
costs. Payment card details should be handled by a payment provider, not
stored directly.

# 21. Step-by-Step Vibe Coding Implementation Plan

This section is intentionally sequential. Give the coding agent **one
phase at a time**. Do not paste all phases as one request and ask it to
build the entire SaaS at once.

## Global instructions for the coding agent

Use these instructions at the start of every phase:

-   Read `PRD.md`, `DESIGN.md`, and `STACK.md` before coding.
-   Follow the agreed architecture: one Next.js codebase, reusable React
    components, component registry, schemas, theme system, JSON page
    documents, and shared renderer.
-   Do not replace the architecture with hardcoded page layouts.
-   Do not implement future phases early.
-   Inspect the existing repository before changing files.
-   Explain the files/modules to be created or changed.
-   Implement only the requested phase.
-   Run typecheck, lint, tests, and build when relevant.
-   Fix errors before declaring the phase complete.
-   Do not use fake success responses or fake production metrics.
-   Do not weaken authorization or validation to make a demo work.
-   Keep a `IMPLEMENTATION_STATUS.md` file with completed tasks, tests,
    known issues, and next phase.
-   Ask before making a major architecture change.

## Phase 0 --- Repository inspection and technical plan

**Goal:** Understand the repo and agree on the implementation plan
before writing product code.

Tasks: 1. Inspect existing files and package configuration. 2. Check
whether Next.js, TypeScript, Tailwind, and shadcn/ui are already
configured. 3. Identify existing code that can be reused. 4. Propose the
folder structure. 5. Confirm database/auth approach. 6. Create an
implementation checklist and `IMPLEMENTATION_STATUS.md`. 7. Do not build
the editor or dashboard yet.

Acceptance: - Existing project state documented. - Proposed architecture
maps to this PRD. - No unnecessary duplicate dependencies. - Build
baseline status recorded.

## Phase 1 --- Next.js foundation and design system

**Goal:** Build a clean application shell and reusable UI primitives.

Tasks: 1. Configure Next.js App Router and TypeScript. 2. Configure
Tailwind and CSS design tokens from `DESIGN.md`. 3. Add shadcn/ui/Radix
components needed for the first screens. 4. Create app layout, font
setup, responsive sidebar, and top bar. 5. Create reusable Button, Card,
Input, Select, Dialog, Dropdown, Badge, Tabs, Tooltip, Toast, and
EmptyState components. 6. Add route placeholders for dashboard,
websites, templates, and editor. 7. Add lint, typecheck, and build
scripts.

Acceptance: - App runs locally. - Responsive shell works. - Shared
design tokens are used. - No business data is hardcoded as live data. -
Typecheck and build pass.

## Phase 2 --- Authentication and tenant foundation

**Goal:** Create secure user identity and website ownership boundaries.

Tasks: 1. Configure Supabase project/environment variables. 2. Implement
registration, login, logout, email verification, and recovery. 3. Create
profile, organization, membership, website, and website-member
migrations. 4. Define role/permission model. 5. Add server-side auth
helpers and authorization service. 6. Configure RLS policies. 7. Add
protected dashboard routes. 8. Write tests for cross-tenant access
denial.

Acceptance: - User can register and log in. - Protected routes require
authentication. - User A cannot read or modify User B's website. -
Server checks permission for every protected operation. - RLS policies
are tested.

## Phase 3 --- Component schemas and registry

**Goal:** Establish the reusable component system before the editor.

Tasks: 1. Define the versioned page document TypeScript types. 2. Define
Zod schema for page document. 3. Define base component definition type.
4. Implement explicit component registry. 5. Implement registry lookup
and safe unknown-component handling. 6. Create initial components:
Header, Hero, About, Services, Features, Testimonials, FAQ, CTA, Footer.
7. Give each component a Zod props schema and defaults. 8. Define editor
metadata for each supported property. 9. Add component unit tests.

Acceptance: - Components render independently. - Every component has
schema/defaults. - Invalid props are rejected. - Unknown component IDs
cannot trigger dynamic imports or code execution. - Registry is the only
component resolution source.

## Phase 4 --- Theme system and JSON renderer

**Goal:** Render a complete website from JSON without hardcoding page
composition.

Tasks: 1. Define theme schema and initial theme presets. 2. Convert
theme tokens to CSS variables. 3. Define page document version and
migration entry point. 4. Implement PageRenderer. 5. Resolve nodes
through Component Registry. 6. Validate props before rendering. 7. Add
editor/public rendering modes. 8. Add error boundaries and safe fallback
behavior. 9. Create one sample business website JSON with Home, About,
Services, and Contact pages. 10. Verify that changing JSON changes the
rendered website without changing component code.

Acceptance: - At least one multi-page website renders entirely from
JSON. - Two different JSON templates render visibly different layouts. -
Changing a title or section order changes the preview. - Theme changes
update supported colors/typography. - Renderer does not execute
arbitrary JSON content. - Public renderer does not expose editor
controls.

## Phase 5 --- Website and template data model

**Goal:** Persist website/page/template data safely.

Tasks: 1. Create website, page, page revision, template, and template
version tables. 2. Add foreign keys, indexes, constraints, and RLS. 3.
Implement server-side repository/service layer. 4. Seed one or two
development templates. 5. Implement template listing and preview
metadata. 6. Implement independent template copy operation. 7. Ensure
copied pages/assets/settings do not depend on mutable source template
records.

Acceptance: - User can list only authorized websites. - Template can be
copied into a new draft website. - Editing the copy does not alter the
original template. - Another tenant cannot access the copy. - Database
migrations are reproducible.

## Phase 6 --- Website creation wizard and dashboard

**Goal:** Allow users to create and manage websites.

Tasks: 1. Implement Create Website wizard. 2. Add website
name/category/details. 3. Add template selection and preview. 4. Create
draft website from selected template. 5. Implement dashboard KPI queries
from database. 6. Implement website list with status, domain, and
last-edited time. 7. Implement quick actions and recent activity from
real events. 8. Add loading, empty, error, and success states.

Acceptance: - User can create a website from a template. - Dashboard
shows only authorized websites. - Metrics reflect database values. - New
website remains draft. - Empty state guides a new user.

## Phase 7 --- Visual editor foundation

**Goal:** Build the three-panel editor using the existing renderer.

Tasks: 1. Build editor top toolbar. 2. Build left tabs: Elements,
Sections, Layers, Pages. 3. Build center canvas using PageRenderer. 4.
Build right properties panel. 5. Add component selection and
selected-node state. 6. Generate property controls from editor metadata.
7. Add page selector. 8. Add desktop/tablet/mobile preview modes. 9. Add
canvas empty state and error states. 10. Keep editor UI state separate
from persisted page document.

Acceptance: - Editor displays the same component output as the public
renderer. - Selecting a component opens its correct controls. - Editing
a text property updates local preview. - Unsupported properties are not
exposed. - Editor does not edit React source code.

## Phase 8 --- Document operations, drag-and-drop, history

**Goal:** Make the editor interactive and reliable.

Tasks: 1. Implement document operations: insert, update props, update
style, move, duplicate, delete, replace. 2. Preserve stable node IDs. 3.
Integrate dnd-kit for palette-to-canvas and reordering. 4. Add keyboard
alternatives for moving components. 5. Implement undo/redo history. 6.
Implement section insertion and saved section format. 7. Prevent invalid
nesting and invalid component placement.

Acceptance: - User can add, move, duplicate, and delete supported
components. - Undo/redo restores previous document state. - Dragging
shows a clear drop target. - IDs remain unique. - Invalid operations are
rejected.

## Phase 9 --- Autosave and revisions

**Goal:** Save draft changes without losing work.

Tasks: 1. Add page revision persistence. 2. Implement debounced
autosave. 3. Show Saving, Saved, Unsaved, and Error states. 4. Add retry
and recovery behavior. 5. Add optimistic concurrency/revision checks. 6.
Warn before leaving with unsaved changes. 7. Implement revision list and
restore-to-draft.

Acceptance: - Refreshing after confirmed save retains edits. - Failed
save does not show Saved. - Concurrent stale edits do not silently
overwrite newer data. - Restoring a revision creates a new draft
revision. - Published version remains unchanged.

## Phase 10 --- Preview and publishing

**Goal:** Publish a validated revision safely.

Tasks: 1. Implement private preview URLs with authorization/expiry. 2.
Implement publish validation. 3. Create immutable publish snapshot. 4.
Implement publish job/status. 5. Activate new published revision only
after successful publish. 6. Add rollback to previous published
revision. 7. Implement public page renderer route. 8. Apply SEO metadata
and canonical URL. 9. Exclude drafts from public rendering and sitemap.

Acceptance: - Preview is private and controlled. - Published site
displays published revision. - Draft changes do not leak. - Failed
publish preserves previous live site. - Rollback works.

## Phase 11 --- Pages, menus, blog, media, forms

**Goal:** Deliver CMS functionality.

Tasks: 1. Pages list/create/edit/duplicate/unpublish. 2. Unique slug
validation. 3. Menu manager with nested items and reorder. 4. Blog
posts, categories, tags, author, featured image, and revisions. 5. Media
upload, metadata, alt text, search, filtering, safe deletion. 6. Contact
form builder/component and submission storage. 7. Email notifications
and spam controls.

Acceptance: - Page and blog records remain distinct from layout JSON. -
Menu hierarchy validates. - Media access is tenant-scoped. - Uploads are
MIME/size validated. - Form submissions are protected.

## Phase 12 --- SEO and domains

**Goal:** Provide website-level SEO and production domain settings.

Tasks: 1. Global SEO defaults. 2. Per-page SEO metadata. 3. Canonical
and robots controls. 4. Sitemap generation from published/indexable
pages. 5. Robots.txt. 6. Redirect manager and loop validation. 7.
Structured data using approved schemas. 8. Platform subdomain routing.
9. Custom domain verification. 10. HTTPS provisioning/status
integration.

Acceptance: - Draft/noindex pages are handled correctly. - Canonicals
are valid and unique. - Sitemap contains only eligible published URLs. -
Domain cannot be claimed without verification. - HTTPS status is
visible.

## Phase 13 --- AI website generation

**Goal:** Generate structured draft websites using approved components.

Tasks: 1. Create provider adapter for AI requests. 2. Define strict
structured output schema. 3. Provide component registry catalog to the
generation service. 4. Enforce usage limits and rate limits. 5. Validate
every generated component ID and prop. 6. Preview proposal before
applying. 7. Save approved output as a draft revision. 8. Add
regenerate/revise workflow. 9. Log usage without storing unnecessary
sensitive prompt data.

Acceptance: - AI cannot create unregistered component IDs. - Invalid
output is rejected or safely repaired through a controlled retry. - User
approves before changes are applied. - AI cannot publish
automatically. - Usage is tracked.

## Phase 14 --- Super Admin, subscriptions, and operations

**Goal:** Add platform management and monetization.

Tasks: 1. Super Admin role and mandatory MFA. 2. User and website
management. 3. Template publishing controls. 4. Usage monitoring. 5.
Subscription plans and quotas. 6. Payment provider integration. 7. Audit
log viewer. 8. Security center. 9. Backup status and restore workflow.
10. Feature flags and platform settings.

Acceptance: - Admin-only endpoints reject regular users. - Admin actions
are audited. - Payment data remains with provider. - Usage limits are
enforced server-side. - Backup restoration is tested.

## Phase 15 --- Hardening and launch readiness

Tasks: 1. Run unit, integration, and end-to-end suites. 2. Test tenant
isolation with multiple accounts. 3. Run dependency and secret scanning.
4. Validate upload, domain, and publishing abuse cases. 5. Test keyboard
accessibility. 6. Test responsive dashboard and editor. 7. Run
performance/load tests. 8. Verify backup restoration. 9. Prepare
documentation and support workflows. 10. Resolve critical/high launch
blockers.

Acceptance: - No unresolved critical security findings. - Core user
journeys pass end-to-end. - Monitoring and alerting are active. -
Rollback and restore procedures are documented and tested.

# 22. Required Testing Matrix

  Area             Required test
  ---------------- -----------------------------------------------------
  Authentication   Registration, verification, login, recovery, logout
  Authorization    Cross-tenant read/write denial
  Registry         Unknown component rejected safely
  JSON             Invalid schema rejected
  Theme            Invalid token/value rejected
  Renderer         JSON changes produce expected output
  Template         Copy is independent
  Editor           Add/edit/move/duplicate/delete
  History          Undo/redo correctness
  Autosave         Save, failure, retry, conflict
  Publishing       Draft isolation, failure safety, rollback
  CMS              Page slug and menu hierarchy
  Media            MIME, size, ownership, deletion
  SEO              Canonical, sitemap, robots, redirects
  AI               Structured output validation and approval
  Domains          Ownership verification
  Admin            Privileged action authorization and audit

# 23. Definition of Done for Every Phase

A phase is complete only when: - Requested functionality is
implemented. - Code follows the agreed architecture. - TypeScript has no
relevant errors. - Lint passes. - Tests for the phase pass. - Build
passes where applicable. - UI has loading, empty, error, and success
states where relevant. - Authorization and validation are implemented
for data operations. - No unrelated future-phase feature has been
added. - `IMPLEMENTATION_STATUS.md` is updated with evidence and
remaining issues.

# 24. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Cross-tenant data exposure          Server authorization, RLS,
                                      integration tests

  Editor complexity                   Start with approved components and
                                      constrained settings

  Invalid AI layouts                  Strict schemas and approval preview

  Slow public pages                   Image optimization, caching,
                                      performance tests

  Publishing failure                  Immutable snapshots and rollback

  Infrastructure cost                 Usage quotas and monitoring

  Vulnerable dependencies             Automated scanning and patching

  Scope expansion                     Sequential phases and acceptance
                                      criteria

  Domain abuse                        Ownership verification

  Data loss                           Automated backups and restore tests
  -----------------------------------------------------------------------

# 25. Final Product Definition

SecureSite Studio is a multi-tenant SaaS platform with: - Public
marketing website. - Authentication and customer workspaces. - Multiple
websites per customer. - One reusable component system. - JSON-based
page structure. - Theme system. - Shared renderer. - Visual
drag-and-drop editor. - Template library. - Pages, navigation, blog, and
media CMS. - Website-level SEO controls. - AI-assisted website and
content generation. - Preview, publishing, domains, and rollback. -
Security controls and Super Admin dashboard. - Usage limits and
subscriptions.

The MVP should focus on business websites, local service websites,
landing pages, and blogs. E-commerce and unrestricted third-party
extensions are later milestones.

**Success means a user can create a website, edit it visually, add
pages, save safely, preview it, and publish it without needing a
separate codebase or manually editing source code.**
