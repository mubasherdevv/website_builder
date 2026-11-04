"use client";

import React, { useEffect, useState } from "react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Shield,
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
  const websiteId = "default_website";

  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categories = BlogManagerService.getCategories(websiteId);
    const cat = categories.find((c) => c.slug === slug) || null;
    setCategory(cat);

    if (cat) {
      const allPosts = BlogManagerService.getPosts(websiteId).filter(
        (p) => p.status === "published" && p.categoryId === cat.id
      );
      setPosts(allPosts);
    }
    setLoading(false);
  }, [websiteId, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F9F6] flex items-center justify-center text-xs text-[#64756C]">
        Loading category archive...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F5F9F6] flex flex-col items-center justify-center p-6 text-center space-y-4">
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
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9F6] text-[#172B24] flex flex-col font-sans">
      {/* Public Header */}
      <header className="h-16 border-b border-[#E1EAE4] bg-white sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#087A55] text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#063B2E]">
              Austin Pro Roofing
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#64756C]">
            <Link href="/" className="hover:text-[#087A55] transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-[#087A55]">
              Blog &amp; Knowledge
            </Link>
          </nav>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087A55] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </Link>
      </header>

      {/* Hero Category Banner */}
      <section className="bg-[#063B2E] text-white py-14 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-[#DDF3E8]/70">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#DDF3E8]/40" />
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>
            <ChevronRight className="w-3 h-3 text-[#DDF3E8]/40" />
            <span className="text-white font-medium">{category.name}</span>
          </nav>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Category: {category.name}
          </h1>

          {category.description && (
            <p className="text-sm text-[#DDF3E8]/80 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="pt-2 text-xs text-[#12A875] font-semibold">
            {posts.length} {posts.length === 1 ? "article" : "articles"} in this category
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full space-y-8">
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
              <div
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
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="bg-[#063B2E] text-white py-12 px-4 sm:px-8 border-t border-[#087A55]/30 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#DDF3E8]/80">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#12A875]" />
            <span className="font-bold text-white">Austin Pro Roofing</span>
            <span>• Verified SaaS Website Builder</span>
          </div>
          <p>© 2026 Austin Pro Roofing. Powered by SecureSite Studio.</p>
        </div>
      </footer>
    </div>
  );
}

