"use client";

import React, { useState } from "react";
import { listRegisteredComponents } from "@/builder/registry";
import { AnyComponentDefinition } from "@/builder/registry/types";
import { SectionNode, ThemeConfig } from "@/types/builder";
import { DesignSystemPanel } from "./design-system/DesignSystemPanel";
import { HeaderVariantsModal } from "./HeaderVariantsModal";
import { emeraldForestPreset } from "@/themes/presets";
import {
  Search,
  Layers,
  Component,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Menu,
  Square,
  LayoutGrid,
  MessageSquare,
  FileText,
  Palette,
  LayoutTemplate,
  ChevronRight,
} from "lucide-react";

export interface ComponentPaletteProps {
  sections: SectionNode[];
  selectedSectionId?: string | null;
  onSelectSection: (id: string) => void;
  onAddSection: (comp: AnyComponentDefinition) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  theme?: ThemeConfig;
  onUpdateTheme?: (updatedTheme: ThemeConfig) => void;
  onApplyHeaderVariant?: (variantId: string) => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  navigation: Menu,
  hero: Square,
  content: LayoutGrid,
  social: MessageSquare,
  forms: FileText,
  footer: Menu,
};

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onMoveUp,
  onMoveDown,
  onDelete,
  theme = emeraldForestPreset,
  onUpdateTheme = () => {},
  onApplyHeaderVariant,
}) => {
  const [activeTab, setActiveTab] = useState<"elements" | "templates" | "layers" | "design-system">("elements");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);

  const allComponents = listRegisteredComponents();
  
  // Deduplicate and filter canonical components for Elements tab (hide aliases from raw list)
  const canonicalComponents = allComponents.filter(
    (c) => c.id !== "header.classic.v1" && c.id !== "header.topbar.v1" && c.id !== "header.transparent.v1"
  );

  const filteredComponents = canonicalComponents.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const existingHeader = sections.find((s) => s.componentId.startsWith("header."));

  return (
    <aside className="w-80 bg-surface border-r border-border flex flex-col h-full min-h-0 shrink-0 z-20">
      {/* 4-Tab Switcher: Elements | Templates | Layers | Design */}
      <div className="flex items-center border-b border-border bg-surface-subtle p-1 gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("elements")}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-0.5 text-[10px] sm:text-[11px] font-semibold rounded-btn transition-colors ${
            activeTab === "elements"
              ? "bg-surface text-brand shadow-sm font-bold"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Basic Elements"
        >
          <Component className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Elements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-0.5 text-[10px] sm:text-[11px] font-semibold rounded-btn transition-colors ${
            activeTab === "templates"
              ? "bg-surface text-brand shadow-sm font-bold"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Ready-Made Section Templates"
        >
          <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Templates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("layers")}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-0.5 text-[10px] sm:text-[11px] font-semibold rounded-btn transition-colors ${
            activeTab === "layers"
              ? "bg-surface text-brand shadow-sm font-bold"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Page Layers"
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Layers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("design-system")}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-0.5 text-[10px] sm:text-[11px] font-semibold rounded-btn transition-colors ${
            activeTab === "design-system"
              ? "bg-surface text-brand shadow-sm font-bold"
              : "text-text-secondary hover:text-text-primary"
          }`}
          title="Design Tokens"
        >
          <Palette className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Design</span>
        </button>
      </div>

      {/* Tab 1: Elements */}
      {activeTab === "elements" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-border shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-btn bg-surface-subtle border border-border focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Element Cards List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
            {filteredComponents.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">
                No matching components found.
              </p>
            ) : (
              filteredComponents.map((comp) => {
                const Icon = categoryIcons[comp.category] || Component;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => {
                      if (comp.category === "navigation") {
                        setIsHeaderModalOpen(true);
                      } else {
                        onAddSection(comp);
                      }
                    }}
                    className="w-full text-left p-3 rounded-btn border border-border hover:border-brand/40 bg-surface hover:bg-surface-subtle transition-all group flex items-start gap-3 shadow-none hover:shadow-sm cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-text-primary group-hover:text-brand transition-colors truncate">
                          {comp.category === "navigation" ? "Header Navigation" : comp.name}
                        </span>
                        <Plus className="w-3.5 h-3.5 text-text-muted group-hover:text-brand shrink-0" />
                      </div>
                      <span className="text-[10px] text-text-muted block uppercase tracking-wider font-mono mt-0.5">
                        {comp.category === "navigation" ? "3 Ready-Made Variants" : comp.category}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Ready-Made Templates with Popup Variants */}
      {activeTab === "templates" && (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
          <div className="px-1 py-1 text-xs text-text-muted">
            <span className="font-semibold text-text-secondary">Ready-Made Section Templates</span>
            <p className="text-[11px] mt-0.5">Click any template category to open its variant preview popup.</p>
          </div>

          {/* 1. Header Templates (3 Variants) */}
          <div
            onClick={() => setIsHeaderModalOpen(true)}
            className="p-3.5 rounded-card border border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
                  <Menu className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                  Header Templates
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                3 Variants
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Classic Business, Top Bar + Header, and Modern Transparent / Hero Overlay designs.
            </p>
            <div className="mt-2.5 pt-2 border-t border-primary/15 flex items-center justify-between text-[11px] font-semibold text-primary">
              <span>View Variants & Live Previews</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 2. Hero Section Template */}
          <div
            onClick={() => {
              const hero = allComponents.find((c) => c.id === "hero.split.v1");
              if (hero) onAddSection(hero);
            }}
            className="p-3.5 rounded-card border border-border bg-surface hover:border-brand/40 hover:bg-surface-subtle transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                  <Square className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                  Hero Sections
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted">
                Split & Centered
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              High-converting hero blocks with headline, CTAs, trust badges and image.
            </p>
          </div>

          {/* 3. Services Grid Template */}
          <div
            onClick={() => {
              const s = allComponents.find((c) => c.id === "services.grid.v1");
              if (s) onAddSection(s);
            }}
            className="p-3.5 rounded-card border border-border bg-surface hover:border-brand/40 hover:bg-surface-subtle transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                  Services Grid
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted">
                3 Columns
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Multi-card feature and service grid with custom icons and bullet points.
            </p>
          </div>

          {/* 4. Testimonials Template */}
          <div
            onClick={() => {
              const t = allComponents.find((c) => c.id === "testimonials.cards.v1");
              if (t) onAddSection(t);
            }}
            className="p-3.5 rounded-card border border-border bg-surface hover:border-brand/40 hover:bg-surface-subtle transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                  Testimonials & Reviews
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted">
                5-Star Proof
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Verified client reviews with reviewer avatars, star rating and quotes.
            </p>
          </div>

          {/* 5. Contact Form Template */}
          <div
            onClick={() => {
              const f = allComponents.find((c) => c.id === "contact.form.v1");
              if (f) onAddSection(f);
            }}
            className="p-3.5 rounded-card border border-border bg-surface hover:border-brand/40 hover:bg-surface-subtle transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                  Contact & Quote Request
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted">
                Form Block
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Interactive lead capture form with instant submission & notification.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Layers */}
      {activeTab === "layers" && (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5">
          {sections.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <Layers className="w-8 h-8 text-text-muted mx-auto stroke-1" />
              <p className="text-xs text-text-muted">No sections on page yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab("templates")}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Choose a ready-made template
              </button>
            </div>
          ) : (
            sections.map((section, index) => {
              const comp = allComponents.find((c) => c.id === section.componentId);
              const isSelected = selectedSectionId === section.id;
              const Icon = comp ? categoryIcons[comp.category] || Component : Component;

              return (
                <div
                  key={section.id}
                  onClick={() => onSelectSection(section.id)}
                  className={`flex items-center justify-between p-2 rounded-btn border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? "bg-brand-soft border-brand/40 text-brand font-semibold"
                      : "bg-surface border-border hover:bg-surface-subtle text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                    <span className="truncate">{comp?.name || section.componentId}</span>
                  </div>

                  <div
                    className="flex items-center gap-0.5 shrink-0 ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => onMoveUp(section.id)}
                        className="p-1 hover:bg-surface-subtle rounded text-text-muted hover:text-text-primary"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    )}
                    {index < sections.length - 1 && (
                      <button
                        type="button"
                        onClick={() => onMoveDown(section.id)}
                        className="p-1 hover:bg-surface-subtle rounded text-text-muted hover:text-text-primary"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(section.id)}
                      className="p-1 hover:bg-status-danger/10 rounded text-text-muted hover:text-status-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: Design System */}
      {activeTab === "design-system" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <DesignSystemPanel theme={theme} onChange={onUpdateTheme} />
        </div>
      )}

      {/* Header Variants Popup Modal */}
      <HeaderVariantsModal
        isOpen={isHeaderModalOpen}
        onClose={() => setIsHeaderModalOpen(false)}
        activeComponentId={existingHeader?.componentId || "header.simple.v1"}
        hasExistingHeader={Boolean(existingHeader)}
        onApplyVariant={(def) => {
          if (onApplyHeaderVariant) {
            onApplyHeaderVariant(def.id);
          } else {
            onAddSection(def);
          }
        }}
      />
    </aside>
  );
};
