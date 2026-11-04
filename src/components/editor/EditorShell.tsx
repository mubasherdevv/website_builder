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
  const handleAddSection = (comp: AnyComponentDefinition) => {
    const newSection: SectionNode = {
      id: generateNodeId("sec"),
      componentId: comp.id,
      componentVersion: comp.version,
      props: structuredClone(comp.defaults),
    };
    const updated = insertSection(currentDoc, newSection);
    commitDocumentChange(updated);
    setSelectedSectionId(newSection.id);
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
  };

  const handleDelete = (sectionId: string) => {
    const updated = deleteNode(currentDoc, sectionId);
    commitDocumentChange(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
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
      alert("Website & Design System published successfully!");
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Component & Design System Palette */}
        <ComponentPalette
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
        />

        {/* Center Canvas with Live Updating Theme */}
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

        {/* Right Properties Panel */}
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
  );
};
