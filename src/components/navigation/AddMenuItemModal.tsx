"use client";

import React, { useState, useMemo } from "react";
import { NavigationItem, NavItemDestinationType } from "@/types/navigation";
import { CMSPageItem } from "@/types/cms";
import { BlogPost, BlogCategory } from "@/types/blog";
import {
  X,
  Plus,
  FileText,
  Bookmark,
  FolderTree,
  Globe,
  Hash,
  ChevronRight,
  Search,
} from "lucide-react";

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: CMSPageItem[];
  posts: BlogPost[];
  categories: BlogCategory[];
  parentCandidates: NavigationItem[];
  onAdd: (
    item: Partial<NavigationItem> & { label: string; destinationType: NavItemDestinationType },
    parentId?: string | null
  ) => void;
  onAddMultiple?: (pageIds: string[], parentId?: string | null) => void;
}

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  isOpen,
  onClose,
  pages,
  posts,
  categories,
  parentCandidates,
  onAdd,
  onAddMultiple,
}) => {
  const [activeTab, setActiveTab] = useState<NavItemDestinationType>("page");
  const [label, setLabel] = useState("");

  // Existing Page multi-select and search
  const [pageSearch, setPageSearch] = useState("");
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>(
    pages[0] ? [pages[0].id] : []
  );

  const [selectedPostId, setSelectedPostId] = useState(posts[0]?.id || "");
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || "");
  const [customUrl, setCustomUrl] = useState("");
  const [sectionAnchor, setSectionAnchor] = useState("services");
  const [parentId, setParentId] = useState<string>("");
  const [openInNewTab, setOpenInNewTab] = useState(false);

  // Filtered pages for table
  const filteredPages = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.navLabel || "").toLowerCase().includes(q)
    );
  }, [pages, pageSearch]);

  if (!isOpen) return null;

  const togglePageSelection = (id: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPages = () => {
    if (selectedPageIds.length === filteredPages.length) {
      setSelectedPageIds([]);
    } else {
      setSelectedPageIds(filteredPages.map((p) => p.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "page") {
      if (selectedPageIds.length === 0) return;

      if (selectedPageIds.length === 1) {
        const page = pages.find((p) => p.id === selectedPageIds[0]);
        if (page) {
          const custom = Boolean(label.trim());
          const finalLabel = label.trim() || page.navLabel || page.title;
          onAdd(
            {
              label: finalLabel,
              destinationType: "page",
              destinationId: page.id,
              customUrl: page.slug,
              openInNewTab,
              visibility: { desktop: true, tablet: true, mobile: true },
              enabled: true,
              isCustomLabel: custom,
            },
            parentId || null
          );
        }
      } else {
        // Multiple pages selected
        if (onAddMultiple) {
          onAddMultiple(selectedPageIds, parentId || null);
        } else {
          selectedPageIds.forEach((pid) => {
            const page = pages.find((p) => p.id === pid);
            if (page) {
              onAdd(
                {
                  label: page.navLabel || page.title,
                  destinationType: "page",
                  destinationId: page.id,
                  customUrl: page.slug,
                  openInNewTab,
                  visibility: { desktop: true, tablet: true, mobile: true },
                  enabled: true,
                  isCustomLabel: false,
                },
                parentId || null
              );
            }
          });
        }
      }

      onClose();
      return;
    }

    let finalLabel = label.trim();
    let destId: string | undefined;
    let url = "/";

    if (activeTab === "blog_listing") {
      if (!finalLabel) finalLabel = "Blog";
      url = "/blog";
    } else if (activeTab === "blog_post") {
      const post = posts.find((p) => p.id === selectedPostId);
      if (post) {
        if (!finalLabel) finalLabel = post.title;
        destId = post.id;
        url = `/blog/${post.slug}`;
      }
    } else if (activeTab === "blog_category") {
      const cat = categories.find((c) => c.id === selectedCatId);
      if (cat) {
        if (!finalLabel) finalLabel = cat.name;
        destId = cat.id;
        url = `/blog/category/${cat.slug}`;
      }
    } else if (activeTab === "section_anchor") {
      if (!finalLabel) finalLabel = sectionAnchor.replace(/^#/, "");
      destId = `#${sectionAnchor.replace(/^#/, "")}`;
      url = `#${sectionAnchor.replace(/^#/, "")}`;
    } else if (activeTab === "dropdown_parent") {
      if (!finalLabel) finalLabel = "Dropdown";
      url = "#";
    } else if (activeTab === "clickable_parent" || activeTab === "custom_url") {
      if (!finalLabel) finalLabel = "Link";
      url = customUrl || "/";
    }

    onAdd(
      {
        label: finalLabel,
        destinationType: activeTab,
        destinationId: destId,
        customUrl: url,
        openInNewTab,
        visibility: { desktop: true, tablet: true, mobile: true },
        enabled: true,
      },
      parentId || null
    );

    // Reset and close
    setLabel("");
    setCustomUrl("");
    setParentId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-subtle/50">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold text-text-primary">Add Navigation Menu Item</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Type Pills */}
        <div className="grid grid-cols-4 gap-1 p-3 border-b border-border bg-surface-subtle/20 text-[11px]">
          {[
            { id: "page", label: "Existing Page", icon: FileText },
            { id: "blog_listing", label: "Blog Index", icon: Bookmark },
            { id: "blog_post", label: "Blog Post", icon: Bookmark },
            { id: "blog_category", label: "Category", icon: FolderTree },
            { id: "section_anchor", label: "Anchor", icon: Hash },
            { id: "custom_url", label: "Custom URL", icon: Globe },
            { id: "dropdown_parent", label: "Folder", icon: ChevronRight },
            { id: "clickable_parent", label: "Menu + Link", icon: ChevronRight },
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = activeTab === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setActiveTab(type.id as NavItemDestinationType)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md font-medium transition-colors ${
                  isSelected
                    ? "bg-brand text-white shadow-xs"
                    : "text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Active Tab: Existing Page(s) */}
          {activeTab === "page" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-text-primary">
                  Select Existing Page(s) to Add
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllPages}
                  className="text-[11px] font-semibold text-brand hover:underline"
                >
                  {selectedPageIds.length === filteredPages.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search pages by title or slug..."
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Scrollable multi-select list */}
              <div className="max-h-44 overflow-y-auto border border-border rounded-btn divide-y divide-border bg-surface">
                {filteredPages.length === 0 ? (
                  <div className="p-4 text-center text-text-muted text-[11px]">
                    No pages matched your search query.
                  </div>
                ) : (
                  filteredPages.map((page) => {
                    const isChecked = selectedPageIds.includes(page.id);
                    return (
                      <div
                        key={page.id}
                        onClick={() => togglePageSelection(page.id)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? "bg-brand/5" : "hover:bg-surface-subtle"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Controlled via row click
                            className="rounded border-border text-brand focus:ring-brand cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-text-primary block truncate">
                              {page.title}
                            </span>
                            <span className="text-[10px] font-mono text-text-muted">
                              {page.slug}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {page.isHome && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-brand/10 text-brand font-bold uppercase">
                              Home
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              page.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {page.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Single page label override */}
              {selectedPageIds.length === 1 && (
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Custom Navigation Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Leave empty to use page title"
                    className="w-full px-3 py-2 rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand text-xs"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Other destinations */
            <>
              {/* Label */}
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Navigation Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Services, Contact, Blog"
                  className="w-full px-3 py-2 rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand text-xs"
                />
              </div>

              {activeTab === "blog_post" && (
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Choose Blog Post *
                  </label>
                  <select
                    value={selectedPostId}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                    className="w-full px-3 py-2 rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand text-xs"
                  >
                    {posts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (/blog/{p.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === "blog_category" && (
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Choose Blog Category *
                  </label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (/blog/category/{c.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === "section_anchor" && (
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Section Anchor (#) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">#</span>
                    <input
                      type="text"
                      value={sectionAnchor}
                      onChange={(e) => setSectionAnchor(e.target.value)}
                      placeholder="services"
                      className="w-full pl-7 pr-3 py-2 rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand text-xs"
                    />
                  </div>
                </div>
              )}

              {(activeTab === "custom_url" || activeTab === "clickable_parent") && (
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    URL Destination *
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com or /pricing"
                    className="w-full px-3 py-2 rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand text-xs"
                  />
                </div>
              )}
            </>
          )}

          {/* Nest Under Parent Item (Level 1 or 2) */}
          {parentCandidates.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Nest Under Parent Menu Item (Dropdown / Submenu)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 rounded-btn border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand text-xs"
              >
                <option value="">-- Top-Level (Level 1 Main Navigation) --</option>
                {parentCandidates
                  .filter((p) => p.level < 3)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.level === 2 ? "└─ " : ""}{p.label} (Level {p.level})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Open in New Tab checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="w-4 h-4 rounded text-brand focus:ring-brand border-border cursor-pointer"
            />
            <span className="text-[11px] text-text-secondary">Open link in a new browser tab</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-btn border border-border text-text-secondary hover:bg-surface-subtle transition-colors text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={activeTab === "page" && selectedPageIds.length === 0}
              className="px-4 py-2 rounded-btn bg-brand text-white hover:bg-brand-hover shadow-xs transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {activeTab === "page" && selectedPageIds.length > 1
                ? `Add ${selectedPageIds.length} Pages to Menu`
                : "Add to Menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
