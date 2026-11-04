"use client";

import React from "react";
import { SectionNode, SectionStyle } from "@/types/builder";
import { getComponentDefinition } from "@/builder/registry";
import { SectionErrorBoundary } from "./ErrorBoundary";
import { AlertCircle, Trash2, Copy, ArrowUp, ArrowDown } from "lucide-react";

export interface SectionRendererProps {
  section: SectionNode;
  mode?: "public" | "editor";
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function getSectionStyleClasses(style?: SectionStyle): string {
  if (!style) return "";

  const classes: string[] = [];

  // Background
  if (style.background === "surface") classes.push("bg-surface bg-[var(--color-section-bg,#FFFFFF)]");
  else if (style.background === "brand") classes.push("bg-brand bg-[var(--color-primary)] text-white");
  else if (style.background === "muted") classes.push("bg-surface-subtle bg-[var(--color-alt-section-bg,#EDF4EF)]");
  else if (style.background === "transparent") classes.push("bg-transparent");

  // Padding Y
  if (style.paddingY === "none") classes.push("py-0");
  else if (style.paddingY === "compact") classes.push("py-6 sm:py-10");
  else if (style.paddingY === "normal") classes.push("py-12 sm:py-16");
  else if (style.paddingY === "spacious") classes.push("py-20 sm:py-28");

  // Alignment
  if (style.alignment === "center") classes.push("text-center");
  else if (style.alignment === "right") classes.push("text-right");
  else if (style.alignment === "left") classes.push("text-left");

  if (style.customClassName) classes.push(style.customClassName);

  return classes.join(" ");
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  mode = "public",
  isSelected = false,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}) => {
  const def = getComponentDefinition(section.componentId);

  // Fallback for unregistered or deprecated components
  if (!def) {
    return (
      <div className="w-full p-8 my-4 rounded-card border-2 border-dashed border-status-warning bg-status-warning-soft/40 text-center">
        <div className="flex items-center justify-center gap-2 text-status-warning mb-2">
          <AlertCircle className="w-5 h-5" />
          <h4 className="font-semibold text-sm">Unknown Component</h4>
        </div>
        <p className="text-xs text-text-secondary">
          Component ID <code className="bg-surface px-1 py-0.5 rounded border">{section.componentId}</code> is not registered on this platform.
        </p>
      </div>
    );
  }

  // Merge defaults with section props
  const mergedProps = { ...def.defaults, ...(section.props || {}) };
  const styleClasses = getSectionStyleClasses(section.style);
  const Component = def.component as React.ComponentType<Record<string, unknown>>;

  if (mode === "public") {
    return (
      <SectionErrorBoundary componentId={section.componentId}>
        <div data-section-id={section.id} className={styleClasses}>
          <Component {...mergedProps} />
        </div>
      </SectionErrorBoundary>
    );
  }

  // Editor mode with selection highlight and quick actions
  return (
    <SectionErrorBoundary componentId={section.componentId}>
      <div
        data-section-id={section.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(section.id);
        }}
        className={`relative group transition-all duration-150 ${
          isSelected
            ? "ring-2 ring-brand ring-offset-2 z-20"
            : "hover:ring-1 hover:ring-brand/50 hover:ring-offset-1"
        }`}
      >
        {/* Editor Action Toolbar (Visible on selection or hover) */}
        {isSelected && (
          <div className="absolute top-2 right-4 z-30 flex items-center gap-1 bg-text-primary text-white p-1 rounded-md shadow-md text-xs">
            <span className="px-2 py-0.5 font-mono text-[10px] text-text-muted border-r border-text-secondary/30">
              {def.name}
            </span>
            {canMoveUp && onMoveUp && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp(section.id);
                }}
                title="Move section up"
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {canMoveDown && onMoveDown && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown(section.id);
                }}
                title="Move section down"
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
            {onDuplicate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(section.id);
                }}
                title="Duplicate section"
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(section.id);
                }}
                title="Delete section"
                className="p-1 hover:bg-status-danger text-status-danger-soft hover:text-white rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className={`pointer-events-auto ${styleClasses}`}>
          <Component {...mergedProps} />
        </div>
      </div>
    </SectionErrorBoundary>
  );
};

