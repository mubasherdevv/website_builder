"use client";

import React, { useEffect, useState } from "react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import { SafeRichTextRenderer } from "@/components/blog/SafeRichTextRenderer";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Check,
  ChevronRight,
  Shield,
  BookOpen,
} from "lucide-react";

interface SingleBlogPageProps {
  params: {
    slug: string;
  };
}

export default function SingleBlogPage({ params }: SingleBlogPageProps) {
  const { slug } = params;
  const websiteId = "default_website";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = BlogManagerService.getPostBySlug(websiteId, slug);
    if (found) {
      setPost(found);
      if (found.categoryId) {
        const cats = BlogManagerService.getCategories(websiteId);
        const matchedCat = cats.find((c) => c.id === found.categoryId) || null;
        setCategory(matchedCat);
      }
      const allPosts = BlogManagerService.getPosts(websiteId).filter(
        (p) => p.id !== found.id && p.status === "published"
      );
      setRelatedPosts(allPosts.slice(0, 3));
    }
    setLoading(false);
  }, [websiteId, slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F9F6] flex items-center justify-center text-xs text-[#64756C]">
        Loading article...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F5F9F6] flex flex-col items-center justify-center p-6 text-center space-y-4">
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
    );
  }

  // Schema.org Article Structured Data (JSON-LD)
  const jsonLd = {
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
  };

  return (
    <div className="min-h-screen bg-[#F5F9F6] text-[#172B24] flex flex-col font-sans">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          <span>All Articles</span>
        </Link>
      </header>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-[#64756C] overflow-x-auto">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#64756C]/50" />
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3 text-[#64756C]/50" />
              <Link href={`/blog/category/${category.slug}`} className="hover:underline">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-[#64756C]/50" />
          <span className="text-[#172B24] font-medium truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Article Header */}
        <div className="space-y-4">
          {category && (
            <Link
              href={`/blog/category/${category.slug}`}
              className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#DDF3E8] text-[#063B2E] hover:bg-[#12A875]/20 transition-colors"
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#172B24] leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-[#64756C] leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author attribution & Share actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-y border-[#E1EAE4] text-xs">
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

