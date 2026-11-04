import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { componentRegistry, validateComponentProps } from "@/builder/registry";
import { HeaderSimple } from "@/components/website/header/HeaderSimple";
import { HeaderTopBar } from "@/components/website/header/HeaderTopBar";
import { HeaderTransparent } from "@/components/website/header/HeaderTransparent";
import { NavigationManagerService } from "@/lib/services/navigation-manager.service";
import { PagesManagerService } from "@/lib/services/pages-manager.service";

describe("Ready-Made Header Templates System", () => {
  const websiteId = "test-header-site";

  beforeEach(() => {
    localStorage.clear();
  });

  describe("1. Component Registry & Schema Validation", () => {
    it("registers all 3 header variants and aliases in component registry", () => {
      expect(componentRegistry["header.simple.v1"]).toBeDefined();
      expect(componentRegistry["header.classic.v1"]).toBeDefined();
      expect(componentRegistry["header.topbar.v1"]).toBeDefined();
      expect(componentRegistry["header.transparent.v1"]).toBeDefined();
    });

    it("validates Classic Business Header schema with valid props", () => {
      const validProps = {
        brandName: "Acme Pro Services",
        phone: "+1 (555) 019-2834",
        ctaLabel: "Schedule Now",
        alignment: "center",
      };
      const validation = validateComponentProps("header.simple.v1", validProps);
      expect(validation.success).toBe(true);
      expect(validation.data?.brandName).toBe("Acme Pro Services");
    });

    it("validates Top Bar + Header schema with top bar and social links", () => {
      const validProps = {
        brandName: "Apex Construction",
        email: "office@apexbuild.com",
        phone: "(512) 555-8822",
        location: "Austin, TX",
        showTopBar: true,
        showSocials: true,
        ctaLabel: "Request Estimate",
      };
      const validation = validateComponentProps("header.topbar.v1", validProps);
      expect(validation.success).toBe(true);
      expect(validation.data?.email).toBe("office@apexbuild.com");
      expect(validation.data?.location).toBe("Austin, TX");
    });

    it("validates Modern Transparent / Hero Header schema", () => {
      const validProps = {
        brandName: "Luxe Agency",
        overlayHero: true,
        scrolledBackground: "glass",
        ctaLabel: "Book Consultation",
      };
      const validation = validateComponentProps("header.transparent.v1", validProps);
      expect(validation.success).toBe(true);
      expect(validation.data?.overlayHero).toBe(true);
      expect(validation.data?.scrolledBackground).toBe("glass");
    });
  });

  describe("2. Variant 1: Classic Business Header Rendering", () => {
    it("renders brand, center navigation items, phone contact, and CTA button", () => {
      render(
        <HeaderSimple
          brandName="Austin Roofing Pro"
          phone="+1 (512) 555-0100"
          ctaLabel="Get a Quote"
          navLinks={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      );

      expect(screen.getByText("Austin Roofing Pro")).toBeDefined();
      expect(screen.getByText("Services")).toBeDefined();
      expect(screen.getByText("+1 (512) 555-0100")).toBeDefined();
      expect(screen.getByText("Get a Quote")).toBeDefined();
    });

    it("toggles mobile menu drawer on mobile hamburger click", () => {
      render(
        <HeaderSimple
          brandName="Austin Roofing Pro"
          phone="+1 (512) 555-0100"
          ctaLabel="Get a Quote"
          navLinks={[{ label: "Services", href: "/services" }]}
        />
      );

      const hamburger = screen.getByLabelText("Open menu");
      fireEvent.click(hamburger);
      expect(screen.getByText("Call Us: +1 (512) 555-0100")).toBeDefined();
    });
  });

  describe("3. Variant 2: Top Bar + Main Header Rendering", () => {
    it("renders top utility bar with email, phone, location and main header with search & CTA", () => {
      render(
        <HeaderTopBar
          brandName="BuildPro Austin"
          email="support@buildpro.com"
          phone="+1 (555) 999-4444"
          location="Austin, Texas"
          ctaLabel="Request a Call"
          showSearch={true}
          navLinks={[
            { label: "Home", href: "/" },
            { label: "Projects", href: "/projects" },
          ]}
        />
      );

      expect(screen.getByText("support@buildpro.com")).toBeDefined();
      expect(screen.getByText("+1 (555) 999-4444")).toBeDefined();
      expect(screen.getByText("Austin, Texas")).toBeDefined();
      expect(screen.getByText("BuildPro Austin")).toBeDefined();
      expect(screen.getByText("Request a Call")).toBeDefined();
      expect(screen.getByLabelText("Search website")).toBeDefined();
    });
  });

  describe("4. Variant 3: Modern Transparent / Hero Header", () => {
    it("renders overlay styling with clean contrast and outline CTA button", () => {
      render(
        <HeaderTransparent
          brandName="Nexus Creative"
          ctaLabel="Book Now"
          overlayHero={true}
          navLinks={[
            { label: "Home", href: "/" },
            { label: "Portfolio", href: "/portfolio" },
          ]}
        />
      );

      expect(screen.getByText("Nexus Creative")).toBeDefined();
      expect(screen.getByText("Portfolio")).toBeDefined();
      expect(screen.getByText("Book Now")).toBeDefined();
    });
  });

  describe("5. Navigation Manager Dynamic Sync", () => {
    it("loads navigation items dynamically from active WebsiteMenu", () => {
      const customMenu = NavigationManagerService.createMenu(
        websiteId,
        "Custom Test Header Menu",
        "header"
      );

      NavigationManagerService.saveMenu(websiteId, {
        ...customMenu,
        items: [
          {
            id: "m_home",
            menuId: customMenu.id,
            label: "Overview Home",
            customUrl: "/",
            type: "custom",
            enabled: true,
            openInNewTab: false,
            visibility: { desktop: true, mobile: true },
          },
          {
            id: "m_serv",
            menuId: customMenu.id,
            label: "Specialized Services",
            customUrl: "/services",
            type: "custom",
            enabled: true,
            openInNewTab: false,
            visibility: { desktop: true, mobile: true },
          },
        ],
      });

      render(
        <HeaderSimple
          brandName="Dynamic Sync Corp"
          menuId={customMenu.id}
          websiteId={websiteId}
        />
      );

      expect(screen.getByText("Overview Home")).toBeDefined();
      expect(screen.getByText("Specialized Services")).toBeDefined();
    });
  });

  describe("6. Global Header Synchronization", () => {
    it("synchronizes header configuration across all website page documents", () => {
      PagesManagerService.getPages(websiteId);

      const newHeaderSection = {
        id: "sec_header_sync",
        componentId: "header.topbar.v1",
        componentVersion: 1,
        props: {
          brandName: "Globally Synced Site",
          email: "global@company.com",
          ctaLabel: "Connect Now",
        },
      };

      PagesManagerService.syncGlobalHeader(websiteId, newHeaderSection as any);

      const savedGlobal = PagesManagerService.getGlobalHeader(websiteId);
      expect(savedGlobal?.componentId).toBe("header.topbar.v1");
      expect(savedGlobal?.props?.brandName).toBe("Globally Synced Site");
    });
  });
});
