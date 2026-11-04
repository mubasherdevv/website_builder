"use client";

import React, { useState } from "react";
import { BlogTag } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import {
  X,
  Tag as TagIcon,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface TagManagerModalProps {
  websiteId: string;
  isOpen: boolean;
  onClose: () => void;
  onTagsUpdated: () => void;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  websiteId,
  isOpen,
  onClose,
  onTagsUpdated,
}) => {
  const [tags, setTags] = useState<BlogTag[]>(() =>
    BlogManagerService.getTags(websiteId)
  );
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    const updated = BlogManagerService.getTags(websiteId);
    setTags(updated);
    onTagsUpdated();
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = BlogManagerService.createTag(websiteId, name.trim());
    if (!res.success) {
      setError(res.error || "Failed to create tag.");
      return;
    }

    setName("");
    setError(null);
    refreshList();
  };

  const handleDeleteTag = (id: string) => {
    BlogManagerService.deleteTag(websiteId, id);
    setError(null);
    refreshList();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-card border border-border shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-brand" />
            <div>
              <h3 className="font-bold text-sm text-text-primary">Tag Management</h3>
              <p className="text-xs text-text-muted">
                Manage granular keyword tags applied to your blog articles.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-btn bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Add Tag Form */}
          <form onSubmit={handleCreateTag} className="flex gap-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new tag name (e.g. warranties)..."
              className="flex-1 px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tag</span>
            </button>
          </form>

          {/* Tag Badges List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary">
              Active Tags ({tags.length})
            </h4>

            {tags.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">
                No tags created yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-surface-subtle border border-border text-text-primary hover:border-brand/40 transition-colors"
                  >
                    <span className="font-medium">#{tag.name}</span>
                    <button
                      type="button"
                      title="Remove tag"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-text-muted hover:text-status-danger p-0.5 rounded-full cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-border bg-surface-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

