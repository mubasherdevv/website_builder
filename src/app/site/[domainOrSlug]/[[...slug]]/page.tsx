import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PageRenderer } from "@/builder/renderer/PageRenderer";
import { localServiceTemplate } from "@/templates/definitions/local-service.template";
import { digitalAgencyTemplate } from "@/templates/definitions/digital-agency.template";
import { restaurantTemplate } from "@/templates/definitions/restaurant.template";
import { corporateConsultingTemplate } from "@/templates/definitions/corporate-consulting.template";
import { wellnessClinicTemplate } from "@/templates/definitions/wellness-clinic.template";
import { PageDocument } from "@/types/builder";
import { SEOService } from "@/server/services/seo.service";

interface TenantPageProps {
  params: {
    domainOrSlug: string;
    slug?: string[];
  };
}

/**
 * Tenant Public Page Resolver
 * PRD.md Section 8 & STACK.md:
 * Renders published pages using the shared PageRenderer in mode="public"
 */
function resolvePublicDocument(domainOrSlug: string, routeSlug: string): PageDocument | null {
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
    // Default to local service (e.g. Austin Elite Plumbing / Lone Star Roofing)
    templatePages = localServiceTemplate.pages;
  }

  // Normalize requested slug
  const normalizedRoute = routeSlug === "" || routeSlug === "/" ? "/" : `/${routeSlug.replace(/^\//, "")}`;

  // Find matching page in template
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

  // Fallback to home page if route is root
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
  const document = resolvePublicDocument(params.domainOrSlug, routeSlug);

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

export default function TenantPublicPage({ params }: TenantPageProps) {
  const routeSlug = params.slug ? params.slug.join("/") : "";
  const document = resolvePublicDocument(params.domainOrSlug, routeSlug);

  if (!document) {
    notFound();
  }

  // Schema.org LocalBusiness JSON-LD markup
  const schemaMarkup = SEOService.generateLocalBusinessSchema({
    title: document.page.title,
    description: document.page.description || "",
    businessName: document.page.title.split("-")[0]?.trim() || document.page.title,
    telephone: "(512) 555-0199",
    address: "100 Congress Ave, Austin, TX 78701",
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
