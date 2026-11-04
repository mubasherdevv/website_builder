"use client";

import React, { useState } from "react";
import { CMSPageItem } from "@/types/cms";
import { PageRenderer } from "@/builder/renderer/PageRenderer";
import { emeraldForestPreset } from "@/themes/presets";
import {
  X,
  Smartphone,
  Tablet,
  Monitor,
  Edit3,
} from "lucide-react";
import Link from "next/link";

interface PagePreviewModalProps {
  page: CMSPageItem | null;
  isOpen: boolean;
  onClose: () => void;
  websiteId: string;
}

export const PagePreviewModal: React.FC<PagePreviewModalProps> = ({
  page,
  isOpen,
  onClose,
  websiteId,
}) => {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  if (!isOpen || !page || !page.document) return null;

  const deviceWidths = {
    desktop: "w-full",
    tablet: "w-[768px] max-w-full",
    mobile: "w-[375px] max-w-full",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-surface rounded-card border border-border shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-text-primary">{page.title}</h3>
                <span className="font-mono text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                  {page.slug}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    page.status === "published"
                      ? "bg-status-success-soft text-status-success"
                      : "bg-status-warning-soft text-status-warning"
                  }`}
                >
                  {page.status}
                </span>
              </div>
            </div>
          </div>

          {/* Viewport switchers */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-btn border border-border">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded text-xs transition-colors ${
                device === "desktop" ? "bg-brand text-white shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded text-xs transition-colors ${
                device === "tablet" ? "bg-brand text-white shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded text-xs transition-colors ${
                device === "mobile" ? "bg-brand text-white shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/websites/${websiteId}/editor/${page.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Page</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas viewport container */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 overflow-y-auto flex justify-center items-start">
          <div
            className={`transition-all duration-200 bg-surface rounded-xl shadow-lg border border-border overflow-hidden ${deviceWidths[device]}`}
          >
            <PageRenderer
              document={page.document}
              theme={emeraldForestPreset}
              mode="public"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
