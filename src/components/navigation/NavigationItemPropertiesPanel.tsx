"use client";

import React from "react";
import { NavigationItem, NavItemDestinationType } from "@/types/navigation";
import { CMSPageItem } from "@/types/cms";
import { BlogPost, BlogCategory } from "@/types/blog";
import {
  X,
  AlertTriangle,
  Trash2,
  Copy,
  ChevronRight,
} from "lucide-react";

interface NavigationItemPropertiesPanelProps {
  item: NavigationItem | null;
  pages: CMSPageItem[];
  posts: BlogPost[];
  categories: BlogCategory[];
  onUpdate: (updated: NavigationItem) => void;
  onDelete: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
  onClose: () => void;
}

export const NavigationItemPropertiesPanel: React.FC<NavigationItemPropertiesPanelProps> = ({
  item,
  pages,
  posts,
  categories,
  onUpdate,
  onDelete,
  onDuplicate,
  onClose,
}) => {
  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-text-muted">
        <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border flex items-center justify-center mb-3">
          <ChevronRight className="w-5 h-5 text-text-muted" />
        </div>
        <p className="text-xs font-semibold text-text-primary">No Item Selected</p>
        <p className="text-[11px] text-text-secondary mt-1 max-w-[200px]">
          Select any navigation item from the center hierarchy to configure its link, icons, and visibility.
        </p>
      </div>
    );
  }

  const handleDestinationTypeChange = (newType: NavItemDestinationType) => {
    let newDestinationId = "";
    let newCustomUrl = "";

    if (newType === "page" && pages.length > 0) {
      newDestinationId = pages[0].id;
      newCustomUrl = pages[0].slug;
    } else if (newType === "blog_listing") {
      newCustomUrl = "/blog";
    } else if (newType === "blog_post" && posts.length > 0) {
      newDestinationId = posts[0].id;
      newCustomUrl = `/blog/${posts[0].slug}`;
    } else if (newType === "blog_category" && categories.length > 0) {
      newDestinationId = categories[0].id;
      newCustomUrl = `/blog/category/${categories[0].slug}`;
    } else if (newType === "section_anchor") {
      newCustomUrl = "#services";
    } else if (newType === "dropdown_parent") {
      newCustomUrl = "#";
    }

    onUpdate({
      ...item,
      destinationType: newType,
      destinationId: newDestinationId,
      customUrl: newCustomUrl,
      isBroken: false,
    });
  };

  const handlePageSelect = (pageId: string) => {
    const selectedPage = pages.find((p) => p.id === pageId);
    if (!selectedPage) return;
    onUpdate({
      ...item,
      destinationId: selectedPage.id,
      customUrl: selectedPage.slug,
      isBroken: false,
    });
  };

  const handlePostSelect = (postId: string) => {
    const selectedPost = posts.find((p) => p.id === postId);
    if (!selectedPost) return;
    onUpdate({
      ...item,
      destinationId: selectedPost.id,
      customUrl: `/blog/${selectedPost.slug}`,
      isBroken: false,
    });
  };

  const handleCategorySelect = (catId: string) => {
    const selectedCat = categories.find((c) => c.id === catId);
    if (!selectedCat) return;
    onUpdate({
      ...item,
      destinationId: selectedCat.id,
      customUrl: `/blog/category/${selectedCat.slug}`,
      isBroken: false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-border bg-surface-subtle/50 shrink-0">
        <div>
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Menu Item Settings
          </h3>
          <p className="text-[11px] text-text-muted">Hierarchy Level {item.level}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(item.id)}
            title="Duplicate"
            className="p-1 text-text-muted hover:text-text-primary hover:bg-surface rounded"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            title="Delete"
            className="p-1 text-text-muted hover:text-status-danger hover:bg-status-danger-soft rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary hover:bg-surface rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning banner for broken links */}
      {item.isBroken && (
        <div className="m-3 p-3 rounded-lg bg-status-danger-soft/60 border border-status-danger/30 text-status-danger flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <p className="font-semibold">Broken Destination Warning</p>
            <p className="text-status-danger/80 mt-0.5">
              {item.brokenReason || "The destination for this item is missing or deleted."}
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="p-3.5 space-y-4 text-xs">
        {/* Navigation Label */}
        <div>
          <label className="block text-[11px] font-semibold text-text-secondary mb-1">
            Navigation Label *
          </label>
          <input
            type="text"
            value={item.label}
            onChange={(e) => onUpdate({ ...item, label: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            placeholder="e.g. Home, Services, Contact"
          />
        </div>

        {/* Destination Type */}
        <div>
          <label className="block text-[11px] font-semibold text-text-secondary mb-1">
            Destination Type
          </label>
          <select
            value={item.destinationType}
            onChange={(e) => handleDestinationTypeChange(e.target.value as NavItemDestinationType)}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          >
            <option value="page">Website Page (from Pages Module)</option>
            <option value="blog_listing">Blog Listing (/blog)</option>
            <option value="blog_post">Single Blog Post</option>
            <option value="blog_category">Blog Category Archive</option>
            <option value="section_anchor">Section Anchor (#section)</option>
            <option value="custom_url">Custom Internal / External URL</option>
            <option value="dropdown_parent">Dropdown Parent (Non-clickable)</option>
            <option value="clickable_parent">Clickable Parent with Submenu</option>
          </select>
        </div>

        {/* Dynamic Destination Selector */}
        {item.destinationType === "page" && (
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Select Website Page
            </label>
            <select
              value={item.destinationId || ""}
              onChange={(e) => handlePageSelect(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            >
              <option value="">-- Choose a page --</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.slug}) [{p.status}]
                </option>
              ))}
            </select>
          </div>
        )}

        {item.destinationType === "blog_post" && (
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Select Blog Post
            </label>
            <select
              value={item.destinationId || ""}
              onChange={(e) => handlePostSelect(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            >
              <option value="">-- Choose an article --</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (/blog/{p.slug})
                </option>
              ))}
            </select>
          </div>
        )}

        {item.destinationType === "blog_category" && (
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Select Category
            </label>
            <select
              value={item.destinationId || ""}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            >
              <option value="">-- Choose a category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (/blog/category/{c.slug})
                </option>
              ))}
            </select>
          </div>
        )}

        {(item.destinationType === "custom_url" ||
          item.destinationType === "clickable_parent") && (
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Target URL
              </label>
              <input
                type="text"
                value={item.customUrl || ""}
                onChange={(e) => onUpdate({ ...item, customUrl: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                placeholder="https://example.com or /pricing"
              />
            </div>
          )}

        {item.destinationType === "section_anchor" && (
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Section Anchor ID
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">#</span>
              <input
                type="text"
                value={(item.customUrl || "").replace(/^#/, "")}
                onChange={(e) =>
                  onUpdate({
                    ...item,
                    customUrl: `#${e.target.value.replace(/^#/, "")}`,
                    destinationId: `#${e.target.value.replace(/^#/, "")}`,
                  })
                }
                className="w-full pl-6 pr-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                placeholder="services"
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              Scrolls smoothly to the section with this HTML ID on the page.
            </p>
          </div>
        )}

        {/* Open in new tab toggle */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-text-secondary">
            Open Link in New Tab
          </span>
          <input
            type="checkbox"
            checked={item.openInNewTab || false}
            onChange={(e) => onUpdate({ ...item, openInNewTab: e.target.checked })}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
          />
        </div>

        {/* Responsive Device Visibility */}
        <div className="pt-2 border-t border-border">
          <label className="block text-[11px] font-semibold text-text-secondary mb-2">
            Device Visibility
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center gap-1.5 p-2 rounded-md border border-border bg-surface-subtle cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={item.visibility.desktop}
                onChange={(e) =>
                  onUpdate({
                    ...item,
                    visibility: { ...item.visibility, desktop: e.target.checked },
                  })
                }
                className="w-3.5 h-3.5 text-primary rounded"
              />
              <span>Desktop</span>
            </label>

            <label className="flex items-center gap-1.5 p-2 rounded-md border border-border bg-surface-subtle cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={item.visibility.tablet}
                onChange={(e) =>
                  onUpdate({
                    ...item,
                    visibility: { ...item.visibility, tablet: e.target.checked },
                  })
                }
                className="w-3.5 h-3.5 text-primary rounded"
              />
              <span>Tablet</span>
            </label>

            <label className="flex items-center gap-1.5 p-2 rounded-md border border-border bg-surface-subtle cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={item.visibility.mobile}
                onChange={(e) =>
                  onUpdate({
                    ...item,
                    visibility: { ...item.visibility, mobile: e.target.checked },
                  })
                }
                className="w-3.5 h-3.5 text-primary rounded"
              />
              <span>Mobile</span>
            </label>
          </div>
        </div>

        {/* Description / Subtitle */}
        <div>
          <label className="block text-[11px] font-semibold text-text-secondary mb-1">
            Optional Item Subtitle / Description
          </label>
          <input
            type="text"
            value={item.description || ""}
            onChange={(e) => onUpdate({ ...item, description: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            placeholder="Helpful context for mega-menus or rich dropdowns"
          />
        </div>

        {/* Custom CSS Class */}
        <div>
          <label className="block text-[11px] font-semibold text-text-secondary mb-1">
            Custom CSS Class
          </label>
          <input
            type="text"
            value={item.cssClass || ""}
            onChange={(e) => onUpdate({ ...item, cssClass: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
            placeholder="nav-highlighted"
          />
        </div>

        {/* Enabled Status */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-text-secondary block">
              Item Status
            </span>
            <span className="text-[10px] text-text-muted">
              {item.enabled ? "Visible on published website" : "Temporarily disabled / hidden"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ ...item, enabled: !item.enabled })}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${item.enabled
              ? "bg-primary text-white"
              : "bg-surface-subtle text-text-muted border border-border"
              }`}
          >
            {item.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>
    </div>
  );
};
