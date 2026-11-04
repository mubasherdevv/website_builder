"use client";

import React, { useEffect, useState } from "react";
import { EditorShell } from "@/components/editor/EditorShell";
import { emeraldForestPreset } from "@/themes/presets";
import { PageDocument } from "@/types/builder";
import { PagesManagerService } from "@/lib/services/pages-manager.service";
import { Loader2 } from "lucide-react";

interface EditorPageProps {
  params: {
    websiteId: string;
    pageId: string;
  };
}

// Fallback starter document if neither localStorage nor template exists
const defaultDoc: PageDocument = {
  schemaVersion: 1,
  page: {
    id: "page_home",
    title: "Home",
    slug: "/",
    status: "draft",
  },
  sections: [
    {
      id: "sec_header",
      componentId: "header.simple.v1",
      componentVersion: 1,
      props: {
        brandName: "Austin Pro Roofing",
        ctaLabel: "Get a Free Inspection",
        phone: "(512) 555-0199",
      },
    },
    {
      id: "sec_hero",
      componentId: "hero.split.v1",
      componentVersion: 1,
      props: {
        eyebrow: "Austin's Premier Roofing Specialists",
        title: "Dependable Roofing for Central Texas",
        description:
          "From storm restoration to new gutter installation, our licensed crew delivers lasting quality.",
        primaryButtonLabel: "Schedule Roof Inspection",
        secondaryButtonLabel: "View Recent Work",
      },
    },
    {
      id: "sec_services",
      componentId: "services.grid.v1",
      componentVersion: 1,
      props: {
        eyebrow: "Our Core Services",
        title: "Comprehensive Residential & Commercial Care",
        subtitle:
          "Built to withstand severe Texas weather with lifetime warranty shingles.",
      },
    },
    {
      id: "sec_reviews",
      componentId: "testimonials.cards.v1",
      componentVersion: 1,
      props: {
        eyebrow: "5-Star Reputation",
        title: "What Your Neighbors Are Saying",
      },
    },
    {
      id: "sec_contact",
      componentId: "contact.form.v1",
      componentVersion: 1,
      props: {
        eyebrow: "Fast Response",
        title: "Request Your Free Inspection Today",
        phone: "(512) 555-0199",
        address: "701 Brazos St, Austin, TX 78701",
      },
    },
    {
      id: "sec_footer",
      componentId: "footer.simple.v1",
      componentVersion: 1,
      props: {
        brandName: "Austin Pro Roofing",
        copyright: "© 2026 Austin Pro Roofing. All rights reserved.",
      },
    },
  ],
};

export default function EditorPageRoute({ params }: EditorPageProps) {
  const { websiteId, pageId } = params;
  const [doc, setDoc] = useState<PageDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const page = PagesManagerService.getPageById(websiteId, pageId);
      if (page) {
        if (page.document && page.document.sections?.length > 0) {
          setDoc(page.document);
        } else {
          // Check if there is a cached document directly
          const cached = PagesManagerService.getPageDocument(websiteId, pageId);
          if (cached) {
            setDoc(cached);
          } else {
            setDoc({
              ...defaultDoc,
              page: {
                id: page.id,
                title: page.title,
                slug: page.slug,
                status: page.status,
              },
            });
          }
        }
      } else {
        // Check for general page document fallback
        const cached = PagesManagerService.getPageDocument(websiteId, pageId);
        if (cached) {
          setDoc(cached);
        } else {
          setDoc(defaultDoc);
        }
      }
    } catch {
      setDoc(defaultDoc);
    } finally {
      setLoading(false);
    }
  }, [websiteId, pageId]);

  const handleSave = async (updatedDoc: PageDocument) => {
    PagesManagerService.savePageDocument(websiteId, pageId, updatedDoc);
    // Also update page metadata if title/status changed
    const existing = PagesManagerService.getPageById(websiteId, pageId);
    if (existing) {
      PagesManagerService.updatePage(websiteId, pageId, {
        document: updatedDoc,
        title: updatedDoc.page.title || existing.title,
        updatedAt: "Just now",
      });
    }

    // Persist JSON revision snapshot to Supabase database
    try {
      fetch(`/api/websites/${websiteId}/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: updatedDoc }),
      }).catch((e) => console.warn("Supabase revision sync background notice:", e));
    } catch (e) {
      console.warn("Supabase revision sync background notice:", e);
    }
  };

  const handlePublish = async (updatedDoc: PageDocument) => {
    PagesManagerService.savePageDocument(websiteId, pageId, updatedDoc);
    PagesManagerService.updatePage(websiteId, pageId, {
      document: updatedDoc,
      status: "published",
      updatedAt: "Just now",
    });

    // Mark published revision in Supabase database
    try {
      fetch(`/api/websites/${websiteId}/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }).catch((e) => console.warn("Supabase publish sync background notice:", e));
    } catch (e) {
      console.warn("Supabase publish sync background notice:", e);
    }
  };

  if (loading || !doc) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-text-secondary gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm font-medium">Loading Page Editor...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <EditorShell
        websiteId={websiteId}
        backHref={`/websites/${websiteId}/pages`}
        initialDocument={doc}
        theme={emeraldForestPreset}
        websiteName={`Website: ${websiteId}`}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </div>
  );
}
