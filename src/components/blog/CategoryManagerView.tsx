"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BlogCategory } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import {
  ArrowLeft,
  FolderPlus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";

interface CategoryManagerViewProps {
  websiteId: string;
  onBack: () => void;
}

export const CategoryManagerView: React.FC<CategoryManagerViewProps> = ({
  websiteId,
  onBack,
}) => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshList = useCallback(() => {
    const updated = BlogManagerService.getCategories(websiteId);
    setCategories(updated);
  }, [websiteId]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const handleStartEdit = (cat: BlogCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setError(null);
    setSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
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
      if (res.category) {
        try {
          await fetch(`/api/websites/${websiteId}/blog`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "save_category", category: res.category }),
          });
        } catch {
          // fallback
        }
      }
      setSuccessMsg(`Category "${name}" updated successfully.`);
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
      if (res.category) {
        try {
          await fetch(`/api/websites/${websiteId}/blog`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "save_category", category: res.category }),
          });
        } catch {
          // fallback
        }
      }
      setSuccessMsg(`Category "${name}" created successfully.`);
    }

    handleCancelEdit();
    refreshList();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    const res = BlogManagerService.deleteCategory(websiteId, id);
    if (!res.success) {
      setError(res.error || "Failed to delete category.");
      return;
    }
    try {
      await fetch(`/api/websites/${websiteId}/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_category", id }),
      });
    } catch {
      // fallback
    }
    setError(null);
    setSuccessMsg("Category deleted successfully.");
    refreshList();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Get post count per category
  const posts = BlogManagerService.getPosts(websiteId);
  const getPostCount = (catId: string) =>
    posts.filter((p) => p.categoryId === catId).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface rounded-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-btn border border-border bg-surface text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Articles</span>
          </button>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div>
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-brand" />
              <span>Category Management</span>
            </h2>
            <p className="text-[11px] text-text-muted">
              Organize your articles into clear topical silos to improve SEO structure and user discovery.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-btn bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-btn bg-status-success/10 border border-status-success/30 text-xs text-status-success flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* In-Page 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create / Edit Category Form */}
        <div className="bg-surface rounded-card border border-border p-6 shadow-xs h-fit space-y-4">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5 pb-2 border-b border-border">
            <span>{editingId ? "Edit Category" : "Add New Category"}</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
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
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="preventative-maintenance"
                className="w-full px-3 py-2 font-mono rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
              />
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Public archive will be accessible at: /blog/category/{slug || "slug"}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview explaining what readers will find in this category..."
                className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-btn bg-brand text-white font-semibold hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
              >
                {editingId ? "Update Category" : "Save Category"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Existing Categories List Table */}
        <div className="lg:col-span-2 bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-bold text-sm text-text-primary">
              All Categories ({categories.length})
            </h3>
            <span className="text-[11px] text-text-muted">
              Categories with assigned posts cannot be deleted until reassigned.
            </span>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const postCount = getPostCount(cat.id);

              return (
                <div
                  key={cat.id}
                  className="p-4 bg-surface rounded-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-brand/40 transition-colors shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-text-primary">
                        {cat.name}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted px-2 py-0.5 rounded-full bg-surface-subtle border border-border">
                        /blog/category/{cat.slug}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-mint text-[#063B2E]">
                        {postCount} {postCount === 1 ? "article" : "articles"}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-text-muted line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      title="Edit Category"
                      onClick={() => handleStartEdit(cat)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-btn text-xs font-semibold border border-border text-text-secondary hover:text-brand hover:bg-surface-subtle transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      title="Delete Category"
                      onClick={() => handleDelete(cat.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-btn text-xs font-semibold border border-border text-text-secondary hover:text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

