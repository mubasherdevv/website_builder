import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WebsiteRepository } from "@/lib/database/repositories/website.repo";
import { PageRepository } from "@/lib/database/repositories/page.repo";
import { BlogRepository } from "@/lib/database/repositories/blog.repo";
import { listTemplates, cloneTemplateForWebsite } from "@/templates/services/template-clone.service";
import { WebsiteCreationDraft } from "@/types/creation-wizard";
import { PageDocument } from "@/types/builder";
import { generateEntityId } from "@/lib/utils/id";

export async function POST(request: Request) {
  try {
    const draft: WebsiteCreationDraft = await request.json();
    const admin = createAdminClient();
    const websiteRepo = new WebsiteRepository(admin);
    const pageRepo = new PageRepository(admin);
    const blogRepo = new BlogRepository(admin);

    const { basicInfo, services, locations, blogTitles, keywordClusters } = draft;

    // 1. Resolve or create organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingOrg } = await (admin as any)
      .from("organizations")
      .select("id")
      .limit(1)
      .maybeSingle();

    let organizationId = existingOrg?.id;
    if (!organizationId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newOrg } = await (admin as any)
        .from("organizations")
        .insert({ name: "Personal Workspace", slug: "workspace-" + Date.now() })
        .select("id")
        .single();
      organizationId = newOrg?.id;
    }

    // 2. Compute clean subdomain
    const cleanSubdomain =
      basicInfo.projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `site-${Date.now()}`;

    // 3. Create Website Record
    const website = await websiteRepo.create({
      organizationId,
      name: basicInfo.projectName || basicInfo.businessName,
      subdomain: `${cleanSubdomain}-${Math.random().toString(36).substring(2, 6)}`,
      status: "draft",
    });

    const websiteId = website.id;

    // 4. Clone Selected Template
    const templates = listTemplates();
    const chosenTemplate =
      templates.find((t) => t.id === draft.selectedTemplateId) || templates[0];

    const { clonedPages } = cloneTemplateForWebsite(chosenTemplate, {
      businessName: basicInfo.businessName,
      phone: basicInfo.phone,
      email: basicInfo.email,
      address: basicInfo.address,
    });

    // 5. Commit Cloned Template Pages (Homepage, etc.)
    for (const doc of clonedPages) {
      // Find matching keywords
      const cluster = keywordClusters.find(
        (c) => c.pageSlug === doc.page.slug || (doc.page.slug === "/" && c.pageType === "homepage")
      );

      const pageTitle = doc.page.title;
      const pageSlug = doc.page.slug;

      const { page: createdPage } = await pageRepo.createPage(
        websiteId,
        pageTitle,
        pageSlug,
        doc
      );

      if (cluster && createdPage) {
        // Update SEO metadata on page
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from("pages")
          .update({
            seo_title: cluster.primaryKeyword ? `${pageTitle} | ${cluster.primaryKeyword}` : pageTitle,
            meta_description: cluster.secondaryKeywords?.join(", ") || "",
          })
          .eq("id", createdPage.id);
      }
    }

    // 6. Create Service Pages in Draft Status
    for (const service of services.slice(0, 10)) {
      const slug = `/services/${service.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
      const cluster = keywordClusters.find((c) => c.pageName === service.name || c.pageSlug === slug);

      const serviceDoc: PageDocument = {
        schemaVersion: 1,
        page: {
          id: generateEntityId("page"),
          title: `${service.name} | ${basicInfo.businessName}`,
          slug,
          status: "draft",
          description: `Professional ${service.name.toLowerCase()} provided by ${basicInfo.businessName} in ${basicInfo.city}.`,
        },
        sections: [
          {
            id: generateEntityId("sec"),
            componentId: "header.simple.v1",
            componentVersion: 1,
            props: {
              brandName: basicInfo.businessName,
              phone: basicInfo.phone,
              ctaLabel: "Contact Us",
              ctaHref: "/contact",
            },
          },
          {
            id: generateEntityId("sec"),
            componentId: "hero.split.v1",
            componentVersion: 1,
            props: {
              eyebrow: `${basicInfo.city} Specialist`,
              title: service.name,
              description: `Top-rated ${service.name.toLowerCase()} in ${basicInfo.city} and surrounding areas. Upfront estimates, skilled craftsmanship, and total peace of mind.`,
              primaryButtonLabel: "Request Service",
              primaryButtonHref: "/contact",
              secondaryButtonLabel: `Call ${basicInfo.phone}`,
              secondaryButtonHref: `tel:${basicInfo.phone.replace(/[^0-9]/g, "")}`,
            },
          },
          {
            id: generateEntityId("sec"),
            componentId: "contact.form.v1",
            componentVersion: 1,
            props: {
              eyebrow: "Fast Booking",
              title: `Schedule Your ${service.name}`,
              subtitle: `Our team in ${basicInfo.city} is ready to help.`,
              phone: basicInfo.phone,
              email: basicInfo.email,
              address: basicInfo.address || `${basicInfo.city}, ${basicInfo.country}`,
              submitButtonLabel: "Send Request",
            },
          },
          {
            id: generateEntityId("sec"),
            componentId: "footer.simple.v1",
            componentVersion: 1,
            props: {
              brandName: basicInfo.businessName,
              copyright: `© ${new Date().getFullYear()} ${basicInfo.businessName}. All rights reserved.`,
            },
          },
        ],
      };

      const { page: createdPage } = await pageRepo.createPage(
        websiteId,
        serviceDoc.page.title,
        slug,
        serviceDoc
      );

      if (cluster && createdPage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from("pages")
          .update({
            seo_title: `${service.name} | ${cluster.primaryKeyword || basicInfo.city}`,
            meta_description: cluster.longTailKeywords?.join("; ") || `Expert ${service.name} in ${basicInfo.city}.`,
          })
          .eq("id", createdPage.id);
      }
    }

    // 7. Create Location Pages in Draft Status
    for (const loc of locations.slice(0, 10)) {
      const slug = `/locations/${loc.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
      const cluster = keywordClusters.find((c) => c.pageName === loc.name || c.pageSlug === slug);

      const locationDoc: PageDocument = {
        schemaVersion: 1,
        page: {
          id: generateEntityId("page"),
          title: `${basicInfo.niche} in ${loc.name} | ${basicInfo.businessName}`,
          slug,
          status: "draft",
          description: `Serving ${loc.name} with reliable ${basicInfo.niche.toLowerCase()} by ${basicInfo.businessName}.`,
        },
        sections: [
          {
            id: generateEntityId("sec"),
            componentId: "header.simple.v1",
            componentVersion: 1,
            props: {
              brandName: basicInfo.businessName,
              phone: basicInfo.phone,
              ctaLabel: "Get Estimate",
              ctaHref: "/contact",
            },
          },
          {
            id: generateEntityId("sec"),
            componentId: "hero.split.v1",
            componentVersion: 1,
            props: {
              eyebrow: `Local Coverage: ${loc.name}`,
              title: `${basicInfo.niche} in ${loc.name}`,
              description: `Dedicated ${basicInfo.niche.toLowerCase()} service for homeowners and businesses in ${loc.name}. Fast local response and satisfaction guaranteed.`,
              primaryButtonLabel: "Contact Local Team",
              primaryButtonHref: "/contact",
              secondaryButtonLabel: `Call ${basicInfo.phone}`,
              secondaryButtonHref: `tel:${basicInfo.phone.replace(/[^0-9]/g, "")}`,
            },
          },
          {
            id: generateEntityId("sec"),
            componentId: "footer.simple.v1",
            componentVersion: 1,
            props: {
              brandName: basicInfo.businessName,
              copyright: `© ${new Date().getFullYear()} ${basicInfo.businessName}. All rights reserved.`,
            },
          },
        ],
      };

      const { page: createdPage } = await pageRepo.createPage(
        websiteId,
        locationDoc.page.title,
        slug,
        locationDoc
      );

      if (cluster && createdPage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from("pages")
          .update({
            seo_title: `${basicInfo.niche} in ${loc.name} | ${basicInfo.businessName}`,
            meta_description: cluster.secondaryKeywords?.join(", ") || `Serving ${loc.name}.`,
          })
          .eq("id", createdPage.id);
      }
    }

    // 8. Save Approved Blog Titles as Draft Blog Posts in CMS
    for (const blog of blogTitles) {
      const slug = blog.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await blogRepo.savePost({
        id: generateEntityId("post"),
        websiteId,
        title: blog.title,
        slug: slug || `post-${Date.now()}`,
        status: "draft",
        excerpt: `SEO planning article for: ${blog.title}`,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Draft content planned for topic: ${blog.title}. Intent: ${blog.intent || "informational"}.`,
                },
              ],
            },
          ],
        },
        readingTimeMinutes: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      websiteId,
      subdomain: cleanSubdomain,
    });
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create website with onboarding data",
      },
      { status: 500 }
    );
  }
}

