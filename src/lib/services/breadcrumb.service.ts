export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface BreadcrumbResolutionInput {
  websiteId?: string;
  slug: string;
  title?: string;
  pageType?: string;
  categoryName?: string;
  categorySlug?: string;
  parentTitle?: string;
  parentSlug?: string;
  baseUrl?: string;
}

export interface BreadcrumbResolutionResult {
  items: BreadcrumbItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaJsonLd: Record<string, any>;
}

export class BreadcrumbService {
  /**
   * Resolves hierarchical breadcrumb items based on page type, relationships, and slug
   */
  public static resolveBreadcrumbs(
    input: BreadcrumbResolutionInput
  ): BreadcrumbResolutionResult {
    const {
      slug,
      title = "Page",
      pageType,
      categoryName,
      categorySlug,
      parentTitle,
      parentSlug,
      baseUrl = "https://mysite.securesite.io",
    } = input;

    const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    // Normalize slug
    const cleanSlug = slug.startsWith("/") ? slug : `/${slug}`;
    const segments = cleanSlug.split("/").filter(Boolean);

    // 1. Blog Detail Page
    if (pageType === "blog-post" || (segments[0] === "blog" && segments.length > 1 && segments[1] !== "category")) {
      items.push({ label: "Blog", href: "/blog" });
      if (categoryName && categorySlug) {
        items.push({
          label: categoryName,
          href: `/blog/category/${categorySlug.replace(/^\/blog\/category\//, "")}`,
        });
      }
      items.push({ label: title, href: cleanSlug });
    }
    // 2. Blog Category Page
    else if (pageType === "blog-category" || (segments[0] === "blog" && segments[1] === "category")) {
      items.push({ label: "Blog", href: "/blog" });
      items.push({
        label: categoryName || title,
        href: cleanSlug,
      });
    }
    // 3. Blog Index Page
    else if (pageType === "blog" || cleanSlug === "/blog") {
      items.push({ label: "Blog", href: "/blog" });
    }
    // 4. Service Sub-Page (e.g. /services/roof-repair or child of services)
    else if (pageType === "service" || segments[0] === "services") {
      items.push({ label: parentTitle || "Services", href: parentSlug || "/services" });
      if (segments.length > 1 || cleanSlug !== "/services") {
        items.push({ label: title, href: cleanSlug });
      }
    }
    // 5. Location Sub-Page (e.g. /locations/austin)
    else if (pageType === "location" || segments[0] === "locations" || segments[0] === "service-areas") {
      items.push({
        label: parentTitle || "Service Areas",
        href: parentSlug || "/service-areas",
      });
      if (segments.length > 1 || (cleanSlug !== "/locations" && cleanSlug !== "/service-areas")) {
        items.push({ label: title, href: cleanSlug });
      }
    }
    // 6. Generic Child Page with Explicit Parent
    else if (parentSlug && parentTitle) {
      items.push({ label: parentTitle, href: parentSlug });
      items.push({ label: title, href: cleanSlug });
    }
    // 7. Standard Top-Level Page (About, Contact, Pricing, FAQ, etc.)
    else if (cleanSlug !== "/") {
      items.push({ label: title, href: cleanSlug });
    }

    // De-duplicate items preserving order
    const deduped: BreadcrumbItem[] = [];
    for (const it of items) {
      if (!deduped.some((d) => d.href === it.href && d.label === it.label)) {
        deduped.push(it);
      }
    }

    // Build Schema.org BreadcrumbList JSON-LD
    const schemaJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: deduped.map((item, index) => {
        const itemUrl = item.href.startsWith("http")
          ? item.href
          : `${baseUrl.replace(/\/$/, "")}${item.href === "/" ? "" : item.href}`;
        return {
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: itemUrl,
        };
      }),
    };

    return {
      items: deduped,
      schemaJsonLd,
    };
  }
}

