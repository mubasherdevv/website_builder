"use client";

import React, { useState } from "react";
import { SectionNode, SectionStyle } from "@/types/builder";
import { getComponentDefinition } from "@/builder/registry";
import { IconPickerControl } from "./IconPickerControl";
import {
  Sliders,
  Palette,
  X,
  Info,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  Compass,
  ExternalLink,
} from "lucide-react";
import { NavigationManagerService } from "@/lib/services/navigation-manager.service";
import { PagesManagerService } from "@/lib/services/pages-manager.service";
import { toast } from "@/components/ui/Toast";

export interface PropertiesPanelProps {
  section: SectionNode | null;
  onClose: () => void;
  onUpdateProps: (sectionId: string, newProps: Record<string, unknown>) => void;
  onUpdateStyle: (sectionId: string, newStyle: Partial<SectionStyle>) => void;
  onSwitchComponent?: (sectionId: string, newComponentId: string) => void;
  onMoveUp?: (sectionId: string) => void;
  onMoveDown?: (sectionId: string) => void;
  onDuplicate?: (sectionId: string) => void;
  onDelete?: (sectionId: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  section,
  onClose,
  onUpdateProps,
  onUpdateStyle,
  onSwitchComponent,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");
  const [copiedId, setCopiedId] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, number | null>>({});

  if (!section) {
    return (
      <aside className="w-84 bg-surface border-l border-border flex flex-col items-center justify-center p-6 text-center text-text-muted h-[calc(100vh-4rem)] shrink-0 z-20">
        <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border flex items-center justify-center mb-3 text-text-muted">
          <Info className="w-5 h-5 stroke-1" />
        </div>
        <h4 className="text-xs font-semibold text-text-primary">No Section Selected</h4>
        <p className="text-[11px] mt-1.5 max-w-xs text-text-secondary leading-relaxed">
          Click any section on the canvas to configure its content, layout variants, icons, and styling.
        </p>
      </aside>
    );
  }

  const def = getComponentDefinition(section.componentId);
  const controls = def?.editor.controls || [];
  const currentProps: Record<string, unknown> = {
    ...(def?.defaults || {}),
    ...(section.props || {}),
  };
  const currentStyle = (section.style || {}) as SectionStyle;

  const handlePropChange = (propName: string, value: unknown) => {
    onUpdateProps(section.id, { [propName]: value });
  };

  const handleStyleChange = (key: keyof SectionStyle, value: unknown) => {
    onUpdateStyle(section.id, { [key]: value });
  };

  const handleCopyId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(section.id);
      setCopiedId(true);
      toast.info(`Section ID "${section.id}" copied to clipboard.`);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetDefaults = () => {
    if (def?.defaults) {
      onUpdateProps(section.id, structuredClone(def.defaults));
      onUpdateStyle(section.id, {
        background: "surface",
        paddingY: "normal",
        alignment: "left",
        customClassName: "",
      });
    }
  };

  // Helper for List/Array item operations
  const handleUpdateListItem = (propName: string, index: number, key: string, val: unknown) => {
    const list = Array.isArray(currentProps[propName])
      ? [...(currentProps[propName] as Record<string, unknown>[])]
      : [];
    if (list[index]) {
      list[index] = { ...list[index], [key]: val };
      handlePropChange(propName, list);
    }
  };

  const handleAddListItem = (propName: string) => {
    const list = Array.isArray(currentProps[propName])
      ? [...(currentProps[propName] as Record<string, unknown>[])]
      : [];
    
    // Create smart placeholder based on property name
    let newItem: Record<string, unknown> = {
      title: `New Item ${list.length + 1}`,
      description: "Description of the new item.",
      icon: "shield",
    };

    if (propName === "stats") {
      newItem = { label: "Metric Name", value: "100+" };
    } else if (propName === "highlights") {
      (list as unknown as string[]).push("New verified company guarantee");
      handlePropChange(propName, list);
      return;
    } else if (propName === "images") {
      newItem = {
        title: `Project #${list.length + 1}`,
        category: "Showcase",
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      };
    } else if (propName === "testimonials") {
      newItem = {
        quote: "Outstanding quality and responsive customer service.",
        authorName: "Alex Morgan",
        authorRole: "Verified Customer",
        rating: 5,
      };
    }

    list.push(newItem);
    handlePropChange(propName, list);
    setExpandedItems((prev) => ({ ...prev, [propName]: list.length - 1 }));
  };

  const handleDeleteListItem = (propName: string, index: number) => {
    const list = Array.isArray(currentProps[propName])
      ? [...(currentProps[propName] as Record<string, unknown>[])]
      : [];
    list.splice(index, 1);
    handlePropChange(propName, list);
  };

  const toggleAccordion = (propName: string, index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [propName]: prev[propName] === index ? null : index,
    }));
  };

  return (
    <aside className="w-88 bg-surface border-l border-border flex flex-col h-full min-h-0 shrink-0 z-20 overflow-hidden shadow-xs">
      {/* Header with Quick Actions */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-surface-subtle shrink-0">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-xs font-bold text-text-primary truncate">
            {def?.name || section.componentId}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              type="button"
              onClick={handleCopyId}
              title="Click to copy section ID"
              className="text-[10px] text-text-muted font-mono hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <span className="truncate max-w-[110px]">{section.id}</span>
              {copiedId ? (
                <Check className="w-2.5 h-2.5 text-status-success shrink-0" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-text-muted hover:text-text-primary shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onMoveUp && (
            <button
              type="button"
              onClick={() => onMoveUp(section.id)}
              title="Move Section Up"
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              onClick={() => onMoveDown(section.id)}
              title="Move Section Down"
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(section.id)}
              title="Duplicate Section"
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(section.id)}
              title="Delete Section"
              className="p-1 rounded text-text-muted hover:text-status-danger hover:bg-status-danger-soft/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="w-px h-3.5 bg-border mx-0.5" />

          <button
            type="button"
            onClick={onClose}
            title="Close Panel"
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border bg-surface px-3 py-1.5 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-semibold rounded-btn transition-colors ${
            activeTab === "content"
              ? "bg-brand-soft text-brand shadow-2xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Content & Items</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-semibold rounded-btn transition-colors ${
            activeTab === "style"
              ? "bg-brand-soft text-brand shadow-2xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Layout & Style</span>
        </button>
      </div>

      {/* Form Fields Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
        {activeTab === "content" ? (
          <>
            {section.componentId.startsWith("header.") && (
              <div className="space-y-3">
                {/* 1. Compact Header Variant Switcher */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-subtle">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Active Header Style
                    </span>
                    <h4 className="text-xs font-bold text-text-primary">
                      {section.componentId === "header.topbar.v1"
                        ? "Top Bar + Main Header"
                        : section.componentId === "header.transparent.v1"
                        ? "Modern Transparent / Hero Header"
                        : "Classic Business Header"}
                    </h4>
                  </div>
                  {onSwitchComponent && (
                    <select
                      value={section.componentId}
                      onChange={(e) => onSwitchComponent(section.id, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
                    >
                      <option value="header.simple.v1">Classic Business</option>
                      <option value="header.topbar.v1">Top Bar + Header</option>
                      <option value="header.transparent.v1">Modern Transparent</option>
                    </select>
                  )}
                </div>

                {/* 2. Navigation Menu Selector */}
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Compass className="w-4 h-4" />
                      <span>Navigation Menu</span>
                    </div>
                    {typeof window !== "undefined" && (
                      <a
                        href={(() => {
                          const match = window.location.pathname.match(/\/websites\/([^/]+)/);
                          return match ? `/websites/${match[1]}/navigation` : "#";
                        })()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Manager</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">
                      Select Active Menu
                    </label>
                    <select
                      value={typeof currentProps.menuId === "string" ? currentProps.menuId : ""}
                      onChange={(e) => handlePropChange("menuId", e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Default (Main Header Menu)</option>
                      {typeof window !== "undefined" && (() => {
                        const match = window.location.pathname.match(/\/websites\/([^/]+)/);
                        const websiteId = match ? match[1] : "default";
                        const siteMenus = NavigationManagerService.getMenus(websiteId);
                        return siteMenus.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.location})
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  {/* Sync Global Header across all pages */}
                  <div className="pt-2 border-t border-primary/10 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">Global Website Header</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          const match = window.location.pathname.match(/\/websites\/([^/]+)/);
                          const websiteId = match ? match[1] : "default";
                          PagesManagerService.syncGlobalHeader(websiteId, section);
                          toast.success("Header updated and synchronized across all website pages!");
                        }
                      }}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Sync All Pages
                    </button>
                  </div>
                </div>
              </div>
            )}

            {controls.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">
              No configurable properties for this section.
            </p>
          ) : (
            controls.map((control) => {
              const val = currentProps[control.propName];

              // 1. Switch / Boolean Toggle (e.g. showIcons, showEyebrowIcon, showBadgeIcon)
              if (control.type === "switch" || typeof val === "boolean") {
                const isChecked = Boolean(val);
                return (
                  <div
                    key={control.propName}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-subtle/50"
                  >
                    <div className="space-y-0.5">
                      <label className="text-xs font-semibold text-text-primary block cursor-pointer">
                        {control.label}
                      </label>
                      <span className="text-[10px] text-text-muted block">
                        {isChecked ? "Visible on section" : "Hidden from section"}
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      onClick={() => handlePropChange(control.propName, !isChecked)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isChecked ? "bg-brand" : "bg-border"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isChecked ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              }

              // 2. Textarea
              if (control.type === "textarea") {
                return (
                  <div key={control.propName} className="space-y-1">
                    <label className="block text-[11px] font-semibold text-text-primary">
                      {control.label}
                    </label>
                    <textarea
                      rows={3}
                      value={typeof val === "string" ? val : ""}
                      onChange={(e) => handlePropChange(control.propName, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand resize-none"
                    />
                  </div>
                );
              }

              // 3. Color Picker Input
              if (control.type === "color") {
                const colorVal = typeof val === "string" ? val : "#063B2E";
                return (
                  <div key={control.propName} className="space-y-1">
                    <label className="block text-[11px] font-semibold text-text-primary">
                      {control.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorVal.startsWith("#") ? colorVal : "#063B2E"}
                        onChange={(e) => handlePropChange(control.propName, e.target.value)}
                        className="w-8 h-8 rounded-lg border border-border p-0.5 cursor-pointer bg-surface shrink-0"
                      />
                      <input
                        type="text"
                        value={colorVal}
                        onChange={(e) => handlePropChange(control.propName, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                );
              }

              // 4. Select Dropdown (Layout Variants, Columns, Alignment)
              if (control.type === "select" && control.options) {
                return (
                  <div key={control.propName} className="space-y-1">
                    <label className="block text-[11px] font-semibold text-text-primary">
                      {control.label}
                    </label>
                    <select
                      value={typeof val === "string" ? val : ""}
                      onChange={(e) => handlePropChange(control.propName, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                    >
                      {control.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              // 4. Repeater / Dynamic List Item Editor (Services, Features, Highlights, Stats, Gallery, Reviews)
              if (control.type === "list" || Array.isArray(val)) {
                const list = Array.isArray(val) ? (val as Record<string, unknown>[]) : [];
                const activeIndex = expandedItems[control.propName] ?? 0;

                return (
                  <div key={control.propName} className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                        {control.label} ({list.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddListItem(control.propName)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {list.map((item, idx) => {
                        const isExpanded = activeIndex === idx;
                        const isStringItem = typeof item === "string";

                        return (
                          <div
                            key={idx}
                            className="border border-border rounded-lg bg-surface-subtle overflow-hidden text-xs"
                          >
                            <div
                              onClick={() => toggleAccordion(control.propName, idx)}
                              className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-border/30 transition-colors select-none"
                            >
                              <span className="font-semibold text-text-primary truncate max-w-[180px]">
                                {isStringItem
                                  ? (item as string)
                                  : (item.authorName as string) || (item.title as string) || (item.label as string) || `Item #${idx + 1}`}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteListItem(control.propName, idx);
                                  }}
                                  title="Delete Item"
                                  className="p-1 rounded text-text-muted hover:text-status-danger"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-3 border-t border-border bg-surface space-y-2.5">
                                {isStringItem ? (
                                  <input
                                    type="text"
                                    value={item as string}
                                    onChange={(e) => {
                                      const updatedList = [...list];
                                      (updatedList as unknown as string[])[idx] = e.target.value;
                                      handlePropChange(control.propName, updatedList);
                                    }}
                                    className="w-full px-2.5 py-1 text-xs rounded border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                                  />
                                ) : (
                                  <>
                                    {"title" in item && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-text-secondary">
                                          Title
                                        </label>
                                        <input
                                          type="text"
                                          value={(item.title as string) || ""}
                                          onChange={(e) =>
                                            handleUpdateListItem(control.propName, idx, "title", e.target.value)
                                          }
                                          className="w-full px-2.5 py-1 text-xs rounded border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                                        />
                                      </div>
                                    )}

                                    {"description" in item && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-text-secondary">
                                          Description
                                        </label>
                                        <textarea
                                          rows={2}
                                          value={(item.description as string) || ""}
                                          onChange={(e) =>
                                            handleUpdateListItem(control.propName, idx, "description", e.target.value)
                                          }
                                          className="w-full px-2.5 py-1 text-xs rounded border border-border bg-surface-subtle focus:outline-none focus:border-brand resize-none"
                                        />
                                      </div>
                                    )}

                                    {"icon" in item && (
                                      <IconPickerControl
                                        label="Card Icon"
                                        value={(item.icon as string) || "wrench"}
                                        onChange={(newIcon) =>
                                          handleUpdateListItem(control.propName, idx, "icon", newIcon)
                                        }
                                      />
                                    )}

                                    {"value" in item && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-medium text-text-secondary">
                                            Value
                                          </label>
                                          <input
                                            type="text"
                                            value={(item.value as string) || ""}
                                            onChange={(e) =>
                                              handleUpdateListItem(control.propName, idx, "value", e.target.value)
                                            }
                                            className="w-full px-2 py-1 text-xs rounded border border-border bg-surface-subtle"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-medium text-text-secondary">
                                            Label
                                          </label>
                                          <input
                                            type="text"
                                            value={(item.label as string) || ""}
                                            onChange={(e) =>
                                              handleUpdateListItem(control.propName, idx, "label", e.target.value)
                                            }
                                            className="w-full px-2 py-1 text-xs rounded border border-border bg-surface-subtle"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {"imageUrl" in item && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-text-secondary">
                                          Photo URL
                                        </label>
                                        <input
                                          type="text"
                                          value={(item.imageUrl as string) || ""}
                                          onChange={(e) =>
                                            handleUpdateListItem(control.propName, idx, "imageUrl", e.target.value)
                                          }
                                          className="w-full px-2.5 py-1 text-xs rounded border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                                        />
                                      </div>
                                    )}

                                    {"quote" in item && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-text-secondary">
                                          Customer Quote / Review
                                        </label>
                                        <textarea
                                          rows={3}
                                          value={(item.quote as string) || ""}
                                          onChange={(e) =>
                                            handleUpdateListItem(control.propName, idx, "quote", e.target.value)
                                          }
                                          className="w-full px-2.5 py-1 text-xs rounded border border-border bg-surface-subtle focus:outline-none focus:border-brand resize-none"
                                        />
                                      </div>
                                    )}

                                    {"authorName" in item && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-medium text-text-secondary">
                                            Author Name
                                          </label>
                                          <input
                                            type="text"
                                            value={(item.authorName as string) || ""}
                                            onChange={(e) =>
                                              handleUpdateListItem(control.propName, idx, "authorName", e.target.value)
                                            }
                                            className="w-full px-2 py-1 text-xs rounded border border-border bg-surface-subtle"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-medium text-text-secondary">
                                            Role / Location
                                          </label>
                                          <input
                                            type="text"
                                            value={(item.authorRole as string) || ""}
                                            onChange={(e) =>
                                              handleUpdateListItem(control.propName, idx, "authorRole", e.target.value)
                                            }
                                            className="w-full px-2 py-1 text-xs rounded border border-border bg-surface-subtle"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {"rating" in item && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-text-secondary">
                                          Star Rating
                                        </label>
                                        <select
                                          value={Number(item.rating) || 5}
                                          onChange={(e) =>
                                            handleUpdateListItem(control.propName, idx, "rating", Number(e.target.value))
                                          }
                                          className="w-full px-2.5 py-1 text-xs rounded border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                                        >
                                          <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                                          <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                                          <option value={3}>⭐⭐⭐ 3 Stars</option>
                                          <option value={2}>⭐⭐ 2 Stars</option>
                                          <option value={1}>⭐ 1 Star</option>
                                        </select>
                                      </div>
                                    )}

                                    {"avatarUrl" in item && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-text-secondary">
                                          Avatar Photo URL (Optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={(item.avatarUrl as string) || ""}
                                          onChange={(e) =>
                                            handleUpdateListItem(control.propName, idx, "avatarUrl", e.target.value)
                                          }
                                          placeholder="https://images.unsplash.com/photo-..."
                                          className="w-full px-2.5 py-1 text-xs rounded border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // 5. Default Standard Text Input (Headings, Subheadings, URLs, Labels)
              return (
                <div key={control.propName} className="space-y-1">
                  <label className="block text-[11px] font-semibold text-text-primary">
                    {control.label}
                  </label>
                  <input
                    type="text"
                    value={typeof val === "string" ? val : ""}
                    onChange={(e) => handlePropChange(control.propName, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                </div>
              );
            })
          )}
        </>
      ) : (
          /* Style & Layout Tab */
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-text-primary">
                Background Theme
              </label>
              <select
                value={currentStyle.background || "surface"}
                onChange={(e) => handleStyleChange("background", e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
              >
                <option value="surface">Default Surface (Clean White)</option>
                <option value="muted">Subtle Surface (Soft Gray / Light Tint)</option>
                <option value="brand">Brand Accent (Filled Brand Color)</option>
                <option value="transparent">Transparent Background</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-text-primary">
                Vertical Spacing (Padding Y)
              </label>
              <select
                value={currentStyle.paddingY || "normal"}
                onChange={(e) => handleStyleChange("paddingY", e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
              >
                <option value="none">None (0px padding)</option>
                <option value="compact">Compact (24px - 40px)</option>
                <option value="normal">Standard (48px - 64px)</option>
                <option value="spacious">Spacious (80px - 112px)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-text-primary">
                Text Alignment
              </label>
              <select
                value={currentStyle.alignment || "left"}
                onChange={(e) => handleStyleChange("alignment", e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
              >
                <option value="left">Left Aligned</option>
                <option value="center">Centered</option>
                <option value="right">Right Aligned</option>
              </select>
            </div>

            <div className="space-y-1 pt-2 border-t border-border">
              <label className="block text-[11px] font-semibold text-text-primary">
                Custom CSS Classes
              </label>
              <input
                type="text"
                placeholder="e.g. border-b border-border shadow-md"
                value={currentStyle.customClassName || ""}
                onChange={(e) => handleStyleChange("customClassName", e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {["shadow-sm", "border-b", "border-t", "backdrop-blur-sm"].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      const current = currentStyle.customClassName || "";
                      if (!current.includes(cls)) {
                        handleStyleChange("customClassName", `${current} ${cls}`.trim());
                      }
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-text-muted hover:text-text-primary"
                  >
                    +{cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Defaults button */}
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle hover:bg-border/40 rounded-btn transition-colors border border-border"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Section to Defaults</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
