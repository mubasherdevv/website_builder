import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PageDocument } from "@/types/builder";
import { PageRenderer } from "@/builder/renderer/PageRenderer";
import { getSectionStyleClasses } from "@/builder/renderer/SectionRenderer";
import { modernPurplePreset } from "@/themes/presets";

describe("Shared Dynamic Page Renderer", () => {
  const sampleDoc: PageDocument = {
    schemaVersion: 1,
    page: {
      id: "page_home",
      title: "Local Pro Services",
      slug: "/",
      status: "published",
    },
    sections: [
      {
        id: "sec_header",
        componentId: "header.simple.v1",
        componentVersion: 1,
        props: {
          brandName: "Austin Elite Plumbing",
          ctaLabel: "Get Estimate",
        },
      },
      {
        id: "sec_hero",
        componentId: "hero.split.v1",
        componentVersion: 1,
        props: {
          title: "Fast 24/7 Local Plumbers",
          eyebrow: "Austin & Surrounding Areas",
        },
      },
      {
        id: "sec_footer",
        componentId: "footer.simple.v1",
        componentVersion: 1,
        props: {
          brandName: "Austin Elite Plumbing",
        },
      },
    ],
  };

  it("renders a full page in public mode with no editor controls", () => {
    render(
      React.createElement(PageRenderer, {
        document: sampleDoc,
        theme: modernPurplePreset,
        mode: "public",
      })
    );

    // Header & Footer both display the brand name
    const brandElements = screen.getAllByText("Austin Elite Plumbing");
    expect(brandElements.length).toBe(2);

    expect(screen.getByText("Fast 24/7 Local Plumbers")).toBeDefined();
    expect(screen.getByText("Get Estimate")).toBeDefined();

    // Editor controls like Move Up/Down should NOT exist in public mode
    expect(screen.queryByTitle("Move section up")).toBeNull();
  });

  it("renders in editor mode and fires callbacks on interaction", () => {
    const onSelect = vi.fn();
    const onMoveDown = vi.fn();

    render(
      React.createElement(PageRenderer, {
        document: sampleDoc,
        theme: modernPurplePreset,
        mode: "editor",
        selectedSectionId: "sec_header",
        onSelectSection: onSelect,
        onMoveSectionDown: onMoveDown,
      })
    );

    // Section should be selected and show toolbar
    const moveDownBtn = screen.getByTitle("Move section down");
    expect(moveDownBtn).toBeDefined();

    fireEvent.click(moveDownBtn);
    expect(onMoveDown).toHaveBeenCalledWith("sec_header");
  });

  it("renders fallback message for unknown component ID without crashing", () => {
    const corruptedDoc: PageDocument = {
      schemaVersion: 1,
      page: { id: "p1", title: "Test", slug: "/", status: "draft" },
      sections: [
        {
          id: "bad_sec",
          componentId: "nonexistent.vendor.v99",
          componentVersion: 1,
          props: {},
        },
      ],
    };

    render(React.createElement(PageRenderer, { document: corruptedDoc }));

    expect(screen.getByText("Unknown Component")).toBeDefined();
    expect(screen.getByText("nonexistent.vendor.v99")).toBeDefined();
  });

  it("renders empty state placeholder when no sections exist", () => {
    const emptyDoc: PageDocument = {
      schemaVersion: 1,
      page: { id: "p1", title: "Blank", slug: "/", status: "draft" },
      sections: [],
    };

    render(React.createElement(PageRenderer, { document: emptyDoc, mode: "editor" }));
    expect(screen.getByText("This page has no sections")).toBeDefined();
  });

  it("computes section style classes accurately", () => {
    const classes = getSectionStyleClasses({
      background: "brand",
      paddingY: "spacious",
      alignment: "center",
      customClassName: "custom-token-class",
    });

    expect(classes).toContain("bg-brand");
    expect(classes).toContain("py-20");
    expect(classes).toContain("text-center");
    expect(classes).toContain("custom-token-class");
  });
});
