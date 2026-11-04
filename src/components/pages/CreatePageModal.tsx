"use client";

import React, { useState, useEffect } from "react";
import { PageType } from "@/types/cms";
import { PAGE_TEMPLATES, listPageTemplates } from "@/builder/templates/page-templates";
import { NavigationManagerService } from "@/lib/services/navigation-manager.service";
import { WebsiteMenu, NavigationItem } from "@/types/navigation";
import {
  X,
  Sparkles,
  Check,
  FileText,
  Compass,
  ArrowRight,
  ArrowLeft,
  Home,
  Users,
  Wrench,
  DollarSign,
  Phone,
  HelpCircle,
  Star,
  Camera,
  MapPin,
  Plus,
} from "lucide-react";

interface CreatePageModalProps {
  isOpen: boolean;
  websiteId?: string;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    slug: string;
    pageType: PageType;
    description: string;
    status: "draft" | "published";
    inNavigation: boolean;
    navLabel: string;
    navMenuId?: string;
    navParentId?: string | null;
    seo: {
      title: string;
      description: string;
      canonicalUrl: string;
      noIndex: boolean;
      ogTitle: string;
      ogDescription: string;
      focusKeyword: string;
    };
  }) => void;
  error?: string | null;
}

export const CreatePageModal: React.FC<CreatePageModalProps> = ({
  isOpen,
  websiteId,
  onClose,
  onSubmit,
  error,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<PageType>("services");
  const [title, setTitle] = useState("New Services Page");
  const [slug, setSlug] = useState("/services");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [inNavigation, setInNavigation] = useState(false);
  const [navLabel, setNavLabel] = useState("");

  // Navigation Menus & Hierarchy
  const [menus, setMenus] = useState<WebsiteMenu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  useEffect(() => {
    if (isOpen && websiteId) {
      const siteMenus = NavigationManagerService.getMenus(websiteId);
      setMenus(siteMenus);
      if (siteMenus.length > 0) {
        const headerMenu = siteMenus.find((m) => m.location === "header") || siteMenus[0];
        setSelectedMenuId(headerMenu.id);
      }
    }
  }, [isOpen, websiteId]);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noIndex, setNoIndex] = useState(false);

  if (!isOpen) return null;

  const templates = listPageTemplates();

  const handleSelectTemplate = (type: PageType) => {
    setSelectedType(type);
    const tmpl = PAGE_TEMPLATES[type];
    setTitle(tmpl.defaultTitle);
    setSlug(tmpl.defaultSlug);
    setDescription(tmpl.description);
    setNavLabel(tmpl.defaultTitle);
    setSeoTitle(`${tmpl.defaultTitle} | SecureSite Studio`);
    setMetaDesc(tmpl.description);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!navLabel || navLabel === title) {
      setNavLabel(val);
    }
    const clean = "/" + val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSlug(clean);
    if (!seoTitle || seoTitle.startsWith(title)) {
      setSeoTitle(`${val} | SecureSite Studio`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      slug,
      pageType: selectedType,
      description,
      status,
      inNavigation,
      navLabel: navLabel || title,
      navMenuId: inNavigation ? selectedMenuId : undefined,
      navParentId: inNavigation && selectedParentId ? selectedParentId : null,
      seo: {
        title: seoTitle || `${title} | SecureSite Studio`,
        description: metaDesc || description,
        canonicalUrl,
        noIndex,
        ogTitle: seoTitle || title,
        ogDescription: metaDesc || description,
        focusKeyword,
      },
    });
  };

  // Get active menu items for parent dropdown
  const activeMenu = menus.find((m) => m.id === selectedMenuId) || menus[0];
  const flatMenuItems: NavigationItem[] = activeMenu
    ? NavigationManagerService.flattenItems(activeMenu.items).filter((i) => i.level < 3)
    : [];

  const renderIcon = (type: PageType) => {
    switch (type) {
      case "home":
        return <Home className="w-5 h-5" />;
      case "about":
        return <Users className="w-5 h-5" />;
      case "services":
        return <Wrench className="w-5 h-5" />;
      case "service_detail":
        return <FileText className="w-5 h-5" />;
      case "pricing":
        return <DollarSign className="w-5 h-5" />;
      case "team":
        return <Users className="w-5 h-5" />;
      case "contact":
        return <Phone className="w-5 h-5" />;
      case "faq":
        return <HelpCircle className="w-5 h-5" />;
      case "testimonials":
        return <Star className="w-5 h-5" />;
      case "gallery":
        return <Camera className="w-5 h-5" />;
      case "locations":
        return <MapPin className="w-5 h-5" />;
      case "custom":
      default:
        return <Plus className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-surface rounded-card border border-border shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Create New Page</h3>
              <p className="text-[11px] text-text-secondary">
                Step {step} of 3 — {step === 1 ? "Choose Page Template" : step === 2 ? "Page Details & Navigation" : "Search Engine Optimization (SEO)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-3 border-b border-border bg-surface text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              step === 1
                ? "border-brand text-brand bg-brand-soft/30"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] flex items-center justify-center">1</span>
            <span>Template</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              step === 2
                ? "border-brand text-brand bg-brand-soft/30"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] flex items-center justify-center">2</span>
            <span>Page Details</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              step === 3
                ? "border-brand text-brand bg-brand-soft/30"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] flex items-center justify-center">3</span>
            <span>SEO & Social</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-btn bg-status-danger-soft text-status-danger border border-status-danger/30">
              {error}
            </div>
          )}

          {/* STEP 1: TEMPLATE SELECTION (12 Templates) */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Select a Blueprint Template
                </h4>
                <p className="text-[11px] text-text-muted">
                  Choose from 12 pre-architected layouts with pre-configured sections. You can fully customize every section afterward.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {templates.map((tmpl) => {
                  const isSelected = selectedType === tmpl.type;
                  return (
                    <div
                      key={tmpl.type}
                      onClick={() => handleSelectTemplate(tmpl.type)}
                      className={`p-3.5 rounded-card border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-brand bg-brand-soft/40 shadow-xs ring-1 ring-brand"
                          : "border-border hover:border-brand/40 bg-surface hover:bg-surface-subtle"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-brand text-white"
                                : "bg-surface-subtle text-text-primary"
                            }`}
                          >
                            {renderIcon(tmpl.type)}
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-text-primary">{tmpl.name}</h5>
                        <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2">
                          {tmpl.description}
                        </p>
                      </div>
                      <div className="pt-2 text-[10px] font-mono text-text-muted">
                        Default: {tmpl.defaultSlug}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PAGE DETAILS & NAVIGATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Page Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Residential Roofing Services"
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                  <p className="text-[10px] text-text-muted mt-1">
                    Internal name visible across pages list and workspace navigation.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 text-xs bg-surface-subtle border border-r-0 border-border text-text-muted rounded-l-btn">
                      /
                    </span>
                    <input
                      required
                      type="text"
                      value={slug.startsWith("/") ? slug.slice(1) : slug}
                      onChange={(e) => setSlug("/" + e.target.value.toLowerCase().replace(/[^a-z0-9/_-]+/g, "-"))}
                      placeholder="services"
                      className="w-full px-3 py-2 text-xs font-mono rounded-r-btn border border-border bg-surface focus:outline-none focus:border-brand"
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">
                    Target URL: <code className="text-brand font-mono">{slug || "/"}</code>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Page Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary of this page's purpose..."
                  className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  >
                    <option value="draft">Draft (Work in Progress)</option>
                    <option value="published">Published (Live Online)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Selected Blueprint Template
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-btn border border-border bg-surface-subtle text-xs">
                    {renderIcon(selectedType)}
                    <span className="font-semibold text-text-primary">
                      {PAGE_TEMPLATES[selectedType]?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="ml-auto text-[10px] text-brand hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="p-4 rounded-card border border-border bg-surface-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-brand" />
                    <div>
                      <h5 className="text-xs font-bold text-text-primary">
                        Add this page to navigation
                      </h5>
                      <p className="text-[10px] text-text-secondary">
                        Optionally place this new page into an existing header or footer navigation menu.
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
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>

                {inNavigation && (
                  <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-text-primary mb-1">
                        Select Navigation Menu
                      </label>
                      <select
                        value={selectedMenuId}
                        onChange={(e) => {
                          setSelectedMenuId(e.target.value);
                          setSelectedParentId("");
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                      >
                        {menus.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-text-primary mb-1">
                        Select Parent Menu Item
                      </label>
                      <select
                        value={selectedParentId}
                        onChange={(e) => setSelectedParentId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                      >
                        <option value="">-- Top Level (No Parent) --</option>
                        {flatMenuItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.level === 2 ? "└─ " : ""}{item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-text-primary mb-1">
                        Menu Link Label
                      </label>
                      <input
                        type="text"
                        value={navLabel}
                        onChange={(e) => setNavLabel(e.target.value)}
                        placeholder="e.g. Services"
                        className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SEO & SOCIAL SETTINGS */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    SEO Page Title
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      seoTitle.length >= 30 && seoTitle.length <= 60
                        ? "text-status-success font-semibold"
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
                  placeholder="e.g. Dependable Roofing Contractors | Austin, TX"
                  className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Meta Description
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      metaDesc.length >= 70 && metaDesc.length <= 160
                        ? "text-status-success font-semibold"
                        : "text-text-muted"
                    }`}
                  >
                    {metaDesc.length} / 160 chars (Recommended: 70-160)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="e.g. Looking for trusted local roofers? We offer 24/7 emergency repairs and new installations backed by warranties."
                  className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Primary Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g. roofing services"
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Canonical URL (Optional)
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

              {/* Robots & Indexing */}
              <div className="flex items-center justify-between p-3 rounded-btn border border-border bg-surface-subtle">
                <div>
                  <h6 className="text-xs font-semibold text-text-primary">Search Engine Indexing</h6>
                  <p className="text-[10px] text-text-muted">
                    Prevent search engines from indexing this page in search results.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                  <input
                    type="checkbox"
                    checked={noIndex}
                    onChange={(e) => setNoIndex(e.target.checked)}
                    className="rounded text-brand focus:ring-brand"
                  />
                  <span>noindex</span>
                </label>
              </div>

              {/* Google SERP Live Snippet Preview */}
              <div className="p-4 rounded-card border border-border bg-surface space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Google Search Snippet Preview
                </span>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-emerald-800 font-mono">
                    https://mysite.securesite.io{slug || "/"}
                  </p>
                  <h6 className="text-sm font-semibold text-blue-700 hover:underline truncate">
                    {seoTitle || title || "Page Title"}
                  </h6>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {metaDesc || description || "Add a meta description to display a summary in search results..."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-subtle">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-btn border border-border bg-surface text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create & Configure Page</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
