# SecureSite Studio --- Component & Section Variant Development Rules

> **Purpose:** These rules apply to every new section, component,
> template, or variant created in SecureSite Studio. Any variant added
> in the future must be responsive, accessible, reusable, theme-aware,
> and compatible with the existing Visual Builder and publishing system
> by default.

## 1. Mandatory Rule

Whenever you create or modify any component or variant --- including
Header, Footer, Hero, Services, About, Features, Testimonials, Gallery,
Forms, CTA, Pricing, FAQ, or any future section --- you MUST implement
and verify its responsive behavior for desktop, tablet, and mobile.

**Responsive support is not an optional follow-up task. It is part of
completing the component.**

Never mark a component or variant as complete if it only works on
desktop.

## 2. Read Project Instructions First

Before making changes, inspect and follow: - `AGENT.md` - `PRD.md` -
`DESIGN.md` - `STACK.md` - `DEVELOPMENT_PROGRESS.md`

Also inspect the existing Component Registry, component schemas, Theme
Token System, shared PageRenderer, Visual Builder, responsive preview,
Navigation Manager (where relevant), and publishing system.

Preserve the current architecture and existing functionality. Do not
create a second rendering engine, duplicate component systems, or
introduce unnecessary dependencies.

## 3. Responsive Device Requirements

Every component variant must adapt fluidly to different viewport sizes.
Test at least these widths:

  Device category           Test width
  ----------------------- ------------
  Small mobile                   320px
  Standard mobile                375px
  Large mobile                   480px
  Tablet portrait                768px
  Tablet / small laptop         1024px
  Laptop                        1280px
  Desktop                       1440px
  Large desktop                 1920px

Use the project's existing breakpoints and responsive conventions. These
widths are test points, not a requirement to create a separate hardcoded
layout for every width.

### Responsive behavior must include

-   No unintended horizontal page overflow.
-   No overlapping, clipped, or inaccessible content.
-   Text must wrap naturally and remain readable.
-   Images must scale proportionally and use suitable cropping.
-   Buttons and controls must remain usable and have adequate touch
    targets.
-   Columns and grids must adapt to available space.
-   Spacing, padding, typography, and alignment must scale
    appropriately.
-   Long content, translated text, and missing optional content must not
    break the layout.
-   Menus, dropdowns, accordions, and interactive controls must work
    with touch and keyboard input where applicable.

## 4. Component-Specific Responsive Decisions

Do not apply one generic mobile layout to every section. Choose behavior
appropriate to the component.

Examples: - **Header:** full navigation on wide screens; accessible
hamburger/drawer or dropdown on smaller screens; nested menus must
remain usable. - **Footer:** multi-column layout may collapse into fewer
columns or accordions on mobile. - **Hero:** text and media may stack;
CTA buttons may wrap; maintain readable text over backgrounds. -
**Services / Features / Testimonials / Pricing cards:** grids should
reduce columns progressively and become a suitable single-column layout
on narrow screens. - **About / Image-text sections:** image and text
should stack in a sensible order. - **Gallery:** responsive grid or
carousel behavior must not cause overflow. - **Forms:** fields should
stack on narrow screens; labels, errors, and submit controls must remain
visible. - **CTA:** text and actions should wrap or stack without
clipping. - **Tables:** use an intentional mobile treatment such as
responsive rows or controlled horizontal scrolling inside the table
container, not page-wide overflow.

These are examples. Inspect each variant and implement the layout that
best fits its content and purpose.

## 5. Visual Builder Responsive Controls

Every new component must work in the existing Visual Builder's Desktop,
Tablet, and Mobile preview modes.

Where appropriate, expose responsive properties in the Properties Panel,
such as: - Visibility per device - Alignment - Direction / stacking
order - Columns or grid layout - Gap and padding - Typography size -
Image sizing and position - Width and max-width - Button layout

Rules: 1. Use desktop values as the default. 2. Allow tablet and mobile
overrides only where they are useful. 3. Inherit values from larger
breakpoints when no override exists. 4. Do not duplicate the entire
component configuration for each device. 5. Do not create fake
preview-only layouts. The preview must render the actual component with
its real responsive styles. 6. Responsive edits must update the canvas
immediately and persist through the existing save process. 7. Keep the
Properties Panel simple; do not expose unnecessary controls for every
component.

## 6. Variant and Template Architecture

