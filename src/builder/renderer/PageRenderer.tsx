"use client";

import React from "react";
import { PageDocument, ThemeConfig } from "@/types/builder";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { SectionRenderer } from "./SectionRenderer";
import { PlusCircle } from "lucide-react";

export interface PageRendererProps {
  document: PageDocument;
  theme?: ThemeConfig;
  mode?: "public" | "editor";
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  onDeleteSection?: (id: string) => void;
  onDuplicateSection?: (id: string) => void;
  onMoveSectionUp?: (id: string) => void;
  onMoveSectionDown?: (id: string) => void;
  onAddSectionClick?: () => void;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  document,
  theme,
  mode = "public",
  selectedSectionId = null,
  onSelectSection,
  onDeleteSection,
  onDuplicateSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onAddSectionClick,
}) => {
  const sections = document.sections || [];

  const content = (
    <div
      className="w-full min-h-screen text-text-primary flex flex-col transition-colors"
      style={{ backgroundColor: "var(--color-page-bg, var(--color-app-bg, #F5F9F6))" }}
    >
      {sections.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-brand-soft text-brand flex items-center justify-center mb-4">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">This page has no sections</h3>
          <p className="text-sm text-text-secondary max-w-md mb-6">
            {mode === "editor"
              ? "Select an element from the component library or click below to add your first section."
              : "Check back soon for content."}
          </p>
          {mode === "editor" && onAddSectionClick && (
            <button
              type="button"
              onClick={onAddSectionClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn bg-brand text-white font-semibold text-sm hover:bg-brand-hover transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Section</span>
            </button>
          )}
        </div>
      ) : (
        sections.map((section, index) => (
          <SectionRenderer
            key={section.id}
            section={section}
            mode={mode}
            isSelected={mode === "editor" && selectedSectionId === section.id}
            onSelect={onSelectSection}
            onDelete={onDeleteSection}
            onDuplicate={onDuplicateSection}
            onMoveUp={onMoveSectionUp}
            onMoveDown={onMoveSectionDown}
            canMoveUp={index > 0}
            canMoveDown={index < sections.length - 1}
          />
        ))
      )}
    </div>
  );

  if (theme) {
    return <ThemeProvider theme={theme}>{content}</ThemeProvider>;
  }

  return content;
};

