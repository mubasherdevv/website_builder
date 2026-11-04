"use client";

import React, { useState } from "react";
import { MediaAssetItem } from "@/types/cms";
import {
  UploadCloud,
  Search,
  Trash2,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

interface MediaPageProps {
  params: {
    websiteId: string;
  };
}

export default function MediaLibraryPage({ params }: MediaPageProps) {
  const { websiteId } = params;

  const [assets, setAssets] = useState<MediaAssetItem[]>([
    {
      id: "media_1",
      websiteId,
      filename: "roof-inspection-austin.jpg",
      url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      fileSize: 420000,
      mimeType: "image/jpeg",
      altText: "Austin licensed technician inspecting residential shingles",
      createdAt: "Oct 24, 2026",
    },
    {
      id: "media_2",
      websiteId,
      filename: "agency-dashboard-analytics.png",
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      fileSize: 280000,
      mimeType: "image/png",
      altText: "Local geo-grid rank performance report graph",
      createdAt: "Oct 28, 2026",
    },
    {
      id: "media_3",
      websiteId,
      filename: "commercial-restaurant-kitchen.jpg",
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      fileSize: 512000,
      mimeType: "image/jpeg",
      altText: "Chef preparing wood-fired seasonal dishes",
      createdAt: "Nov 01, 2026",
    },
  ]);

  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filteredAssets = assets.filter(
    (a) =>
      a.filename.toLowerCase().includes(search.toLowerCase()) ||
      a.altText.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type per PRD.md Section 10.4
    const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedMime.includes(file.type)) {
      setUploadError("Only JPEG, PNG, WebP, or SVG images are allowed.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit.");
      return;
    }

    const newAsset: MediaAssetItem = {
      id: `media_${Math.random().toString(36).substring(2, 9)}`,
      websiteId,
      filename: file.name,
      url: URL.createObjectURL(file),
      fileSize: file.size,
      mimeType: file.type,
      altText: file.name.replace(/\.[^/.]+$/, ""),
      createdAt: "Just now",
    };

    setAssets([newAsset, ...assets]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Media Library
          </h1>
          <p className="text-xs text-text-secondary">
            Upload and manage images and assets for website: {websiteId}.
          </p>
        </div>

        <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMockUpload}
          />
        </label>
      </div>

      {uploadError && (
        <div className="p-3 rounded-btn bg-status-danger-soft text-status-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-surface p-3 rounded-card border border-border flex items-center justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-btn bg-surface-subtle border border-border focus:outline-none focus:border-brand"
          />
        </div>
        <span className="text-xs text-text-muted font-medium">
          Total Assets: {assets.length}
        </span>
      </div>

      {/* Grid of Media Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-surface rounded-card border border-border overflow-hidden shadow-xs flex flex-col justify-between group"
          >
            {/* Image Preview */}
            <div className="h-44 bg-surface-subtle relative overflow-hidden border-b border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.altText}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
              />
            </div>

            {/* Asset Details */}
            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary truncate max-w-[200px]" title={asset.filename}>
                  {asset.filename}
                </span>
                <span className="text-[10px] text-text-muted font-mono uppercase">
                  {(asset.fileSize / 1024).toFixed(0)} KB
                </span>
              </div>

              <div>
                <label className="text-[10px] text-text-muted block font-semibold">
                  Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  value={asset.altText}
                  onChange={(e) => {
                    const updated = assets.map((a) =>
                      a.id === asset.id ? { ...a, altText: e.target.value } : a
                    );
                    setAssets(updated);
                  }}
                  className="w-full mt-0.5 px-2.5 py-1 text-[11px] rounded bg-surface-subtle border border-border focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-text-muted">
                <span className="text-[10px]">{asset.createdAt}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className="p-1.5 rounded hover:bg-surface-subtle text-text-secondary hover:text-brand transition-colors"
                    title="Copy Image URL"
                  >
                    {copiedId === asset.id ? (
                      <Check className="w-3.5 h-3.5 text-status-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 rounded hover:bg-status-danger-soft text-text-secondary hover:text-status-danger transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

