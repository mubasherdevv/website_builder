import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { HeaderSimple } from "@/components/website/header/HeaderSimple";
import { HeroSplit } from "@/components/website/hero/HeroSplit";
import { ServicesGrid } from "@/components/website/services/ServicesGrid";
import { AboutSplit } from "@/components/website/about/AboutSplit";
import { TestimonialsCards } from "@/components/website/testimonials/TestimonialsCards";
import { GalleryGrid } from "@/components/website/gallery/GalleryGrid";
import { ContactForm } from "@/components/website/forms/ContactForm";
import { CtaBanner } from "@/components/website/cta/CtaBanner";
import { FooterSimple } from "@/components/website/footer/FooterSimple";
import { Canvas } from "@/components/editor/Canvas";
import { modernPurplePreset } from "@/themes/presets";
import { PageDocument } from "@/types/builder";

describe("Fully Responsive Website Rendering & Editing", () => {
  describe("1. Header & Navigation Component", () => {
    it("renders desktop brand, nav links, and toggles mobile hamburger drawer", () => {
      render(
        React.createElement(HeaderSimple, {
          brandName: "Peak Roofing",
          navLinks: [
            { label: "Home", href: "/" },
            { label: "Services", href: "#services" },
            { label: "Contact", href: "#contact" },
          ],
          ctaLabel: "Request Inspection",
          phone: "(512) 555-0199",
        })
      );

      // Brand should be visible
      expect(screen.getByText("Peak Roofing")).toBeDefined();

      // Desktop links rendered in nav
      expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Services").length).toBeGreaterThan(0);

      // Hamburger button exists with aria-label
      const hamburgerBtn = screen.getByLabelText("Open menu");
      expect(hamburgerBtn).toBeDefined();

      // Click hamburger to open mobile menu drawer
      fireEvent.click(hamburgerBtn);

      // Mobile drawer now open, button toggles to 'Close menu'
      expect(screen.getByLabelText("Close menu")).toBeDefined();
      expect(screen.getByText("Call Us: (512) 555-0199")).toBeDefined();

      // Click a mobile menu link to close
      const mobileServiceLinks = screen.getAllByText("Services");
      fireEvent.click(mobileServiceLinks[mobileServiceLinks.length - 1]);
      expect(screen.getByLabelText("Open menu")).toBeDefined();
    });
  });

  describe("2. Hero Split Component", () => {
    it("renders responsive heading, description, full-width action buttons, and image", () => {
      render(
        React.createElement(HeroSplit, {
          eyebrow: "Emergency Repairs",
          title: "Fast Local Plumbing",
          description: "Prompt, certified plumbers available 24/7 with transparent pricing.",
          primaryButtonLabel: "Book Online",
          secondaryButtonLabel: "Call Specialist",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
        })
      );

      expect(screen.getByText("Emergency Repairs")).toBeDefined();
      expect(screen.getByText("Fast Local Plumbing")).toBeDefined();
      expect(screen.getByText("Book Online")).toBeDefined();
      expect(screen.getByText("Call Specialist")).toBeDefined();
      expect(screen.getByAltText("Hero background image")).toBeDefined();
    });
  });

  describe("3. Services Grid Component", () => {
    it("renders responsive grid and touch carousel modes", () => {
      const { rerender } = render(
        React.createElement(ServicesGrid, {
          title: "Commercial Services",
          layout: "grid",
          columns: "3",
          services: [
            { title: "Leak Detection", description: "Infrared pipe scanning.", icon: "wrench" },
            { title: "Repiping", description: "Full copper repiping.", icon: "check" },
          ],
        })
      );

      expect(screen.getByText("Commercial Services")).toBeDefined();
      expect(screen.getByText("Leak Detection")).toBeDefined();
      expect(screen.getByText("Repiping")).toBeDefined();

      // Switch to touch carousel
      rerender(
        React.createElement(ServicesGrid, {
          title: "Commercial Services",
          layout: "carousel",
          services: [
            { title: "Leak Detection", description: "Infrared pipe scanning.", icon: "wrench" },
          ],
        })
      );

      expect(screen.getByLabelText("Previous service")).toBeDefined();
      expect(screen.getByLabelText("Next service")).toBeDefined();
    });
  });

  describe("4. About Split Component", () => {
    it("renders responsive stats, story, and highlights", () => {
      render(
        React.createElement(AboutSplit, {
          title: "Over a Decade of Trust",
          stats: [
            { label: "Projects Completed", value: "4,500+" },
            { label: "Customer Rating", value: "99.8%" },
          ],
          highlights: ["Licensed & Bonded", "Upfront Flat Pricing"],
        })
      );

      expect(screen.getByText("Over a Decade of Trust")).toBeDefined();
      expect(screen.getByText("4,500+")).toBeDefined();
      expect(screen.getByText("Projects Completed")).toBeDefined();
      expect(screen.getByText("Licensed & Bonded")).toBeDefined();
    });
  });

  describe("5. Testimonials Cards Component", () => {
    it("renders reviews in horizontal scroll carousel and multi-column grid", () => {
      const { rerender } = render(
        React.createElement(TestimonialsCards, {
          title: "Client Feedback",
          layout: "carousel",
          testimonials: [
            {
              quote: "Remarkable service, punctual and professional.",
              authorName: "John Smith",
              authorRole: "Austin Resident",
              rating: 5,
            },
          ],
        })
      );

      expect(screen.getByText("Client Feedback")).toBeDefined();
      expect(screen.getByText(/Remarkable service/)).toBeDefined();
      expect(screen.getByText("John Smith")).toBeDefined();
      expect(screen.getByLabelText("Scroll reviews left")).toBeDefined();
      expect(screen.getByLabelText("Scroll reviews right")).toBeDefined();

      // Test standard grid mode
      rerender(
        React.createElement(TestimonialsCards, {
          title: "Client Feedback",
          layout: "grid",
          testimonials: [
            {
              quote: "Remarkable service, punctual and professional.",
              authorName: "John Smith",
              authorRole: "Austin Resident",
              rating: 5,
            },
          ],
        })
      );

      expect(screen.getByText("John Smith")).toBeDefined();
    });
  });

  describe("6. Gallery Grid Component", () => {
    it("renders responsive image showcase with aspect ratios", () => {
      render(
        React.createElement(GalleryGrid, {
          title: "Our Work in Photos",
          columns: "3",
          images: [
            {
              title: "Kitchen Remodel",
              category: "Residential",
              imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f",
            },
          ],
        })
      );

      expect(screen.getByText("Our Work in Photos")).toBeDefined();
      expect(screen.getByText("Kitchen Remodel")).toBeDefined();
      expect(screen.getByText("Residential")).toBeDefined();
    });
  });

  describe("7. Contact Form Component", () => {
    it("renders full-width responsive form inputs and handles submission", () => {
      render(
        React.createElement(ContactForm, {
          title: "Schedule Inspection",
          phone: "(512) 555-0100",
          email: "team@peakroofing.com",
          address: "701 Brazos St, Austin, TX",
          buttonLabel: "Send Message",
        })
      );

      expect(screen.getByText("Schedule Inspection")).toBeDefined();
      expect(screen.getByText("(512) 555-0100")).toBeDefined();
      expect(screen.getByText("team@peakroofing.com")).toBeDefined();

      const nameInput = screen.getByPlaceholderText("John Doe");
      const phoneInput = screen.getByPlaceholderText("(555) 000-0000");
      const form = nameInput.closest("form")!;

      fireEvent.change(nameInput, { target: { value: "Alex Rivera" } });
      fireEvent.change(phoneInput, { target: { value: "5125551234" } });
      fireEvent.submit(form);

      expect(screen.getByText("Request Received!")).toBeDefined();
    });
  });

  describe("8. CTA Banner & Footer Components", () => {
    it("renders responsive CTA banner and footer layout", () => {
      render(
        React.createElement("div", null,
          React.createElement(CtaBanner, {
            title: "Book Your Inspection Today",
            primaryButtonLabel: "Get Started",
            secondaryButtonLabel: "Call Directly",
          }),
          React.createElement(FooterSimple, {
            brandName: "Peak Roofing",
            copyright: "© 2026 Peak Roofing. All rights reserved.",
          })
        )
      );

      expect(screen.getByText("Book Your Inspection Today")).toBeDefined();
      expect(screen.getByText("Get Started")).toBeDefined();
      expect(screen.getByText("Call Directly")).toBeDefined();
      expect(screen.getByText("Peak Roofing")).toBeDefined();
      expect(screen.getByText("© 2026 Peak Roofing. All rights reserved.")).toBeDefined();
    });
  });

  describe("9. Canvas Viewport Controls & Breakpoint Presets", () => {
    const sampleDoc: PageDocument = {
      schemaVersion: 1,
      page: { id: "p1", title: "Home", slug: "/", status: "draft" },
      sections: [
        {
          id: "s_hero",
          componentId: "hero.split.v1",
          componentVersion: 1,
          props: { title: "Responsive Canvas Section" },
        },
      ],
    };

    it("renders responsive indicator and width presets for mobile, tablet, and desktop", () => {
      const onSelect = vi.fn();

      const { rerender } = render(
        React.createElement(Canvas, {
          document: sampleDoc,
          theme: modernPurplePreset,
          viewport: "mobile",
          selectedSectionId: null,
          onSelectSection: onSelect,
          onDeleteSection: vi.fn(),
          onDuplicateSection: vi.fn(),
          onMoveSectionUp: vi.fn(),
          onMoveSectionDown: vi.fn(),
          onAddSectionClick: vi.fn(),
        })
      );

      // Mobile indicator and presets: 320px, 360px, 375px, 390px, 430px
      expect(screen.getByText("Mobile Preview:")).toBeDefined();
      expect(screen.getAllByText("320px").length).toBeGreaterThan(0);
      expect(screen.getAllByText("375px").length).toBeGreaterThan(0);
      expect(screen.getAllByText("430px").length).toBeGreaterThan(0);

      // Click 320px preset button
      const btn320 = screen.getByRole("button", { name: "320px" });
      fireEvent.click(btn320);
      expect(screen.getAllByText("320px").length).toBeGreaterThan(0);

      // Switch to tablet
      rerender(
        React.createElement(Canvas, {
          document: sampleDoc,
          theme: modernPurplePreset,
          viewport: "tablet",
          selectedSectionId: null,
          onSelectSection: onSelect,
          onDeleteSection: vi.fn(),
          onDuplicateSection: vi.fn(),
          onMoveSectionUp: vi.fn(),
          onMoveSectionDown: vi.fn(),
          onAddSectionClick: vi.fn(),
        })
      );

      expect(screen.getByText("Tablet Preview:")).toBeDefined();
      expect(screen.getByText("768px (iPad)")).toBeDefined();
      expect(screen.getByText("820px (Air)")).toBeDefined();

      // Switch to desktop
      rerender(
        React.createElement(Canvas, {
          document: sampleDoc,
          theme: modernPurplePreset,
          viewport: "desktop",
          selectedSectionId: null,
          onSelectSection: onSelect,
          onDeleteSection: vi.fn(),
          onDuplicateSection: vi.fn(),
          onMoveSectionUp: vi.fn(),
          onMoveSectionDown: vi.fn(),
          onAddSectionClick: vi.fn(),
        })
      );

      expect(screen.getByText("Desktop Preview:")).toBeDefined();
      expect(screen.getByText("1024px")).toBeDefined();
      expect(screen.getByText("1280px")).toBeDefined();
      expect(screen.getByText("1440px")).toBeDefined();
      expect(screen.getByText("100%")).toBeDefined();
    });
  });
});
