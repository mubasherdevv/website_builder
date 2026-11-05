import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import { componentRegistry, validateComponentProps } from "@/builder/registry";
import {
  FooterClassic,
  FooterClassicPropsSchema,
} from "@/components/website/footer/FooterClassic";
import {
  FooterColumns,
  FooterColumnsPropsSchema,
} from "@/components/website/footer/FooterColumns";
import {
  FooterNewsletter,
  FooterNewsletterPropsSchema,
} from "@/components/website/footer/FooterNewsletter";
import { FooterLinkGroup } from "@/components/website/footer/shared/FooterLinkGroup";
import { FooterVariantsModal } from "@/components/editor/FooterVariantsModal";
import { EditorShell } from "@/components/editor/EditorShell";
import { emeraldForestPreset } from "@/themes/presets";
import { PageDocument } from "@/types/builder";

describe("Ready-Made Footer Templates System", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("1. Component Registry & Schema Validation", () => {
    it("registers all 4 footer components (legacy + 3 new variants)", () => {
      expect(componentRegistry["footer.simple.v1"]).toBeDefined();
      expect(componentRegistry["footer.classic.v1"]).toBeDefined();
      expect(componentRegistry["footer.columns.v1"]).toBeDefined();
      expect(componentRegistry["footer.newsletter.v1"]).toBeDefined();
    });

    it("validates empty props against each footer schema", () => {
      for (const id of [
        "footer.simple.v1",
        "footer.classic.v1",
        "footer.columns.v1",
        "footer.newsletter.v1",
      ]) {
        const result = validateComponentProps(id, {});
        expect(result.success, `${id} should accept defaults`).toBe(true);
      }
    });

    it("exposes editor list controls for footer link arrays", () => {
      for (const id of ["footer.classic.v1", "footer.columns.v1", "footer.newsletter.v1"]) {
        const def = componentRegistry[id];
        const controlNames = def.editor.controls.map((c) => c.propName);
        expect(controlNames).toContain("legalLinks");
        const listControls = def.editor.controls.filter((c) => c.type === "list");
        expect(listControls.length).toBeGreaterThan(0);
      }
      const classicControls = componentRegistry["footer.classic.v1"].editor.controls.map(
        (c) => c.propName
      );
      expect(classicControls).toContain("quickLinks");
      const columnsControls = componentRegistry["footer.columns.v1"].editor.controls.map(
        (c) => c.propName
      );
      expect(columnsControls).toContain("servicesLinks");
      expect(columnsControls).toContain("companyLinks");
    });
  });

  describe("2. Footer Variant Rendering", () => {
    it("renders Classic footer with brand, contact and quick links", () => {
      render(<FooterClassic {...FooterClassicPropsSchema.parse({})} />);

      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
      expect(screen.getAllByText("Acme Business").length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/© 2026 Acme Business/i).length
      ).toBeGreaterThan(0);
      // Quick links
      expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
        "href",
        "/services"
      );
      // CTA panel
      expect(screen.getByRole("link", { name: /Get a Free Quote/i })).toBeInTheDocument();
    });

    it("renders Columns footer with SEO link columns and hours", () => {
      render(<FooterColumns {...FooterColumnsPropsSchema.parse({})} />);

      expect(
        screen.getAllByRole("heading", { name: "Services" }).length
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByRole("heading", { name: "Company" }).length
      ).toBeGreaterThan(0);
      expect(screen.getAllByText(/Monday–Friday/i).length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/© 2026 Acme Business/i).length
      ).toBeGreaterThan(0);
    });

    it("renders Newsletter footer with form, consent text and columns", () => {
      render(<FooterNewsletter {...FooterNewsletterPropsSchema.parse({})} />);

      expect(screen.getByRole("button", { name: /Subscribe/i })).toBeInTheDocument();
      expect(
        screen.getAllByText(/By subscribing, you agree to receive occasional updates/i).length
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/Get practical updates in your inbox/i).length
      ).toBeGreaterThan(0);
    });
  });

  describe("3. Safe URL Handling", () => {
    it("filters unsafe hrefs out of footer link groups", () => {
      render(
        <FooterLinkGroup
          id="test"
          title="Explore"
          links={[
            { label: "Safe Relative", href: "/services" },
            { label: "Safe Anchor", href: "#contact" },
            { label: "Safe Https", href: "https://example.com/page" },
            { label: "Evil Script", href: "javascript:alert(1)" },
            { label: "Evil Data", href: "data:text/html,<b>x</b>" },
            { label: "Evil Socket", href: "vbscript:msgbox(1)" },
          ]}
        />
      );

      expect(screen.getByRole("link", { name: "Safe Relative" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Safe Anchor" })).toHaveAttribute(
        "href",
        "#contact"
      );
      expect(screen.getByRole("link", { name: "Safe Https" })).toBeInTheDocument();
      expect(screen.queryByText("Evil Script")).not.toBeInTheDocument();
      expect(screen.queryByText("Evil Data")).not.toBeInTheDocument();
      expect(screen.queryByText("Evil Socket")).not.toBeInTheDocument();
    });

    it("renders nothing when all links are unsafe", () => {
      const { container } = render(
        <FooterLinkGroup
          id="test"
          title="Explore"
          links={[{ label: "Evil", href: "javascript:alert(1)" }]}
        />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("rejects unsafe hrefs inside the Classic footer quick links at schema level", () => {
      expect(() =>
        FooterClassicPropsSchema.parse({
          quickLinks: [
            { label: "Kept", href: "/about" },
            { label: "Dropped", href: "javascript:void(0)" },
          ],
        })
      ).toThrow(/Use a relative path/);
    });
  });

  describe("4. Newsletter Form Honesty", () => {
    const baseProps = (overrides: Record<string, unknown> = {}) =>
      FooterNewsletterPropsSchema.parse(overrides);

    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("does NOT fake success when no endpoint is connected", async () => {
      render(<FooterNewsletter {...baseProps()} />);

      const emailInput = screen.getByLabelText(/Email address/i);
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.click(screen.getByRole("button", { name: /Subscribe/i }));

      expect(await screen.findByText(/not connected yet/i)).toBeInTheDocument();
      expect(screen.queryByText(/subscribed/i)).not.toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });

    it("shows a validation message for an invalid email", async () => {
      render(
        <FooterNewsletter
          {...baseProps({ newsletterEndpoint: "/api/newsletter" })}
        />
      );

      const emailInput = screen.getByLabelText(/Email address/i);
      fireEvent.change(emailInput, { target: { value: "not-an-email" } });
      fireEvent.click(screen.getByRole("button", { name: /Subscribe/i }));

      expect(await screen.findByText(/Enter a valid email address/i)).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });

    it("posts JSON to a safe endpoint and shows the real success message", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => ({ ok: true, status: 200 }))
      );

      render(
        <FooterNewsletter
          {...baseProps({ newsletterEndpoint: "/api/newsletter" })}
        />
      );

      const emailInput = screen.getByLabelText(/Email address/i);
      fireEvent.change(emailInput, { target: { value: "User@Example.com" } });
      fireEvent.click(screen.getByRole("button", { name: /Subscribe/i }));

      expect(await screen.findByText(/subscribed/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });
      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe("/api/newsletter");
      expect(JSON.parse((init as RequestInit).body as string)).toEqual({
        email: "user@example.com",
      });
    });

    it("shows an honest failure message when the endpoint errors", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => ({ ok: false, status: 500 }))
      );

      render(
        <FooterNewsletter
          {...baseProps({ newsletterEndpoint: "/api/newsletter" })}
        />
      );

      const emailInput = screen.getByLabelText(/Email address/i);
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.click(screen.getByRole("button", { name: /Subscribe/i }));

      expect(await screen.findByText(/could not save your subscription/i)).toBeInTheDocument();
      expect(screen.queryByText(/subscribed\./i)).not.toBeInTheDocument();
    });
  });

  describe("5. Footer Templates Modal (Real Component Previews)", () => {
    it("opens as a dialog with all three variants and real previews", () => {
      render(
        <FooterVariantsModal
          isOpen
          onClose={() => {}}
          hasExistingFooter={false}
          onApplyVariant={() => {}}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText("Variant 1: Classic Business Footer")).toBeInTheDocument();
      expect(within(dialog).getByText("Variant 2: Multi-Column SEO Footer")).toBeInTheDocument();
      expect(within(dialog).getByText("Variant 3: Modern Newsletter Footer")).toBeInTheDocument();

      // Real previews render actual default content from the components
      expect(within(dialog).getAllByText("Acme Business").length).toBeGreaterThan(0);
      expect(
        within(dialog).getAllByText(/Get practical updates in your inbox/i).length
      ).toBeGreaterThan(0);
    });

    it("applies a variant through onApplyVariant and closes", () => {
      const onApply = vi.fn();
      const onClose = vi.fn();

      render(
        <FooterVariantsModal
          isOpen
          onClose={onClose}
          hasExistingFooter
          onApplyVariant={onApply}
        />
      );

      const dialog = screen.getByRole("dialog");
      // Second card's button = columns variant
      const applyButtons = within(dialog).getAllByRole("button", {
        name: "Apply to Page",
      });
      expect(applyButtons).toHaveLength(3);
      fireEvent.click(applyButtons[1]);

      expect(onApply).toHaveBeenCalledTimes(1);
      const [def, mode] = onApply.mock.calls[0];
      expect(def.id).toBe("footer.columns.v1");
      expect(mode).toBe("replace");
      expect(onClose).toHaveBeenCalled();
    });

    it("closes on Escape key", () => {
      const onClose = vi.fn();
      render(
        <FooterVariantsModal
          isOpen
          onClose={onClose}
          hasExistingFooter={false}
          onApplyVariant={() => {}}
        />
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("6. Editor Integration (Templates Tab → Modal → Page)", () => {
    const buildDoc = (withFooter: boolean): PageDocument => ({
      schemaVersion: 1,
      page: { id: "page_home", title: "Home", slug: "/", status: "draft" },
      sections: [
        {
          id: "sec_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: { brandName: "Acme Business" },
        },
        ...(withFooter
          ? [
              {
                id: "sec_footer",
                componentId: "footer.simple.v1",
                componentVersion: 1,
                props: {},
              },
            ]
          : []),
      ],
    });

    const openFooterModalAndApply = (
      applyButtonIndex: number,
      expectedButtonName: string
    ) => {
      fireEvent.click(screen.getByRole("button", { name: "Templates" }));
      fireEvent.click(screen.getByText("Footer Templates"));
      const dialog = screen.getByRole("dialog");
      fireEvent.click(
        within(dialog).getAllByRole("button", { name: expectedButtonName })[
          applyButtonIndex
        ]
      );
    };

    it("replaces an existing footer in place", () => {
      render(
        <EditorShell
          initialDocument={buildDoc(true)}
          theme={emeraldForestPreset}
          websiteId="test-site"
        />
      );

      openFooterModalAndApply(1, "Apply to Page");

      // Layers list shows the replaced footer component alongside the untouched header
      fireEvent.click(screen.getByRole("button", { name: "Layers" }));
      expect(
        screen.getAllByText("Multi-Column SEO Footer").length
      ).toBeGreaterThan(0);
      // The old minimal footer is gone → replaced in place
      expect(screen.queryByText("Simple Footer")).not.toBeInTheDocument();
      // Header survived untouched
      expect(
        screen.getAllByText("Simple Navigation Header").length
      ).toBeGreaterThan(0);
    });

    it("inserts a footer at the end of the page when none exists", () => {
      render(
        <EditorShell
          initialDocument={buildDoc(false)}
          theme={emeraldForestPreset}
          websiteId="test-site"
        />
      );

      openFooterModalAndApply(0, "Insert Footer");

      // Layers tab now lists the new classic footer alongside the untouched header
      fireEvent.click(screen.getByRole("button", { name: "Layers" }));
      expect(screen.getAllByText("Classic Business Footer").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Simple Navigation Header").length).toBeGreaterThan(0);
    });
  });
});
