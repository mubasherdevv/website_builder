import { NextResponse } from "next/server";
import { SEOManagerService } from "@/lib/services/seo-manager.service";
import { CMSPageItem } from "@/types/cms";
import { BlogPost } from "@/types/blog";

export async function GET(
  request: Request,
  { params }: { params: { domainOrSlug: string } }
) {
  const host = params.domainOrSlug;
  const baseUrl = host.includes(".")
    ? `https://${host}`
    : `https://${host}.securesite.io`;

  // Standard published pages for tenant sitemap
  const pages: CMSPageItem[] = [
    {
      id: "p1",
      websiteId: host,
      title: "Home",
      slug: "/",
      status: "published",
      updatedAt: new Date().toISOString(),
      isHome: true,
      seo: {
        title: "Home — Quality Services",
        description: "Welcome to our website.",
        noIndex: false,
      },
    },
    {
      id: "p2",
      websiteId: host,
      title: "Services",
      slug: "/services",
      status: "published",
      updatedAt: new Date().toISOString(),
      seo: {
        title: "Services",
        description: "Explore our wide range of services.",
        noIndex: false,
      },
    },
    {
      id: "p3",
      websiteId: host,
      title: "About Us",
      slug: "/about",
      status: "published",
      updatedAt: new Date().toISOString(),
      seo: {
        title: "About Us",
        description: "Learn more about our team and history.",
        noIndex: false,
      },
    },
    {
      id: "p4",
      websiteId: host,
      title: "Contact",
      slug: "/contact",
      status: "published",
      updatedAt: new Date().toISOString(),
      seo: {
        title: "Contact Us",
        description: "Get in touch with our team today.",
        noIndex: false,
      },
    },
  ];

  const posts: BlogPost[] = [];

  const sitemapXml = SEOManagerService.generateSitemapXml(baseUrl, pages, posts);

  return new NextResponse(sitemapXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
