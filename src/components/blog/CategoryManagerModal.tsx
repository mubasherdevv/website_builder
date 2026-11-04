"use client";

import React, { useState } from "react";
import { BlogCategory } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import {
  X,
  FolderPlus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";

interface CategoryManagerModalProps {
  websiteId: string;
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  websiteId,
  isOpen,
  onClose,
  onCategoriesUpdated,
}) => {
  const [categories, setCategories] = useState<BlogCategory[]>(() =>
    BlogManagerService.getCategories(websiteId)
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    const updated = BlogManagerService.getCategories(websiteId);
    setCategories(updated);
    onCategoriesUpdated();
  };

  const handleStartEdit = (cat: BlogCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      const res = BlogManagerService.updateCategory(websiteId, editingId, {
        name,
        slug,
        description,
      });
      if (!res.success) {
        setError(res.error || "Failed to update category.");
        return;
      }
    } else {
      const res = BlogManagerService.createCategory(websiteId, {
        name,
        slug,
        description,
      });
      if (!res.success) {
        setError(res.error || "Failed to create category.");
        return;
      }
    }

    handleCancelEdit();
    refreshList();
  };

  const handleDelete = (id: string) => {
    const res = BlogManagerService.deleteCategory(websiteId, id);
    if (!res.success) {
      setError(res.error || "Failed to delete category.");
      return;
    }
    setError(null);
    refreshList();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-card border border-border shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-brand" />
            <div>
              <h3 className="font-bold text-sm text-text-primary">
                Category Management
              </h3>
              <p className="text-xs text-text-muted">
                Create and organize topic silos for your website blog.
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create / Edit Form */}
          <form
            onSubmit={handleSave}
            className="p-4 rounded-card border border-border bg-surface-subtle/60 space-y-3"
          >
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <span>{editingId ? "Edit Category" : "Add New Category"}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingId) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]+/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  placeholder="e.g. Preventative Maintenance"
                  className="w-full px-3 py-2 rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Slug (URL-friendly)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="preventative-maintenance"
                  className="w-full px-3 py-2 font-mono rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Topic description for archive pages..."
                className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingId ? "Update Category" : "Save Category"}</span>
              </button>
            </div>
          </form>

          {/* Existing Categories Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary">
              Existing Categories ({categories.length})
            </h4>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 bg-surface rounded-card border border-border flex items-center justify-between text-xs hover:border-brand/40 transition-colors shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">{cat.name}</span>
                      <span className="font-mono text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-surface-subtle border border-border">
                        /{cat.slug}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-text-muted line-clamp-1">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title="Edit Category"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded text-text-muted hover:text-brand hover:bg-surface-subtle transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete Category"
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

