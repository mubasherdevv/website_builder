import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  PricingTiers,
  PricingTiersPropsSchema,
} from "@/components/website/pricing/PricingTiers";
import {
  TeamGrid,
  TeamGridPropsSchema,
} from "@/components/website/team/TeamGrid";
import {
  StepsProcess,
  StepsProcessPropsSchema,
} from "@/components/website/steps/StepsProcess";
import {
  MediaContent,
  MediaContentPropsSchema,
} from "@/components/website/content/MediaContent";
import {
  componentRegistry,
  listRegisteredComponents,
} from "@/builder/registry";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";

afterEach(() => cleanup());

describe("Batch B — Conversion & Content Website Components", () => {
  describe("1. Registry & Schemas", () => {
    it("registers all four components with stable ids and categories", () => {
      const ids = listRegisteredComponents().map((c) => c.id);

      expect(ids).toContain("pricing.tiers.v1");
      expect(ids).toContain("team.grid.v1");
      expect(ids).toContain("steps.process.v1");
      expect(ids).toContain("content.media.v1");

      ["pricing.tiers.v1", "team.grid.v1", "steps.process.v1", "content.media.v1"].forEach((id) => {
        expect(componentRegistry[id].category).toBe("content");
      });
    });

    it("keeps the registry at 27 unique components", () => {
      const ids = listRegisteredComponents().map((c) => c.id);
      expect(ids.length).toBe(27);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("parses sensible defaults for every new schema", () => {
      const pricing = PricingTiersPropsSchema.parse({});
      expect(pricing.tiers.length).toBe(3);
      expect(pricing.tiers[1].highlighted).toBe(true);
      expect(pricing.tiers[0].features.length).toBeGreaterThan(0);

      const team = TeamGridPropsSchema.parse({});
      expect(team.members.length).toBe(3);
      expect(team.columns).toBe("3");

      const steps = StepsProcessPropsSchema.parse({});
      expect(steps.steps.length).toBe(4);
      expect(steps.variant).toBe("horizontal");

      const media = MediaContentPropsSchema.parse({});
      expect(media.bullets.length).toBe(3);
      expect(media.imagePosition).toBe("right");
      expect(media.imageAspect).toBe("video");
    });

    it("exposes editor controls including the list repeaters", () => {
      expect(
        componentRegistry["pricing.tiers.v1"].editor.controls.map((c) => c.propName)
      ).toContain("tiers");
      expect(
        componentRegistry["team.grid.v1"].editor.controls.map((c) => c.propName)
      ).toContain("members");
      expect(
        componentRegistry["steps.process.v1"].editor.controls.map((c) => c.propName)
      ).toContain("steps");
      expect(
        componentRegistry["content.media.v1"].editor.controls.map((c) => c.propName)
      ).toEqual(expect.arrayContaining(["bullets", "imageUrl", "ctaHref"]));
    });
  });

  describe("2. Pricing Plans", () => {
    it("renders every tier with price, feature list and CTA label", () => {
      const props = PricingTiersPropsSchema.parse({});
      render(<PricingTiers {...props} />);

      props.tiers.forEach((tier) => {
        expect(screen.getByText(tier.name)).toBeTruthy();
        expect(screen.getByText(tier.price)).toBeTruthy();
        expect(screen.getByText(tier.ctaLabel)).toBeTruthy();
        tier.features.forEach((feature) => {
          expect(screen.getByText(feature)).toBeTruthy();
        });
      });
    });

    it("highlights the featured plan and shows its badge", () => {
      const props = PricingTiersPropsSchema.parse({});
      const { container } = render(<PricingTiers {...props} />);

      expect(screen.getByText("Most Popular")).toBeTruthy();

      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("sm:grid-cols-2");
      expect(grid?.className).toContain("lg:grid-cols-3");

      const featuredCard = Array.from(grid?.children || []).find((card) =>
        (card as HTMLElement).getAttribute("style")?.includes("var(--color-primary")
      ) as HTMLElement | undefined;

      expect(featuredCard).toBeTruthy();
      expect(featuredCard?.getAttribute("style")).toContain("--radius-card");
    });

    it("blocks unsafe CTA URLs instead of rendering a javascript: link", () => {
      const props = PricingTiersPropsSchema.parse({
        tiers: [
          {
            name: "Unsafe Plan",
            price: "$10",
            period: "",
            description: "Test plan",
            features: [],
            ctaLabel: "Buy Now",
            ctaHref: "javascript:alert(1)",
            highlighted: false,
            badge: "",
          },
        ],
      });

      const { container } = render(<PricingTiers {...props} />);

      expect(container.querySelector("a[href^='javascript']")).toBeNull();
      expect(screen.getByText("Buy Now").tagName).toBe("SPAN");
      expect(container.querySelector(".max-w-md")).not.toBeNull();
    });

    it("supports the stacked rows variant without a card grid", () => {
      const props = PricingTiersPropsSchema.parse({});
      const { container } = render(<PricingTiers {...props} variant="stacked" />);

      expect(container.querySelector(".grid")).toBeNull();
      expect(container.querySelector(".space-y-3")).not.toBeNull();
      props.tiers.forEach((tier) => {
        expect(screen.getByText(tier.name)).toBeTruthy();
      });
    });
  });

  describe("3. Team & Staff", () => {
    it("renders names, roles and bios", () => {
      const props = TeamGridPropsSchema.parse({});
      render(<TeamGrid {...props} />);

      props.members.forEach((member) => {
        expect(screen.getByText(member.name)).toBeTruthy();
        expect(screen.getByText(member.role)).toBeTruthy();
        expect(screen.getByText(member.bio)).toBeTruthy();
      });
    });

    it("falls back to initials when no usable photo is provided", () => {
      const props = TeamGridPropsSchema.parse({
        members: [
          { name: "Ada Lovelace", role: "Engineer", imageUrl: "", bio: "Pioneer." },
          {
            name: "Unsafe Photo",
            role: "Tester",
            imageUrl: "javascript:alert(1)",
            bio: "Should not load.",
          },
        ],
      });

      const { container } = render(<TeamGrid {...props} />);

      expect(screen.getByText("AL")).toBeTruthy();
      expect(screen.getByText("UP")).toBeTruthy();
      expect(container.querySelector("img")).toBeNull();
    });

    it("maps the column control to a responsive grid", () => {
      const props = TeamGridPropsSchema.parse({
        members: [
          { name: "One", role: "Role", imageUrl: "", bio: "Bio" },
          { name: "Two", role: "Role", imageUrl: "", bio: "Bio" },
        ],
      });

      const twoCol = render(<TeamGrid {...props} columns="2" />);
      // Mobile/tablet renders a horizontally scrollable flex row
      expect(twoCol.container.querySelector(".overflow-x-auto")).not.toBeNull();
      expect(twoCol.container.querySelector(".flex.gap-3")).not.toBeNull();
      cleanup();

      const fourCol = render(<TeamGrid {...props} columns="4" />);
      expect(fourCol.container.querySelector(".overflow-x-auto")).not.toBeNull();
      expect(fourCol.container.querySelector(".flex.gap-3")).not.toBeNull();
    });
  });

  describe("4. Process / How It Works", () => {
    it("numbers steps sequentially when no icon is set", () => {
      const props = StepsProcessPropsSchema.parse({});
      render(<StepsProcess {...props} />);

      ["01", "02", "03", "04"].forEach((number) => {
        expect(screen.getByText(number)).toBeTruthy();
      });

      props.steps.forEach((step) => {
        expect(screen.getByText(step.title)).toBeTruthy();
        expect(screen.getByText(step.description)).toBeTruthy();
      });
    });

    it("uses a responsive 4-column grid in the horizontal variant", () => {
      const props = StepsProcessPropsSchema.parse({});
      const { container } = render(<StepsProcess {...props} variant="horizontal" />);

      const grid = container.querySelector("ol");
      expect(grid?.className).toContain("grid-cols-1");
      expect(grid?.className).toContain("sm:grid-cols-2");
      expect(grid?.className).toContain("lg:grid-cols-4");
    });

    it("renders a vertical timeline with a connector line", () => {
      const props = StepsProcessPropsSchema.parse({});
      const { container } = render(<StepsProcess {...props} variant="vertical" />);

      const connector = container.querySelector("[aria-hidden='true']");
      expect(connector).not.toBeNull();
      expect(connector?.className).toContain("w-px");
      expect(container.querySelectorAll("ol > li").length).toBe(props.steps.length);
      expect(container.querySelector(".grid")).toBeNull();
    });
  });

  describe("5. Image + Text (Media Split)", () => {
    it("renders heading, body, bullets and a safe CTA", () => {
      const props = MediaContentPropsSchema.parse({
        ctaHref: "/contact",
        body: "We deliver detail-obsessed work on schedule.",
      });
      render(<MediaContent {...props} />);

      expect(screen.getByText(props.title)).toBeTruthy();
      expect(screen.getByText(props.body)).toBeTruthy();
      props.bullets.forEach((bullet) => {
        expect(screen.getByText(bullet)).toBeTruthy();
      });
      expect(screen.getByText(props.ctaLabel).getAttribute("href")).toBe("/contact");
    });

    it("swaps the visual order for image-left layouts while keeping text first in the DOM", () => {
      const props = MediaContentPropsSchema.parse({ imagePosition: "left" });
      const { container } = render(<MediaContent {...props} />);

      const grid = container.querySelector(".grid");
      const [textBlock, mediaBlock] = Array.from(grid?.children || []) as HTMLElement[];

      expect(textBlock.className).toContain("lg:order-2");
      expect(mediaBlock.className).toContain("lg:order-1");
      expect(textBlock.textContent).toContain(props.title);
    });

    it("replaces unsafe images with a theme-token placeholder", () => {
      const props = MediaContentPropsSchema.parse({
        imageUrl: "javascript:alert(1)",
      });
      const { container } = render(<MediaContent {...props} />);

      expect(container.querySelector("img")).toBeNull();
      expect(
        screen.getByText("Add an image URL in the properties panel")
      ).toBeTruthy();
    });

    it("hides the CTA entirely when the URL is unsafe", () => {
      const props = MediaContentPropsSchema.parse({
        ctaHref: "javascript:alert(1)",
      });
      const { container } = render(<MediaContent {...props} />);

      expect(container.querySelector("a[href^='javascript']")).toBeNull();
      expect(screen.queryByText(props.ctaLabel)).toBeNull();
    });
  });

  describe("6. Editor integration — generic repeater fallback", () => {
    const buildPanel = () => {
      const onUpdateProps = vi.fn();
      const onUpdateStyle = vi.fn();

      render(
        <PropertiesPanel
          section={{
            id: "sec-pricing",
            componentId: "pricing.tiers.v1",
            componentVersion: 1,
            props: PricingTiersPropsSchema.parse({}),
            style: {},
          }}
          onClose={vi.fn()}
          onUpdateProps={onUpdateProps}
          onUpdateStyle={onUpdateStyle}
        />
      );

      return { onUpdateProps, onUpdateStyle };
    };

    const lastTiers = (onUpdateProps: ReturnType<typeof vi.fn>) => {
      const calls = onUpdateProps.mock.calls;
      const call = calls[calls.length - 1];
      return (call?.[1] as { tiers: Array<Record<string, unknown>> }).tiers;
    };

    it("edits pricing fields that have no dedicated editor block", () => {
      const { onUpdateProps } = buildPanel();

      expect(screen.getByLabelText("Highlight This Item")).toBeTruthy();
      expect(screen.getByDisplayValue("$99")).toBeTruthy();

      fireEvent.change(screen.getByDisplayValue("$99"), {
        target: { value: "$149" },
      });

      expect(onUpdateProps).toHaveBeenCalledWith(
        "sec-pricing",
        expect.objectContaining({ tiers: expect.any(Array) })
      );
      expect(lastTiers(onUpdateProps)[0].price).toBe("$149");
    });

    it("round-trips string arrays through a one-per-line textarea", () => {
      const { onUpdateProps } = buildPanel();

      const features = screen.getByPlaceholderText(
        "One item per line"
      ) as HTMLTextAreaElement;

      expect(features.value).toBe(
        "Up to 3 pages\nBasic SEO setup\nEmail support\nMonthly reporting"
      );

      fireEvent.change(features, {
        target: { value: "Custom domain\nPriority support" },
      });

      expect(lastTiers(onUpdateProps)[0].features).toEqual([
        "Custom domain",
        "Priority support",
      ]);
    });

    it("toggles boolean fields and adds new tier rows with sane defaults", () => {
      const { onUpdateProps } = buildPanel();

      fireEvent.click(screen.getByLabelText("Highlight This Item"));
      expect(lastTiers(onUpdateProps)[0].highlighted).toBe(true);

      fireEvent.click(screen.getByText("Add Item"));
      const tiers = lastTiers(onUpdateProps);
      expect(tiers.length).toBe(4);
      expect(tiers[3].name).toBe("New Plan");
      expect(tiers[3].price).toBe("$0");
    });
  });
});