When adding a new variant: - Register it in the existing Component
Registry. - Use a stable, unique variant identifier. - Define and
validate its configuration with the existing schema approach (Zod where
used). - Reuse shared primitives and design tokens. - Keep content data
separate from presentation. - Provide sensible default values. - Handle
optional fields safely. - Preserve compatibility with existing saved
pages. - Ensure the public renderer can render the variant without
editor-only dependencies.

Do not create a separate code file for every minor color or spacing
variation. Use configuration and theme tokens for configurable styling.
Create a distinct variant when the structure or layout is meaningfully
different.

## 7. Theme and Design-System Compatibility

Every variant must respect the existing theme system: - Use theme tokens
for colors, typography, borders, radii, and spacing wherever
available. - Do not hardcode colors that should come from the active
website theme. - Maintain readable contrast in light and dark
backgrounds. - Ensure buttons, links, focus states, and hover states are
visually consistent. - Changing a website's theme should update
compatible variants without breaking their layout.

## 8. Accessibility and Interaction

Every interactive component must: - Use semantic HTML elements. -
Support keyboard navigation. - Provide visible focus states. - Have
accessible labels for icon-only controls. - Use appropriate ARIA
attributes when needed. - Support touch interaction on mobile. - Avoid
hover-only interactions that cannot be used on touch devices. - Respect
reduced-motion preferences for animations. - Maintain usable contrast
and readable text.

Do not add decorative controls that appear interactive but do nothing.

## 9. Images and Media

For image-based variants: - Use responsive image sizing. - Preserve
aspect ratio unless intentional cropping is configured. - Prevent layout
shifts by reserving image dimensions. - Support appropriate object-fit
and object-position settings. - Provide alt text controls where
applicable. - Handle missing or failed images gracefully. - Ensure media
does not exceed its container on small screens.

## 10. Testing Checklist --- Required for Every Variant

Before marking a new variant complete, verify:

### Visual responsiveness

-   [ ] 320px small mobile
-   [ ] 375px mobile
-   [ ] 480px large mobile
-   [ ] 768px tablet
-   [ ] 1024px tablet / small laptop
-   [ ] 1280px laptop
-   [ ] 1440px desktop
-   [ ] 1920px large desktop
-   [ ] No unintended horizontal overflow
-   [ ] No overlap, clipping, or unreadable text
-   [ ] Images and grids resize correctly

### Functionality

-   [ ] All controls work
-   [ ] Menus and nested interactions work on touch and keyboard
-   [ ] Variant settings save and reload correctly
-   [ ] Theme changes work
-   [ ] Desktop, tablet, and mobile previews show the real component
-   [ ] Published website renders the same responsive component
-   [ ] Existing pages and variants remain unaffected

### Engineering quality

-   [ ] Schema validation added or updated
-   [ ] Relevant unit/component tests added
-   [ ] Existing test suite passes
-   [ ] Production build passes
-   [ ] No new console errors or warnings related to the implementation

Use browser-based visual inspection or the project's available
responsive testing tools where possible. Do not claim a viewport was
tested if it was not actually checked.

## 11. Definition of Done

A component or variant is complete only when all applicable conditions
are met: 1. It renders correctly in the Visual Builder. 2. It renders
correctly on the published website. 3. It supports desktop, tablet, and
mobile. 4. It works with the existing theme system. 5. It uses the
existing component registry and renderer architecture. 6. Its controls
and interactions work. 7. Its configuration is validated and saved
correctly. 8. Responsive behavior has been tested at the required
viewport widths. 9. Relevant tests and production build pass. 10.
`DEVELOPMENT_PROGRESS.md` is updated accurately.

If any condition is not met, record it as incomplete with the exact
limitation. Never mark untested behavior as verified.

## 12. Instructions for Future Component Requests

Whenever the user asks to create a new section or variant: 1. Identify
the component's purpose and content structure. 2. Inspect existing
variants to avoid duplication. 3. Design the new variant consistently
with SecureSite Studio. 4. Implement desktop, tablet, and mobile
behavior in the same task. 5. Add only useful responsive controls to the
Properties Panel. 6. Integrate with the existing registry, renderer,
theme, and publishing pipeline. 7. Test all required viewport widths. 8.
Update project documentation and progress.

**Do not wait for the user to separately ask for responsive design.
Automatically include responsive implementation and testing in every new
component and variant task.**
