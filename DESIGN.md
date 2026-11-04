# SecureSite Studio --- Design System & UI Specification

**Version:** 1.0\
**Product:** Secure AI Website Builder & CMS\
**Purpose:** Visual design reference for the SaaS dashboard, website
manager, template gallery, AI generator, and visual page editor.

------------------------------------------------------------------------

## 1. Design Direction

Create a modern, calm, professional SaaS interface. The product should
feel like a serious website-building workspace rather than a generic
analytics dashboard.

### Design principles

1.  **Builder-first:** Website creation and editing are the primary
    actions.
2.  **Clear hierarchy:** Keep navigation, page content, and editing
    controls visually distinct.
3.  **Low visual noise:** Use whitespace, subtle borders, and restrained
    shadows.
4.  **Consistent patterns:** Reuse the same buttons, cards, forms,
    dialogs, menus, and status indicators.
5.  **Responsive:** The dashboard must work on desktop, tablet, and
    mobile. The visual editor is desktop-first but must provide a usable
    tablet/mobile experience.
6.  **Accessible:** Keyboard focus, readable contrast, semantic
    controls, and clear labels are required.

## 2. Brand and Color Tokens

Use the premium Emerald Green + Deep Forest + Soft Mint design system as default.

  Token              HEX         Usage
  ------------------ ----------- -------------------------------------------
  Primary            `#087A55`   Primary buttons, active navigation, links
  Primary Hover      `#066747`   Hover/pressed primary actions
  Deep Forest        `#063B2E`   Workspace and Dashboard sidebars
  Deep Forest Hover  `#052F25`   Sidebar interactive item hover state
  Accent             `#12A875`   Badges, sparklines, progress bars, active icons
  Soft Mint          `#DDF3E8`   Selected navigation, icon containers, highlights
  Page Background    `#F5F9F6`   Main platform background
  Card Background    `#FFFFFF`   Cards, panels, dialogs
  Muted Background   `#EDF4EF`   Subtle surfaces, input backgrounds, canvas wells
  Main Text          `#172B24`   Main headings and body text
  Secondary Text     `#64756C`   Supporting text and descriptions
  Text Muted         `#8E9F96`   Hints, timestamps, metadata
  Border             `#E1EAE4`   Card and input borders
  Border Strong      `#C8D7CE`   Focused/strong separators
  Success            `#168653`   Published, successful actions
  Success Soft       `#DDF3E8`   Success status backgrounds
  Warning            `#D99024`   Pending, draft warnings
  Warning Soft       `#FEF3E2`   Warning status backgrounds
  Error / Danger     `#D94848`   Destructive actions and errors
  Error Soft         `#FDE8E8`   Error status backgrounds

Do not hardcode these values throughout components. Define design tokens
in the theme/CSS variable layer.

## 3. Typography

Use **Inter** or a similar highly legible sans-serif font.

  Style        Desktop     Weight Usage
  --------- ---------- ---------- --------------------------
  Display     32--36px        700 Main page welcome/title
  H1          28--32px        700 Primary page heading
  H2          22--24px   650--700 Section heading
  H3          18--20px        600 Card and panel headings
  Body        14--16px        400 Main interface text
  Small       12--13px   400--500 Metadata and helper text
  Button          14px        600 Button labels

Use a consistent line-height: 1.2--1.3 for headings and 1.45--1.6 for
body copy. Avoid using many font sizes.

## 4. Layout and Spacing

Use a 4px base spacing scale.

-   4px: icon/text micro-gap
-   8px: compact controls
-   12px: field groups
-   16px: standard card padding
-   20px: section spacing
-   24px: large card padding
-   32px: page section spacing
-   40--48px: major page separation

### App shell

-   Desktop sidebar: 232--248px wide, fixed or sticky.
-   Top bar: 64--72px high.
-   Main content: flexible width, 24px desktop padding.
-   Content max width: approximately 1600px.
-   Card radius: 12--16px.
-   Input/button radius: 8--10px.
-   Use subtle shadows only for floating surfaces; cards should rely
    primarily on borders.

