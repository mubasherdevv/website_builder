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
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";
import {
  SEOMetadata,
  SEORedirect,
  SEOSchemaConfig,
  SEOTechnicalSettings,
  SEOAuditIssue,
} from "@/types/seo";
import {
  SEOAuditRecord,
  SEOCrawledPageRecord,
  SEOAuditIssueRecord,
  IssueSeverity,
  IssueCategory,
  IssueStatus,
} from "@/lib/database/repositories/seo-audit.repo";
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

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tabId === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tabId);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Core Data States
  const [pages, setPages] = useState<CMSPageItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [redirects, setRedirects] = useState<SEORedirect[]>([]);
  const [schemas, setSchemas] = useState<SEOSchemaConfig[]>([]);
  const [techSettings, setTechSettings] = useState<SEOTechnicalSettings>(
    SEOManagerService.getDefaultTechnicalSettings(websiteId)
  );
  const [auditIssues, setAuditIssues] = useState<SEOAuditIssue[]>([]);

  // Real Crawler & SEO Audit Engine State
  const [realAudit, setRealAudit] = useState<SEOAuditRecord | null>(null);
  const [crawledPages, setCrawledPages] = useState<SEOCrawledPageRecord[]>([]);
  const [realIssues, setRealIssues] = useState<SEOAuditIssueRecord[]>([]);
  const [auditHistory, setAuditHistory] = useState<SEOAuditRecord[]>([]);
  const [auditSubView, setAuditSubView] = useState<"issues" | "pages" | "passed" | "history">("issues");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<"all" | IssueSeverity>("all");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<"all" | IssueCategory>("all");
  const [auditStatusFilter, setAuditStatusFilter] = useState<"all" | IssueStatus>("all");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [isCrawlingAudit, setIsCrawlingAudit] = useState(false);
  const [crawlProgressStatus, setCrawlProgressStatus] = useState<string>("");

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

  const loadAllData = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/seo`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.seo) {
          if (json.seo.technicalSettings) {
            setTechSettings(json.seo.technicalSettings);
            SEOManagerService.saveTechnicalSettings(websiteId, json.seo.technicalSettings);
          }
          if (json.seo.redirects) {
            setRedirects(json.seo.redirects);
            SEOManagerService.saveRedirects(websiteId, json.seo.redirects);
          }
          if (json.seo.schemaConfigs && json.seo.schemaConfigs.length > 0) {
            setSchemas(json.seo.schemaConfigs);
            SEOManagerService.saveSchemaConfigs(websiteId, json.seo.schemaConfigs);
          } else {
            const defSchemas = SEOManagerService.getDefaultSchemaConfigs(websiteId);
            setSchemas(defSchemas);
            SEOManagerService.saveSchemaConfigs(websiteId, defSchemas);
          }
        }
      }
    } catch {
      // fallback to local
    }

    const p = PagesManagerService.getPages(websiteId);
    const b = BlogManagerService.getPosts(websiteId);
    const r = SEOManagerService.getRedirects(websiteId);
    const s = SEOManagerService.getSchemaConfigs(websiteId);
    const t = SEOManagerService.getTechnicalSettings(websiteId);
    const a = SEOManagerService.runSEOAudit(websiteId);

    const finalSchemas = s && s.length > 0 ? s : SEOManagerService.getDefaultSchemaConfigs(websiteId);

    setPages(p);
    setBlogPosts(b);
    setRedirects(r);
    setSchemas(finalSchemas);
    setTechSettings(t);
    setAuditIssues(a);

    // Fetch real audit data from database
    try {
      const auditRes = await fetch(`/api/websites/${websiteId}/seo/audit/latest`);
      if (auditRes.ok) {
        const auditJson = await auditRes.json();
        if (auditJson.success && auditJson.audit) {
          setRealAudit(auditJson.audit);
          setCrawledPages(auditJson.pages || []);
          setRealIssues(auditJson.issues || []);
        }
      }
    } catch (e) {
      console.warn("Could not load latest real audit:", e);
    }
  }, [websiteId]);

  // Load audit history
  const loadAuditHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/seo/audit/history`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.audits) {
          setAuditHistory(json.audits);
        }
      }
    } catch (e) {
      console.warn("Could not load audit history:", e);
    }
  }, [websiteId]);

  // Load initial data
  useEffect(() => {
    loadAllData();
    loadAuditHistory();
  }, [loadAllData, loadAuditHistory]);

  const showNotification = (msg: string) => {
    toast.success(msg);
  };

  // Run Real Website SEO Crawler Audit
  const handleRunRealAudit = async () => {
    setIsCrawlingAudit(true);
    setCrawlProgressStatus("Initiating safe crawler (SSRF guard, sitemap & inventory)...");
    try {
      const res = await fetch(`/api/websites/${websiteId}/seo/audit/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crawlSitemap: true,
          maxPages: 25,
          pages: pages.map((p) => ({ slug: p.slug, title: p.title, seo: p.seo })),
          blogPosts: blogPosts.map((b) => ({ slug: b.slug, title: b.title, seo: b.seo })),
        }),
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setRealAudit(data.audit);
        setCrawledPages(data.pages || []);
        setRealIssues(data.issues || []);
        toast.success(`SEO Audit complete! Health score: ${data.audit.overall_score}/100`);
        loadAuditHistory();
      } else {
        toast.error(data.error || "SEO Audit encountered an error.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to run website SEO audit.");
    } finally {
      setIsCrawlingAudit(false);
      setCrawlProgressStatus("");
    }
  };

  const handleUpdateIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/seo/audit/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setRealIssues((prev) =>
          prev.map((iss) => (iss.id === issueId ? { ...iss, status: newStatus } : iss))
        );
        toast.success(`Issue marked as ${newStatus}`);
      }
    } catch {
      toast.error("Failed to update issue status");
    }
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
  const handleSaveTechSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    SEOManagerService.saveTechnicalSettings(websiteId, techSettings);
    try {
      await fetch(`/api/websites/${websiteId}/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seo: {
            websiteId,
            technicalSettings: techSettings,
            redirects,
            schemaConfigs: schemas,
          },
        }),
      });
    } catch {
      // background
    }
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
  const handleSaveSchemaConfigs = async () => {
    SEOManagerService.saveSchemaConfigs(websiteId, schemas);
    try {
      await fetch(`/api/websites/${websiteId}/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seo: {
            websiteId,
            technicalSettings: techSettings,
            redirects,
            schemaConfigs: schemas,
          },
        }),
      });
    } catch {
      // background
    }
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
    if (realAudit && typeof realAudit.overall_score === "number") {
      return realAudit.overall_score;
    }
    if (totalPages === 0) return 100;
    let score = 100;
    score -= criticalIssuesCount * 12;
    score -= warningIssuesCount * 4;
    return Math.max(10, Math.min(100, score));
  }, [realAudit, totalPages, criticalIssuesCount, warningIssuesCount]);

  // Filtered real issues
  const filteredRealIssues = useMemo(() => {
    return realIssues.filter((issue) => {
      if (auditSeverityFilter !== "all" && issue.severity !== auditSeverityFilter) return false;
      if (auditCategoryFilter !== "all" && issue.category !== auditCategoryFilter) return false;
      if (auditStatusFilter !== "all" && issue.status !== auditStatusFilter) return false;
      if (auditSearchQuery.trim()) {
        const q = auditSearchQuery.toLowerCase();
        const matches =
          issue.title.toLowerCase().includes(q) ||
          issue.finding.toLowerCase().includes(q) ||
          issue.affected_url.toLowerCase().includes(q) ||
          issue.recommended_fix.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [realIssues, auditSeverityFilter, auditCategoryFilter, auditStatusFilter, auditSearchQuery]);

  const getReadablePagePath = (url?: string | null): string => {
    if (!url || typeof url !== "string") return "/";
    try {
      const u = new URL(url);
      const p = u.pathname || "/";
      if (p.includes("/site/")) {
        const afterSite = p.split("/site/")[1];
        if (afterSite) {
          const parts = afterSite.split("/").slice(1);
          return parts.length === 0 || parts[0] === "" ? "/" : `/${parts.join("/")}`;
        }
      }
      return p || "/";
    } catch {
      return url || "/";
    }
  };

  const getEditorRoute = (issue?: SEOAuditIssueRecord | null): string => {
    if (!issue) return `/websites/${websiteId}/pages`;
    if (issue.editor_route) return issue.editor_route;
    const rawPath = getReadablePagePath(issue.affected_url);
    const p = (rawPath || "/").toLowerCase();
    if (p.startsWith("/blog")) return `/websites/${websiteId}/blog`;
    if (issue.category === "structured_data") return `/websites/${websiteId}/seo?tab=schema`;
    if (issue.category === "on_page") return `/websites/${websiteId}/seo?tab=pages`;
    return `/websites/${websiteId}/pages`;
  };

  // Structured list of passed SEO tests across all standard categories
  const passedChecksList = useMemo(() => {
    const checkDefinitions = [
      {
        category: "Technical SEO",
        name: "Mobile Responsive Viewport Configuration",
        description: "Valid <meta name='viewport' content='width=device-width, initial-scale=1'> detected for full mobile device compatibility.",
        issueCode: "MISSING_VIEWPORT_TAG",
      },
      {
        category: "Technical SEO",
        name: "HTTPS / SSL Protocol Encryption",
        description: "Public pages delivered securely over encrypted HTTPS connection to prevent eavesdropping.",
        issueCode: "INSECURE_HTTP_PROTOCOL",
      },
      {
        category: "Technical SEO",
        name: "HTML Language Attribute Specification",
        description: "Document declares valid language attribute (e.g. lang='en') in the root HTML tag.",
        issueCode: "MISSING_HTML_LANG",
      },
      {
        category: "Technical SEO",
        name: "Canonical Link Tag Integrity",
        description: "Canonical URLs configured to signal primary preferred page addresses to search engines.",
        issueCode: "MISSING_CANONICAL_TAG",
      },
      {
        category: "Technical SEO",
        name: "Search Engine Indexability (Robots Directives)",
        description: "Public pages allow Googlebot and search engines to index content without accidental noindex directives.",
        issueCode: "NOINDEX_PAGE_DETECTED",
      },
      {
        category: "Technical SEO",
        name: "Fast Initial Server Response Time (TTFB)",
        description: "Server responds quickly (< 800ms initial response) under standard hosting performance limits.",
        issueCode: "SLOW_SERVER_RESPONSE",
      },
      {
        category: "Technical SEO",
        name: "Zero Redirect Loops & Circular Chains",
        description: "URLs resolve cleanly without multi-hop redirect chains or infinite circular redirects.",
        issueCode: "REDIRECT_CHAIN_LOOP",
      },
      {
        category: "Technical SEO",
        name: "Clean HTTP 200 Status Codes",
        description: "Public website routes return valid 200 OK responses with zero 5xx server-side failures.",
        issueCode: "HTTP_SERVER_ERROR",
      },
      {
        category: "On-Page SEO",
        name: "Primary <title> Tag Present & Configured",
        description: "Pages contain unique title tags that identify topic and brand in search engine result snippets.",
        issueCode: "MISSING_TITLE_TAG",
      },
      {
        category: "On-Page SEO",
        name: "Search Snippet Meta Description",
        description: "Engaging meta descriptions summarize page purpose and value proposition in SERP listings.",
        issueCode: "MISSING_META_DESCRIPTION",
      },
      {
        category: "On-Page SEO",
        name: "Single Prominent <h1> Hero Heading",
        description: "Semantic heading structure includes a single prominent H1 heading for clear content hierarchy.",
        issueCode: "MISSING_H1_HEADING",
      },
      {
        category: "On-Page SEO",
        name: "Open Graph Social Graph Tags",
        description: "og:title, og:description, and og:image tags are present for rich link sharing on social networks.",
        issueCode: "MISSING_OPEN_GRAPH_TAGS",
      },
      {
        category: "On-Page SEO",
        name: "Twitter Summary Large Card Directives",
        description: "twitter:card and twitter:title configured for high-engagement rich previews on Twitter/X.",
        issueCode: "MISSING_TWITTER_CARD",
      },
      {
        category: "Content Quality",
        name: "Substantial Body Copy & Word Count",
        description: "Pages contain sufficient helpful text content (> 150 words) to satisfy visitor search intent.",
        issueCode: "THIN_CONTENT",
      },
      {
        category: "Images & Media",
        name: "Image Descriptive Alt Attributes",
        description: "Content images include descriptive alt text for screen readers and Google Image search ranking.",
        issueCode: "IMAGES_MISSING_ALT",
      },
      {
        category: "Images & Media",
        name: "Explicit Image Dimensions (CLS Prevention)",
        description: "Image elements declare explicit width and height attributes to prevent layout shifts.",
        issueCode: "IMAGES_MISSING_DIMENSIONS",
      },
      {
        category: "Links & Navigation",
        name: "Internal Crawlability & 404-Free Architecture",
        description: "Navigation menus and body links connect valid destination pages without broken links.",
        issueCode: "BROKEN_INTERNAL_LINK",
      },
      {
        category: "Structured Data",
        name: "Schema.org JSON-LD Entities",
        description: "Structured data (LocalBusiness / Organization) embedded to earn Google rich search results.",
        issueCode: "NO_SCHEMA_DETECTED",
      },
    ];

    const activeIssueCodes = new Set(realIssues.filter((i) => i.status === "open").map((i) => i.issue_code));
    return checkDefinitions.map((check) => ({
      ...check,
      passed: !activeIssueCodes.has(check.issueCode),
    }));
  }, [realIssues]);

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
            onClick={handleRunRealAudit}
            disabled={isCrawlingAudit}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-btn bg-surface border border-border text-text-primary hover:bg-surface-subtle transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCrawlingAudit ? "animate-spin text-brand" : "text-text-muted"}`} />
            <span>{isCrawlingAudit ? (crawlProgressStatus || "Auditing Website...") : "Run SEO Audit"}</span>
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
              onClick={() => handleTabChange(tab.id as TabType)}
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
                      onClick={() => handleTabChange("audit")}
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const defaults = SEOManagerService.getDefaultSchemaConfigs(websiteId);
                    setSchemas(defaults);
                    SEOManagerService.saveSchemaConfigs(websiteId, defaults);
                    showNotification("Recommended schemas enabled!");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-primary hover:bg-surface-subtle transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
                  <span>Reset Recommended</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveSchemaConfigs}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Schema Settings</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border">
              {/* Form Settings */}
              <div className="space-y-3 text-xs">
                {schemas.length === 0 ? (
                  <div className="p-8 rounded-card border-2 border-dashed border-border bg-surface-subtle text-center space-y-3">
                    <Building2 className="w-8 h-8 text-text-muted mx-auto" />
                    <div>
                      <h4 className="font-bold text-text-primary text-xs">No Active Schema Enabled</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5 max-w-sm mx-auto">
                        Add structured LocalBusiness and Organization schema to qualify for Google rich search results.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const defaults = SEOManagerService.getDefaultSchemaConfigs(websiteId);
                        setSchemas(defaults);
                        SEOManagerService.saveSchemaConfigs(websiteId, defaults);
                        showNotification("Recommended schemas enabled!");
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Enable Recommended Schemas</span>
                    </button>
                  </div>
                ) : (
                  schemas.map((schema, index) => (
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
                )))}
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

      {/* TAB 7: REAL SEO AUDIT ENGINE */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Audit Header Banner */}
          <div className="bg-surface rounded-card border border-border p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              {/* Circular Health Score Badge */}
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 font-bold shadow-xs ${
                  healthScore >= 85
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : healthScore >= 60
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}
              >
                <span className="text-2xl leading-none">{healthScore}</span>
                <span className="text-[10px] uppercase font-semibold text-text-muted mt-0.5">/ 100</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-text-primary">Website SEO Health Audit</h3>
                  {realAudit ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Live Crawl Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      Not Crawled Yet
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">
                  Real server crawler analyzing HTTP status, metadata, H1-H3 hierarchy, image alt tags, internal links, load latency, and JSON-LD schema.
                </p>
                {realAudit && (
                  <div className="flex items-center gap-3 text-[11px] text-text-muted pt-0.5">
                    <span>
                      Last Audit: <strong className="text-text-primary">{new Date(realAudit.created_at).toLocaleString()}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Pages Crawled: <strong className="text-text-primary">{realAudit.total_pages_crawled} / {realAudit.total_pages_discovered}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Duration: <strong className="text-text-primary">{(realAudit.duration_ms / 1000).toFixed(1)}s</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleRunRealAudit}
                disabled={isCrawlingAudit}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isCrawlingAudit ? "animate-spin" : ""}`} />
                <span>{isCrawlingAudit ? (crawlProgressStatus || "Crawling Website...") : "Run Full Website Audit"}</span>
              </button>
            </div>
          </div>

          {/* 4 Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => {
                setAuditSubView("issues");
                setAuditSeverityFilter("error");
              }}
              className="bg-surface rounded-card border border-border p-4 shadow-xs flex items-center gap-3 text-left hover:border-rose-300 hover:bg-rose-50/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-text-muted tracking-wider">Errors</p>
                <p className="text-xl font-bold text-rose-600">{realAudit?.error_count ?? 0}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuditSubView("issues");
                setAuditSeverityFilter("warning");
              }}
              className="bg-surface rounded-card border border-border p-4 shadow-xs flex items-center gap-3 text-left hover:border-amber-300 hover:bg-amber-50/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-text-muted tracking-wider">Warnings</p>
                <p className="text-xl font-bold text-amber-600">{realAudit?.warning_count ?? 0}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuditSubView("issues");
                setAuditSeverityFilter("notice");
              }}
              className="bg-surface rounded-card border border-border p-4 shadow-xs flex items-center gap-3 text-left hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-text-muted tracking-wider">Notices</p>
                <p className="text-xl font-bold text-blue-600">{realAudit?.notice_count ?? 0}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAuditSubView("passed")}
              className="bg-surface rounded-card border border-border p-4 shadow-xs flex items-center gap-3 text-left hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-text-muted tracking-wider">Passed Checks</p>
                <p className="text-xl font-bold text-emerald-600">{realAudit?.passed_count ?? 0}</p>
              </div>
            </button>
          </div>

          {/* 6 Category Breakdown Progress Bars */}
          {realAudit && (
            <div className="bg-surface rounded-card border border-border p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Category Score Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { label: "Technical", score: realAudit.technical_score },
                  { label: "On-Page", score: realAudit.onpage_score },
                  { label: "Content", score: realAudit.content_score },
                  { label: "Images", score: realAudit.image_score },
                  { label: "Linking", score: realAudit.linking_score },
                  { label: "Schema", score: realAudit.schema_score },
                ].map((cat) => (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-text-secondary">{cat.label}</span>
                      <span className="font-bold text-text-primary">{cat.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden border border-border/50">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat.score >= 80 ? "bg-emerald-500" : cat.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-view Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-border pb-px">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuditSubView("issues")}
                className={`px-3 py-2 text-xs font-semibold rounded-t-btn border-b-2 transition-colors flex items-center gap-1.5 ${
                  auditSubView === "issues"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Issues & Findings</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-subtle border border-border">
                  {filteredRealIssues.length}
                </span>
              </button>

              <button
                onClick={() => setAuditSubView("passed")}
                className={`px-3 py-2 text-xs font-semibold rounded-t-btn border-b-2 transition-colors flex items-center gap-1.5 ${
                  auditSubView === "passed"
                    ? "border-emerald-600 text-emerald-600 font-bold"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Passed Checks</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                  {realAudit?.passed_count ?? passedChecksList.filter(c => c.passed).length}
                </span>
              </button>

              <button
                onClick={() => setAuditSubView("pages")}
                className={`px-3 py-2 text-xs font-semibold rounded-t-btn border-b-2 transition-colors flex items-center gap-1.5 ${
                  auditSubView === "pages"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Crawled Pages</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-subtle border border-border">
                  {crawledPages.length}
                </span>
              </button>

              <button
                onClick={() => setAuditSubView("history")}
                className={`px-3 py-2 text-xs font-semibold rounded-t-btn border-b-2 transition-colors flex items-center gap-1.5 ${
                  auditSubView === "history"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Audit History</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-subtle border border-border">
                  {auditHistory.length}
                </span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: ISSUES LIST */}
          {auditSubView === "issues" && (
            <div className="space-y-4">
              {/* Filters & Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="Search findings, affected URL, or issue title..."
                    className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-btn focus:outline-none focus:ring-1 focus:ring-brand text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-surface border border-border rounded-btn p-0.5">
                    {(["all", "error", "warning", "notice"] as const).map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setAuditSeverityFilter(sev)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold uppercase transition-colors ${
                          auditSeverityFilter === sev
                            ? "bg-brand text-white shadow-2xs"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>

                  <select
                    value={auditCategoryFilter}
                    onChange={(e) => setAuditCategoryFilter(e.target.value as "all" | IssueCategory)}
                    className="px-2.5 py-1.5 bg-surface border border-border rounded-btn text-xs font-semibold text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="all">All Categories</option>
                    <option value="technical">Technical</option>
                    <option value="on_page">On-Page</option>
                    <option value="content">Content</option>
                    <option value="images">Images</option>
                    <option value="links">Links</option>
                    <option value="mobile">Mobile</option>
                    <option value="performance">Performance</option>
                    <option value="structured_data">Structured Data</option>
                  </select>

                  <select
                    value={auditStatusFilter}
                    onChange={(e) => setAuditStatusFilter(e.target.value as "all" | IssueStatus)}
                    className="px-2.5 py-1.5 bg-surface border border-border rounded-btn text-xs font-semibold text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="fixed">Fixed</option>
                    <option value="ignored">Ignored</option>
                  </select>
                </div>
              </div>

              {/* Issues List Items */}
              {filteredRealIssues.length === 0 ? (
                <div className="p-8 text-center text-xs text-emerald-700 bg-emerald-50 rounded-card border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <h4 className="font-bold text-sm">
                    {realAudit ? "No matching SEO issues found!" : "Run an audit to discover SEO issues"}
                  </h4>
                  <p className="text-text-secondary mt-1">
                    {realAudit
                      ? "All checked pages comply with current filters."
                      : "Click 'Run Full Website Audit' above to crawl your published website pages."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRealIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`bg-surface rounded-card border p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs transition-colors ${
                        issue.status === "fixed"
                          ? "border-emerald-200 bg-emerald-50/30 opacity-70"
                          : issue.status === "ignored"
                          ? "border-slate-200 bg-slate-50/50 opacity-60"
                          : "border-border"
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              issue.severity === "error"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : issue.severity === "warning"
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {issue.severity}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-subtle border border-border text-text-secondary uppercase">
                            {issue.category.replace("_", " ")}
                          </span>

                          <span className="font-bold text-text-primary text-sm">{issue.title}</span>

                          {/* PROMINENT PAGE BADGE */}
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold">
                            <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Page: {getReadablePagePath(issue.affected_url)}</span>
                          </div>

                          {issue.status !== "open" && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                issue.status === "fixed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {issue.status}
                            </span>
                          )}
                        </div>

                        <p className="text-text-primary font-medium">{issue.finding}</p>

                        {/* HIGHLIGHTED RECOMMENDED FIX BOX */}
                        <div className="p-2.5 rounded-md bg-surface-subtle border border-border/80 flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-text-primary">
                              Recommended Fix for {getReadablePagePath(issue.affected_url)}:
                            </span>{" "}
                            <span className="text-text-secondary">{issue.recommended_fix}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                        <Link
                          href={getEditorRoute(issue)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-brand text-white hover:bg-brand-hover shadow-2xs transition-colors shrink-0"
                        >
                          <span>Fix in Editor</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {issue.status === "open" ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateIssueStatus(issue.id, "fixed")}
                              className="px-2.5 py-2 text-[11px] font-semibold rounded border border-border hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              title="Mark issue as fixed"
                            >
                              Mark Fixed
                            </button>
                            <button
                              onClick={() => handleUpdateIssueStatus(issue.id, "ignored")}
                              className="px-2 py-2 text-[11px] text-text-muted hover:text-rose-600 transition-colors"
                              title="Ignore this issue"
                            >
                              Ignore
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateIssueStatus(issue.id, "open")}
                            className="px-2.5 py-2 text-[11px] font-semibold rounded border border-border hover:bg-surface-subtle transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW: PASSED CHECKS LIST */}
          {auditSubView === "passed" && (
            <div className="bg-surface rounded-card border border-border p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified SEO Standards & Passed Checks</span>
                  </h4>
                  <p className="text-xs text-text-secondary">
                    All technical, on-page, image, schema, and mobile requirements successfully verified during the audit.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {passedChecksList.filter((c) => c.passed).length} of {passedChecksList.length} Categories Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {passedChecksList.map((check, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
                      check.passed
                        ? "bg-emerald-50/40 border-emerald-200 text-emerald-950"
                        : "bg-amber-50/40 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {check.passed ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-text-primary">{check.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            check.passed
                              ? "bg-emerald-200/60 text-emerald-800"
                              : "bg-amber-200/60 text-amber-800"
                          }`}
                        >
                          {check.passed ? "Passed" : "Action Needed"}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{check.description}</p>
                      <div className="pt-0.5">
                        <span className="text-[10px] uppercase font-semibold text-text-muted">
                          Category: {check.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: CRAWLED PAGES TABLE */}
          {auditSubView === "pages" && (
            <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle text-text-secondary uppercase tracking-wider font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Page URL / Path</th>
                      <th className="px-4 py-3">HTTP Status</th>
                      <th className="px-4 py-3">Page SEO Score</th>
                      <th className="px-4 py-3">Load Time</th>
                      <th className="px-4 py-3">Headings</th>
                      <th className="px-4 py-3">Word Count</th>
                      <th className="px-4 py-3">Images (Missing Alt)</th>
                      <th className="px-4 py-3">Schema Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {crawledPages.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                          No crawled pages on record. Run a full website audit to crawl internal URLs.
                        </td>
                      </tr>
                    ) : (
                      crawledPages.map((page) => (
                        <tr key={page.id} className="hover:bg-surface-subtle/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-text-primary">{page.title || "Untitled Page"}</div>
                            <div className="font-mono text-[11px] text-text-muted">{page.path}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                page.http_status >= 200 && page.http_status < 300
                                  ? "bg-emerald-100 text-emerald-800"
                                  : page.http_status >= 300 && page.http_status < 400
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {page.http_status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-bold ${
                                page.page_score >= 80
                                  ? "text-emerald-600"
                                  : page.page_score >= 60
                                  ? "text-amber-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {page.page_score}/100
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-secondary font-mono text-[11px]">
                            {page.load_time_ms}ms
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            H1: <strong className="text-text-primary">{page.h1_count}</strong> | H2: <strong className="text-text-primary">{page.h2_count}</strong>
                          </td>
                          <td className="px-4 py-3 text-text-secondary font-mono text-[11px]">
                            {page.word_count} words
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                page.images_missing_alt > 0
                                  ? "text-rose-600 font-bold"
                                  : "text-emerald-600 font-medium"
                              }
                            >
                              {page.images_count} ({page.images_missing_alt} missing)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-muted text-[11px]">
                            {page.schema_types?.length > 0 ? page.schema_types.join(", ") : "None"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: AUDIT HISTORY TABLE */}
          {auditSubView === "history" && (
            <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle text-text-secondary uppercase tracking-wider font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Audit Date & Time</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Overall Health Score</th>
                      <th className="px-4 py-3">Pages Crawled</th>
                      <th className="px-4 py-3">Errors / Warnings</th>
                      <th className="px-4 py-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                          No previous audit runs found in database history.
                        </td>
                      </tr>
                    ) : (
                      auditHistory.map((hist) => (
                        <tr key={hist.id} className="hover:bg-surface-subtle/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-text-primary">
                            {new Date(hist.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                hist.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : hist.status === "failed"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {hist.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-text-primary">
                            <span
                              className={
                                hist.overall_score >= 80
                                  ? "text-emerald-600"
                                  : hist.overall_score >= 60
                                  ? "text-amber-600"
                                  : "text-rose-600"
                              }
                            >
                              {hist.overall_score}/100
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {hist.total_pages_crawled} / {hist.total_pages_discovered}
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            <span className="text-rose-600 font-bold">{hist.error_count} Errors</span> •{" "}
                            <span className="text-amber-600 font-bold">{hist.warning_count} Warnings</span>
                          </td>
                          <td className="px-4 py-3 text-text-muted font-mono text-[11px]">
                            {(hist.duration_ms / 1000).toFixed(1)}s
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
