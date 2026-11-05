"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { PageDocument, ThemeConfig, SectionNode, SectionStyle } from "@/types/builder";
import { HistoryManager } from "@/builder/history/history-manager";
import {
  insertSection,
  updateNodeProps,
  updateNodeStyle,
  moveSection,
  duplicateSection,
  deleteNode,
  generateNodeId,
} from "@/builder/operations/document-operations";
import { AnyComponentDefinition } from "@/builder/registry/types";
import { getComponentDefinition } from "@/builder/registry";
import { EditorTopBar, ViewportMode, SaveStatus } from "./EditorTopBar";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { PageRenderer } from "@/builder/renderer/PageRenderer";
import { toast } from "@/components/ui/Toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface EditorShellProps {
  initialDocument: PageDocument;
  theme: ThemeConfig;
  websiteId?: string;
  websiteName?: string;
  backHref?: string;
  onSave?: (doc: PageDocument) => Promise<void>;
  onPublish?: (doc: PageDocument) => Promise<void>;
}

export const EditorShell: React.FC<EditorShellProps> = ({
  initialDocument,
  theme,
  websiteId,
  websiteName = "My Business Website",
  backHref,
  onSave,
  onPublish,
}) => {
  // History Manager instance for document
  const [history] = useState(() => new HistoryManager(initialDocument));
  const [currentDoc, setCurrentDoc] = useState<PageDocument>(initialDocument);

  // Reactive Design System / Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(theme);
  const [themeHistory, setThemeHistory] = useState<ThemeConfig[]>([theme]);
  const [themeHistoryIndex, setThemeHistoryIndex] = useState(0);

  // UI state
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    initialDocument.sections[0]?.id || null
  );
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isPublishing, startPublishTransition] = useTransition();

  // Collapsible Left and Right Panels
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Load website-specific design tokens from persistence
  useEffect(() => {
    try {
      const siteKey = websiteName.includes(":") ? websiteName.split(":")[1].trim() : "default";
      const savedTheme = localStorage.getItem(`website_${siteKey}_theme`);
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme) as ThemeConfig;
        setCurrentTheme(parsed);
        setThemeHistory([parsed]);
        setThemeHistoryIndex(0);
      }
    } catch {
      // Fallback to initial prop theme
    }
  }, [websiteName]);

  // Selected Section Node
  const selectedSection =
    currentDoc.sections.find((s) => s.id === selectedSectionId) || null;

  // Helper to commit doc changes to history & trigger save
  const commitDocumentChange = useCallback(
    (newDoc: PageDocument) => {
      history.push(newDoc);
      setCurrentDoc(newDoc);
      setSaveStatus("unsaved");

      // Debounce/simulate autosave
      setTimeout(() => {
        setSaveStatus("saving");
        if (onSave) {
          onSave(newDoc)
            .then(() => setSaveStatus("saved"))
            .catch(() => setSaveStatus("error"));
        } else {
          setSaveStatus("saved");
        }
      }, 500);
    },
    [history, onSave]
  );

  // Theme Updates with live preview & persistence
  const handleUpdateTheme = useCallback(
    (newTheme: ThemeConfig) => {
      setCurrentTheme(newTheme);
      const updatedHistory = themeHistory.slice(0, themeHistoryIndex + 1);
      updatedHistory.push(newTheme);
      setThemeHistory(updatedHistory);
      setThemeHistoryIndex(updatedHistory.length - 1);
      setSaveStatus("unsaved");

      // Autosave website-isolated theme
      try {
        const siteKey = websiteName.includes(":") ? websiteName.split(":")[1].trim() : "default";
        localStorage.setItem(`website_${siteKey}_theme`, JSON.stringify(newTheme));
      } catch {
        // Safe fallback
      }

      setTimeout(() => {
        setSaveStatus("saved");
      }, 400);
    },
    [themeHistory, themeHistoryIndex, websiteName]
  );

  // Undo / Redo Handlers supporting both document & design system
  const handleUndo = () => {
    if (themeHistoryIndex > 0) {
      const prevTheme = themeHistory[themeHistoryIndex - 1];
      setThemeHistoryIndex(themeHistoryIndex - 1);
      setCurrentTheme(prevTheme);
    }
    const doc = history.undo();
    if (doc) setCurrentDoc(doc);
  };

  const handleRedo = () => {
    if (themeHistoryIndex < themeHistory.length - 1) {
      const nextTheme = themeHistory[themeHistoryIndex + 1];
      setThemeHistoryIndex(themeHistoryIndex + 1);
      setCurrentTheme(nextTheme);
    }
    const doc = history.redo();
    if (doc) setCurrentDoc(doc);
  };

  // Section Operations
  const handleAddSection = (
    comp: AnyComponentDefinition,
    customProps?: Record<string, unknown>
  ) => {
    const newSection: SectionNode = {
      id: generateNodeId("sec"),
      componentId: comp.id,
      componentVersion: comp.version,
      props: {
        ...structuredClone(comp.defaults),
        ...(customProps || {}),
      },
    };
    const updated = insertSection(currentDoc, newSection);
    commitDocumentChange(updated);
    setSelectedSectionId(newSection.id);
    toast.success(`Added ${comp.name} section.`);
  };

  const handleUpdateProps = (sectionId: string, newProps: Record<string, unknown>) => {
    const updated = updateNodeProps(currentDoc, sectionId, newProps);
    commitDocumentChange(updated);
  };

  const handleUpdateStyle = (sectionId: string, newStyle: Partial<SectionStyle>) => {
    const updated = updateNodeStyle(currentDoc, sectionId, newStyle);
    commitDocumentChange(updated);
  };

  const handleSwitchComponent = (sectionId: string, newComponentId: string) => {
    const target = currentDoc.sections.find((s) => s.id === sectionId);
    if (!target) return;

    const newDef = getComponentDefinition(newComponentId);
    if (!newDef) return;

    // Preserve compatible properties across template variants
    const mergedProps = {
      ...newDef.defaults,
      ...target.props,
    };

    const updatedSections = currentDoc.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          componentId: newComponentId,
          componentVersion: newDef.version,
          props: mergedProps,
        };
      }
      return s;
    });

    const updatedDoc = {
      ...currentDoc,
      sections: updatedSections,
    };
    commitDocumentChange(updatedDoc);
  };

  const handleApplyHeaderVariant = (variantId: string) => {
    const existingHeader = currentDoc.sections.find((s) => s.componentId.startsWith("header."));
    const newDef = getComponentDefinition(variantId);
    if (!newDef) return;

    if (existingHeader) {
      handleSwitchComponent(existingHeader.id, variantId);
      setSelectedSectionId(existingHeader.id);
    } else {
      // Insert at the very top of the page
      const newHeaderSection: SectionNode = {
        id: generateNodeId("sec"),
        componentId: variantId,
        componentVersion: newDef.version,
        props: structuredClone(newDef.defaults),
      };
      const updatedDoc = {
        ...currentDoc,
        sections: [newHeaderSection, ...currentDoc.sections],
      };
      commitDocumentChange(updatedDoc);
      setSelectedSectionId(newHeaderSection.id);
    }
  };

  const handleApplyFooterVariant = (variantId: string) => {
    const existingFooter = currentDoc.sections.find((s) => s.componentId.startsWith("footer."));
    const newDef = getComponentDefinition(variantId);
    if (!newDef) return;

    if (existingFooter) {
      handleSwitchComponent(existingFooter.id, variantId);
      setSelectedSectionId(existingFooter.id);
    } else {
      // Insert at the very end of the page
      const newFooterSection: SectionNode = {
        id: generateNodeId("sec"),
        componentId: variantId,
        componentVersion: newDef.version,
        props: structuredClone(newDef.defaults),
      };
      const updatedDoc = {
        ...currentDoc,
        sections: [...currentDoc.sections, newFooterSection],
      };
      commitDocumentChange(updatedDoc);
      setSelectedSectionId(newFooterSection.id);
    }
    toast.success(
      existingFooter ? `Footer updated to ${newDef.name}.` : `Added ${newDef.name} at page end.`
    );
  };

  const handleMoveUp = (sectionId: string) => {
    const idx = currentDoc.sections.findIndex((s) => s.id === sectionId);
    if (idx > 0) {
      const updated = moveSection(currentDoc, idx, idx - 1);
      commitDocumentChange(updated);
    }
  };

  const handleMoveDown = (sectionId: string) => {
    const idx = currentDoc.sections.findIndex((s) => s.id === sectionId);
    if (idx !== -1 && idx < currentDoc.sections.length - 1) {
      const updated = moveSection(currentDoc, idx, idx + 1);
      commitDocumentChange(updated);
    }
  };

  const handleDuplicate = (sectionId: string) => {
    const updated = duplicateSection(currentDoc, sectionId);
    commitDocumentChange(updated);
    toast.success("Section duplicated.");
  };

  const handleDelete = (sectionId: string) => {
    const updated = deleteNode(currentDoc, sectionId);
    commitDocumentChange(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
    toast.success("Section removed from page.");
  };

  const handlePublish = () => {
    startPublishTransition(async () => {
      if (onPublish) {
        await onPublish(currentDoc);
      }
      // Also persist published theme
      try {
        const siteKey = websiteName.includes(":") ? websiteName.split(":")[1].trim() : "default";
        localStorage.setItem(`website_${siteKey}_theme_published`, JSON.stringify(currentTheme));
      } catch {
        // Safe fallback
      }
      toast.success("Website & Design System published successfully!", "Live Deployment");
    });
  };

  // Preview Mode
  if (isPreview) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-white">
        <div className="h-12 bg-text-primary text-white px-6 flex items-center justify-between text-xs sticky top-0 z-50 shrink-0 shadow-sm">
          <span className="font-semibold">Interactive Preview Mode</span>
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className="px-3 py-1 bg-brand text-white rounded font-medium hover:bg-brand-hover cursor-pointer transition-colors"
          >
            Return to Visual Editor
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PageRenderer document={currentDoc} theme={currentTheme} mode="public" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-surface-background">
      {/* Top Bar */}
      <EditorTopBar
        websiteName={websiteName}
        websiteId={websiteId}
        backHref={backHref}
        pageTitle={currentDoc.page.title}
        viewport={viewport}
        onViewportChange={setViewport}
        canUndo={history.canUndo || themeHistoryIndex > 0}
        canRedo={history.canRedo || themeHistoryIndex < themeHistory.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        saveStatus={saveStatus}
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview(true)}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Component & Design System Palette */}
        <div className="relative shrink-0 flex h-full">
          <div
            className={`h-full overflow-hidden transition-all duration-300 ease-in-out ${
              isLeftPanelOpen ? "w-80" : "w-0"
            }`}
          >
            <div className="w-80 h-full">
              <ComponentPalette
                websiteId={websiteId}
                sections={currentDoc.sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={setSelectedSectionId}
                onAddSection={handleAddSection}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDelete={handleDelete}
                theme={currentTheme}
                onUpdateTheme={handleUpdateTheme}
                onApplyHeaderVariant={handleApplyHeaderVariant}
                onApplyFooterVariant={handleApplyFooterVariant}
              />
            </div>
          </div>

          {/* Left Arrow Toggle Button */}
          <div className="relative flex items-center justify-center w-0 z-30">
            <button
              type="button"
              onClick={() => setIsLeftPanelOpen((prev) => !prev)}
              className={`absolute top-1/2 -translate-y-1/2 w-5 h-10 bg-surface hover:bg-surface-subtle border border-border shadow-xs hover:shadow-sm flex items-center justify-center text-text-muted hover:text-brand transition-all cursor-pointer focus:outline-none ${
                isLeftPanelOpen
                  ? "-translate-x-1/2 rounded-full"
                  : "left-0 rounded-r-md border-l-0"
              }`}
              title={isLeftPanelOpen ? "Collapse Left Panel" : "Expand Left Panel"}
              aria-label={isLeftPanelOpen ? "Collapse Left Panel" : "Expand Left Panel"}
            >
              {isLeftPanelOpen ? (
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>

        {/* Center Canvas with Live Updating Theme */}
        <div className="flex-1 min-w-0 h-full overflow-hidden relative">
          <Canvas
            document={currentDoc}
            theme={currentTheme}
            viewport={viewport}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onDeleteSection={handleDelete}
            onDuplicateSection={handleDuplicate}
            onMoveSectionUp={handleMoveUp}
            onMoveSectionDown={handleMoveDown}
            onAddSectionClick={() => {}}
          />
        </div>

        {/* Right Properties Panel */}
        <div className="relative shrink-0 flex h-full">
          {/* Right Arrow Toggle Button */}
          <div className="relative flex items-center justify-center w-0 z-30">
            <button
              type="button"
              onClick={() => setIsRightPanelOpen((prev) => !prev)}
              className={`absolute top-1/2 -translate-y-1/2 w-5 h-10 bg-surface hover:bg-surface-subtle border border-border shadow-xs hover:shadow-sm flex items-center justify-center text-text-muted hover:text-brand transition-all cursor-pointer focus:outline-none ${
                isRightPanelOpen
                  ? "-translate-x-1/2 rounded-full"
                  : "right-0 rounded-l-md border-r-0"
              }`}
              title={isRightPanelOpen ? "Collapse Right Panel" : "Expand Right Panel"}
              aria-label={isRightPanelOpen ? "Collapse Right Panel" : "Expand Right Panel"}
            >
              {isRightPanelOpen ? (
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </button>
          </div>

          <div
            className={`h-full overflow-hidden transition-all duration-300 ease-in-out ${
              isRightPanelOpen ? "w-[350px]" : "w-0"
            }`}
          >
            <div className="w-[350px] h-full">
              <PropertiesPanel
                section={selectedSection}
                onClose={() => setSelectedSectionId(null)}
                onUpdateProps={handleUpdateProps}
                onUpdateStyle={handleUpdateStyle}
                onSwitchComponent={handleSwitchComponent}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
