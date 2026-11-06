import React from "react";
import { notFound } from "next/navigation";
import { Metadata, Viewport } from "next";
import { PageRenderer } from "@/builder/renderer/PageRenderer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
import { localServiceTemplate } from "@/templates/definitions/local-service.template";
import { digitalAgencyTemplate } from "@/templates/definitions/digital-agency.template";
import { restaurantTemplate } from "@/templates/definitions/restaurant.template";
import { corporateConsultingTemplate } from "@/templates/definitions/corporate-consulting.template";
import { wellnessClinicTemplate } from "@/templates/definitions/wellness-clinic.template";
import { PageDocument } from "@/types/builder";
import { SEOService } from "@/server/services/seo.service";
import { createAdminClient } from "@/lib/supabase/admin";

interface TenantPageProps {
  params: {
    domainOrSlug: string;
    slug?: string[];
  };
}

/**
 * Safe parser to turn blog post content (string or JSON blocks) into styled HTML.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBlogContentToHtml(content: any): string {
  if (!content) return "<p>No content available.</p>";
  if (typeof content === "string") {
    if (content.includes("<p>") || content.includes("<div>")) {
      return content;
    }
    return content
      .split(/\n{2,}/)
      .map(
        (p) =>
          `<p style="margin-bottom: 16px; line-height: 1.75; color: var(--color-text-secondary, #334155); font-size: 16px;">${p.replace(/\n/g, "<br/>")}</p>`
      )
      .join("");
  }
  if (typeof content === "object") {
    if (content.html) return String(content.html);
    if (Array.isArray(content.blocks)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return content.blocks
        .map(
          (b: any) =>
            `<p style="margin-bottom: 16px; line-height: 1.75; color: var(--color-text-secondary, #334155); font-size: 16px;">${b.text || b.content || ""}</p>`
        )
        .join("");
    }
    return `<div style="font-size: 16px; line-height: 1.75; color: var(--color-text-secondary, #334155);">${JSON.stringify(content)}</div>`;
  }
  return "<p>No content available.</p>";
}

/**
 * Extract website's actual Header and Footer sections from its home page,
 * or generate brand-matched defaults if not yet created.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getWebsiteHeaderAndFooter(admin: any, websiteId: string, websiteName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let headerSection: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let footerSection: any = null;

  try {
    const { data: homePage } = await admin
      .from("pages")
      .select("published_revision_id, draft_revision_id")
      .eq("website_id", websiteId)
      .or("slug.eq./,slug.eq.home,slug.eq./home")
      .maybeSingle();

    if (homePage?.published_revision_id || homePage?.draft_revision_id) {
      const { data: rev } = await admin
        .from("page_revisions")
        .select("document")
        .eq("id", homePage.published_revision_id || homePage.draft_revision_id)
        .maybeSingle();

      if (rev?.document) {
        const doc = rev.document as PageDocument;
        headerSection = doc.sections?.find((s) => s.componentId.startsWith("header."));
        footerSection = doc.sections?.find((s) => s.componentId.startsWith("footer."));
      }
    }
  } catch {
    // ignore
  }

  if (!headerSection) {
    headerSection = {
      id: "sec_site_header",
      componentId: "header.simple.v1",
      props: {
        brandName: websiteName || "My Website",
        ctaLabel: "Get a Quote",
        ctaHref: "/#contact",
      },
    };
  }

  if (!footerSection) {
    footerSection = {
      id: "sec_site_footer",
      componentId: "footer.simple.v1",
      props: {
        brandName: websiteName || "My Website",
        tagline: "Professional quality, dedicated service.",
      },
    };
  }

  return { headerSection, footerSection };
}

/**
 * Dynamically resolves blog listing (/blog) and single post (/blog/[slug]) documents
 * using the website's real header, inner page hero, and footer.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveBlogDocument(
  admin: any,
  website: any,
  normalizedRoute: string
): Promise<PageDocument | null> {
  const websiteId = website.id;
  const websiteName = website.name || "Our Website";
  const { headerSection, footerSection } = await getWebsiteHeaderAndFooter(
    admin,
    websiteId,
    websiteName
  );

  // 1. Single Blog Post: /blog/[slug]
  if (normalizedRoute.startsWith("/blog/")) {
    const postSlug = normalizedRoute.replace(/^\/blog\//, "").trim();

    const { data: post } = await admin
      .from("blog_posts")
      .select("*")
      .eq("website_id", websiteId)
      .eq("slug", postSlug)
      .maybeSingle();

    if (!post) {
      return {
        page: {
          id: `blog_not_found_${postSlug}`,
          title: `Article Not Found | ${websiteName}`,
          slug: normalizedRoute,
          status: "published",
          websiteId,
        },
        themeConfig: (website.theme_config as Record<string, unknown>) || {},
        sections: [
          headerSection,
          {
            id: "sec_blog_hero_404",
            componentId: "hero.inner.v1",
            props: {
              eyebrow: "Blog Post",
              title: "Article Not Found",
              subtitle: "The requested article could not be located or may have been moved.",
              breadcrumbs: [
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: "Not Found", href: normalizedRoute },
              ],
            },
          },
          {
            id: "sec_blog_not_found_content",
            componentId: "custom.embed.v1",
            props: {
              htmlContent: `
                <div style="text-align: center; padding: 48px 20px;">
                  <p style="font-size: 15px; color: var(--color-text-secondary, #64748B); margin-bottom: 24px;">Please check out our other articles or return to the blog homepage.</p>
                  <a href="/blog" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; font-size: 13px; font-weight: 600; border-radius: 10px; background: var(--color-primary, #087A55); color: #FFFFFF; text-decoration: none;">&larr; Return to Blog</a>
                </div>
              `,
            },
          },
          footerSection,
        ],
      };
    }

    const postDateFormatted = post.published_at
      ? new Date(post.published_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Recently Published";

    const articleHtml = `
      <article style="max-width: 820px; margin: 0 auto; padding: 20px 16px 48px;">
        ${
          post.featured_image
            ? `<div style="width: 100%; max-height: 440px; overflow: hidden; border-radius: 16px; margin-bottom: 28px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); background: #F1F5F9;">
                <img src="${post.featured_image}" alt="${post.featured_image_alt || post.title}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>`
            : ""
        }
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 13px; color: var(--color-text-muted, #64748B); padding-bottom: 16px; border-bottom: 1px solid var(--color-divider, #E2E8F0); margin-bottom: 28px;">
          <span>Published on ${postDateFormatted}</span>
          ${post.reading_time_minutes ? `<span>• ${post.reading_time_minutes} min read</span>` : ""}
          ${post.author && typeof post.author === "object" && (post.author as any).name ? `<span>• By ${(post.author as any).name}</span>` : ""}
        </div>
        <div style="font-size: 16px; line-height: 1.8; color: var(--color-text-primary, #1E293B);">
          ${parseBlogContentToHtml(post.content)}
        </div>
        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--color-divider, #E2E8F0); display: flex; justify-content: space-between; align-items: center;">
          <a href="/blog" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--color-primary, #087A55); text-decoration: none;">
            <span>&larr;</span>
            <span>Back to All Articles</span>
          </a>
        </div>
      </article>
    `;

    return {
      page: {
        id: `blog_post_${post.id}`,
        title: `${post.title} | ${websiteName}`,
        description: post.excerpt || `${post.title} - Article`,
        slug: normalizedRoute,
        status: "published",
        websiteId,
      },
      themeConfig: (website.theme_config as Record<string, unknown>) || {},
      sections: [
        headerSection,
        {
          id: "sec_blog_hero",
          componentId: "hero.inner.v1",
          props: {
            eyebrow: "Article",
            title: post.title,
            subtitle: post.excerpt || "Insights, updates, and expert tips.",
            breadcrumbs: [
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title, href: normalizedRoute },
            ],
          },
        },
        {
          id: "sec_blog_body",
          componentId: "custom.embed.v1",
          props: {
            htmlContent: articleHtml,
          },
        },
        {
          id: "sec_blog_post_cta",
          componentId: "cta.banner.v1",
          props: {
            eyebrow: "Let's Talk",
            title: "Have Questions About This Article?",
            description: "Reach out to our team today to learn how our services can assist your next project.",
            primaryButtonLabel: "Contact Our Team",
            primaryButtonHref: "/#contact",
            secondaryButtonLabel: "Browse More Articles",
            secondaryButtonHref: "/blog",
          },
        },
        footerSection,
      ],
    };
  }

  // 2. Blog Index: /blog
  const { data: posts } = await admin
    .from("blog_posts")
    .select("*")
    .eq("website_id", websiteId)
    .order("published_at", { ascending: false });

  const hasPosts = Array.isArray(posts) && posts.length > 0;

  const blogListingHtml = hasPosts
    ? `
      <div style="max-w-6xl mx-auto px-4 py-8">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px;">
          ${posts
            .map((post: any) => {
              const dateStr = post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Published";
              return `
              <article style="border: 1px solid var(--color-divider, #E2E8F0); border-radius: 16px; overflow: hidden; background: var(--color-surface, #FFFFFF); box-shadow: 0 4px 12px rgba(0,0,0,0.04); display: flex; flex-direction: column;">
                ${
                  post.featured_image
                    ? `<div style="width: 100%; height: 200px; overflow: hidden; background: #F1F5F9;">
                        <img src="${post.featured_image}" alt="${post.featured_image_alt || post.title}" style="width: 100%; height: 100%; object-fit: cover;" />
                      </div>`
                    : `<div style="width: 100%; height: 160px; background: linear-gradient(135deg, var(--color-primary-soft, #DDF3E8), #F8FAFC); display: flex; align-items: center; justify-content: center; font-size: 32px;">📄</div>`
                }
                <div style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-muted, #94A3B8); margin-bottom: 12px;">
                    <span>${dateStr}</span>
                    ${post.reading_time_minutes ? `<span>• ${post.reading_time_minutes} min read</span>` : ""}
                  </div>
                  <h3 style="font-size: 18px; font-weight: 700; color: var(--color-heading, #0F172A); line-height: 1.35; margin-bottom: 10px;">
                    <a href="/blog/${post.slug}" style="text-decoration: none; color: inherit;">${post.title}</a>
                  </h3>
                  <p style="font-size: 14px; color: var(--color-text-secondary, #475569); line-height: 1.6; margin-bottom: 20px; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${post.excerpt || ""}
                  </p>
                  <div>
                    <a href="/blog/${post.slug}" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--color-primary, #087A55); text-decoration: none;">
                      <span>Read Article</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                </div>
              </article>
            `;
            })
            .join("")}
        </div>
      </div>
    `
    : `
      <div style="max-width: 600px; margin: 40px auto; text-align: center; padding: 56px 24px; border: 1px dashed var(--color-divider, #E2E8F0); border-radius: 20px; background: var(--color-surface, #F8FAFC);">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--color-primary-soft, #DDF3E8); color: var(--color-primary, #087A55); display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 16px;">📖</div>
        <h3 style="font-size: 19px; font-weight: 700; color: var(--color-heading, #1E293B); margin-bottom: 8px;">No Articles Published Yet</h3>
        <p style="font-size: 14px; color: var(--color-text-secondary, #64748B); line-height: 1.6; margin-bottom: 24px;">Our team is crafting helpful articles and industry tips. Check back soon or visit our homepage.</p>
        <a href="/" style="display: inline-flex; align-items: center; padding: 10px 22px; font-size: 13px; font-weight: 600; border-radius: 10px; background: var(--color-primary, #087A55); color: #FFFFFF; text-decoration: none;">Return to Homepage</a>
      </div>
    `;

  return {
    page: {
      id: "blog_index_page",
      title: `Blog & Insights | ${websiteName}`,
      description: `Latest insights, articles, and industry tips from ${websiteName}.`,
      slug: "/blog",
      status: "published",
      websiteId,
    },
    themeConfig: (website.theme_config as Record<string, unknown>) || {},
    sections: [
      headerSection,
      {
        id: "sec_blog_index_hero",
        componentId: "hero.inner.v1",
        props: {
          eyebrow: "Articles & Updates",
          title: "Our Blog & Insights",
          subtitle: "Explore the latest news, expert guides, and updates from our team.",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
          ],
        },
      },
      {
        id: "sec_blog_index_listing",
        componentId: "custom.embed.v1",
        props: {
          htmlContent: blogListingHtml,
        },
      },
      footerSection,
    ],
  };
}

/**
 * Builds a branded placeholder page with Header, Inner Page Hero banner, and Footer
 * whenever an uncreated page is visited on a tenant subdomain.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveBrandedFallbackDocument(
  admin: any,
  website: any,
  normalizedRoute: string
): Promise<PageDocument> {
  const websiteId = website.id;
  const websiteName = website.name || "Our Website";
  const { headerSection, footerSection } = await getWebsiteHeaderAndFooter(
    admin,
    websiteId,
    websiteName
  );

  const cleanName =
    normalizedRoute
      .replace(/^\//, "")
      .split(/[-_/]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Page";

  return {
    page: {
      id: `fallback_${normalizedRoute.replace(/[^a-zA-Z0-9]/g, "_")}`,
      title: `${cleanName} | ${websiteName}`,
      description: `Welcome to ${cleanName} at ${websiteName}.`,
      slug: normalizedRoute,
      status: "published",
      websiteId,
    },
    themeConfig: (website.theme_config as Record<string, unknown>) || {},
    sections: [
      headerSection,
      {
        id: "sec_fallback_hero",
        componentId: "hero.inner.v1",
        props: {
          eyebrow: "Under Construction",
          title: `${cleanName} — Coming Soon`,
          subtitle: "We are actively preparing this page. Feel free to explore our homepage or get in touch with our team in the meantime.",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: cleanName, href: normalizedRoute },
          ],
        },
      },
      {
        id: "sec_fallback_cta",
        componentId: "cta.banner.v1",
        props: {
          eyebrow: "Stay In Touch",
          title: "Have Questions Or Need Immediate Assistance?",
          description: "Our team is ready to assist you with any questions, estimates, or service inquiries.",
          primaryButtonLabel: "Return to Homepage",
          primaryButtonHref: "/",
          secondaryButtonLabel: "Contact Our Team",
          secondaryButtonHref: "/#contact",
        },
      },
      footerSection,
    ],
  };
}

/**
 * Try to resolve a page from the database first.
 * Falls back to hardcoded templates if no database page matches.
 */
