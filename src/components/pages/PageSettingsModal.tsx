"use client";

import React, { useState, useEffect } from "react";
import { CMSPageItem } from "@/types/cms";
import {
  X,
  Compass,
  Check,
  AlertCircle,
} from "lucide-react";

interface PageSettingsModalProps {
  page: CMSPageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<CMSPageItem>) => void;
  error?: string | null;
}

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  page,
  isOpen,
  onClose,
  onSave,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "seo">("general");

  // General State
  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [description, setDescription] = useState(page?.description || "");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    page?.status || "draft"
  );
  const [inNavigation, setInNavigation] = useState(page?.inNavigation ?? true);
  const [navLabel, setNavLabel] = useState(page?.navLabel || page?.title || "");

  // SEO State
  const [seoTitle, setSeoTitle] = useState(page?.seo?.title || page?.title || "");
  const [metaDescription, setMetaDescription] = useState(
    page?.seo?.description || page?.description || ""
  );
  const [focusKeyword, setFocusKeyword] = useState(page?.seo?.focusKeyword || "");
  const [canonicalUrl, setCanonicalUrl] = useState(page?.seo?.canonicalUrl || "");
  const [noIndex, setNoIndex] = useState(page?.seo?.noIndex || false);
  const [ogTitle, setOgTitle] = useState(
    page?.seo?.ogTitle || page?.seo?.title || page?.title || ""
  );
  const [ogDescription, setOgDescription] = useState(
    page?.seo?.ogDescription || page?.seo?.description || ""
  );
  const [ogImage, setOgImage] = useState(page?.seo?.ogImage || "");

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setDescription(page.description || "");
      setStatus(page.status);
      setInNavigation(page.inNavigation ?? true);
      setNavLabel(page.navLabel || page.title);

      setSeoTitle(page.seo?.title || page.title);
      setMetaDescription(page.seo?.description || page.description || "");
      setFocusKeyword(page.seo?.focusKeyword || "");
      setCanonicalUrl(page.seo?.canonicalUrl || "");
      setNoIndex(page.seo?.noIndex || false);
      setOgTitle(page.seo?.ogTitle || page.seo?.title || page.title);
      setOgDescription(page.seo?.ogDescription || page.seo?.description || "");
      setOgImage(page.seo?.ogImage || "");
    }
  }, [page]);

  if (!isOpen || !page) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      slug,
      description,
      status,
      inNavigation,
      navLabel,
      seo: {
        title: seoTitle,
        description: metaDescription,
        focusKeyword,
        canonicalUrl,
        noIndex,
        ogTitle: ogTitle || seoTitle || title,
        ogDescription: ogDescription || metaDescription || description,
        ogImage,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-card border border-border shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
          <div>
            <h3 className="font-bold text-sm text-text-primary">
              Page Settings &amp; SEO
            </h3>
            <p className="text-xs text-text-muted">
              Configure general page metadata, URL routing, and SEO indexability for &quot;{page.title}&quot;.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center px-6 border-b border-border bg-surface text-xs font-semibold gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "general"
                ? "border-brand text-brand"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>General Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "seo"
                ? "border-brand text-brand"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>Search Engine Optimization (SEO)</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-btn bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "general" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Page Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={page.isHome}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-btn border border-border bg-surface focus:outline-none focus:border-brand disabled:opacity-50 disabled:bg-surface-subtle"
                  />
                  {page.isHome && (
                    <span className="text-[10px] text-text-muted">
                      Root homepage slug cannot be changed.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Internal Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes for team members or content editors..."
                  className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived")}
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                    <option value="archived">Archived (Unlisted)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Navigation Menu Label
                  </label>
                  <input
                    type="text"
                    value={navLabel}
                    onChange={(e) => setNavLabel(e.target.value)}
                    placeholder={title}
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Navigation toggle */}
              <div className="flex items-center justify-between p-3 rounded-btn border border-border bg-surface-subtle">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand" />
                  <div>
                    <h6 className="text-xs font-semibold text-text-primary">
                      Include in Main Navigation
                    </h6>
                    <p className="text-[10px] text-text-muted">
                      Automatically shows this page in the header menu bar.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inNavigation}
                    onChange={(e) => setInNavigation(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-primary">
                    SEO Meta Title
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      seoTitle.length >= 30 && seoTitle.length <= 60
                        ? "text-emerald-600 font-semibold"
                        : "text-text-muted"
                    }`}
                  >
                    {seoTitle.length} / 60 chars (Recommended: 30-60)
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Austin Commercial Roofing Services | Lifetime Guarantee"
                  className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-primary">
                    Meta Description
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      metaDescription.length >= 70 && metaDescription.length <= 155
                        ? "text-emerald-600 font-semibold"
                        : "text-text-muted"
                    }`}
                  >
                    {metaDescription.length} / 160 chars (Recommended: 70-155)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Concise overview explaining value proposition and encouraging clicks from search engines..."
                  className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Focus Target Keyword
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g. commercial roofing austin"
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://example.com/services"
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Social Share (OG) Title
                  </label>
                  <input
                    type="text"
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                    placeholder={seoTitle || title}
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Social Share Image URL
                  </label>
                  <input
                    type="url"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Social Share (OG) Description
                </label>
                <input
                  type="text"
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder={metaDescription || description || "Social description"}
                  className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>

              {/* Robots & Indexing */}
              <div className="flex items-center justify-between p-3 rounded-btn border border-border bg-surface-subtle">
                <div>
                  <h6 className="text-xs font-semibold text-text-primary">Index / Noindex Policy</h6>
                  <p className="text-[10px] text-text-muted">
                    When active, tags this page with &lt;meta name=&quot;robots&quot; content=&quot;noindex&quot; /&gt;.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                  <input
                    type="checkbox"
                    checked={noIndex}
                    onChange={(e) => setNoIndex(e.target.checked)}
                    className="rounded text-brand focus:ring-brand"
                  />
                  <span>Block Search Engines (noindex)</span>
                </label>
              </div>

              {/* Snippet Preview */}
              <div className="p-3.5 rounded-card border border-border bg-surface space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Search Result Snippet Preview
                </span>
                <p className="text-[11px] text-emerald-800 font-mono">
                  https://mysite.securesite.io{slug}
                </p>
                <h6 className="text-xs font-semibold text-blue-700 truncate">
                  {seoTitle || title}
                </h6>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {metaDescription || description || "No meta description provided."}
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
