"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CMSPageItem } from "@/types/cms";
import { PagesManagerService } from "@/lib/services/pages-manager.service";
import { CreatePageModal } from "@/components/pages/CreatePageModal";
import { PageSettingsModal } from "@/components/pages/PageSettingsModal";
import { DeletePageModal } from "@/components/pages/DeletePageModal";
import { PagePreviewModal } from "@/components/pages/PagePreviewModal";
import {
  Plus,
  FileText,
  Copy,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Search,
  Settings,
  Eye,
  Compass,
  ArrowUpDown,
  AlertCircle,
  Home,
  Check,
} from "lucide-react";

interface PagesPageProps {
  params: {
    websiteId: string;
  };
}

export default function PagesManagerPage({ params }: PagesPageProps) {
  const { websiteId } = params;

  const [pages, setPages] = useState<CMSPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [sortBy, setSortBy] = useState<"updated_desc" | "updated_asc" | "title_asc" | "title_desc">("updated_desc");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [settingsPage, setSettingsPage] = useState<CMSPageItem | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CMSPageItem | null>(null);
  const [previewTarget, setPreviewTarget] = useState<CMSPageItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load pages on mount
  useEffect(() => {
    const data = PagesManagerService.getPages(websiteId);
    setPages(data);
    setLoading(false);
  }, [websiteId]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Filter and sort pages
  const filteredPages = useMemo(() => {
    return pages
      .filter((page) => {
        const matchesSearch =
          page.title.toLowerCase().includes(search.toLowerCase()) ||
          page.slug.toLowerCase().includes(search.toLowerCase()) ||
          (page.pageType && page.pageType.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        if (statusFilter === "all") return true;
        return page.status === statusFilter;
      })
      .sort((a, b) => {
        if (sortBy === "title_asc") return a.title.localeCompare(b.title);
        if (sortBy === "title_desc") return b.title.localeCompare(a.title);
        // Default: Home first, then by updated
        if (a.isHome) return -1;
        if (b.isHome) return 1;
        return 0;
      });
  }, [pages, search, statusFilter, sortBy]);

  // Actions
  const handleCreateSubmit = (payload: Parameters<typeof PagesManagerService.createPage>[1]) => {
    setCreateError(null);
    const res = PagesManagerService.createPage(websiteId, payload);
    if (!res.success) {
      setCreateError(res.error || "Failed to create page.");
      return;
    }
    const refreshed = PagesManagerService.getPages(websiteId);
    setPages(refreshed);
    setIsCreateOpen(false);
    showNotice(`Page "${res.page?.title}" created successfully.`);
  };

  const handleDuplicate = (pageId: string) => {
    const res = PagesManagerService.duplicatePage(websiteId, pageId);
    if (res.success && res.page) {
      const refreshed = PagesManagerService.getPages(websiteId);
      setPages(refreshed);
      showNotice(`Page duplicated as "${res.page.title}".`);
    } else {
      alert(res.error || "Could not duplicate page.");
    }
  };

  const handleTogglePublish = (pageId: string) => {
    const res = PagesManagerService.togglePublish(websiteId, pageId);
    if (res.success) {
      const refreshed = PagesManagerService.getPages(websiteId);
      setPages(refreshed);
      showNotice(`Page status updated to ${res.status}.`);
    }
  };

  const handleToggleNavigation = (pageId: string) => {
    const inNav = PagesManagerService.togglePageInNavigation(websiteId, pageId);
    const refreshed = PagesManagerService.getPages(websiteId);
    setPages(refreshed);
    showNotice(inNav ? "Page added to website navigation." : "Page removed from website navigation.");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const res = PagesManagerService.deletePage(websiteId, deleteTarget.id);
    if (!res.success) {
      alert(res.error || "Failed to delete page.");
      return;
    }
    const refreshed = PagesManagerService.getPages(websiteId);
    setPages(refreshed);
    setDeleteTarget(null);
    showNotice(`Page "${deleteTarget.title}" deleted.`);
  };

  const handleSettingsSave = (updates: Partial<CMSPageItem>) => {
    if (!settingsPage) return;
    setSettingsError(null);
    const res = PagesManagerService.updatePage(websiteId, settingsPage.id, updates);
    if (!res.success) {
      setSettingsError(res.error || "Failed to update page.");
      return;
    }
    const refreshed = PagesManagerService.getPages(websiteId);
    setPages(refreshed);
    setSettingsPage(null);
    showNotice("Page settings updated.");
  };

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: pages.length,
      published: pages.filter((p) => p.status === "published").length,
      draft: pages.filter((p) => p.status === "draft").length,
      archived: pages.filter((p) => p.status === "archived").length,
      inNav: pages.filter((p) => p.inNavigation).length,
    };
  }, [pages]);

  return (
    <div className="space-y-6">
      {/* Notice Pill */}
      {actionNotice && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-card bg-forest text-white text-xs font-semibold shadow-xl border border-accent animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-accent" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              Pages Manager
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-soft text-brand font-semibold">
              {pages.length} Pages
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Create, duplicate, design, and configure SEO & navigation for website: <span className="font-semibold text-text-primary">{websiteId}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/websites/${websiteId}/navigation`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:text-brand hover:bg-surface-subtle transition-colors shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>Navigation Menu ({counts.inNav})</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
          </button>
        </div>
      </div>

      {/* Top Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-btn transition-colors cursor-pointer shrink-0 ${
              statusFilter === "all"
                ? "bg-forest text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-btn transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              statusFilter === "published"
                ? "bg-forest text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
            <span>Published ({counts.published})</span>
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-btn transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              statusFilter === "draft"
                ? "bg-forest text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-status-warning inline-block"></span>
            <span>Draft ({counts.draft})</span>
          </button>
          <button
            onClick={() => setStatusFilter("archived")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-btn transition-colors cursor-pointer shrink-0 ${
              statusFilter === "archived"
                ? "bg-forest text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
            }`}
          >
            Archived ({counts.archived})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, slug, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-btn bg-surface-subtle border border-border focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2.5 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand font-medium text-text-secondary cursor-pointer"
            >
              <option value="updated_desc">Recently Modified</option>
              <option value="title_asc">Name (A-Z)</option>
              <option value="title_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Loading pages...
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-subtle text-text-muted flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-text-primary">No pages found</h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {search
                  ? `No pages matched "${search}". Try clearing your search keyword.`
                  : "Get started by creating your first website page with our templates."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Page</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Page Details</th>
                  <th className="px-6 py-3.5 font-semibold">URL Slug</th>
                  <th className="px-6 py-3.5 font-semibold">Type</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">SEO Health</th>
                  <th className="px-6 py-3.5 font-semibold">Navigation</th>
                  <th className="px-6 py-3.5 font-semibold">Last Modified</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-surface-subtle/40 transition-colors group">
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center shrink-0">
                          {page.isHome ? (
                            <Home className="w-4 h-4 text-brand" />
                          ) : (
                            <FileText className="w-4 h-4 text-text-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-text-primary truncate max-w-[200px]">
                              {page.title}
                            </span>
                            {page.isHome && (
                              <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-brand-soft text-brand font-bold uppercase tracking-wider">
                                Root Home
                              </span>
                            )}
                          </div>
                          {page.description && (
                            <p className="text-[11px] text-text-muted truncate max-w-xs">
                              {page.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <code className="font-mono text-[11px] text-text-secondary bg-surface-subtle px-2 py-0.5 rounded border border-border">
                        {page.slug}
                      </code>
                    </td>

                    {/* Page Type */}
                    <td className="px-6 py-4">
                      <span className="capitalize text-text-secondary font-medium px-2 py-0.5 bg-surface-subtle rounded border border-border/60">
                        {page.pageType ? page.pageType.replace("_", " ") : "Custom"}
                      </span>
                    </td>

                    {/* Publication Status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(page.id)}
                        title="Click to toggle Draft / Published"
                        className="cursor-pointer"
                      >
                        {page.status === "published" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-success-soft text-status-success hover:ring-1 hover:ring-status-success transition-all">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Published</span>
                          </span>
                        ) : page.status === "draft" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-warning-soft text-status-warning hover:ring-1 hover:ring-status-warning transition-all">
                            <Clock className="w-3 h-3" />
                            <span>Draft</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                            <span>Archived</span>
                          </span>
                        )}
                      </button>
                    </td>

                    {/* SEO Health */}
                    <td className="px-6 py-4">
                      {page.seoStatus === "good" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-success" title="Title & meta description optimized">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Optimized</span>
                        </span>
                      ) : page.seoStatus === "warning" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-warning" title="Title or meta description length needs review">
                          <AlertCircle className="w-3 h-3" />
                          <span>Needs Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted" title="SEO metadata missing">
                          <span>Missing</span>
                        </span>
                      )}
                    </td>

                    {/* In Navigation */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleNavigation(page.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          page.inNavigation
                            ? "bg-brand-soft text-brand hover:bg-brand-soft/80"
                            : "bg-surface-subtle text-text-muted hover:text-text-primary"
                        }`}
                        title="Click to toggle in navbar"
                      >
                        <Compass className="w-3 h-3" />
                        <span>{page.inNavigation ? (page.navLabel || "In Nav") : "Hidden"}</span>
                      </button>
                    </td>

                    {/* Last Modified */}
                    <td className="px-6 py-4 text-text-muted">
                      {page.updatedAt || "Recently"}
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Edit in Visual Builder */}
                        <Link
                          href={`/websites/${websiteId}/editor/${page.id}`}
                          className="p-1.5 rounded text-text-secondary hover:text-brand hover:bg-brand-soft transition-colors"
                          title="Open Visual Drag-and-Drop Editor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {/* Live Page Preview */}
                        <button
                          type="button"
                          onClick={() => setPreviewTarget(page)}
                          className="p-1.5 rounded text-text-secondary hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer"
                          title="Preview Page Canvas"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Page Settings & SEO */}
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsError(null);
                            setSettingsPage(page);
                          }}
                          className="p-1.5 rounded text-text-secondary hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer"
                          title="Page Settings & SEO"
                        >
                          <Settings className="w-4 h-4" />
                        </button>

                        {/* Duplicate Page */}
                        <button
                          type="button"
                          onClick={() => handleDuplicate(page.id)}
                          className="p-1.5 rounded text-text-secondary hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer"
                          title="Duplicate Page"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete Page */}
                        {!page.isHome && page.slug !== "/" && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(page)}
                            className="p-1.5 rounded text-text-muted hover:text-status-danger hover:bg-status-danger-soft transition-colors cursor-pointer"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      <CreatePageModal
        isOpen={isCreateOpen}
        websiteId={websiteId}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        error={createError}
      />

      <PageSettingsModal
        page={settingsPage}
        isOpen={Boolean(settingsPage)}
        onClose={() => setSettingsPage(null)}
        onSave={handleSettingsSave}
        error={settingsError}
      />

      <DeletePageModal
        page={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <PagePreviewModal
        page={previewTarget}
        isOpen={Boolean(previewTarget)}
        onClose={() => setPreviewTarget(null)}
        websiteId={websiteId}
      />
    </div>
  );
}