async function resolvePublicDocumentFromDB(
  domainOrSlug: string,
  routeSlug: string
): Promise<PageDocument | null> {
  try {
    const admin = createAdminClient();

    // Normalize domain: strip protocol, www, and .securesite.io / .localhost suffix
    const normalizedDomain = domainOrSlug
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\.securesite\.io$/, "")
      .replace(/\.localhost.*$/, "")
      .replace(/:[0-9]+$/, "")
      .replace(/\/$/, "");

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let query = admin
      .from("websites")
      .select("id, name, subdomain, custom_domain, theme_config");

    if (UUID_REGEX.test(normalizedDomain)) {
      query = query.eq("id", normalizedDomain);
    } else {
      query = query.or(`subdomain.eq.${normalizedDomain},custom_domain.eq.${normalizedDomain}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: website, error: websiteError } = (await query.maybeSingle()) as any;

    if (websiteError || !website) {
      return null;
    }

    const websiteId = website.id;

    // Normalize route slug
    const normalizedRoute =
      routeSlug === "" || routeSlug === "/" ? "/" : `/${routeSlug.replace(/^\//, "")}`;

    // Find page by website_id and slug (prefer published, but fall back to draft)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: initialPage, error: pageError } = (await (admin as any)
      .from("pages")
      .select("id, title, slug, status, published_revision_id, draft_revision_id")
      .eq("website_id", websiteId)
      .eq("slug", normalizedRoute)
      .maybeSingle()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    let page = initialPage;

    // Fallback: If route is home ("/") and not found, try slug "home"
    if (!page && normalizedRoute === "/") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: altHomePage } = (await (admin as any)
        .from("pages")
        .select("id, title, slug, status, published_revision_id, draft_revision_id")
        .eq("website_id", websiteId)
        .or("slug.eq.home,slug.eq./home")
        .maybeSingle()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (altHomePage) page = altHomePage;
    }

    // If page exists in database, resolve its revision
    if (!pageError && page) {
      const targetRevId = page.published_revision_id || page.draft_revision_id;
      if (targetRevId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: revision, error: revError } = (await (admin as any)
          .from("page_revisions")
          .select("document")
          .eq("id", targetRevId)
          .maybeSingle()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        if (!revError && revision?.document) {
          const doc = revision.document as unknown as PageDocument;
          return {
            ...doc,
            themeConfig: (website.theme_config as Record<string, unknown>) || {},
            page: {
              ...doc.page,
              id: page.id,
              websiteId: websiteId,
              status: page.status || "published",
            },
          } as unknown as PageDocument;
        }
      }
    }

    // If page does NOT exist in database:
    // 1. Is this a Blog route (/blog or /blog/[slug])?
    if (normalizedRoute === "/blog" || normalizedRoute.startsWith("/blog/")) {
      return await resolveBlogDocument(admin, website, normalizedRoute);
    }

    // 2. Try template fallback first if available
    const templateDoc = resolvePublicDocumentFromTemplate(domainOrSlug, routeSlug);
    if (templateDoc) {
      return templateDoc;
    }

    // 3. Fallback for uncreated pages on this tenant: Branded Coming Soon page with Header, Inner Hero, and Footer!
    return await resolveBrandedFallbackDocument(admin, website, normalizedRoute);
  } catch {
    return null;
  }
}

/**
 * Legacy fallback: resolve from hardcoded templates.
 */
function resolvePublicDocumentFromTemplate(
  domainOrSlug: string,
  routeSlug: string
): PageDocument | null {
  const identifier = domainOrSlug.toLowerCase();

  let templatePages: PageDocument[];
  if (identifier.includes("agency") || identifier.includes("nexa")) {
    templatePages = digitalAgencyTemplate.pages;
  } else if (identifier.includes("restaurant") || identifier.includes("bistro")) {
    templatePages = restaurantTemplate.pages;
  } else if (identifier.includes("consulting") || identifier.includes("vanguard") || identifier.includes("corporate")) {
    templatePages = corporateConsultingTemplate.pages;
  } else if (identifier.includes("wellness") || identifier.includes("clinic") || identifier.includes("aura")) {
    templatePages = wellnessClinicTemplate.pages;
  } else {
    templatePages = localServiceTemplate.pages;
  }

  const normalizedRoute =
    routeSlug === "" || routeSlug === "/" ? "/" : `/${routeSlug.replace(/^\//, "")}`;

  const matchedPage = templatePages.find((p) => {
    const pageSlug = p.page.slug === "" || p.page.slug === "/" ? "/" : `/${p.page.slug.replace(/^\//, "")}`;
    return pageSlug === normalizedRoute;
  });

  if (matchedPage) {
    return {
      ...matchedPage,
      page: {
        ...matchedPage.page,
        status: "published",
      },
    };
  }

  if (normalizedRoute === "/" && templatePages.length > 0) {
    return {
      ...templatePages[0],
      page: {
        ...templatePages[0].page,
        status: "published",
      },
    };
  }

  return null;
}

export async function generateMetadata({ params }: TenantPageProps): Promise<Metadata> {
  const routeSlug = params.slug ? params.slug.join("/") : "";

  // Try database first, then template fallback
  let document = await resolvePublicDocumentFromDB(params.domainOrSlug, routeSlug);

  if (!document) {
    document = resolvePublicDocumentFromTemplate(params.domainOrSlug, routeSlug);
  }

  if (!document) {
    return {
      title: "Page Not Found",
    };
  }

  const title = document.page.title;
  const description = document.page.description || `${title} - Professional Services`;
  const domain = params.domainOrSlug.includes(".")
    ? `https://${params.domainOrSlug}`
    : `https://${params.domainOrSlug}.securesite.io`;
  const canonicalUrl = `${domain}${document.page.slug === "/" ? "" : document.page.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
  };
}

export default async function TenantPublicPage({ params }: TenantPageProps) {
  const routeSlug = params.slug ? params.slug.join("/") : "";

  // Resolve document: try database first, then template fallback
  const document = await resolvePublicDocumentFromDB(params.domainOrSlug, routeSlug) ||
    resolvePublicDocumentFromTemplate(params.domainOrSlug, routeSlug);

  if (!document) {
    notFound();
  }

  // Extract business info from theme_config or document props for schema markup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const themeConfig = (document as any).themeConfig || {};
  const businessName =
    themeConfig.businessName ||
    document.page.title.split("-")[0]?.trim() ||
    document.page.title;
  const telephone =
    themeConfig.phone || "(512) 555-0199";
  const address =
    themeConfig.address || "100 Congress Ave, Austin, TX 78701";

  // Schema.org LocalBusiness JSON-LD markup
  const schemaMarkup = SEOService.generateLocalBusinessSchema({
    title: document.page.title,
    description: document.page.description || "",
    businessName,
    telephone,
    address,
    canonicalUrl: `https://${params.domainOrSlug}.securesite.io`,
    noIndex: false,
    noFollow: false,
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Dynamic SEO JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Shared Page Renderer in strict public visitor mode */}
      <PageRenderer document={document} mode="public" />
    </main>
  );
}
