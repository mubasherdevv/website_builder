I am building a production-ready Website Builder SaaS with SEO capabilities.

First, carefully read all three project documents:

- DESIGN.md
- PRD.md
- STACK.md

IMPORTANT DEVELOPMENT RULES:

1. Do not start coding immediately.
2. Analyze all requirements and understand the complete architecture.
3. Create a detailed implementation plan divided into sequential phases.
4. Break every phase into small, independently testable tasks.
5. Identify dependencies between tasks.
6. Follow the JSON-based architecture, Component Registry, Theme System, reusable React components and shared Page Renderer defined in PRD.md.
7. Never create unnecessary duplicate components or separate codebases for individual templates.
8. Follow DESIGN.md for all UI decisions.
9. Follow STACK.md for technical decisions.


Every new dashboard page, component, modal, form, table, or feature must support Light, Dark, and System themes from the beginning. Never introduce hardcoded application UI colors that bypass the centralized theme tokens.


## Mandatory Responsive Development Instructions

Before creating or modifying any component, section, template, or variant, read and follow:

structure\SECURESITE_COMPONENT_RESPONSIVE_RULES.md

These rules are mandatory for every future component implementation.

Always implement desktop, tablet, and mobile responsiveness as part of the same task. Never wait for a separate user request for responsive behavior.

Follow its testing checklist and Definition of Done before marking any component complete.

EXECUTION RULES:

- Start with Phase 0 only.
- Wait for my approval before implementation.
- Complete one phase at a time.
- After each phase, run relevant tests and fix errors.
- Verify that existing functionality is not broken.
- Update a DEVELOPMENT_PROGRESS.md file after every completed task.
- Maintain a checklist of completed and pending tasks.
- Do not skip phases.
- Do not implement future features prematurely.
- If a requirement is unclear, ask before making architectural decisions.

First deliver the complete implementation plan. Do not write application code until I approve it.