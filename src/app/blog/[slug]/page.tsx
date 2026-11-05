"use client";

import React, { useEffect, useState } from "react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import { SafeRichTextRenderer } from "@/components/blog/SafeRichTextRenderer";
import { WebsiteBlogLayout } from "@/components/blog/WebsiteBlogLayout";
import { InnerPageHero } from "@/components/website/hero/InnerPageHero";
import { BreadcrumbService } from "@/lib/services/breadcrumb.service";
import { ArticleLoadingSkeleton } from "@/components/blog/ArticleLoadingSkeleton";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Check,
  BookOpen,
} from "lucide-react";

interface SingleBlogPageProps {
  params: {
    slug: string;
  };
}

export default function SingleBlogPage({ params }: SingleBlogPageProps) {
  const { slug } = params;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      setLoading(true);

      // 1. Try fetching from server API (Supabase database)
      try {
        const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.post && isMounted) {
            setPost(data.post);
            if (data.category) setCategory(data.category);
            if (data.relatedPosts) setRelatedPosts(data.relatedPosts);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Could not fetch article from API, falling back to local cache:", e);
      }

      // 2. Client-side fallback: check known websiteIds in LocalStorage
      if (typeof window !== "undefined") {
        const candidateSites = ["my-site-1", "default_website"];
        
        // Also look for any other site keys stored in localStorage
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("securesite_") && key.endsWith("_blog_posts")) {
              const extractedSite = key.replace("securesite_", "").replace("_blog_posts", "");
              if (!candidateSites.includes(extractedSite)) {
                candidateSites.push(extractedSite);
              }
            }
          }
        } catch {
          // ignore storage scan error
        }

        for (const siteId of candidateSites) {
          const found = BlogManagerService.getPostBySlug(siteId, slug);
          if (found && isMounted) {
            setPost(found);
            if (found.categoryId) {
              const cats = BlogManagerService.getCategories(siteId);
              const matchedCat = cats.find((c) => c.id === found.categoryId) || null;
              setCategory(matchedCat);
            }
            const allPosts = BlogManagerService.getPosts(siteId).filter(
              (p) => p.id !== found.id && p.status === "published"
            );
            setRelatedPosts(allPosts.slice(0, 3));
            setLoading(false);
            return;
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resolvedWebsiteId = post?.websiteId || "my-site-1";

  // Schema.org Article Structured Data (JSON-LD)
  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.seo?.metaTitle || post.title,
        description: post.seo?.metaDescription || post.excerpt,
        image: post.featuredImage,
        author: {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.role,
        },
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": post.seo?.canonicalUrl || `https://mysite.securesite.io/blog/${post.slug}`,
        },
      }
    : null;

  // Resolve dynamic hierarchical breadcrumbs & Schema.org JSON-LD
  const breadcrumbResult = post
    ? BreadcrumbService.resolveBreadcrumbs({
        slug: `/blog/${post.slug}`,
        title: post.title,
        pageType: "blog-post",
        categoryName: category?.name,
        categorySlug: category?.slug,
      })
    : null;

  return (
    <WebsiteBlogLayout websiteId={resolvedWebsiteId}>
      {/* 1. Article Loading State — Isolated to content area only, Header & Footer remain visible */}
      {loading && <ArticleLoadingSkeleton />}

      {/* 2. Article Not Found State — Localized within the layout */}
      {!loading && !post && (
        <div className="py-20 px-6 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-[#087A55] opacity-50" />
          <h2 className="text-xl font-bold text-[#172B24]">Article Not Found</h2>
          <p className="text-xs text-[#64756C] max-w-sm">
            The requested article slug &quot;{slug}&quot; could not be found or has not been published yet.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#087A55] text-white text-xs font-semibold hover:bg-[#066747] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Blog</span>
          </Link>
        </div>
      )}

      {/* 3. Published Article View */}
      {!loading && post && (
        <>
          {/* Inject Article & Breadcrumb Structured Data */}
          {jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          )}
          {breadcrumbResult && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbResult.schemaJsonLd) }}
            />
          )}

          {/* Unified Inner Page Hero with Breadcrumb on top of Background */}
          <InnerPageHero
            title={post.title}
            subtitle={post.excerpt}
            eyebrow={category?.name || "Official Guide"}
            bgType="image"
            bgImageUrl={
              post.featuredImage ||
              "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80"
            }
            overlayOpacity={78}
            overlayColor="#062B21"
            customBreadcrumbs={breadcrumbResult?.items}
          />

          {/* Main Article Content Container */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Author attribution & Share actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-[#E1EAE4] text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#087A55] text-white flex items-center justify-center font-bold text-sm">
              {post.author.name[0] || "A"}
            </div>
            <div>
              <span className="font-bold text-[#172B24] block">{post.author.name}</span>
              <span className="text-[#64756C] text-[11px]">{post.author.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#64756C] text-xs">
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Draft"}
            </span>

            <span>•</span>

            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTimeMinutes} min read
            </span>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#E1EAE4] bg-white text-[#172B24] hover:bg-[#EDF4EF] transition-colors cursor-pointer ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#087A55]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Featured Hero Image */}
        {post.featuredImage && (
          <figure className="space-y-2">
            <div className="rounded-2xl overflow-hidden border border-[#E1EAE4] shadow-sm max-h-[500px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
            {post.imageCaption && (
              <figcaption className="text-center text-xs text-[#64756C] italic">
                {post.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Main Body */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E1EAE4] shadow-xs">
          <SafeRichTextRenderer content={post.content} />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-10 border-t border-[#E1EAE4] space-y-4">
            <h3 className="text-xl font-bold text-[#172B24]">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-xl border border-[#E1EAE4] overflow-hidden shadow-2xs hover:shadow-sm transition-shadow flex flex-col"
                >
                  <div className="relative h-36 overflow-hidden bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.featuredImage}
                      alt={rel.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <Link href={`/blog/${rel.slug}`}>
                      <h4 className="font-bold text-xs text-[#172B24] hover:text-[#087A55] transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                    </Link>
                    <span className="text-[10px] text-[#64756C] font-mono">
                      {rel.readingTimeMinutes} min read
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      </>
      )}
    </WebsiteBlogLayout>
  );
}

