import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  FaqAccordion,
  FaqAccordionPropsSchema,
} from "@/components/website/faq/FaqAccordion";
import {
  StatsCounter,
  StatsCounterPropsSchema,
} from "@/components/website/stats/StatsCounter";
import {
  LogosCloud,
  LogosCloudPropsSchema,
} from "@/components/website/logos/LogosCloud";
import {
  RichTextContent,
  RichTextContentPropsSchema,
} from "@/components/website/content/RichTextContent";
import {
  componentRegistry,
  listRegisteredComponents,
} from "@/builder/registry";

afterEach(() => cleanup());

describe("Batch A — Must-Have Website Components", () => {
  describe("1. Registry & Schemas", () => {
    it("registers all four components with stable ids", () => {
      const ids = listRegisteredComponents().map((c) => c.id);
      expect(ids).toContain("faq.accordion.v1");
      expect(ids).toContain("stats.counter.v1");
      expect(ids).toContain("logos.cloud.v1");
      expect(ids).toContain("content.richtext.v1");
      expect(componentRegistry["faq.accordion.v1"].category).toBe("content");
      expect(componentRegistry["logos.cloud.v1"].category).toBe("social");
    });

    it("never registers the same component twice", () => {
      const ids = listRegisteredComponents().map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("parses defaults for every new schema", () => {
      expect(FaqAccordionPropsSchema.parse({}).faqItems.length).toBeGreaterThanOrEqual(3);
      expect(StatsCounterPropsSchema.parse({}).stats.length).toBe(4);
      expect(LogosCloudPropsSchema.parse({}).logos.length).toBeGreaterThanOrEqual(4);
      expect(RichTextContentPropsSchema.parse({}).variant).toBe("simple");
    });

    it("exposes editor controls including the list repeaters", () => {
      expect(
        componentRegistry["faq.accordion.v1"].editor.controls.map((c) => c.propName)
      ).toContain("faqItems");
      expect(
        componentRegistry["stats.counter.v1"].editor.controls.map((c) => c.propName)
      ).toContain("stats");
      expect(
        componentRegistry["logos.cloud.v1"].editor.controls.map((c) => c.propName)
      ).toContain("logos");
      expect(
        componentRegistry["content.richtext.v1"].editor.controls.map((c) => c.propName)
      ).toContain("sidebarLinks");
    });
  });

  describe("2. FAQ Accordion", () => {
    const props = FaqAccordionPropsSchema.parse({});

    it("renders accessible accordion buttons with open/close behaviour", () => {
      render(<FaqAccordion {...props} defaultOpenFirst={false} />);

      const firstQuestion = screen.getByText(props.faqItems[0].question);
      const button = firstQuestion.closest("button") as HTMLButtonElement;

      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(screen.queryByText(props.faqItems[0].answer)).toBeNull();

      fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(screen.getByText(props.faqItems[0].answer)).toBeTruthy();

      const panel = document.getElementById(button.getAttribute("aria-controls") || "");
      expect(panel).not.toBeNull();
      expect(panel?.getAttribute("role")).toBe("region");

      fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(screen.queryByText(props.faqItems[0].answer)).toBeNull();
    });

    it("supports the two-column variant with responsive grid classes", () => {
      const { container } = render(<FaqAccordion {...props} variant="two-column" />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("grid-cols-1");
      expect(grid?.className).toContain("md:grid-cols-2");
      expect(container.querySelectorAll("button[aria-expanded]").length).toBe(
        props.faqItems.length
      );
    });
  });

  describe("3. Stats & Counters", () => {
    it("renders every stat value and label", () => {
      const props = StatsCounterPropsSchema.parse({ animateCount: false });
      render(<StatsCounter {...props} />);

      props.stats.forEach((stat) => {
        expect(screen.getByText(stat.value)).toBeTruthy();
        expect(screen.getByText(stat.label)).toBeTruthy();
      });
    });

    it("starts counting from 0 when animation is enabled", () => {
      const props = StatsCounterPropsSchema.parse({ animateCount: true });
      render(<StatsCounter {...props} />);

      // IntersectionObserver does not fire in jsdom, so the initial value stays "0"
      expect(screen.getAllByText("0").length).toBe(4);
    });

    it("uses a 2-column mobile / 4-column desktop responsive grid", () => {
      const props = StatsCounterPropsSchema.parse({});
      const { container } = render(<StatsCounter {...props} />);

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("grid-cols-2");
      expect(grid?.className).toContain("lg:grid-cols-4");
    });

    it("renders card tiles with theme-token chrome in cards variant", () => {
      const props = StatsCounterPropsSchema.parse({ animateCount: false, variant: "cards" });
      const { container } = render(<StatsCounter {...props} />);

      const grid = container.querySelector(".grid");
      const card = grid?.children[0] as HTMLElement;
      expect(card.className).toContain("border");
      expect(card.getAttribute("style")).toContain("--color-card-bg");
    });
  });

  describe("4. Client Logos / Trust Bar", () => {
    it("renders logos in a responsive grid and blocks unsafe links", () => {
      const props = LogosCloudPropsSchema.parse({
        logos: [
          { title: "Safe Client", imageUrl: "https://example.com/logo.png", href: "https://example.com" },
          { title: "Unsafe Client", imageUrl: "", href: "javascript:alert(1)" },
        ],
      });

      const { container } = render(<LogosCloud {...props} />);

      expect(container.querySelector("a[href^='javascript']")).toBeNull();
      expect(screen.getByText("Unsafe Client")).toBeTruthy();

      const safeLink = screen.getByLabelText("Safe Client");
      expect(safeLink.getAttribute("href")).toBe("https://example.com");
      expect(safeLink.getAttribute("target")).toBe("_blank");
      expect(safeLink.getAttribute("rel")).toContain("noopener");

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("grid-cols-2");
      expect(grid?.className).toContain("lg:grid-cols-6");
    });

    it("renders a draggable marquee track with a hidden clone for seamless loop", () => {
      const props = LogosCloudPropsSchema.parse({
        variant: "marquee",
        logos: [
          { title: "One", imageUrl: "", href: "" },
          { title: "Two", imageUrl: "", href: "" },
        ],
      });

      const { container } = render(<LogosCloud {...props} />);

      const track = container.querySelector(".flex.w-max");
      expect(track).not.toBeNull();
      expect(track?.className).toContain("cursor-grab");
      expect(container.querySelectorAll("[aria-hidden='true']").length).toBe(1);
      expect(screen.getAllByText("One").length).toBe(2);
    });
  });

  describe("5. Rich Text Content", () => {
    it("splits blank-line separated body into paragraphs", () => {
      const props = RichTextContentPropsSchema.parse({
        body: "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.",
        variant: "simple",
      });

      const { container } = render(<RichTextContent {...props} />);

      const paragraphs = Array.from(container.querySelectorAll("p")).map(
        (node) => node.textContent
      );
      expect(paragraphs).toEqual([
        "First paragraph.",
        "Second paragraph.",
        "Third paragraph.",
      ]);
    });

    it("renders a sanitized sidebar table of contents", () => {
      const props = RichTextContentPropsSchema.parse({
        variant: "with-sidebar",
        sidebarLinks: [
          { label: "Services", href: "#services" },
          { label: "Bad Link", href: "javascript:alert(1)" },
        ],
      });

      const { container } = render(<RichTextContent {...props} />);

      expect(container.querySelector("aside")).not.toBeNull();
      expect(screen.getByText("Services").getAttribute("href")).toBe("#services");
      expect(container.querySelector("a[href^='javascript']")).toBeNull();
      expect(screen.getByText("Bad Link").tagName).toBe("SPAN");

      const layout = container.querySelector(".grid");
      expect(layout?.className).toContain("lg:grid-cols-[260px_minmax(0,1fr)]");
    });
  });
});
