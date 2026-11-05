"use client";

import React, { useEffect, useState } from "react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import { WebsiteBlogLayout } from "@/components/blog/WebsiteBlogLayout";
import { InnerPageHero } from "@/components/website/hero/InnerPageHero";
import { BreadcrumbService } from "@/lib/services/breadcrumb.service";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  ArrowRight,
  Folder,
} from "lucide-react";

interface CategoryArchivePageProps {
  params: {
    slug: string;
  };
}

export default function CategoryArchivePage({ params }: CategoryArchivePageProps) {
  const { slug } = params;

  const [websiteId, setWebsiteId] = useState<string>("my-site-1");
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCategoryData() {
      setLoading(true);

      const candidateSites = ["my-site-1", "default_website"];

      if (typeof window !== "undefined") {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("securesite_") && key.endsWith("_blog_categories")) {
              const extracted = key.replace("securesite_", "").replace("_blog_categories", "");
              if (!candidateSites.includes(extracted)) {
                candidateSites.push(extracted);
              }
            }
          }
        } catch {}
      }

      for (const siteId of candidateSites) {
        const categories = BlogManagerService.getCategories(siteId);
        const cat = categories.find((c) => c.slug === slug) || null;
        if (cat && isMounted) {
          setWebsiteId(siteId);
          setCategory(cat);
          const allPosts = BlogManagerService.getPosts(siteId).filter(
            (p) => p.status === "published" && p.categoryId === cat.id
          );
          setPosts(allPosts);
          setLoading(false);
          return;
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    loadCategoryData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Breadcrumb generation via centralized BreadcrumbService
  const breadcrumbResult = category
    ? BreadcrumbService.resolveBreadcrumbs({
        slug: `/blog/category/${category.slug}`,
        title: category.name,
        pageType: "blog-category",
      })
    : null;

  return (
    <WebsiteBlogLayout websiteId={websiteId}>
      {/* 1. Category Loading Skeleton — isolated to page body */}
      {loading && (
        <div className="w-full animate-pulse">
          <div className="h-64 sm:h-80 bg-slate-800 flex flex-col items-center justify-center p-6 space-y-4">
            <div className="h-4 w-48 bg-slate-700/60 rounded" />
            <div className="h-9 w-72 sm:w-96 bg-slate-700 rounded-lg" />
            <div className="h-4 w-64 bg-slate-700/50 rounded" />
          </div>
          <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            ))}
          </main>
        </div>
      )}

      {/* 2. Category Not Found — localized without wiping layout */}
      {!loading && !category && (
        <div className="py-20 px-6 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto">
          <Folder className="w-12 h-12 text-[#087A55] opacity-50" />
          <h2 className="text-xl font-bold text-[#172B24]">Category Not Found</h2>
          <p className="text-xs text-[#64756C] max-w-sm">
            No category matching &quot;{slug}&quot; was found.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#087A55] text-white text-xs font-semibold hover:bg-[#066747] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to All Articles</span>
          </Link>
        </div>
      )}

      {/* 3. Category Archive Display */}
      {!loading && category && (
        <>
          {breadcrumbResult && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbResult.schemaJsonLd) }}
            />
          )}

          {/* Inner Page Hero banner with breadcrumb on background */}
          <InnerPageHero
            title={`Category: ${category.name}`}
            subtitle={category.description || `Browse all expert guides, articles and resources filed under ${category.name}.`}
            eyebrow="Topic Hub"
            bgType="image"
            bgImageUrl="https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80"
            overlayOpacity={80}
            overlayColor="#062B21"
            customBreadcrumbs={breadcrumbResult?.items}
          />

          {/* Articles Grid */}
          <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full space-y-8">
            <div className="flex items-center justify-between border-b border-[#E1EAE4] pb-4">
              <span className="text-xs font-semibold text-[#087A55]">
                {posts.length} {posts.length === 1 ? "Article Published" : "Articles Published"}
              </span>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#64756C] hover:text-[#087A55] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Categories</span>
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-[#E1EAE4] rounded-xl bg-white space-y-3">
                <BookOpen className="w-8 h-8 text-[#087A55] mx-auto opacity-70" />
                <h3 className="font-bold text-base text-[#172B24]">No published articles yet</h3>
                <p className="text-xs text-[#64756C]">
                  There are currently no published articles in this category. Check back soon!
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#087A55] hover:underline pt-2"
                >
                  <span>Explore all articles</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl border border-[#E1EAE4] overflow-hidden shadow-2xs hover:shadow-sm transition-shadow flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden bg-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-[11px] text-[#64756C] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {post.readingTimeMinutes} min read
                        </span>

                        <Link href={`/blog/${post.slug}`}>
                          <h4 className="font-bold text-sm text-[#172B24] hover:text-[#087A55] transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                        </Link>

                        <p className="text-xs text-[#64756C] line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E1EAE4] flex items-center justify-between text-xs">
                        <span className="font-medium text-[#172B24]">{post.author.name}</span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-[#087A55] font-semibold hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Read Story</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </>
      )}
    </WebsiteBlogLayout>
  );
}
