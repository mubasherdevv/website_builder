import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InnerPageHero } from "@/components/website/hero/InnerPageHero";
import { componentRegistry } from "@/builder/registry";

describe("InnerPageHero Component & Registry (Phase 1)", () => {
  it("should be successfully registered in componentRegistry with id 'hero.inner.v1'", () => {
    expect(componentRegistry["hero.inner.v1"]).toBeDefined();
    expect(componentRegistry["hero.inner.v1"].id).toBe("hero.inner.v1");
    expect(componentRegistry["hero.inner.v1"].category).toBe("hero");
  });

  it("should render default title, subtitle, and breadcrumb within the same hero banner", () => {
    render(
      <InnerPageHero
        title="Roof Repair & Maintenance"
        subtitle="Professional roof care in Austin, Texas."
        customBreadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Roof Repair", href: "/services/roof-repair" },
        ]}
      />
    );

    // H1 Heading
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Roof Repair & Maintenance");

    // Subtitle
    expect(screen.getByText("Professional roof care in Austin, Texas.")).toBeDefined();

    // Breadcrumb navigation
    const breadcrumbNav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(breadcrumbNav).toBeDefined();
    expect(screen.getByText("Roof Repair")).toBeDefined();
    expect(screen.getByText("Services")).toBeDefined();
  });

  it("should hide breadcrumbs when showBreadcrumb is false", () => {
    render(
      <InnerPageHero
        title="Contact Us"
        showBreadcrumb={false}
        customBreadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]}
      />
    );

    expect(screen.queryByRole("navigation", { name: /breadcrumb/i })).toBeNull();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Contact Us");
  });

  it("should hide breadcrumbs on image background when hideBreadcrumbOnImageBg is true", () => {
    const { rerender } = render(
      <InnerPageHero
        title="Our Story"
        bgType="image"
        showBreadcrumb={true}
        hideBreadcrumbOnImageBg={true}
      />
    );
    expect(screen.queryByRole("navigation", { name: /breadcrumb/i })).toBeNull();

    // Switching back to color should restore breadcrumb
    rerender(
      <InnerPageHero
        title="Our Story"
        bgType="color"
        showBreadcrumb={true}
        hideBreadcrumbOnImageBg={true}
      />
    );
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeDefined();
  });

  it("should render primary and secondary CTAs when provided", () => {
    render(
      <InnerPageHero
        title="Commercial Roofing"
        primaryCtaLabel="Get Free Quote"
        primaryCtaHref="/quote"
        secondaryCtaLabel="Call (512) 555-0199"
        secondaryCtaHref="tel:5125550199"
      />
    );

    const primaryLink = screen.getByRole("link", { name: /get free quote/i });
    expect(primaryLink.getAttribute("href")).toBe("/quote");

    const secondaryLink = screen.getByRole("link", { name: /call \(512\) 555-0199/i });
    expect(secondaryLink.getAttribute("href")).toBe("tel:5125550199");
  });
});
