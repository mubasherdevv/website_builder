import {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogPublishStatus,
  StructuredRichTextJSON,
  BlogPostSEO,
} from "@/types/blog";
import { SEOHealthStatus } from "@/types/cms";
import { generateEntityId } from "@/lib/utils/id";

const STORAGE_PREFIX = "website_";

export function sanitizeBlogSlug(input: string): string {
  let s = (input || "").trim().toLowerCase();
  s = s.replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-");
  s = s.replace(/^-+|-+$/g, "");
  return s || "untitled-post";
}

export function calculateReadingTime(content: StructuredRichTextJSON): number {
  if (!content || !content.blocks) return 1;
  let wordCount = 0;
  content.blocks.forEach((b) => {
    if (b.text) wordCount += b.text.trim().split(/\s+/).length;
    if (b.items) {
      b.items.forEach((item) => {
        wordCount += item.trim().split(/\s+/).length;
      });
    }
  });
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function computeBlogSEOHealth(
  seo?: Partial<BlogPostSEO>,
  title?: string,
  content?: StructuredRichTextJSON
): SEOHealthStatus {
  const t = seo?.metaTitle || title || "";
  const d = seo?.metaDescription || "";
  const kw = seo?.focusKeyword || "";

  if (!t || !d) return "missing";
  const tLen = t.trim().length;
  const dLen = d.trim().length;

  const hasBlocks = Boolean(content && content.blocks && content.blocks.length > 0);

  if (tLen >= 25 && tLen <= 70 && dLen >= 50 && dLen <= 170) {
    if (kw) {
      const lowerKw = kw.toLowerCase();
      const inTitle = t.toLowerCase().includes(lowerKw);
      const inDesc = d.toLowerCase().includes(lowerKw);
      if (!inTitle || !inDesc) {
        return "warning";
      }
    }
    return hasBlocks ? "good" : "good";
  }
  return "warning";
}

export function getInitialDefaultCategories(websiteId: string): BlogCategory[] {
  return [
    {
      id: "cat_roofing_tips",
      websiteId,
      name: "Roofing Tips & Maintenance",
      slug: "roofing-tips",
      description: "Expert advice on seasonal roof upkeep, storm protection, and inspection checklists.",
      seoTitle: "Roofing Tips & Preventative Maintenance Guides",
      metaDescription: "Learn how to care for your residential and commercial roofs with expert advice.",
      createdAt: "2026-01-15T10:00:00.000Z",
    },
    {
      id: "cat_industry_news",
      websiteId,
      name: "Industry News",
      slug: "industry-news",
      description: "Latest trends in eco-friendly shingles, hail resistance standards, and regional building codes.",
      seoTitle: "Commercial & Residential Roofing Industry News",
      metaDescription: "Stay updated on construction regulations, insurance guidelines, and roofing innovations.",
      createdAt: "2026-01-20T11:00:00.000Z",
    },
    {
      id: "cat_case_studies",
      websiteId,
      name: "Project Case Studies",
      slug: "case-studies",
      description: "Real-world walkthroughs of complex roof replacements across Texas.",
      seoTitle: "Featured Roofing Project Case Studies",
      metaDescription: "Explore before and after transformations of local residential and commercial projects.",
      createdAt: "2026-02-01T09:30:00.000Z",
    },
  ];
}

export function getInitialDefaultTags(websiteId: string): BlogTag[] {
  return [
    { id: "tag_shingles", websiteId, name: "Shingles", slug: "shingles", createdAt: "2026-01-15T10:00:00Z" },
    { id: "tag_storm", websiteId, name: "Storm Damage", slug: "storm-damage", createdAt: "2026-01-15T10:00:00Z" },
    { id: "tag_gutters", websiteId, name: "Gutters", slug: "gutters", createdAt: "2026-01-15T10:00:00Z" },
    { id: "tag_commercial", websiteId, name: "Commercial", slug: "commercial", createdAt: "2026-01-15T10:00:00Z" },
    { id: "tag_residential", websiteId, name: "Residential", slug: "residential", createdAt: "2026-01-15T10:00:00Z" },
  ];
}

export function getInitialDefaultPosts(websiteId: string): BlogPost[] {
  const content1: StructuredRichTextJSON = {
    version: 1,
    blocks: [
      {
        id: "b1",
        type: "paragraph",
        text: "Texas weather is notorious for sudden hailstorms and intense heat waves. Regular preventative inspections can save homeowners thousands of dollars in emergency leak repairs.",
      },
      {
        id: "b2",
        type: "heading",
        level: 2,
        text: "Key Signs Your Roof Needs Immediate Attention",
      },
      {
        id: "b3",
        type: "list",
        ordered: false,
        items: [
          "Curling, cracked, or missing asphalt shingles after heavy wind gusts.",
          "Granules accumulating in gutter downspouts, exposing raw fiberglass backing.",
          "Interior ceiling stains or attic dampness after rainfall.",
          "Flashing deterioration around chimneys, skylights, and vent pipes.",
        ],
      },
      {
        id: "b4",
        type: "blockquote",
        text: "A 15-minute attic and roof visual inspection every spring can prevent over 80% of preventable interior ceiling water damage.",
      },
      {
        id: "b5",
        type: "heading",
        level: 3,
        text: "When to Call a Licensed Specialist",
      },
      {
        id: "b6",
        type: "paragraph",
        text: "Never attempt walking on steep pitches without proper fall arrest harnesses. Always schedule a drone or ladder inspection with an OSHA-compliant contractor.",
      },
    ],
  };

  const content2: StructuredRichTextJSON = {
    version: 1,
    blocks: [
      {
        id: "b1",
        type: "paragraph",
        text: "Commercial flat roofs have unique drainage and membrane requirements. In this comprehensive guide, we compare TPO, EPDM, and modified bitumen coatings.",
      },
      {
        id: "b2",
        type: "heading",
        level: 2,
        text: "Why TPO Single-Ply Membrane Dominates the Market",
      },
      {
        id: "b3",
        type: "paragraph",
        text: "Thermoplastic Polyolefin (TPO) offers outstanding solar reflectance, dropping summer rooftop temperatures by up to 50 degrees Fahrenheit compared to dark gravel surfaces.",
      },
      {
        id: "b4",
        type: "table",
        tableData: {
          headers: ["Material", "Average Lifespan", "Heat Reflectance", "Puncture Resistance"],
          rows: [
            ["TPO (60 mil)", "22-28 Years", "Excellent (88%)", "High"],
            ["EPDM Rubber", "25-30 Years", "Moderate", "Very High"],
            ["Mod-Bitumen", "15-20 Years", "Fair", "Moderate"],
          ],
        },
      },
    ],
  };

  return [
    {
      id: "post_1",
      websiteId,
      title: "5 Critical Spring Roofing Inspection Checks for Texas Homeowners",
      slug: "spring-roofing-inspection-checklist-texas",
      excerpt: "Don't let seasonal storms cause surprise interior leaks. Here is the ultimate 5-point checklist recommended by certified inspectors.",
      content: content1,
      featuredImage: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1200&q=80",
      featuredImageAlt: "Modern residential roof with asphalt shingles against a blue sky",
      imageCaption: "Preventative checks keep your warranty intact and prevent moisture intrusion.",
      author: {
        id: "auth_1",
        name: "Marcus Vance",
        role: "Chief Roofing Inspector",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      },
      categoryId: "cat_roofing_tips",
      tagIds: ["tag_shingles", "tag_storm", "tag_residential"],
      status: "published",
      publishedAt: "2026-02-10T14:30:00.000Z",
      scheduledAt: null,
      readingTimeMinutes: 3,
      seo: {
        metaTitle: "5 Spring Roofing Inspection Checks | Texas Homeowner Guide",
        metaDescription: "Inspect shingles, gutters, and flashing with our certified 5-step spring checklist for Central Texas homes.",
        focusKeyword: "roofing inspection",
        canonicalUrl: "https://mysite.securesite.io/blog/spring-roofing-inspection-checklist-texas",
        noIndex: false,
        ogTitle: "5 Critical Spring Roofing Checks for Homeowners",
        ogDescription: "Keep your roof storm-ready with our preventative spring checklist.",
        ogImage: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1200&q=80",
      },
      seoStatus: "good",
      createdAt: "2026-02-10T12:00:00.000Z",
      updatedAt: "2026-02-10T14:30:00.000Z",
    },
    {
      id: "post_2",
      websiteId,
      title: "Commercial Flat Roofing Comparison: TPO vs EPDM vs Modified Bitumen",
      slug: "commercial-flat-roofing-comparison-tpo-epdm",
      excerpt: "Evaluating durability, energy efficiency, and lifecycle costs for facility managers considering a new roof installation.",
      content: content2,
      featuredImage: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
      featuredImageAlt: "Large commercial building flat roof with white energy-efficient membrane",
      imageCaption: "High-reflectance white membranes help cut cooling bills during triple-digit summers.",
      author: {
        id: "auth_2",
        name: "Elena Rostova",
        role: "Commercial Project Director",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      },
      categoryId: "cat_industry_news",
      tagIds: ["tag_commercial"],
      status: "published",
      publishedAt: "2026-02-18T09:15:00.000Z",
      scheduledAt: null,
      readingTimeMinutes: 4,
      seo: {
        metaTitle: "Commercial Flat Roofing Guide: TPO vs EPDM Comparison",
        metaDescription: "Discover how TPO, EPDM, and modified bitumen compare in cost, durability, and commercial energy savings.",
        focusKeyword: "commercial flat roofing",
        canonicalUrl: "https://mysite.securesite.io/blog/commercial-flat-roofing-comparison-tpo-epdm",
        noIndex: false,
        ogTitle: "Commercial Flat Roofing Comparison: TPO vs EPDM",
        ogDescription: "An in-depth guide to commercial flat roof membrane selection.",
        ogImage: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
      },
      seoStatus: "good",
      createdAt: "2026-02-18T08:00:00.000Z",
      updatedAt: "2026-02-18T09:15:00.000Z",
    },
    {
      id: "post_3",
      websiteId,
      title: "How to File a Successful Insurance Claim After Heavy Hail Damage",
      slug: "how-to-file-insurance-claim-hail-damage",
      excerpt: "Step-by-step instructions on documenting hail hits, securing contractor estimates, and meeting insurance adjusters.",
      content: content1,
      featuredImage: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=1200&q=80",
      featuredImageAlt: "Hail storm clouds gathering over suburban homes",
      author: {
        id: "auth_1",
        name: "Marcus Vance",
        role: "Chief Roofing Inspector",
      },
      categoryId: "cat_roofing_tips",
      tagIds: ["tag_storm", "tag_residential"],
      status: "draft",
      publishedAt: null,
      scheduledAt: null,
      readingTimeMinutes: 3,
      seo: {
        metaTitle: "Filing a Roof Insurance Claim for Hail Damage",
        metaDescription: "Learn how to document damage and meet adjusters to get your roof repair claim approved without delays.",
        focusKeyword: "insurance claim",
        noIndex: false,
      },
      seoStatus: "warning",
      createdAt: "2026-02-25T11:00:00.000Z",
      updatedAt: "2026-02-25T11:00:00.000Z",
    },
  ];
}

export class BlogManagerService {
  private static getPostsKey(websiteId: string): string {
    return `${STORAGE_PREFIX}${websiteId}_blog_posts`;
  }

  private static getCategoriesKey(websiteId: string): string {
    return `${STORAGE_PREFIX}${websiteId}_blog_categories`;
  }

  private static getTagsKey(websiteId: string): string {
    return `${STORAGE_PREFIX}${websiteId}_blog_tags`;
  }

  // --- POSTS ---
  public static getPosts(websiteId: string): BlogPost[] {
    if (typeof window === "undefined") {
      return getInitialDefaultPosts(websiteId);
    }
    try {
      const raw = localStorage.getItem(this.getPostsKey(websiteId));
      if (!raw) {
        const seeded = getInitialDefaultPosts(websiteId);
        this.savePosts(websiteId, seeded);
        return seeded;
      }
      const posts: BlogPost[] = JSON.parse(raw);
      // Run auto-publish check for scheduled posts
      this.evaluateScheduledPosts(websiteId, posts);
      return posts;
    } catch {
      return getInitialDefaultPosts(websiteId);
    }
  }

  public static savePosts(websiteId: string, posts: BlogPost[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getPostsKey(websiteId), JSON.stringify(posts));
    } catch (e) {
      console.error("Failed to save blog posts", e);
    }
  }

  public static getPostById(websiteId: string, postId: string): BlogPost | null {
    const posts = this.getPosts(websiteId);
    return posts.find((p) => p.id === postId) || null;
  }

  public static getPostBySlug(websiteId: string, slug: string): BlogPost | null {
    const clean = sanitizeBlogSlug(slug);
    const posts = this.getPosts(websiteId);
    return posts.find((p) => sanitizeBlogSlug(p.slug) === clean) || null;
  }

  public static createPost(
    websiteId: string,
    payload: {
      title: string;
      slug?: string;
      excerpt?: string;
      content?: StructuredRichTextJSON;
      featuredImage?: string;
      featuredImageAlt?: string;
      imageCaption?: string;
      author?: { name: string; avatar?: string; role?: string };
      categoryId?: string;
      tagIds?: string[];
      status?: BlogPublishStatus;
      scheduledAt?: string | null;
      seo?: Partial<BlogPostSEO>;
    }
  ): { success: boolean; post?: BlogPost; error?: string } {
    const posts = this.getPosts(websiteId);
    const candidateSlug = sanitizeBlogSlug(payload.slug || payload.title);

    // Enforce unique slug per website
    if (posts.some((p) => sanitizeBlogSlug(p.slug) === candidateSlug)) {
      return {
        success: false,
        error: `A blog post with URL slug "${candidateSlug}" already exists on this website.`,
      };
    }

    const postId = generateEntityId("post");
    const content = payload.content || {
      version: 1,
      blocks: [
        {
          id: generateEntityId("b"),
          type: "paragraph",
          text: "Start writing your article here...",
        },
      ],
    };

    const readingTime = calculateReadingTime(content);
    const nowIso = new Date().toISOString();
    const status = payload.status || "draft";

    const seoTitle = payload.seo?.metaTitle || `${payload.title} | Blog`;
    const seoDesc = payload.seo?.metaDescription || payload.excerpt || "";
    const seoStatus = computeBlogSEOHealth(payload.seo, payload.title, content);

    const newPost: BlogPost = {
      id: postId,
      websiteId,
      title: payload.title,
      slug: candidateSlug,
      excerpt: payload.excerpt || "",
      content,
      featuredImage:
        payload.featuredImage ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      featuredImageAlt: payload.featuredImageAlt || payload.title,
      imageCaption: payload.imageCaption || "",
      author: {
        id: generateEntityId("auth"),
        name: payload.author?.name || "Editorial Team",
        role: payload.author?.role || "Staff Writer",
        avatar: payload.author?.avatar,
      },
      categoryId: payload.categoryId,
      tagIds: payload.tagIds || [],
      status,
      publishedAt: status === "published" ? nowIso : null,
      scheduledAt: status === "scheduled" ? payload.scheduledAt || null : null,
      readingTimeMinutes: readingTime,
      seo: {
        metaTitle: seoTitle,
        metaDescription: seoDesc,
        focusKeyword: payload.seo?.focusKeyword || "",
        canonicalUrl: payload.seo?.canonicalUrl || "",
        noIndex: payload.seo?.noIndex || false,
        ogTitle: payload.seo?.ogTitle || seoTitle,
        ogDescription: payload.seo?.ogDescription || seoDesc,
        ogImage: payload.seo?.ogImage || payload.featuredImage || "",
      },
      seoStatus,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updated = [newPost, ...posts];
    this.savePosts(websiteId, updated);
    return { success: true, post: newPost };
  }

  public static updatePost(
    websiteId: string,
    postId: string,
    updates: Partial<BlogPost>
  ): { success: boolean; post?: BlogPost; error?: string } {
    const posts = this.getPosts(websiteId);
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) {
      return { success: false, error: "Post not found." };
    }

    const current = posts[idx];

    // Check slug collision if slug changed
    if (updates.slug && sanitizeBlogSlug(updates.slug) !== sanitizeBlogSlug(current.slug)) {
      const clean = sanitizeBlogSlug(updates.slug);
      const conflict = posts.some(
        (p) => p.id !== postId && sanitizeBlogSlug(p.slug) === clean
      );
      if (conflict) {
        return { success: false, error: `The URL slug "${clean}" is already in use by another post.` };
      }
      updates.slug = clean;
    }

    const nowIso = new Date().toISOString();
    let publishedAt = current.publishedAt;
    if (updates.status === "published" && !current.publishedAt) {
      publishedAt = nowIso;
    }

    const updatedContent = updates.content || current.content;
    const readingTime = calculateReadingTime(updatedContent);

    const mergedPost: BlogPost = {
      ...current,
      ...updates,
      publishedAt,
      readingTimeMinutes: readingTime,
      updatedAt: nowIso,
    };

    if (updates.seo || updates.title || updates.content) {
      mergedPost.seoStatus = computeBlogSEOHealth(
        mergedPost.seo,
        mergedPost.title,
        mergedPost.content
      );
    }

    posts[idx] = mergedPost;
    this.savePosts(websiteId, posts);
    return { success: true, post: mergedPost };
  }

  public static duplicatePost(
    websiteId: string,
    postId: string
  ): { success: boolean; post?: BlogPost; error?: string } {
    const posts = this.getPosts(websiteId);
    const source = posts.find((p) => p.id === postId);
    if (!source) {
      return { success: false, error: "Source post not found." };
    }

    let candidateSlug = `${source.slug}-copy`;
    let counter = 1;
    while (posts.some((p) => sanitizeBlogSlug(p.slug) === sanitizeBlogSlug(candidateSlug))) {
      counter++;
      candidateSlug = `${source.slug}-copy-${counter}`;
    }

    const newId = generateEntityId("post");
    const nowIso = new Date().toISOString();

    const duplicated: BlogPost = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      title: `${source.title} (Copy)`,
      slug: candidateSlug,
      status: "draft",
      publishedAt: null,
      scheduledAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updated = [duplicated, ...posts];
    this.savePosts(websiteId, updated);
    return { success: true, post: duplicated };
  }

  public static deletePost(websiteId: string, postId: string): { success: boolean; error?: string } {
    const posts = this.getPosts(websiteId);
    const filtered = posts.filter((p) => p.id !== postId);
    if (filtered.length === posts.length) {
      return { success: false, error: "Post not found." };
    }
    this.savePosts(websiteId, filtered);
    return { success: true };
  }

  public static togglePublish(
    websiteId: string,
    postId: string
  ): { success: boolean; status?: BlogPublishStatus; error?: string } {
    const posts = this.getPosts(websiteId);
    const post = posts.find((p) => p.id === postId);
    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const nextStatus: BlogPublishStatus = post.status === "published" ? "draft" : "published";
    const nowIso = new Date().toISOString();
    post.status = nextStatus;
    if (nextStatus === "published" && !post.publishedAt) {
      post.publishedAt = nowIso;
    }
    post.updatedAt = nowIso;

    this.savePosts(websiteId, posts);
    return { success: true, status: nextStatus };
  }

  // --- SCHEDULED PUBLISHING EVALUATION ---
  public static evaluateScheduledPosts(websiteId: string, posts?: BlogPost[]): number {
    let list: BlogPost[] = [];
    if (posts) {
      list = posts;
    } else if (typeof window === "undefined") {
      list = getInitialDefaultPosts(websiteId);
    } else {
      try {
        const raw = localStorage.getItem(this.getPostsKey(websiteId));
        list = raw ? JSON.parse(raw) : getInitialDefaultPosts(websiteId);
      } catch {
        list = getInitialDefaultPosts(websiteId);
      }
    }

    const now = new Date().getTime();
    let updatedCount = 0;

    list.forEach((p) => {
      if (p.status === "scheduled" && p.scheduledAt) {
        const scheduledTime = new Date(p.scheduledAt).getTime();
        if (scheduledTime <= now) {
          p.status = "published";
          p.publishedAt = new Date().toISOString();
          p.scheduledAt = null;
          p.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      this.savePosts(websiteId, list);
    }
    return updatedCount;
  }

  // --- CATEGORIES ---
  public static getCategories(websiteId: string): BlogCategory[] {
    if (typeof window === "undefined") {
      return getInitialDefaultCategories(websiteId);
    }
    try {
      const raw = localStorage.getItem(this.getCategoriesKey(websiteId));
      if (!raw) {
        const seeded = getInitialDefaultCategories(websiteId);
        this.saveCategories(websiteId, seeded);
        return seeded;
      }
      return JSON.parse(raw);
    } catch {
      return getInitialDefaultCategories(websiteId);
    }
  }

  public static saveCategories(websiteId: string, categories: BlogCategory[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getCategoriesKey(websiteId), JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to save categories", e);
    }
  }

  public static createCategory(
    websiteId: string,
    payload: {
      name: string;
      slug?: string;
      description?: string;
      seoTitle?: string;
      metaDescription?: string;
    }
  ): { success: boolean; category?: BlogCategory; error?: string } {
    const categories = this.getCategories(websiteId);
    const cleanSlug = sanitizeBlogSlug(payload.slug || payload.name);

    if (categories.some((c) => sanitizeBlogSlug(c.slug) === cleanSlug)) {
      return { success: false, error: `Category with slug "${cleanSlug}" already exists.` };
    }

    const newCategory: BlogCategory = {
      id: generateEntityId("cat"),
      websiteId,
      name: payload.name,
      slug: cleanSlug,
      description: payload.description || "",
      seoTitle: payload.seoTitle || payload.name,
      metaDescription: payload.metaDescription || payload.description || "",
      createdAt: new Date().toISOString(),
    };

    const updated = [...categories, newCategory];
    this.saveCategories(websiteId, updated);
    return { success: true, category: newCategory };
  }

  public static updateCategory(
    websiteId: string,
    categoryId: string,
    updates: Partial<BlogCategory>
  ): { success: boolean; category?: BlogCategory; error?: string } {
    const categories = this.getCategories(websiteId);
    const idx = categories.findIndex((c) => c.id === categoryId);
    if (idx === -1) {
      return { success: false, error: "Category not found." };
    }

    if (updates.slug && sanitizeBlogSlug(updates.slug) !== sanitizeBlogSlug(categories[idx].slug)) {
      const clean = sanitizeBlogSlug(updates.slug);
      if (categories.some((c) => c.id !== categoryId && sanitizeBlogSlug(c.slug) === clean)) {
        return { success: false, error: `Slug "${clean}" is already in use.` };
      }
      updates.slug = clean;
    }

    const updatedCat = { ...categories[idx], ...updates };
    categories[idx] = updatedCat;
    this.saveCategories(websiteId, categories);
    return { success: true, category: updatedCat };
  }

  public static deleteCategory(
    websiteId: string,
    categoryId: string
  ): { success: boolean; error?: string } {
    const posts = this.getPosts(websiteId);
    const inUse = posts.some((p) => p.categoryId === categoryId);
    if (inUse) {
      return {
        success: false,
        error: "Cannot delete category because it is currently assigned to one or more blog posts. Please reassign those posts first.",
      };
    }

    const categories = this.getCategories(websiteId);
    const filtered = categories.filter((c) => c.id !== categoryId);
    this.saveCategories(websiteId, filtered);
    return { success: true };
  }

  // --- TAGS ---
  public static getTags(websiteId: string): BlogTag[] {
    if (typeof window === "undefined") {
      return getInitialDefaultTags(websiteId);
    }
    try {
      const raw = localStorage.getItem(this.getTagsKey(websiteId));
      if (!raw) {
        const seeded = getInitialDefaultTags(websiteId);
        this.saveTags(websiteId, seeded);
        return seeded;
      }
      return JSON.parse(raw);
    } catch {
      return getInitialDefaultTags(websiteId);
    }
  }

  public static saveTags(websiteId: string, tags: BlogTag[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getTagsKey(websiteId), JSON.stringify(tags));
    } catch (e) {
      console.error("Failed to save tags", e);
    }
  }

  public static createTag(
    websiteId: string,
    name: string,
    slug?: string
  ): { success: boolean; tag?: BlogTag; error?: string } {
    const tags = this.getTags(websiteId);
    const cleanSlug = sanitizeBlogSlug(slug || name);

    if (tags.some((t) => sanitizeBlogSlug(t.slug) === cleanSlug)) {
      return { success: false, error: `Tag "${cleanSlug}" already exists.` };
    }

    const newTag: BlogTag = {
      id: generateEntityId("tag"),
      websiteId,
      name,
      slug: cleanSlug,
      createdAt: new Date().toISOString(),
    };

    const updated = [...tags, newTag];
    this.saveTags(websiteId, updated);
    return { success: true, tag: newTag };
  }

  public static deleteTag(websiteId: string, tagId: string): { success: boolean } {
    // Remove tag association from any existing posts
    const posts = this.getPosts(websiteId);
    let changed = false;
    posts.forEach((p) => {
      if (p.tagIds && p.tagIds.includes(tagId)) {
        p.tagIds = p.tagIds.filter((t) => t !== tagId);
        changed = true;
      }
    });
    if (changed) {
      this.savePosts(websiteId, posts);
    }

    const tags = this.getTags(websiteId);
    const filtered = tags.filter((t) => t.id !== tagId);
    this.saveTags(websiteId, filtered);
    return { success: true };
  }
}
