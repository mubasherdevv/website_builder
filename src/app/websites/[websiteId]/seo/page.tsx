"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Save,
  Globe,
  FileCode,
  Building2,
  ArrowRightLeft,
  ShieldAlert,
  Sliders,
  FileText,
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
  CheckCircle2,
  Share2,
} from "lucide-react";
import {
  SEOMetadata,
  SEORedirect,
  SEOSchemaConfig,
  SEOTechnicalSettings,
  SEOAuditIssue,
} from "@/types/seo";
import { CMSPageItem } from "@/types/cms";
import { BlogPost } from "@/types/blog";
import { PagesManagerService } from "@/lib/services/pages-manager.service";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import { SEOManagerService } from "@/lib/services/seo-manager.service";
import { toast } from "@/components/ui/Toast";

interface SEOPageProps {
  params: {
    websiteId: string;
  };
}

type TabType =
  | "overview"
  | "pages"
  | "blog"
  | "technical"
  | "schema"
  | "redirects"
  | "audit"
  | "settings";

export default function SEOWorkspacePage({ params }: SEOPageProps) {
  const { websiteId } = params;
  const searchParams = useSearchParams();

  // Active tab state
  const initialTab = (searchParams.get("tab") as TabType) || "overview";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Core Data States
  const [pages, setPages] = useState<CMSPageItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [redirects, setRedirects] = useState<SEORedirect[]>([]);
  const [schemas, setSchemas] = useState<SEOSchemaConfig[]>([]);
  const [techSettings, setTechSettings] = useState<SEOTechnicalSettings>(
    SEOManagerService.getDefaultTechnicalSettings(websiteId)
  );
  const [auditIssues, setAuditIssues] = useState<SEOAuditIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Page SEO Editing Modal / Drawer State
  const [editingPage, setEditingPage] = useState<CMSPageItem | null>(null);
  const [pageSEOForm, setPageSEOForm] = useState<SEOMetadata>({
    title: "",
    description: "",
    canonicalUrl: "",
    focusKeyword: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    noIndex: false,
    noFollow: false,
    noArchive: false,
    noSnippet: false,
  });

  // Redirect Modal State
  const [isAddRedirectOpen, setIsAddRedirectOpen] = useState(false);
  const [redirectForm, setRedirectForm] = useState<{
    sourcePath: string;
    destinationPath: string;
    statusCode: 301 | 302;
    notes: string;
  }>({
    sourcePath: "",
    destinationPath: "",
    statusCode: 301,
    notes: "",
  });
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // Filter & Search States for Pages SEO Table
  const [pageSearch, setPageSearch] = useState("");
  const [pageStatusFilter, setPageStatusFilter] = useState<"all" | "indexed" | "noindex" | "issues">("all");

  const loadAllData = useCallback(() => {
    const p = PagesManagerService.getPages(websiteId);
    const b = BlogManagerService.getPosts(websiteId);
    const r = SEOManagerService.getRedirects(websiteId);
    const s = SEOManagerService.getSchemaConfigs(websiteId);
    const t = SEOManagerService.getTechnicalSettings(websiteId);
    const a = SEOManagerService.runSEOAudit(websiteId);

    setPages(p);
    setBlogPosts(b);
    setRedirects(r);
    setSchemas(s);
    setTechSettings(t);
    setAuditIssues(a);
  }, [websiteId]);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const showNotification = (msg: string) => {
    setSaveSuccessMessage(msg);
    toast.success(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Run SEO Audit
  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const results = SEOManagerService.runSEOAudit(websiteId);
      setAuditIssues(results);
      setIsAuditing(false);
      showNotification("SEO Audit completed successfully!");
    }, 600);
  };

  // Open Page SEO Editor
  const handleOpenPageEditor = (page: CMSPageItem) => {
    setEditingPage(page);
    setPageSEOForm({
      title: page.seo?.title || page.title || "",
      description: page.seo?.description || "",
      canonicalUrl: page.seo?.canonicalUrl || "",
      focusKeyword: page.seo?.focusKeyword || "",
      ogTitle: page.seo?.ogTitle || page.seo?.title || page.title || "",
      ogDescription: page.seo?.ogDescription || page.seo?.description || "",
      ogImageUrl: page.seo?.ogImage || "",
      twitterCard: "summary_large_image",
      twitterTitle: page.seo?.ogTitle || page.seo?.title || page.title || "",
      twitterDescription: page.seo?.ogDescription || page.seo?.description || "",
      twitterImage: page.seo?.ogImage || "",
      noIndex: !!page.seo?.noIndex,
      noFollow: false,
      noArchive: false,
      noSnippet: false,
    });
  };

  // Save Page SEO
  const handleSavePageSEO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    PagesManagerService.updatePage(websiteId, editingPage.id, {
      seo: {
        title: pageSEOForm.title,
        description: pageSEOForm.description,
        canonicalUrl: pageSEOForm.canonicalUrl,
        focusKeyword: pageSEOForm.focusKeyword,
        noIndex: pageSEOForm.noIndex,
        ogTitle: pageSEOForm.ogTitle,
        ogDescription: pageSEOForm.ogDescription,
        ogImage: pageSEOForm.ogImageUrl,
      },
    });

    setEditingPage(null);
    loadAllData();
    showNotification(`SEO settings updated for "${editingPage.title}"`);
  };

  // Save Technical Settings
  const handleSaveTechSettings = (e: React.FormEvent) => {
    e.preventDefault();
    SEOManagerService.saveTechnicalSettings(websiteId, techSettings);
    loadAllData();
    showNotification("Technical SEO settings saved successfully!");
  };

  // Add Redirect
  const handleCreateRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    setRedirectError(null);

    const res = SEOManagerService.addRedirect(websiteId, {
      websiteId,
      sourcePath: redirectForm.sourcePath,
      destinationPath: redirectForm.destinationPath,
      statusCode: redirectForm.statusCode,
      isActive: true,
      notes: redirectForm.notes,
    });

    if (!res.success) {
      setRedirectError(res.error || "Failed to create redirect");
      return;
    }

    setIsAddRedirectOpen(false);
    setRedirectForm({ sourcePath: "", destinationPath: "", statusCode: 301, notes: "" });
    loadAllData();
    showNotification("Redirect created successfully!");
  };

  // Toggle Redirect Active
  const handleToggleRedirect = (id: string, current: boolean) => {
    SEOManagerService.updateRedirect(websiteId, id, { isActive: !current });
    loadAllData();
  };

  // Delete Redirect
  const handleDeleteRedirect = (id: string) => {
    SEOManagerService.deleteRedirect(websiteId, id);
    loadAllData();
    showNotification("Redirect deleted");
  };

  // Save Schema Configs
  const handleSaveSchemaConfigs = () => {
    SEOManagerService.saveSchemaConfigs(websiteId, schemas);
    loadAllData();
    showNotification("Schema markup configuration updated!");
  };

  // Overview metrics
  const totalPages = pages.length;
  const indexedPages = pages.filter((p) => !p.seo?.noIndex).length;
  const noindexPages = pages.filter((p) => p.seo?.noIndex).length;
  const missingTitles = pages.filter((p) => !p.seo?.title && !p.title).length;
  const missingDescriptions = pages.filter((p) => !p.seo?.description).length;
  const missingCanonicals = pages.filter((p) => !p.seo?.canonicalUrl).length;
  const totalRedirects = redirects.length;
  const activeRedirects = redirects.filter((r) => r.isActive).length;

  const criticalIssuesCount = auditIssues.filter((i) => i.severity === "critical").length;
  const warningIssuesCount = auditIssues.filter((i) => i.severity === "warning").length;

  // SEO Health Score Calculation
  const healthScore = useMemo(() => {
    if (totalPages === 0) return 100;
    let score = 100;
    score -= criticalIssuesCount * 12;
    score -= warningIssuesCount * 4;
    return Math.max(10, Math.min(100, score));
  }, [totalPages, criticalIssuesCount, warningIssuesCount]);

  // Filtered pages for table
  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(pageSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(pageSearch.toLowerCase()) ||
      (p.seo?.title || "").toLowerCase().includes(pageSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (pageStatusFilter === "indexed") return !p.seo?.noIndex;
    if (pageStatusFilter === "noindex") return !!p.seo?.noIndex;
    if (pageStatusFilter === "issues") return !p.seo?.title || !p.seo?.description;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2F24] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-emerald-500/30 transition-all animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            SEO Management & Technical Search Engine Hub
          </h1>
          <p className="text-xs text-text-secondary">
            Manage page metadata, XML sitemaps, robots.txt, 301 redirects, Schema.org JSON-LD, and automated audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-btn bg-surface border border-border text-text-primary hover:bg-surface-subtle transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin text-brand" : "text-text-muted"}`} />
            <span>{isAuditing ? "Running Audit..." : "Run SEO Audit"}</span>
          </button>

          <a
            href={`/site/${websiteId}/sitemap.xml`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-btn bg-surface border border-border text-text-primary hover:bg-surface-subtle transition-colors shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-text-muted" />
            <span>View sitemap.xml</span>
            <ExternalLink className="w-3 h-3 text-text-muted" />
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none pb-px text-xs font-medium">
        {[
          { id: "overview", label: "Overview", icon: Globe },
          { id: "pages", label: "Pages SEO", icon: FileText, count: pages.length },
          { id: "blog", label: "Blog SEO", icon: BookOpen, count: blogPosts.length },
          { id: "technical", label: "Technical SEO", icon: Sliders },
          { id: "schema", label: "Schema Markup", icon: Building2 },
          { id: "redirects", label: "Redirects", icon: ArrowRightLeft, count: redirects.length },
          { id: "audit", label: "SEO Audit", icon: ShieldAlert, count: auditIssues.length },
          { id: "settings", label: "SEO Settings", icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-brand text-brand font-semibold"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-brand/10 text-brand" : "bg-surface-subtle text-text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Health Score & Quick Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface rounded-card border border-border p-5 flex items-center gap-4 shadow-xs">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-4 ${
                  healthScore >= 80
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : healthScore >= 50
                    ? "border-amber-500 text-amber-600 bg-amber-50"
                    : "border-rose-500 text-rose-600 bg-rose-50"
                }`}
              >
                {healthScore}%
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">SEO Health Score</h4>
                <p className="text-sm font-bold text-text-primary">
                  {healthScore >= 80 ? "Optimized" : healthScore >= 50 ? "Needs Improvement" : "Action Required"}
                </p>
                <p className="text-[11px] text-text-secondary">
                  {criticalIssuesCount} critical / {warningIssuesCount} warnings
                </p>
              </div>
            </div>

            <div className="bg-surface rounded-card border border-border p-5 shadow-xs">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Page Indexing</h4>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary">{indexedPages}</span>
                <span className="text-xs text-text-muted">of {totalPages} pages indexable</span>
              </div>
              <div className="mt-1 text-[11px] text-text-secondary">
                {noindexPages > 0 ? `${noindexPages} pages marked noindex` : "All pages indexable"}
              </div>
            </div>

            <div className="bg-surface rounded-card border border-border p-5 shadow-xs">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active Redirects</h4>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary">{activeRedirects}</span>
                <span className="text-xs text-text-muted">live rules</span>
              </div>
              <div className="mt-1 text-[11px] text-text-secondary">
                {totalRedirects} total configured (301/302)
              </div>
            </div>

            <div className="bg-surface rounded-card border border-border p-5 shadow-xs">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">XML Sitemap Status</h4>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-text-primary">Active & Dynamic</span>
              </div>
              <div className="mt-1 text-[11px] text-text-secondary">
                Includes {indexedPages} pages + {blogPosts.filter((b) => b.status === "published").length} articles
              </div>
            </div>
          </div>

          {/* Missing SEO Metadata Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-surface rounded-btn border border-border flex items-center justify-between text-xs">
              <div>
                <span className="text-text-muted text-[11px] font-medium block">Missing SEO Titles</span>
                <span className={`text-base font-bold ${missingTitles > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {missingTitles} {missingTitles === 1 ? "page" : "pages"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${missingTitles > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                {missingTitles > 0 ? "Action Required" : "Optimal"}
              </span>
            </div>

            <div className="p-3.5 bg-surface rounded-btn border border-border flex items-center justify-between text-xs">
              <div>
                <span className="text-text-muted text-[11px] font-medium block">Missing Meta Descriptions</span>
                <span className={`text-base font-bold ${missingDescriptions > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {missingDescriptions} {missingDescriptions === 1 ? "page" : "pages"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${missingDescriptions > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                {missingDescriptions > 0 ? "Review Needed" : "Optimal"}
              </span>
            </div>

            <div className="p-3.5 bg-surface rounded-btn border border-border flex items-center justify-between text-xs">
              <div>
                <span className="text-text-muted text-[11px] font-medium block">Default Canonical Fallback</span>
                <span className="text-base font-bold text-text-primary">
                  {missingCanonicals} {missingCanonicals === 1 ? "page" : "pages"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                Auto-Resolved
              </span>
            </div>
          </div>

          {/* Quick Issue Highlights */}
          <div className="bg-surface rounded-card border border-border p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-brand" />
                  <span>Recent SEO Audit Highlights</span>
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Automated checks detected {auditIssues.length} total recommendations for higher Google rankings.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("audit")}
                className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
              >
                <span>View Full Audit Report</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {auditIssues.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-600 bg-emerald-50 rounded-btn border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                No issues detected. Your site follows all SEO best practices.
              </div>
            ) : (
              <div className="space-y-2">
                {auditIssues.slice(0, 4).map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-btn border border-border bg-surface-subtle flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            issue.severity === "critical"
                              ? "bg-rose-100 text-rose-700"
                              : issue.severity === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <span className="font-semibold text-text-primary">{issue.title}</span>
                      </div>
                      <p className="text-text-secondary">{issue.description}</p>
                    </div>

                    <button
                      onClick={() => setActiveTab("audit")}
                      className="px-2.5 py-1 text-[11px] font-semibold text-brand border border-brand/30 rounded hover:bg-brand/5 shrink-0"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SERP Preview of Homepage */}
          <div className="bg-surface rounded-card border border-border p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Search className="w-4 h-4 text-brand" />
                <span>Primary Google Search Engine Preview (Homepage)</span>
              </span>
              <span className="text-[10px] text-text-muted font-mono">SERP Simulation</span>
            </div>

            <div className="p-4 rounded-btn bg-surface-subtle border border-border space-y-1 font-sans">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="text-text-primary font-semibold">Austin Pro Roofing</span>
                <span className="text-text-muted">›</span>
                <span className="text-[11px] font-mono text-text-muted truncate">
                  https://{websiteId}.securesite.io
                </span>
              </div>
              <h3 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug">
                {pages.find((p) => p.isHome || p.slug === "/")?.seo?.title || "Austin Pro Roofing — Licensed Residential & Commercial Roofers"}
              </h3>
              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                {pages.find((p) => p.isHome || p.slug === "/")?.seo?.description ||
                  "Top-rated 24/7 emergency roof leak repair, storm damage restoration, and new roof installation in Austin, TX. Free estimates."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAGES SEO */}
      {activeTab === "pages" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search pages by name or slug..."
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-text-muted">Filter:</span>
              {(["all", "indexed", "noindex", "issues"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPageStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-btn capitalize transition-colors ${
                    pageStatusFilter === filter
                      ? "bg-brand text-white font-semibold"
                      : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle text-text-secondary uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Page Name</th>
                    <th className="px-4 py-3">URL Path</th>
                    <th className="px-4 py-3">SEO Title</th>
                    <th className="px-4 py-3">Focus Keyword</th>
                    <th className="px-4 py-3">Indexing</th>
                    <th className="px-4 py-3">SEO Health</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPages.map((page) => {
                    const hasTitle = !!page.seo?.title;
                    const hasDesc = !!page.seo?.description;
                    const isGood = hasTitle && hasDesc;

                    return (
                      <tr key={page.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-text-primary">
                          <div className="flex items-center gap-2">
                            <span>{page.title}</span>
                            {page.isHome && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand/10 text-brand font-bold uppercase">
                                Home
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{page.slug}</td>
                        <td className="px-4 py-3 text-text-primary max-w-xs truncate">
                          {page.seo?.title || <span className="text-rose-500 italic">Missing title</span>}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {page.seo?.focusKeyword ? (
                            <span className="px-2 py-0.5 rounded bg-surface-subtle border border-border font-medium">
                              {page.seo.focusKeyword}
                            </span>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {page.seo?.noIndex ? (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                              noindex
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                              index
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isGood
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {isGood ? "Good" : "Needs Attention"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenPageEditor(page)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs"
                            >
                              Edit SEO
                            </button>
                            <Link
                              href={`/websites/${websiteId}/editor/${page.id}`}
                              className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-subtle"
                              title="Open in Visual Editor"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BLOG SEO */}
      {activeTab === "blog" && (
        <div className="space-y-4">
          <div className="bg-surface rounded-card border border-border p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-text-primary">Blog Articles & Category SEO</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Optimize search titles, open graph descriptions, and article schemas for your published blog content.
              </p>
            </div>
            <Link
              href={`/websites/${websiteId}/blog`}
              className="px-3 py-1.5 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs"
            >
              Manage in Blog CMS
            </Link>
          </div>

          <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle text-text-secondary uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Article Title</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">SEO Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">SEO Health</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {blogPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-primary">{post.title}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-text-muted">/blog/{post.slug}</td>
                      <td className="px-4 py-3 text-text-primary max-w-xs truncate">
                        {post.seo?.metaTitle || post.title}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            post.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            post.seo?.metaTitle && post.seo?.metaDescription
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {post.seo?.metaTitle && post.seo?.metaDescription ? "Good" : "Needs Review"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/websites/${websiteId}/blog`}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-surface border border-border text-text-primary hover:bg-surface-subtle"
                        >
                          Edit in Blog
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TECHNICAL SEO (SITEMAP & ROBOTS.TXT) */}
      {activeTab === "technical" && (
        <form onSubmit={handleSaveTechSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sitemap Settings */}
            <div className="bg-surface rounded-card border border-border p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-brand" />
                  <span>XML Sitemap Configuration</span>
                </h3>
                <a
                  href={`/site/${websiteId}/sitemap.xml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Open Live XML</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={techSettings.sitemapEnabled}
                    onChange={(e) =>
                      setTechSettings({ ...techSettings, sitemapEnabled: e.target.checked })
                    }
                    className="rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="font-semibold text-text-primary">Enable Automated XML Sitemap</span>
                </label>
                <p className="text-text-muted text-[11px] pl-5">
                  Dynamically serves an RFC-compliant sitemap at <code>/sitemap.xml</code> including all published, indexable pages.
                </p>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={techSettings.includeBlogInSitemap}
                    onChange={(e) =>
                      setTechSettings({ ...techSettings, includeBlogInSitemap: e.target.checked })
                    }
                    className="rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="font-semibold text-text-primary">Include Published Blog Posts</span>
                </label>
                <p className="text-text-muted text-[11px] pl-5">
                  Automatically appends live blog posts to the sitemap index with updated modification timestamps.
                </p>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="font-semibold text-xs text-text-primary">Search Engine Verification</h4>
                <div>
                  <label className="block text-[11px] text-text-secondary mb-1">
                    Google Search Console Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. google-site-verification=abc123xyz"
                    value={techSettings.googleSearchConsoleVerification || ""}
                    onChange={(e) =>
                      setTechSettings({
                        ...techSettings,
                        googleSearchConsoleVerification: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-surface-subtle border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-secondary mb-1">
                    Bing Webmaster Tools Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234567890ABCDEF"
                    value={techSettings.bingWebmasterVerification || ""}
                    onChange={(e) =>
                      setTechSettings({
                        ...techSettings,
                        bingWebmasterVerification: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-surface-subtle border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Robots.txt Settings */}
            <div className="bg-surface rounded-card border border-border p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-brand" />
                  <span>Robots.txt Engine</span>
                </h3>
                <a
                  href={`/site/${websiteId}/robots.txt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Open Live robots.txt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-text-secondary">
                Control search crawler access. Protects your dashboard, editor, and API routes automatically while allowing public pages.
              </p>

              <div className="p-3 bg-surface-subtle border border-border rounded-btn font-mono text-[11px] text-text-primary whitespace-pre-wrap leading-relaxed">
                {SEOManagerService.generateRobotsTxt(
                  `https://${websiteId}.securesite.io`,
                  techSettings
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Technical SEO Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: SCHEMA MARKUP */}
      {activeTab === "schema" && (
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-border p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand" />
                  <span>Structured Data & Schema.org JSON-LD</span>
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Helps search engines understand your organization, location, phone number, and services for rich snippets.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveSchemaConfigs}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Schema Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border">
              {/* Form Settings */}
              <div className="space-y-3 text-xs">
                {schemas.map((schema, index) => (
                  <div key={schema.id} className="p-4 rounded-btn border border-border bg-surface-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                        {schema.schemaType} Schema
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-text-secondary">
                        <input
                          type="checkbox"
                          checked={schema.isActive}
                          onChange={(e) => {
                            const updated = [...schemas];
                            updated[index].isActive = e.target.checked;
                            setSchemas(updated);
                          }}
                          className="rounded border-border text-brand focus:ring-brand"
                        />
                        <span>Active</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] text-text-secondary mb-1">Business / Brand Name</label>
                      <input
                        type="text"
                        value={schema.name || ""}
                        onChange={(e) => {
                          const updated = [...schemas];
                          updated[index].name = e.target.value;
                          setSchemas(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    {schema.schemaType === "LocalBusiness" && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-text-secondary mb-1">Telephone</label>
                            <input
                              type="text"
                              value={schema.telephone || ""}
                              onChange={(e) => {
                                const updated = [...schemas];
                                updated[index].telephone = e.target.value;
                                setSchemas(updated);
                              }}
                              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-text-secondary mb-1">Price Range</label>
                            <input
                              type="text"
                              value={schema.priceRange || ""}
                              onChange={(e) => {
                                const updated = [...schemas];
                                updated[index].priceRange = e.target.value;
                                setSchemas(updated);
                              }}
                              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-text-secondary mb-1">Street Address</label>
                          <input
                            type="text"
                            value={schema.address?.street || ""}
                            onChange={(e) => {
                              const updated = [...schemas];
                              updated[index].address = {
                                ...updated[index].address,
                                street: e.target.value,
                              };
                              setSchemas(updated);
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* JSON-LD Code Output Preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-text-primary">Generated JSON-LD Output Preview</span>
                <div className="p-4 bg-[#1E293B] text-emerald-400 font-mono text-[11px] rounded-card overflow-x-auto max-h-96">
                  <pre>
                    {JSON.stringify(
                      schemas
                        .filter((s) => s.isActive)
                        .map((s) => SEOManagerService.generateJsonLd(s)),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REDIRECT MANAGEMENT */}
      {activeTab === "redirects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-text-primary">301 / 302 URL Redirects</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Manage URL redirects with built-in loop protection and path validation to preserve backlink SEO equity.
              </p>
            </div>

            <button
              onClick={() => {
                setRedirectError(null);
                setIsAddRedirectOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Redirect</span>
            </button>
          </div>

          <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle text-text-secondary uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Source URL Path</th>
                    <th className="px-4 py-3">Destination Path</th>
                    <th className="px-4 py-3">Status Code</th>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {redirects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                        No redirect rules configured. Click &quot;Add Redirect&quot; to create your first rule.
                      </td>
                    </tr>
                  ) : (
                    redirects.map((redir) => (
                      <tr key={redir.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-text-primary">{redir.sourcePath}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-brand font-medium">
                          {redir.destinationPath}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              redir.statusCode === 301
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {redir.statusCode} {redir.statusCode === 301 ? "Permanent" : "Temporary"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleRedirect(redir.id, redir.isActive)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              redir.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {redir.isActive ? "Active" : "Disabled"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-text-secondary text-[11px] max-w-xs truncate">
                          {redir.notes || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteRedirect(redir.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title="Delete Redirect"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SEO AUDIT */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="bg-surface rounded-card border border-border p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-brand" />
                <span>Automated SEO Audit Engine</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Scans all pages, blog posts, headings, meta descriptions, image alts, and canonicals for compliance.
              </p>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
              <span>{isAuditing ? "Auditing Website..." : "Re-Run Complete Audit"}</span>
            </button>
          </div>

          <div className="space-y-3">
            {auditIssues.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-700 bg-emerald-50 rounded-card border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <h4 className="font-bold text-sm">All SEO Checks Passed!</h4>
                <p className="text-text-secondary mt-1">
                  Your titles, descriptions, headings, canonicals, and schemas are fully optimized.
                </p>
              </div>
            ) : (
              auditIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          issue.severity === "critical"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : issue.severity === "warning"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="font-bold text-text-primary text-sm">{issue.title}</span>
                      {issue.pageSlug && (
                        <span className="font-mono text-[10px] text-text-muted bg-surface-subtle px-1.5 py-0.5 rounded border border-border">
                          {issue.pageSlug}
                        </span>
                      )}
                    </div>
                    <p className="text-text-primary font-medium">{issue.description}</p>
                    <p className="text-text-secondary text-[11px]">
                      <span className="font-semibold text-brand">Recommendation:</span> {issue.recommendation}
                    </p>
                  </div>

                  {issue.fixActionUrl && (
                    <Link
                      href={issue.fixActionUrl}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-brand/10 text-brand hover:bg-brand hover:text-white transition-colors shrink-0"
                    >
                      Fix Issue
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: SEO SETTINGS */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveTechSettings} className="space-y-6">
          <div className="bg-surface rounded-card border border-border p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-text-primary">Global Site SEO Defaults</h3>
            <p className="text-xs text-text-secondary">
              Configure baseline title patterns and fallback Open Graph social preview cards.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block text-text-secondary mb-1 font-semibold">
                  Default Title Template
                </label>
                <input
                  type="text"
                  value={techSettings.defaultTitleTemplate}
                  onChange={(e) =>
                    setTechSettings({ ...techSettings, defaultTitleTemplate: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  Available tags: <code>%title%</code>, <code>%site_name%</code>
                </span>
              </div>

              <div>
                <label className="block text-text-secondary mb-1 font-semibold">
                  Fallback Social Share Image URL (OG Image)
                </label>
                <input
                  type="url"
                  value={techSettings.fallbackOgImage || ""}
                  onChange={(e) =>
                    setTechSettings({ ...techSettings, fallbackOgImage: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  Used when individual pages or blog posts do not specify a unique Open Graph image.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Global Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* PAGE SEO EDIT MODAL */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-card border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Edit SEO — {editingPage.title}
                </h3>
                <span className="text-[11px] font-mono text-text-muted">{editingPage.slug}</span>
              </div>
              <button
                onClick={() => setEditingPage(null)}
                className="p-1 text-text-muted hover:text-text-primary rounded-btn hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live SERP Preview */}
            <div className="p-4 rounded-btn bg-surface-subtle border border-border space-y-1 font-sans">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="text-text-primary font-semibold">Austin Pro Roofing</span>
                <span className="text-text-muted">›</span>
                <span className="text-[11px] font-mono text-text-muted truncate">
                  {pageSEOForm.canonicalUrl || `https://${websiteId}.securesite.io${editingPage.slug}`}
                </span>
              </div>
              <h3 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug">
                {pageSEOForm.title || editingPage.title}
              </h3>
              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                {pageSEOForm.description || "Please provide a meta description for this page."}
              </p>
            </div>

            <form onSubmit={handleSavePageSEO} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-text-primary">SEO Title</label>
                  <span
                    className={`text-[10px] ${
                      pageSEOForm.title.length > 60 ? "text-amber-600 font-bold" : "text-text-muted"
                    }`}
                  >
                    {pageSEOForm.title.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={pageSEOForm.title}
                  onChange={(e) => setPageSEOForm({ ...pageSEOForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="e.g. Roof Inspection Austin | Free Estimate"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-text-primary">Meta Description</label>
                  <span
                    className={`text-[10px] ${
                      pageSEOForm.description.length > 160 ? "text-amber-600 font-bold" : "text-text-muted"
                    }`}
                  >
                    {pageSEOForm.description.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={pageSEOForm.description}
                  onChange={(e) => setPageSEOForm({ ...pageSEOForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Summarize the page content for search engine snippets..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Focus Keyword</label>
                  <input
                    type="text"
                    value={pageSEOForm.focusKeyword || ""}
                    onChange={(e) => setPageSEOForm({ ...pageSEOForm, focusKeyword: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="e.g. roof repairs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Canonical URL</label>
                  <input
                    type="url"
                    value={pageSEOForm.canonicalUrl || ""}
                    onChange={(e) => setPageSEOForm({ ...pageSEOForm, canonicalUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="Leave blank for automatic"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageSEOForm.noIndex}
                    onChange={(e) => setPageSEOForm({ ...pageSEOForm, noIndex: e.target.checked })}
                    className="rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="font-semibold text-text-primary">noindex (Hide from search engines)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-3.5 py-2 rounded-btn border border-border text-text-secondary hover:bg-surface-subtle font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-btn bg-brand text-white hover:bg-brand-hover font-semibold shadow-xs"
                >
                  Save Page SEO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD REDIRECT MODAL */}
      {isAddRedirectOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-card border border-border max-w-md w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary">Create New URL Redirect</h3>
              <button
                onClick={() => setIsAddRedirectOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary rounded-btn hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {redirectError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
                {redirectError}
              </div>
            )}

            <form onSubmit={handleCreateRedirect} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Source Path</label>
                <input
                  type="text"
                  placeholder="/old-page"
                  value={redirectForm.sourcePath}
                  onChange={(e) => setRedirectForm({ ...redirectForm, sourcePath: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Destination Path</label>
                <input
                  type="text"
                  placeholder="/new-page or https://external.com"
                  value={redirectForm.destinationPath}
                  onChange={(e) =>
                    setRedirectForm({ ...redirectForm, destinationPath: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Status Code</label>
                <select
                  value={redirectForm.statusCode}
                  onChange={(e) =>
                    setRedirectForm({ ...redirectForm, statusCode: Number(e.target.value) as 301 | 302 })
                  }
                  className="w-full px-3 py-2 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value={301}>301 Moved Permanently (Recommended for SEO)</option>
                  <option value={302}>302 Found (Temporary Redirect)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Notes / Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Redesigned service page URL"
                  value={redirectForm.notes}
                  onChange={(e) => setRedirectForm({ ...redirectForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddRedirectOpen(false)}
                  className="px-3 py-1.5 rounded-btn border border-border text-text-secondary hover:bg-surface-subtle font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-btn bg-brand text-white hover:bg-brand-hover font-semibold shadow-xs"
                >
                  Add Redirect Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
