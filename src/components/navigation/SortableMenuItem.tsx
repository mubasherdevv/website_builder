"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NavigationItem } from "@/types/navigation";
import {
  GripVertical,
  ChevronRight,
  FolderTree,
  FileText,
  Bookmark,
  Hash,
  Globe,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Indent,
  Outdent,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";

interface SortableMenuItemProps {
  item: NavigationItem;
  isSelected: boolean;
  onSelect: (item: NavigationItem) => void;
  onDelete: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
  onIndent: (itemId: string) => void;
  onOutdent: (itemId: string) => void;
  onToggleEnabled: (itemId: string) => void;
  isFirst: boolean;
  canIndent: boolean;
  canOutdent: boolean;
}

export const SortableMenuItem: React.FC<SortableMenuItemProps> = ({
  item,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onIndent,
  onOutdent,
  onToggleEnabled,
  canIndent,
  canOutdent,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getDestinationIcon = () => {
    switch (item.destinationType) {
      case "page":
        return <FileText className="w-3.5 h-3.5 text-primary" />;
      case "blog_listing":
      case "blog_post":
        return <Bookmark className="w-3.5 h-3.5 text-blue-500" />;
      case "blog_category":
        return <FolderTree className="w-3.5 h-3.5 text-amber-500" />;
      case "section_anchor":
        return <Hash className="w-3.5 h-3.5 text-emerald-600" />;
      case "dropdown_parent":
      case "clickable_parent":
        return <ChevronRight className="w-3.5 h-3.5 text-purple-500" />;
      case "custom_url":
      default:
        return <Globe className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  const getDestinationBadge = () => {
    switch (item.destinationType) {
      case "page":
        return "Page";
      case "blog_listing":
        return "Blog";
      case "blog_post":
        return "Post";
      case "blog_category":
        return "Category";
      case "section_anchor":
        return "Anchor";
      case "dropdown_parent":
        return "Folder";
      case "clickable_parent":
        return "Menu + Link";
      case "custom_url":
      default:
        return "URL";
    }
  };

  // Indentation pixel offset per level
  const indentOffset = (item.level - 1) * 24;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginLeft: `${indentOffset}px`,
      }}
      className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-all mb-1.5 select-none ${
        isSelected
          ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs"
          : "bg-surface hover:bg-surface-subtle/70 border-border hover:border-border-strong shadow-2xs"
      } ${!item.enabled ? "opacity-60 bg-surface-subtle/30" : ""}`}
    >
      {/* Level guide line */}
      {item.level > 1 && (
        <div
          aria-hidden="true"
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-2.5 h-px bg-border group-hover:bg-primary/40"
        />
      )}

      {/* Left: Drag Handle, Level Badge, Icon, Label */}
      <div
        className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 cursor-pointer mr-2"
        onClick={() => onSelect(item)}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="p-1 text-text-muted hover:text-text-primary hover:bg-surface rounded cursor-grab active:cursor-grabbing shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Level badge */}
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${
            item.level === 1
              ? "bg-surface-subtle text-text-secondary border border-border"
              : item.level === 2
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-purple-500/10 text-purple-600 border border-purple-500/20"
          }`}
        >
          L{item.level}
        </span>

        {/* Destination Icon */}
        <div className="w-6 h-6 rounded flex items-center justify-center bg-surface-subtle shrink-0">
          {getDestinationIcon()}
        </div>

        {/* Item Label & Link stacked cleanly */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-text-primary truncate">
              {item.label}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-surface-subtle text-[10px] font-medium border border-border shrink-0">
              {getDestinationBadge()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-text-muted truncate mt-0.5">
            <span className="truncate max-w-[140px] sm:max-w-[240px]">
              {item.customUrl || item.destinationId || "#"}
            </span>
            {item.openInNewTab && (
              <ExternalLink className="w-2.5 h-2.5 text-text-muted shrink-0" />
            )}
          </div>
        </div>

        {/* Broken Link Warning */}
        {item.isBroken && (
          <div
            title={item.brokenReason || "Linked item does not exist"}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-status-danger-soft text-status-danger text-[10px] font-semibold shrink-0"
          >
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden md:inline">Broken</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Indent/Outdent, Visibility & Delete */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Device visibility pills - shown on wider screens */}
        <div className="hidden xl:flex items-center gap-0.5 px-1 py-0.5 rounded bg-surface-subtle/80 border border-border text-[10px] text-text-muted mr-1">
          <span title="Desktop">
            <Monitor
              className={`w-3 h-3 ${item.visibility.desktop ? "text-primary font-bold" : "text-border line-through"}`}
            />
          </span>
          <span title="Tablet">
            <Tablet
              className={`w-3 h-3 ${item.visibility.tablet ? "text-primary font-bold" : "text-border line-through"}`}
            />
          </span>
          <span title="Mobile">
            <Smartphone
              className={`w-3 h-3 ${item.visibility.mobile ? "text-primary font-bold" : "text-border line-through"}`}
            />
          </span>
        </div>

        {/* Indent / Outdent buttons with clear arrow glyphs */}
        <button
          type="button"
          disabled={!canOutdent}
          onClick={(e) => {
            e.stopPropagation();
            onOutdent(item.id);
          }}
          title="Outdent (Move to Parent Level)"
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-20 disabled:pointer-events-none"
        >
          <Outdent className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={!canIndent}
          onClick={(e) => {
            e.stopPropagation();
            onIndent(item.id);
          }}
          title="Indent (Make Child of Above Item)"
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-20 disabled:pointer-events-none"
        >
          <Indent className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Enabled */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleEnabled(item.id);
          }}
          title={item.enabled ? "Disable Item" : "Enable Item"}
          className={`p-1 rounded transition-colors ${
            item.enabled
              ? "text-primary hover:bg-primary/10"
              : "text-text-muted hover:bg-surface"
          }`}
        >
          {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Duplicate */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(item.id);
          }}
          title="Duplicate Item"
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          title="Delete Item"
          className="p-1 rounded text-text-muted hover:text-status-danger hover:bg-status-danger-soft transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Edit Arrow */}
        <button
          type="button"
          onClick={() => onSelect(item)}
          title="Configure Item"
          className="p-1 rounded text-text-muted hover:text-primary transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