### Responsive behavior

-   Desktop: persistent sidebar and full top bar.
-   Tablet: collapsible sidebar and compact toolbar.
-   Mobile: sidebar becomes a drawer; cards stack; tables become compact
    lists.
-   Visual editor: collapse side panels into drawers on narrow screens;
    never allow the canvas to become unusably narrow.

## 5. Shared Components

Create a reusable UI layer before implementing product screens.

### Buttons

-   Primary: purple filled.
-   Secondary: white surface with border.
-   Tertiary: text-only.
-   Destructive: danger treatment.
-   Icon button: square, accessible tooltip/label.
-   Include default, hover, focus, disabled, loading, and pressed
    states.

### Cards

-   White surface, 1px border, 12--16px radius.
-   Consistent padding.
-   Optional title, description, action slot, and footer.
-   Avoid unnecessary gradients.

### Forms

-   Always show labels above inputs.
-   Helper text below fields.
-   Inline validation errors.
-   Required fields clearly identified.
-   Use consistent select, checkbox, radio, switch, textarea, and upload
    controls.

### Status labels

-   Draft: neutral/warning.
-   Published: success.
-   Publishing: info/loading.
-   Failed: danger.
-   Archived: muted.
-   Status must be communicated with text, not color alone.

### Feedback

-   Toasts for brief success/failure messages.
-   Confirmation dialog for destructive actions.
-   Empty states with one clear next action.
-   Skeletons for loading.
-   Error states with retry/help path.

## 6. Navigation and Information Architecture

### Main application sidebar

1.  Dashboard
2.  Websites
3.  Website Builder
4.  Templates
5.  AI Website Generator
6.  Media Library
7.  Domains
8.  Users & Team
9.  Settings

Keep SEO management inside website management in the initial product
unless SEO is later promoted to a separate product module. Do not put
unrelated analytics/marketing features in the website-builder-only
dashboard.

### Website workspace navigation

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
-   Team / Permissions (when enabled)

### Super Admin navigation

Separate from customer navigation: - Overview - Users - Websites -
Templates - Subscriptions - Usage - Security Center - Audit Logs -
Platform Settings

## 7. Dashboard Screen

### Header

-   Page title and short supporting sentence.
-   Search across websites, templates, and pages.
-   Notifications/help/account controls.
-   Primary action: **Create Website**.

### KPI cards

Use only useful website-builder metrics: - Total Websites - Total
Pages - Available Templates - Storage Used

Do not invent live numbers. Show real data or a clear empty/zero state.

### Main AI builder banner

-   Label: AI Website Builder.
-   Headline explaining website creation.
-   Short description.
-   Primary action: Generate with AI.
-   Secondary action: Browse Templates.
-   Product preview image or illustrative website preview.
-   Avoid presenting the banner as a real website preview unless it
    links to a working preview.

### Website list

Each row/card should show: - Website thumbnail - Website name - Domain
or platform subdomain - Draft/Published status - Last edited timestamp -
Open/Edit action - Overflow menu

### Quick actions

-   Create New Website
-   Use a Template
-   Generate with AI
-   Edit Website
-   Connect Domain
-   Publish Website

### Recent activity

Show actual events such as website created, page updated, website
published, domain connected. Include timestamps and appropriate empty
state.

### Dashboard exclusions

Do not include SEO ranking charts, keyword research widgets, backlink
tools, or unrelated marketing analytics in the website-builder-only
dashboard. SEO settings can be reached from each website workspace.

## 8. Website Builder Editor Screen

The editor is the most important application screen. It must have a
distinct layout, not reuse the dashboard layout.

### Top toolbar

-   Back to website/dashboard
-   Website name
-   Current page selector
-   Undo / redo
-   Save state: Saving, Saved, Unsaved, Error
-   Desktop / tablet / mobile preview
-   Preview
-   Publish

### Left panel

Use tabs or segmented navigation: - Add Elements - Sections - Layers -
Pages

