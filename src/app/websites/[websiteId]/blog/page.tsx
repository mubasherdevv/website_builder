"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BlogPost, BlogPublishStatus, BlogCategory } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import { PostEditorView } from "@/components/blog/PostEditorView";
import { CategoryManagerView } from "@/components/blog/CategoryManagerView";
import { TagManagerModal } from "@/components/blog/TagManagerModal";
import { toast } from "@/components/ui/Toast";
import {
  Plus,
  BookOpen,
  Search,
  Clock,
  Trash2,
  FolderPlus,
  Tag,
  Copy,
  Edit2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface BlogPageProps {
  params: {
    websiteId: string;
  };
}

type ViewMode = "list" | "editor" | "categories";

export default function BlogManagerPage({ params }: BlogPageProps) {
  const { websiteId } = params;

  // View state: In-page navigation instead of modal popups
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Data states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<"all" | BlogPublishStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");

  // Tag modal
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const refreshData = useCallback(() => {
    const loadedPosts = BlogManagerService.getPosts(websiteId);
    const loadedCats = BlogManagerService.getCategories(websiteId);
    setPosts(loadedPosts);
    setCategories(loadedCats);
    setLoading(false);
  }, [websiteId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Derived filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Status filter
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesExcerpt = p.excerpt.toLowerCase().includes(q);
        const matchesAuthor = p.author.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt && !matchesAuthor) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Status counts for badge tabs
  const counts = useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      archived: posts.filter((p) => p.status === "archived").length,
    };
  }, [posts]);

  // Actions opening in-page views
  const handleOpenCreateInPage = () => {
    setEditingPost(null);
    setViewMode("editor");
  };

  const handleOpenEditInPage = (post: BlogPost) => {
    setEditingPost(post);
    setViewMode("editor");
  };

  const handleOpenCategoriesInPage = () => {
    setViewMode("categories");
  };

  const handleDuplicate = (postId: string) => {
    const res = BlogManagerService.duplicatePost(websiteId, postId);
    refreshData();
    toast.success(`Duplicated post: "${res?.title || "Copy"}"`);
  };

  const handleTogglePublish = (postId: string) => {
    const updated = BlogManagerService.togglePublish(websiteId, postId);
    refreshData();
    toast.success(`Post status updated to ${updated?.status || "updated"}.`);
  };

  const handleDelete = (postId: string) => {
    if (confirm("Are you sure you want to permanently delete this blog post?")) {
      BlogManagerService.deletePost(websiteId, postId);
      refreshData();
      toast.success("Blog post deleted successfully.");
    }
  };

  // 1. IN-PAGE POST EDITOR (NO MODAL POPUP)
  if (viewMode === "editor") {
    return (
      <PostEditorView
        websiteId={websiteId}
        post={editingPost}
        onBack={() => {
          setViewMode("list");
          refreshData();
        }}
        onSaveSuccess={() => {
          setViewMode("list");
          refreshData();
          toast.success("Blog article saved successfully.");
        }}
      />
    );
  }

  // 2. IN-PAGE CATEGORY MANAGER (NO MODAL POPUP)
  if (viewMode === "categories") {
    return (
      <CategoryManagerView
        websiteId={websiteId}
        onBack={() => {
          setViewMode("list");
          refreshData();
        }}
      />
    );
  }

  // 3. MAIN DASHBOARD ARTICLES LIST
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              Blog CMS &amp; Articles
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-mint text-[#063B2E]">
              {posts.length} Posts Total
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Create and publish SEO-optimized articles, manage categories, and schedule publications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Categories in-page button */}
          <button
            type="button"
            onClick={handleOpenCategoriesInPage}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors shadow-2xs cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-brand" />
            <span>Categories</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTagModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors shadow-2xs cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-brand" />
            <span>Tags</span>
          </button>

          {/* New Blog Post in-page button */}
          <button
            type="button"
            onClick={handleOpenCreateInPage}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Blog Post</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto text-xs font-semibold pb-1">
          {[
            { key: "all", label: "All Posts", count: counts.all },
            { key: "published", label: "Published", count: counts.published },
            { key: "draft", label: "Drafts", count: counts.draft },
            { key: "scheduled", label: "Scheduled", count: counts.scheduled },
            { key: "archived", label: "Archived", count: counts.archived },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as "all" | BlogPublishStatus)}
              className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.key
                  ? "border-brand text-brand font-bold"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab.key
                    ? "bg-brand text-white"
                    : "bg-surface-subtle text-text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Select Bars */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title, excerpt, author..."
              className="w-full pl-9 pr-3 py-2 rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "title")}
              className="px-3 py-2 rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
            >
              <option value="date">Sort: Newest First</option>
              <option value="title">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="p-16 text-center text-text-muted text-xs">
          Loading blog articles...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border rounded-card bg-surface space-y-3">
          <div className="w-12 h-12 rounded-full bg-mint/50 text-brand flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-text-primary">No blog posts found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
              ? "No articles match your active filter criteria. Try resetting filters."
              : "Get started by creating your first blog article to drive organic search traffic."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateInPage}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Post</span>
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-primary font-bold border-b border-border">
                <tr>
                  <th className="p-3.5">Article</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">SEO Health</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPosts.map((post) => {
                  const cat = categories.find((c) => c.id === post.categoryId);

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-surface-subtle/50 transition-colors group"
                    >
                      {/* Post Thumbnail & Title */}
                      <td className="p-3.5 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-btn overflow-hidden border border-border bg-black/5 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <span
                              onClick={() => handleOpenEditInPage(post)}
                              className="font-bold text-text-primary hover:text-brand cursor-pointer line-clamp-1"
                            >
                              {post.title}
                            </span>
                            <span className="font-mono text-[10px] text-text-muted block truncate">
                              /blog/{post.slug}
                            </span>
                            <p className="text-[11px] text-text-muted line-clamp-1">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 whitespace-nowrap">
                        {cat ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-mint text-[#063B2E] border border-brand/20">
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-muted italic">
                            Uncategorized
                          </span>
                        )}
                      </td>

                      {/* Author */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-text-primary">
                            {post.author.name}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(post.id)}
                          title="Click to toggle publish status"
                          className="cursor-pointer"
                        >
                          {post.status === "published" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-success/10 text-status-success border border-status-success/30 hover:bg-status-success/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                              Published
                            </span>
                          ) : post.status === "scheduled" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-mint text-[#063B2E] border border-brand/30">
                              <Clock className="w-3 h-3 text-brand" />
                              Scheduled
                            </span>
                          ) : post.status === "archived" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-subtle text-text-muted border border-border">
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-subtle text-text-secondary border border-border hover:bg-surface-subtle/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                              Draft
                            </span>
                          )}
                        </button>
                      </td>

                      {/* SEO Health */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            post.seoStatus === "good"
                              ? "bg-status-success/10 text-status-success border border-status-success/20"
                              : post.seoStatus === "warning"
                              ? "bg-status-warning/10 text-status-warning border border-status-warning/20"
                              : "bg-status-danger/10 text-status-danger border border-status-danger/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              post.seoStatus === "good"
                                ? "bg-status-success"
                                : post.seoStatus === "warning"
                                ? "bg-status-warning"
                                : "bg-status-danger"
                            }`}
                          />
                          {post.seoStatus}
                        </span>
                      </td>

                      {/* Publication Date */}
                      <td className="p-3.5 whitespace-nowrap text-text-muted text-[11px]">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Draft"}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            title="Public Live View"
                            className="p-1.5 rounded text-text-muted hover:text-brand hover:bg-surface-subtle transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit in-page */}
                          <button
                            type="button"
                            title="Edit Post"
                            onClick={() => handleOpenEditInPage(post)}
                            className="p-1.5 rounded text-text-muted hover:text-brand hover:bg-surface-subtle transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Duplicate Post"
                            onClick={() => handleDuplicate(post.id)}
                            className="p-1.5 rounded text-text-muted hover:text-brand hover:bg-surface-subtle transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Delete Post"
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 rounded text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tag Manager Modal */}
      <TagManagerModal
        websiteId={websiteId}
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onTagsUpdated={refreshData}
      />
    </div>
  );
}
