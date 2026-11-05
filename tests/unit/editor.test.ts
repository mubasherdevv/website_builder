import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryManager } from "@/builder/history/history-manager";
import { PageDocument } from "@/types/builder";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { EditorShell } from "@/components/editor/EditorShell";
import { emeraldForestPreset } from "@/themes/presets";

describe("Visual Editor Foundation", () => {
  const sampleDoc: PageDocument = {
    schemaVersion: 1,
    page: { id: "p1", title: "Home", slug: "/", status: "draft" },
    sections: [
      {
        id: "s1",
        componentId: "header.simple.v1",
        componentVersion: 1,
        props: { brandName: "Original Brand" },
      },
    ],
  };

  it("HistoryManager handles push, undo, and redo accurately", () => {
    const history = new HistoryManager(sampleDoc, 5);
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);

    // Push state 2
    const doc2: PageDocument = {
      ...sampleDoc,
      sections: [
        {
          id: "s1",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: { brandName: "Updated Brand" },
        },
      ],
    };
    history.push(doc2);
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
    expect(history.current.sections[0].props.brandName).toBe("Updated Brand");

    // Undo back to state 1
    const undone = history.undo();
    expect(undone).not.toBeNull();
    expect(undone?.sections[0].props.brandName).toBe("Original Brand");
    expect(history.canRedo).toBe(true);

    // Redo forward to state 2
    const redone = history.redo();
    expect(redone?.sections[0].props.brandName).toBe("Updated Brand");
  });

  it("EditorTopBar renders controls and triggers callbacks", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const onViewport = vi.fn();

    render(
      React.createElement(EditorTopBar, {
        websiteName: "Alpha Plumbers",
        pageTitle: "Homepage",
        viewport: "desktop",
        onViewportChange: onViewport,
        canUndo: true,
        canRedo: false,
        onUndo: onUndo,
        onRedo: onRedo,
        saveStatus: "saved",
        isPreview: false,
        onTogglePreview: () => {},
        onPublish: () => {},
      })
    );

    expect(screen.getByText("Alpha Plumbers")).toBeDefined();
    expect(screen.getByText("Saved")).toBeDefined();

    const undoBtn = screen.getByTitle("Undo (Ctrl+Z)");
    fireEvent.click(undoBtn);
    expect(onUndo).toHaveBeenCalled();

    // Redo is disabled
    const redoBtn = screen.getByTitle("Redo (Ctrl+Y)") as HTMLButtonElement;
    expect(redoBtn.disabled).toBe(true);

    // Click tablet viewport
    const tabletBtn = screen.getByTitle("Tablet view (768px)");
    fireEvent.click(tabletBtn);
    expect(onViewport).toHaveBeenCalledWith("tablet");
  });

  it("PropertiesPanel updates section props on input change", () => {
    const onUpdateProps = vi.fn();
    const onUpdateStyle = vi.fn();

    render(
      React.createElement(PropertiesPanel, {
        section: sampleDoc.sections[0],
        onClose: () => {},
        onUpdateProps: onUpdateProps,
        onUpdateStyle: onUpdateStyle,
      })
    );

    expect(screen.getByText("Simple Navigation Header")).toBeDefined();
    const input = screen.getByDisplayValue("Original Brand");
    fireEvent.change(input, { target: { value: "New Brand Name" } });

    expect(onUpdateProps).toHaveBeenCalledWith("s1", {
      brandName: "New Brand Name",
    });
  });

  it("PropertiesPanel renders quick actions, switch toggles, and fires callbacks", () => {
    const onUpdateProps = vi.fn();
    const onUpdateStyle = vi.fn();
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();
    const onDuplicate = vi.fn();
    const onDelete = vi.fn();

    const featureSection = {
      id: "sec_features_test",
      componentId: "features.grid.v1",
      componentVersion: 1,
      props: {
        title: "Test Features",
        showIcons: true,
      },
    };

    render(
      React.createElement(PropertiesPanel, {
        section: featureSection,
        onClose: () => {},
        onUpdateProps,
        onUpdateStyle,
        onMoveUp,
        onMoveDown,
        onDuplicate,
        onDelete,
      })
    );

    // Verify switch toggle exists and can be clicked
    const switchToggle = screen.getByRole("switch");
    expect(switchToggle).toBeDefined();
    fireEvent.click(switchToggle);
    expect(onUpdateProps).toHaveBeenCalledWith("sec_features_test", {
      showIcons: false,
    });

    // Test quick action toolbar buttons
    const moveUpBtn = screen.getByTitle("Move Section Up");
    fireEvent.click(moveUpBtn);
    expect(onMoveUp).toHaveBeenCalledWith("sec_features_test");

    const duplicateBtn = screen.getByTitle("Duplicate Section");
    fireEvent.click(duplicateBtn);
    expect(onDuplicate).toHaveBeenCalledWith("sec_features_test");

    const deleteBtn = screen.getByTitle("Delete Section");
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith("sec_features_test");
  });

  it("EditorShell provides left and right arrow toggle buttons to collapse and expand sidebars", () => {
    render(
      React.createElement(EditorShell, {
        initialDocument: sampleDoc,
        theme: emeraldForestPreset,
        websiteId: "test-site",
        websiteName: "Test Site",
      })
    );

    // Initial state: both panels are open, so their arrows indicate collapse actions
    const collapseLeftBtn = screen.getByTitle("Collapse Left Panel");
    const collapseRightBtn = screen.getByTitle("Collapse Right Panel");
    expect(collapseLeftBtn).toBeDefined();
    expect(collapseRightBtn).toBeDefined();

    // Click left arrow: collapses left panel, button changes to expand
    fireEvent.click(collapseLeftBtn);
    expect(screen.getByTitle("Expand Left Panel")).toBeDefined();

    // Click right arrow: collapses right panel, button changes to expand
    fireEvent.click(collapseRightBtn);
    expect(screen.getByTitle("Expand Right Panel")).toBeDefined();

    // Click expand buttons to bring them back
    fireEvent.click(screen.getByTitle("Expand Left Panel"));
    expect(screen.getByTitle("Collapse Left Panel")).toBeDefined();

    fireEvent.click(screen.getByTitle("Expand Right Panel"));
    expect(screen.getByTitle("Collapse Right Panel")).toBeDefined();
  });
});