**Add Elements** contains searchable, categorized approved components: -
Layout: Container, Columns, Grid, Spacer, Divider - Basic: Heading,
Paragraph, Rich Text, Image, Button, Icon - Business: Hero, Services,
Features, Testimonials, Team, FAQ, CTA, Contact Form, Footer - Advanced:
Gallery, Accordion, Tabs, Carousel, Blog Listing

**Sections** contains ready-made section compositions.

**Layers** shows the nested page structure and supports
selection/reordering.

**Pages** shows page list and create-page action.

### Center canvas

-   Render the actual page using the same renderer as the published
    website.
-   Clearly highlight selected component.
-   Show insertion indicators while dragging.
-   Support drag/reorder, select, duplicate, delete, and contextual
    actions.
-   Provide desktop/tablet/mobile preview widths.
-   Keep canvas background distinct from the page itself.
-   Show an empty-state insertion prompt when a page has no sections.

### Right properties panel

Context-sensitive settings for the selected component: - Content -
Layout - Style - Advanced / Responsive

Only show settings supported by the selected component schema. Do not
expose arbitrary code or unrestricted CSS in the MVP.

### Editor interaction states

-   No selection
-   Component selected
-   Dragging
-   Drop target
-   Saving
-   Save failed
-   Preview mode
-   Publish validation errors
-   Unsaved changes confirmation

## 9. Template Gallery

-   Search and filter by category.
-   Cards with real template thumbnails.
-   Template name, category, supported page count, and preview action.
-   Preview before using.
-   Use Template action with confirmation.
-   Clearly explain that a template is copied into the user's website
    and future template updates do not overwrite that copy.

## 10. Website Creation Wizard

Use a short stepper: 1. Website name and business type. 2. Choose
template or AI generation. 3. Business details and contact information.
4. Brand colors/logo (optional). 5. Review and create.

Allow users to skip optional fields. Show progress and back/continue
actions. Newly created websites remain drafts until explicitly
published.

## 11. AI Website Generator

-   Prompt/business details form.
-   Business category and target audience.
-   Desired pages checklist.
-   Brand tone and color preference.
-   Generate action with progress state.
-   Preview generated proposal before applying.
-   Allow regenerate or edit prompt.
-   Apply changes to a draft only after user approval.
-   Show usage/credit information where applicable.

## 12. Website Workspace Screens

### Pages

Table/list with title, slug, status, last modified, and actions. Include
create page, duplicate, preview, publish/unpublish, and revision
history.

### Navigation

Visual menu tree with nested items, drag reorder, page/custom link
selection, visibility, and preview.

### Blog

Posts list, status, author, category, scheduled date, and editor. Keep
blog content separate from visual page section configuration.

### Media

Grid/list toggle, search, file type filters, upload, alt text,
dimensions, and safe deletion checks.

### Domains

Platform subdomain, custom domain connection steps, DNS status,
ownership verification, HTTPS status, and troubleshooting.

### SEO

Global defaults and per-page metadata: - SEO title - Meta description -
Slug - Canonical URL - Index/noindex - Open Graph image - Structured
data controls - Sitemap and robots status - Redirect manager

SEO is a website workspace module, not a reason to clutter the main
builder dashboard.

## 13. Accessibility and Interaction Requirements

-   Every interactive control must have an accessible name.
-   All major actions must work by keyboard.
-   Focus states must be visible.
-   Dialogs must trap focus and restore focus when closed.
-   Do not communicate status through color alone.
-   Respect reduced-motion preferences.
-   Images require editable alt text.
-   Form controls require labels and validation announcements.

## 14. Design Acceptance Checklist

-   [ ] Dashboard focuses on website creation and management.
-   [ ] Dashboard has no SEO analytics widgets in builder-only mode.
-   [ ] Editor has a distinct three-panel workspace.
-   [ ] All screens use shared design tokens.
-   [ ] Components have hover, focus, disabled, loading, and error
    states.
-   [ ] Empty/loading/error states are designed.
-   [ ] Mobile and tablet layouts are defined.
-   [ ] Typography and spacing are consistent.
-   [ ] Published website preview uses the same renderer as the editor.
-   [ ] No fake metrics or fake activity are shown as real data.
