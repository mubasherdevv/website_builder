"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import Link from "next/link";
import {
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  Shield,
} from "lucide-react";

export default function PublicBlogIndexPage() {
  const websiteId = "default_website";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadedPosts = BlogManagerService.getPosts(websiteId).filter(
      (p) => p.status === "published"
    );
    const loadedCats = BlogManagerService.getCategories(websiteId);
    setPosts(loadedPosts);
    setCategories(loadedCats);
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

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

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-[#E1EAE4] bg-white text-[#172B24] hover:bg-[#EDF4EF] transition-colors"
          >
            SaaS Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-[#063B2E] text-white py-16 px-4 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#DDF3E8] text-[#063B2E]">
            Roofing &amp; Home Improvement Insights
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Latest Guides, News &amp; Expert Advice
          </h1>
          <p className="text-sm sm:text-base text-[#DDF3E8]/80 max-w-xl mx-auto leading-relaxed">
            Proven maintenance checklists, commercial flat-roof comparisons, and insurance claim strategies from our certified Texas specialists.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto pt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#64756C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by topic, keyword, or author..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-xs text-[#172B24] placeholder-[#64756C] focus:outline-none focus:ring-2 focus:ring-[#12A875] shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <div className="border-b border-[#E1EAE4] bg-white px-4 sm:px-8 py-3 sticky top-16 z-20 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#087A55] text-white shadow-xs"
                : "bg-[#EDF4EF] text-[#64756C] hover:text-[#172B24]"
            }`}
          >
            All Articles
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === c.id
                  ? "bg-[#087A55] text-white shadow-xs"
                  : "bg-[#EDF4EF] text-[#64756C] hover:text-[#172B24]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full space-y-10">
        {filtered.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-[#E1EAE4] rounded-xl bg-white space-y-3">
            <BookOpen className="w-8 h-8 text-[#087A55] mx-auto opacity-70" />
            <h3 className="font-bold text-base text-[#172B24]">No articles found</h3>
            <p className="text-xs text-[#64756C]">
              No published articles matched your active search or category filter.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Post Card */}
            {featured && (
              <div className="bg-white rounded-2xl border border-[#E1EAE4] overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2 group">
                <div className="relative h-64 md:h-full overflow-hidden bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.featuredImage}
                    alt={featured.featuredImageAlt || featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DDF3E8] text-[#063B2E]">
                        Featured Article
                      </span>
                      <span className="text-[11px] text-[#64756C] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {featured.readingTimeMinutes} min read
                      </span>
                    </div>

                    <Link href={`/blog/${featured.slug}`}>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B24] hover:text-[#087A55] transition-colors leading-tight">
                        {featured.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-[#64756C] leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E1EAE4] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#087A55] text-white flex items-center justify-center font-bold text-xs">
                        {featured.author.name[0] || "A"}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#172B24] block">
                          {featured.author.name}
                        </span>
                        <span className="text-[10px] text-[#64756C]">
                          {featured.author.role}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${featured.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#087A55] hover:underline"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of Remaining Articles */}
            {rest.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-[#172B24]">Recent Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => {
                    const cat = categories.find((c) => c.id === post.categoryId);

                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-xl border border-[#E1EAE4] overflow-hidden shadow-2xs hover:shadow-sm transition-shadow flex flex-col"
                      >
                        <div className="relative h-44 overflow-hidden bg-black/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.featuredImage}
                            alt={post.featuredImageAlt || post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-[#64756C]">
                              {cat ? (
                                <Link
                                  href={`/blog/category/${cat.slug}`}
                                  className="font-semibold text-[#087A55] hover:underline"
                                >
                                  {cat.name}
                                </Link>
                              ) : (
                                <span>Guide</span>
                              )}
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {post.readingTimeMinutes} min
                              </span>
                            </div>

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
                            <span className="font-medium text-[#172B24]">
                              {post.author.name}
                            </span>
                            <Link
                              href={`/blog/${post.slug}`}
                              className="text-[#087A55] font-semibold hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Read</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
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

