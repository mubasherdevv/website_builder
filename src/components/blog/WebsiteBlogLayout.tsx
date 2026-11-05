"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SectionNode, ThemeConfig } from "@/types/builder";
import { SectionRenderer } from "@/builder/renderer/SectionRenderer";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { emeraldForestPreset } from "@/themes/presets";
import { PagesManagerService } from "@/lib/services/pages-manager.service";

interface WebsiteBlogLayoutProps {
  websiteId: string;
  children: React.ReactNode;
}

export const WebsiteBlogLayout: React.FC<WebsiteBlogLayoutProps> = ({
  websiteId,
  children,
}) => {
  const fallbackBrand = useMemo(() => {
    return websiteId === "my-site-1" ? "My Business Site" : websiteId.replace(/-/g, " ");
  }, [websiteId]);

  // Synchronous initial header resolution to prevent layout shift or pop-in
  const [headerSection, setHeaderSection] = useState<SectionNode>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`website_${websiteId}_global_header`);
        if (raw) return JSON.parse(raw);
        const homeDoc = PagesManagerService.getPageDocument(websiteId, "page_home");
        const header = homeDoc?.sections?.find((s) => s.componentId.startsWith("header."));
        if (header) return { ...header, props: { ...header.props, websiteId } };
      } catch {}
    }
    return {
      id: "sec_header_init",
      componentId: "header.simple.v1",
      componentVersion: 1,
      props: {
        brandName: fallbackBrand,
        websiteId,
        navLinks: [
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
        ],
        ctaLabel: "Contact Us",
        ctaHref: "/#contact",
        stickyHeader: true,
      },
    };
  });

  // Synchronous initial footer resolution
  const [footerSection, setFooterSection] = useState<SectionNode>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`website_${websiteId}_global_footer`);
        if (raw) return JSON.parse(raw);
        const homeDoc = PagesManagerService.getPageDocument(websiteId, "page_home");
        const footer = homeDoc?.sections?.find((s) => s.componentId.startsWith("footer."));
        if (footer) return { ...footer, props: { ...footer.props, websiteId } };
      } catch {}
    }
    return {
      id: "sec_footer_init",
      componentId: "footer.simple.v1",
      componentVersion: 1,
      props: {
        brandName: fallbackBrand,
        description: `${fallbackBrand} — Official Knowledge Hub & Blog.`,
        copyright: `© ${new Date().getFullYear()} ${fallbackBrand}. All rights reserved.`,
        links: [
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
        ],
      },
    };
  });

  // Synchronous initial theme resolution
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem(`website_${websiteId}_theme`);
        if (savedTheme) return JSON.parse(savedTheme);
      } catch {}
    }
    return emeraldForestPreset;
  });

  useEffect(() => {
    let isMounted = true;

    async function syncServerWebsiteDetails() {
      if (typeof window === "undefined") return;

      try {
        const res = await fetch(`/api/websites/${websiteId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.website?.name && isMounted) {
            const serverBrand = json.website.name;
            setHeaderSection((prev) => ({
              ...prev,
              props: {
                ...prev.props,
                brandName: prev.props?.brandName || serverBrand,
                websiteId,
              },
            }));
            setFooterSection((prev) => ({
              ...prev,
              props: {
                ...prev.props,
                brandName: prev.props?.brandName || serverBrand,
                websiteId,
              },
            }));
          }
        }
      } catch {}
    }

    syncServerWebsiteDetails();

    return () => {
      isMounted = false;
    };
  }, [websiteId]);

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen flex flex-col font-sans transition-colors bg-[var(--color-page-bg,#F5F9F6)] text-[var(--color-text-primary,#172B24)]">
        {/* Real Website Header — Visible immediately without delay */}
        <SectionRenderer section={headerSection} mode="public" />

        {/* Dynamic Page / Blog Content Area */}
        <div className="flex-1 w-full">{children}</div>

        {/* Real Website Footer — Remains in normal page layout */}
        <SectionRenderer section={footerSection} mode="public" />
      </div>
    </ThemeProvider>
  );
};
