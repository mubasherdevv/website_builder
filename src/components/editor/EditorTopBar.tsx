"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Globe,
  ExternalLink,
} from "lucide-react";

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export interface EditorTopBarProps {
  websiteName: string;
  websiteId?: string;
  backHref?: string;
  pageTitle: string;
  viewport: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  saveStatus: SaveStatus;
  isPreview: boolean;
  onTogglePreview: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  websiteName,
  websiteId,
  backHref,
  pageTitle,
  viewport,
  onViewportChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  saveStatus,
  isPreview,
  onTogglePreview,
  onPublish,
  isPublishing = false,
}) => {
  // Derive back destination URL (default to /websites/[websiteId]/overview)
  let resolvedBackHref = backHref || "/dashboard";
  if (!backHref) {
    if (websiteId) {
      resolvedBackHref = `/websites/${websiteId}/overview`;
    } else if (typeof window !== "undefined") {
      const match = window.location.pathname.match(/\/websites\/([^/]+)/);
      if (match && match[1]) {
        resolvedBackHref = `/websites/${match[1]}/overview`;
      }
    } else if (websiteName.includes(":")) {
      const extracted = websiteName.split(":")[1].trim();
      if (extracted) resolvedBackHref = `/websites/${extracted}/overview`;
    }
  }

  // Subdomain resolution for live site link
  const [liveSubdomain, setLiveSubdomain] = useState<string>("");

  useEffect(() => {
    let activeId = websiteId;
    if (!activeId && typeof window !== "undefined") {
      const match = window.location.pathname.match(/\/websites\/([^/]+)/);
      if (match && match[1]) activeId = match[1];
    }
    if (activeId) {
      fetch(`/api/websites/${activeId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data?.website?.subdomain) {
            setLiveSubdomain(data.website.subdomain);
          }
        })
        .catch(() => {});
    }
  }, [websiteId]);

  const getLiveWebsiteUrl = () => {
    const isLocal = typeof window !== "undefined" && window.location.hostname.includes("localhost");
    const sub = liveSubdomain || websiteId || "site";
    const cleanSub = sub
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\.securesite\.io$/, "")
      .replace(/\.localhost.*$/, "")
      .replace(/:[0-9]+$/, "");

    if (isLocal) {
      const port = window.location.port ? `:${window.location.port}` : ":3000";
      return `http://${cleanSub}.localhost${port}`;
    }
    return `https://${cleanSub}.securesite.io`;
  };

  return (
    <header className="h-16 w-full bg-surface border-b border-border px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Left section: Back + Page Info */}
      <div className="flex items-center gap-4">
        <Link
          href={resolvedBackHref}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand transition-colors p-1.5 rounded-md hover:bg-surface-subtle"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-5 w-px bg-border hidden sm:block" />

        <div className="flex flex-col">
          <span className="text-xs font-bold text-text-primary tracking-tight">
            {websiteName}
          </span>
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            Editing: <strong className="text-text-secondary font-medium">{pageTitle}</strong>
          </span>
        </div>
      </div>

      {/* Center: Undo/Redo + Viewport controls */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-surface-subtle p-1 rounded-btn border border-border">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-surface transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-surface transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport switchers */}
        <div className="hidden md:flex items-center bg-surface-subtle p-1 rounded-btn border border-border">
          <button
            type="button"
            onClick={() => onViewportChange("desktop")}
            title="Desktop view (100%)"
            className={`p-1.5 rounded transition-colors ${
              viewport === "desktop"
                ? "bg-surface text-brand shadow-sm font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewportChange("tablet")}
            title="Tablet view (768px)"
            className={`p-1.5 rounded transition-colors ${
              viewport === "tablet"
                ? "bg-surface text-brand shadow-sm font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewportChange("mobile")}
            title="Mobile view (375px)"
            className={`p-1.5 rounded transition-colors ${
              viewport === "mobile"
                ? "bg-surface text-brand shadow-sm font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Save status pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-surface border border-border">
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              <span className="text-text-muted">Saved</span>
            </>
          )}
          {saveStatus === "saving" && (
            <>
              <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
              <span className="text-text-muted">Saving...</span>
            </>
          )}
          {saveStatus === "unsaved" && (
            <>
              <Clock className="w-3.5 h-3.5 text-status-warning" />
              <span className="text-status-warning font-medium">Unsaved</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-status-danger" />
              <span className="text-status-danger font-medium">Save failed</span>
            </>
          )}
        </div>
      </div>

      {/* Right actions: Preview toggle + Live Website Link + Publish */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTogglePreview}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-btn border transition-colors ${
            isPreview
              ? "bg-brand text-white border-brand"
              : "bg-surface text-text-primary border-border hover:bg-surface-subtle"
          }`}
          title="Toggle Canvas Preview"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isPreview ? "Edit Mode" : "Preview"}</span>
        </button>

        {/* Live Website Button */}
        <a
          href={getLiveWebsiteUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-btn border border-brand/30 bg-mint/40 text-brand hover:bg-mint/70 hover:border-brand/50 transition-colors shadow-2xs"
          title="Open Published Live Website"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Live Website</span>
          <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
        </a>

        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-btn transition-colors shadow-sm"
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UploadCloud className="w-3.5 h-3.5" />
          )}
          <span>{isPublishing ? "Publishing..." : "Publish"}</span>
        </button>
      </div>
    </header>
  );
};

