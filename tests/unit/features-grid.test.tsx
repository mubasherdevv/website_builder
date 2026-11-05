import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import {
  FeaturesGrid,
  FeaturesGridPropsSchema,
} from "@/components/website/features/FeaturesGrid";

afterEach(() => cleanup());

const baseProps = FeaturesGridPropsSchema.parse({
  features: [
    { title: "Fast Delivery", description: "Ships in 24 hours.", icon: "zap" },
    { title: "Secure Checkout", description: "PCI compliant payments.", icon: "lock" },
    { title: "Real Support", description: "Humans answer the phone.", icon: "support" },
  ],
});

describe("Features Grid — Compact 2-Up Layout", () => {
  it("defaults to the compact 2-column grid", () => {
    expect(FeaturesGridPropsSchema.parse({}).columns).toBe("2");
    expect(FeaturesGridPropsSchema.parse({}).layout).toBe("grid");
  });

  it("always caps the grid at 2 cards per row, even with legacy columns=3", () => {
    const { container } = render(
      <FeaturesGrid {...baseProps} columns="3" />
    );

    const grid = container.querySelector(".grid");
    expect(grid).not.toBeNull();

    const classes = grid?.className ?? "";
    expect(classes).toContain("grid-cols-1");
    expect(classes).toContain("sm:grid-cols-2");
    expect(classes).not.toContain("lg:grid-cols-3");
    expect(classes).not.toContain("lg:grid-cols-4");
    expect(grid?.children.length).toBe(3);
  });

  it("renders compact cards (icon beside text) with theme tokens", () => {
    const { container, getByText } = render(<FeaturesGrid {...baseProps} />);

    const card = container.querySelector(".grid > div");
    expect(card).not.toBeNull();
    expect(card?.className).toContain("p-4");
    expect(card?.className).toContain("items-start");

    // Card chrome must come from theme variables, never hardcoded colors.
    expect(card?.getAttribute("style")).toContain("--color-card-bg");

    expect(getByText("Fast Delivery")).toBeTruthy();
    expect(getByText("Ships in 24 hours.")).toBeTruthy();
  });

  it("keeps carousel mode intact", () => {
    const { container } = render(<FeaturesGrid {...baseProps} layout="carousel" />);

    expect(container.querySelector(".snap-x")).not.toBeNull();
    expect(container.querySelector(".grid")).toBeNull();
  });

  it("exposes no dead columns control and labels the grid as 2-up", async () => {
    const { featuresGridDefinition } = await import(
      "@/components/website/features/FeaturesGrid"
    );
    const controlNames = featuresGridDefinition.editor.controls.map(
      (c) => c.propName
    );
    expect(controlNames).not.toContain("columns");

    const layoutControl = featuresGridDefinition.editor.controls.find(
      (c) => c.propName === "layout"
    );
    const gridOption = layoutControl?.type === "select"
      ? layoutControl.options?.find((o) => o.value === "grid")
      : undefined;
    expect(gridOption?.label).toContain("2 per row");
  });
});
