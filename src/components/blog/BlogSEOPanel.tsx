"use client";

import React, { useState } from "react";
import { BlogPostSEO, StructuredRichTextJSON } from "@/types/blog";
import { computeBlogSEOHealth } from "@/lib/services/blog-manager.service";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Smartphone,
  Monitor,
  Share2,
} from "lucide-react";

interface BlogSEOPanelProps {
  seo: BlogPostSEO;
  title: string;
  slug: string;
  excerpt: string;
  content: StructuredRichTextJSON;
  onChange: (updated: BlogPostSEO) => void;
}

export const BlogSEOPanel: React.FC<BlogSEOPanelProps> = ({
  seo,
  title,
  slug,
  excerpt,
  content,
  onChange,
}) => {
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");

  const metaTitle = seo.metaTitle || title;
  const metaDescription = seo.metaDescription || excerpt;
  const focusKeyword = seo.focusKeyword || "";
  const canonicalUrl = seo.canonicalUrl || "";
  const noIndex = seo.noIndex || false;
  const ogTitle = seo.ogTitle || metaTitle;
  const ogDescription = seo.ogDescription || metaDescription;
  const ogImage = seo.ogImage || "";

  const seoHealth = computeBlogSEOHealth(seo, title, content);

  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  const kwInTitle = focusKeyword && metaTitle.toLowerCase().includes(focusKeyword.toLowerCase());
  const kwInDesc = focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase());

  return (
    <div className="space-y-6">
      {/* SEO Health Scorecard Banner */}
      <div className="p-4 rounded-card border border-border bg-surface-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {seoHealth === "good" ? (
            <div className="w-9 h-9 rounded-full bg-status-success/10 text-status-success flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : seoHealth === "warning" ? (
            <div className="w-9 h-9 rounded-full bg-status-warning/10 text-status-warning flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-status-danger/10 text-status-danger flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-text-primary">
                SEO Health Score:{" "}
                <span
                  className={
                    seoHealth === "good"
                      ? "text-status-success uppercase"
                      : seoHealth === "warning"
                      ? "text-status-warning uppercase"
                      : "text-status-danger uppercase"
                  }
                >
                  {seoHealth}
                </span>
              </h4>
            </div>
            <p className="text-[11px] text-text-muted">
              {seoHealth === "good"
                ? "Optimal title and description length with target keyword alignment."
                : seoHealth === "warning"
                ? "Review character guidance or ensure target keyword is included in both title and description."
                : "Missing meta title or meta description. Fill in the fields below."}
            </p>
          </div>
        </div>

        {/* Quick Check Indicators */}
        <div className="flex items-center gap-3 text-[11px] text-text-secondary bg-surface p-2 rounded-btn border border-border">
          <span className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                titleLength >= 25 && titleLength <= 65 ? "bg-status-success" : "bg-status-warning"
              }`}
            />
            Title: {titleLength}/60
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                descLength >= 50 && descLength <= 165 ? "bg-status-success" : "bg-status-warning"
              }`}
            />
            Desc: {descLength}/160
          </span>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="space-y-4">
        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-text-primary">
              Meta Title (Search Heading)
            </label>
            <span
              className={`text-[10px] font-mono ${
                titleLength >= 25 && titleLength <= 65
                  ? "text-status-success font-semibold"
                  : "text-text-muted"
              }`}
            >
              {titleLength} / 60 characters
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
            placeholder="e.g. 5 Spring Roofing Inspection Checks | Texas Guide"
            className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-text-primary">
              Meta Description (Search Snippet)
            </label>
            <span
              className={`text-[10px] font-mono ${
                descLength >= 50 && descLength <= 165
                  ? "text-status-success font-semibold"
                  : "text-text-muted"
              }`}
            >
              {descLength} / 160 characters
            </span>
          </div>
          <textarea
            rows={3}
            value={metaDescription}
            onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
            placeholder="Concise overview explaining value proposition and encouraging search clicks..."
            className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
          />
        </div>

        {/* Focus Keyword & Canonical URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-primary">
                Primary Focus Keyword
              </label>
              {focusKeyword && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className={kwInTitle ? "text-status-success" : "text-text-muted"}>
                    Title: {kwInTitle ? "✓" : "✗"}
                  </span>
                  <span className={kwInDesc ? "text-status-success" : "text-text-muted"}>
                    Desc: {kwInDesc ? "✓" : "✗"}
                  </span>
                </div>
              )}
            </div>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => onChange({ ...seo, focusKeyword: e.target.value })}
              placeholder="e.g. roofing inspection"
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
              onChange={(e) => onChange({ ...seo, canonicalUrl: e.target.value })}
              placeholder={`https://mysite.securesite.io/blog/${slug || "post"}`}
              className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand font-mono"
            />
          </div>
        </div>

        {/* Open Graph (Social Sharing) Title & Image */}
        <div className="pt-2 border-t border-border space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <Share2 className="w-4 h-4 text-brand" />
            <span>Social Sharing (Open Graph) Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Open Graph Title
              </label>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => onChange({ ...seo, ogTitle: e.target.value })}
                placeholder={metaTitle}
                className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Social Share Image (OG Image URL)
              </label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => onChange({ ...seo, ogImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Open Graph Description
            </label>
            <input
              type="text"
              value={ogDescription}
              onChange={(e) => onChange({ ...seo, ogDescription: e.target.value })}
              placeholder={metaDescription}
              className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Robots Index / Noindex */}
        <div className="flex items-center justify-between p-3.5 rounded-btn border border-border bg-surface-subtle">
          <div>
            <h6 className="text-xs font-semibold text-text-primary">
              Search Engine Indexing Policy
            </h6>
            <p className="text-[10px] text-text-muted">
              When checked, instructs crawlers not to index this article via &lt;meta name=&quot;robots&quot; content=&quot;noindex&quot; /&gt;.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
            <input
              type="checkbox"
              checked={noIndex}
              onChange={(e) => onChange({ ...seo, noIndex: e.target.checked })}
              className="rounded text-brand focus:ring-brand"
            />
            <span>Apply noindex</span>
          </label>
        </div>
      </div>

      {/* Google SERP Snippet Preview */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <Search className="w-3.5 h-3.5 text-brand" />
            <span>Google Search Result Snippet Preview</span>
          </div>

          <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-btn border border-border text-xs">
            <button
              type="button"
              onClick={() => setSerpDevice("desktop")}
              className={`p-1 rounded cursor-pointer transition-colors ${
                serpDevice === "desktop" ? "bg-surface shadow-xs text-brand font-bold" : "text-text-muted"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSerpDevice("mobile")}
              className={`p-1 rounded cursor-pointer transition-colors ${
                serpDevice === "mobile" ? "bg-surface shadow-xs text-brand font-bold" : "text-text-muted"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          className={`p-4 rounded-card border border-border bg-surface shadow-xs transition-all ${
            serpDevice === "mobile" ? "max-w-sm" : "w-full"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-text-primary font-medium leading-none">
                SecureSite
              </span>
              <span className="text-[10px] text-text-muted font-mono leading-tight">
                https://mysite.securesite.io &gt; blog &gt; {slug || "post"}
              </span>
            </div>
          </div>

          <h5 className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer truncate">
            {metaTitle || "Article Title"}
          </h5>

          <p className="text-xs text-[#4d5156] line-clamp-2 mt-0.5 leading-snug">
            {metaDescription || "Article snippet will display here in search engine rankings."}
          </p>
        </div>
      </div>
    </div>
  );
};

