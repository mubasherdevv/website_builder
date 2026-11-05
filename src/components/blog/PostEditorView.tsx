"use client";

import React, { useState, useEffect } from "react";
import {
  BlogPost,
  BlogPublishStatus,
  BlogCategory,
  BlogTag,
  StructuredRichTextJSON,
  BlogPostSEO,
} from "@/types/blog";
import {
  BlogManagerService,
  sanitizeBlogSlug,
} from "@/lib/services/blog-manager.service";
import { LexicalBlogEditor } from "./lexical/LexicalBlogEditor";
import { BlogSEOPanel } from "./BlogSEOPanel";
import { SafeRichTextRenderer } from "./SafeRichTextRenderer";
import {
  ArrowLeft,
  Check,
  Save,
  Globe,
  FileText,
  Search,
  Eye,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";

interface PostEditorViewProps {
  websiteId: string;
  post: BlogPost | null;
  onBack: () => void;
  onSaveSuccess: () => void;
}

export const PostEditorView: React.FC<PostEditorViewProps> = ({
  websiteId,
  post,
  onBack,
  onSaveSuccess,
}) => {
  const isEditing = Boolean(post);

  // Categories & Tags
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "preview">("content");

  // Form State
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [featuredImage, setFeaturedImage] = useState(
    post?.featuredImage ||
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1200&q=80"
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featuredImageAlt || "");
  const [imageCaption, setImageCaption] = useState(post?.imageCaption || "");
  const [authorName, setAuthorName] = useState(post?.author.name || "Editorial Team");
  const [authorRole, setAuthorRole] = useState(post?.author.role || "Staff Writer");
  const [categoryId, setCategoryId] = useState(post?.categoryId || "");
  const [tagIds, setTagIds] = useState<string[]>(post?.tagIds || []);
  const [status, setStatus] = useState<BlogPublishStatus>(post?.status || "draft");
  const [scheduledAt, setScheduledAt] = useState(post?.scheduledAt || "");

  // Content JSON
  const [content, setContent] = useState<StructuredRichTextJSON>(
    post?.content || {
      version: 1,
      blocks: [
        {
          id: "b1",
          type: "paragraph",
          text: "Start drafting your article...",
        },
      ],
    }
  );

  // SEO State
  const [seo, setSeo] = useState<BlogPostSEO>(
    post?.seo || {
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      canonicalUrl: "",
      noIndex: false,
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
    }
  );

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("Synced");

  useEffect(() => {
    setCategories(BlogManagerService.getCategories(websiteId));
    setTags(BlogManagerService.getTags(websiteId));

    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt);
      setFeaturedImage(post.featuredImage);
      setFeaturedImageAlt(post.featuredImageAlt || "");
      setImageCaption(post.imageCaption || "");
      setAuthorName(post.author.name);
      setAuthorRole(post.author.role || "Staff Writer");
      setCategoryId(post.categoryId || "");
      setTagIds(post.tagIds || []);
      setStatus(post.status);
      setScheduledAt(post.scheduledAt || "");
      setContent(post.content);
      setSeo(post.seo);
    } else {
      setTitle("");
      setSlug("");
      setExcerpt("");
      setFeaturedImage(
        "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1200&q=80"
      );
      setFeaturedImageAlt("");
      setImageCaption("");
      setAuthorName("Editorial Team");
      setAuthorRole("Staff Writer");
      setCategoryId("");
      setTagIds([]);
      setStatus("draft");
      setScheduledAt("");
      setContent({
        version: 1,
        blocks: [
          {
            id: "b_start",
            type: "paragraph",
            text: "Start drafting your article...",
          },
        ],
      });
      setSeo({
        metaTitle: "",
        metaDescription: "",
        focusKeyword: "",
        canonicalUrl: "",
        noIndex: false,
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
      });
    }
    setError(null);
  }, [post, websiteId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      const generated = sanitizeBlogSlug(val);
      setSlug(generated);
    }
    if (!seo.metaTitle || seo.metaTitle === title) {
      setSeo((prev) => ({ ...prev, metaTitle: val }));
    }
  };

  const handleExcerptChange = (val: string) => {
    setExcerpt(val);
    if (!seo.metaDescription || seo.metaDescription === excerpt) {
      setSeo((prev) => ({ ...prev, metaDescription: val }));
    }
  };

  const toggleTag = (id: string) => {
    if (tagIds.includes(id)) {
      setTagIds(tagIds.filter((t) => t !== id));
    } else {
      setTagIds([...tagIds, id]);
    }
  };

  const executeSave = async (overrideStatus?: BlogPublishStatus) => {
    if (!title.trim()) {
      setError("Article title is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const finalStatus = overrideStatus || status;
    const finalSlug = sanitizeBlogSlug(slug || title);

    let savedPost: BlogPost | undefined;

    if (isEditing && post) {
      const res = BlogManagerService.updatePost(websiteId, post.id, {
        title,
        slug: finalSlug,
        excerpt,
        content,
        featuredImage,
        featuredImageAlt,
        imageCaption,
        author: {
          ...post.author,
          name: authorName,
          role: authorRole,
        },
        categoryId: categoryId || undefined,
        tagIds,
        status: finalStatus,
        scheduledAt: finalStatus === "scheduled" ? scheduledAt : null,
        seo,
      });

      if (!res.success) {
        setIsSaving(false);
        setError(res.error || "Failed to update article.");
        return;
      }
      savedPost = res.post;
    } else {
      const res = BlogManagerService.createPost(websiteId, {
        title,
        slug: finalSlug,
        excerpt,
        content,
        featuredImage,
        featuredImageAlt,
        imageCaption,
        author: {
          name: authorName,
          role: authorRole,
        },
        categoryId: categoryId || undefined,
        tagIds,
        status: finalStatus,
        scheduledAt: finalStatus === "scheduled" ? scheduledAt : null,
        seo,
      });

      if (!res.success) {
        setIsSaving(false);
        setError(res.error || "Failed to create article.");
        return;
      }
      savedPost = res.post;
    }

    // Persist to Supabase Database
    if (savedPost) {
      try {
        await fetch(`/api/websites/${websiteId}/blog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_post",
            post: savedPost,
          }),
        });
      } catch (e) {
        console.warn("Could not sync post with database, saved locally:", e);
      }
    }

    setIsSaving(false);
    setLastSaved("Just now");
    onSaveSuccess();
    onBack();
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation Bar */}
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
            <h2 className="text-sm font-bold text-text-primary">
              {isEditing ? `Edit Post: ${post?.title}` : "New Blog Post"}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <span>Slug: /{slug || "untitled"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Status: <strong className="uppercase font-semibold">{status}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => executeSave("draft")}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => executeSave("published")}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{status === "published" ? "Update Post" : "Publish Post"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-2 border-b border-border text-xs font-semibold gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "content"
              ? "border-brand text-brand font-bold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Article Content &amp; Meta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "seo"
              ? "border-brand text-brand font-bold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>SEO &amp; SERP Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "preview"
              ? "border-brand text-brand font-bold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Article Preview</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-btn bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* In-Page Body */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Writing Area (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface rounded-card border border-border p-5 space-y-4 shadow-xs">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. 5 Critical Spring Roofing Inspection Checks"
                  className="w-full px-3.5 py-2.5 text-lg font-bold rounded-btn border border-border bg-surface focus:outline-none focus:border-brand text-text-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-primary mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(sanitizeBlogSlug(e.target.value))}
                    placeholder="spring-roofing-checks"
                    className="w-full px-3 py-2 font-mono rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BlogPublishStatus)}
                    className="w-full px-3 py-2 rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {status === "scheduled" && (
                <div className="p-3 rounded-btn border border-brand/30 bg-mint/30 space-y-1">
                  <label className="block text-xs font-semibold text-[#063B2E] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand" />
                    <span>Scheduled Publication Date &amp; Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Short Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => handleExcerptChange(e.target.value)}
                  placeholder="A compelling 1-2 sentence overview shown in blog cards and search snippets..."
                  className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand resize-none"
                />
              </div>
            </div>

            {/* Rich Text Editor (Lexical Engine) */}
            <div className="bg-surface rounded-card border border-border p-5 shadow-xs space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-primary">
                  Article Body Content
                </label>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Write your story with full rich-text typography, headings, lists, tables, and media embeds.
                </p>
              </div>

              <LexicalBlogEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* Right Column: Taxonomy, Media & Author */}
          <div className="space-y-4">
            {/* Featured Image */}
            <div className="bg-surface p-4 rounded-card border border-border shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-text-primary">Featured Cover Image</h4>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 text-xs font-mono rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
              />
              {featuredImage && (
                <div className="relative rounded-btn overflow-hidden border border-border max-h-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImage}
                    alt={featuredImageAlt || "Featured preview"}
                    className="w-full h-36 object-cover"
                  />
                </div>
              )}
              <input
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="Image alt text (accessibility)..."
                className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
              />
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Image caption (credits)..."
                className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
              />
            </div>

            {/* Category & Tags */}
            <div className="bg-surface p-4 rounded-card border border-border shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-text-primary">Category Silo</h4>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="pt-2 border-t border-border space-y-2">
                <h5 className="text-xs font-bold text-text-primary">Article Tags</h5>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {tags.map((t) => {
                    const isSelected = tagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-brand text-white border-brand shadow-xs"
                            : "bg-surface text-text-secondary border-border hover:border-brand/40"
                        }`}
                      >
                        #{t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Author */}
            <div className="bg-surface p-4 rounded-card border border-border shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-text-primary">Author Attribution</h4>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">
                  Professional Role / Title
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-btn border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="bg-surface p-6 rounded-card border border-border shadow-xs max-w-4xl">
          <BlogSEOPanel
            seo={seo}
            title={title}
            slug={slug}
            excerpt={excerpt}
            content={content}
            onChange={setSeo}
          />
        </div>
      )}

      {activeTab === "preview" && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-border shadow-sm max-w-4xl space-y-6">
          {selectedCategory && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-mint text-[#063B2E]">
              {selectedCategory.name}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            {title || "Untitled Article Preview"}
          </h1>

          {excerpt && (
            <p className="text-base text-text-secondary leading-relaxed font-medium">
              {excerpt}
            </p>
          )}

          <div className="flex items-center gap-3 py-3 border-y border-border text-xs text-text-muted">
            <div className="w-8 h-8 rounded-full bg-brand text-white font-bold flex items-center justify-center">
              {authorName[0] || "A"}
            </div>
            <div>
              <span className="font-semibold text-text-primary">{authorName}</span>
              <span className="text-text-muted"> • {authorRole}</span>
            </div>
          </div>

          {featuredImage && (
            <div className="rounded-xl overflow-hidden border border-border max-h-[450px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredImage}
                alt={featuredImageAlt || title}
                className="w-full h-auto object-cover max-h-[450px]"
              />
            </div>
          )}

          <SafeRichTextRenderer content={content} />
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-card border border-border shadow-xs">
        <span className="text-xs text-text-muted">
          Autosave Status: <strong className="text-text-secondary">{lastSaved}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => executeSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isEditing ? "Save Changes" : "Create Post"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

