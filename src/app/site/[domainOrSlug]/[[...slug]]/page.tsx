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

    if (pageError || !page) {
      return null;
    }

    // Target revision id: published_revision_id first, fallback to draft_revision_id
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

    return null;
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
