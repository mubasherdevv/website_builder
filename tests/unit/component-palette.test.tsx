import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ComponentPalette } from "@/components/editor/ComponentPalette";
import { listRegisteredComponents } from "@/builder/registry";

afterEach(() => cleanup());

const renderPalette = () => {
  const onAddSection = vi.fn();
  const utils = render(
    <ComponentPalette
      sections={[]}
      selectedSectionId={null}
      onSelectSection={vi.fn()}
      onAddSection={onAddSection}
      onMoveUp={vi.fn()}
      onMoveDown={vi.fn()}
      onDelete={vi.fn()}
    />
  );
  return { ...utils, onAddSection };
};

const HIDDEN_ALIASES = [
  "header.classic.v1",
  "header.topbar.v1",
  "header.transparent.v1",
  "footer.classic.v1",
  "footer.columns.v1",
  "footer.newsletter.v1",
];

describe("Editor Component Palette — Compact 2-Up Elements", () => {
  it("renders the Elements tab as a 2-column grid of compact tiles", () => {
    const { container } = renderPalette();

    const grid = container.querySelector(".grid.grid-cols-2");
    expect(grid).not.toBeNull();

    const canonicalCount = listRegisteredComponents().filter(
      (c) => !HIDDEN_ALIASES.includes(c.id)
    ).length;
    expect(grid?.children.length).toBe(canonicalCount);

    // Tiles stack icon + text vertically so two fit per row without horizontal scroll.
    const firstTile = grid?.children[0] as HTMLElement;
    expect(firstTile.className).toContain("flex-col");
    expect(firstTile.className).toContain("min-w-0");
  });

  it("adds a section when a content element tile is clicked", () => {
    const { onAddSection } = renderPalette();

    fireEvent.click(screen.getByText("Services Grid"));

    expect(onAddSection).toHaveBeenCalledTimes(1);
    expect(onAddSection.mock.calls[0][0].id).toBe("services.grid.v1");
  });

  it("keeps header and footer tiles wired to their variant modals", () => {
    const { onAddSection } = renderPalette();

    fireEvent.click(screen.getByText("Header Navigation"));
    fireEvent.click(screen.getByText("Footer Templates"));

    // Header/footer tiles must open preview modals, never silently insert a section.
    expect(onAddSection).not.toHaveBeenCalled();
  });
});
