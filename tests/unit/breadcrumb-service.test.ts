import { describe, it, expect } from "vitest";
import { BreadcrumbService } from "@/lib/services/breadcrumb.service";

describe("BreadcrumbService (Phase 2)", () => {
  it("resolves service sub-page breadcrumbs correctly", () => {
    const res = BreadcrumbService.resolveBreadcrumbs({
      slug: "/services/roof-repair",
      title: "Roof Repair",
      pageType: "service",
    });

    expect(res.items).toEqual([
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Roof Repair", href: "/services/roof-repair" },
    ]);

    expect(res.schemaJsonLd["@type"]).toBe("BreadcrumbList");
    expect(res.schemaJsonLd.itemListElement).toHaveLength(3);
    expect(res.schemaJsonLd.itemListElement[2].name).toBe("Roof Repair");
  });

  it("resolves location page breadcrumbs correctly", () => {
    const res = BreadcrumbService.resolveBreadcrumbs({
      slug: "/locations/austin",
      title: "Austin Roofing",
      pageType: "location",
    });

    expect(res.items).toEqual([
      { label: "Home", href: "/" },
      { label: "Service Areas", href: "/service-areas" },
      { label: "Austin Roofing", href: "/locations/austin" },
    ]);
  });

  it("resolves blog article breadcrumbs with category", () => {
    const res = BreadcrumbService.resolveBreadcrumbs({
      slug: "/blog/battery-maintenance",
      title: "Battery Maintenance Guide",
      pageType: "blog-post",
      categoryName: "Golf Cart Care",
      categorySlug: "golf-cart-care",
    });

    expect(res.items).toEqual([
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Golf Cart Care", href: "/blog/category/golf-cart-care" },
      { label: "Battery Maintenance Guide", href: "/blog/battery-maintenance" },
    ]);

    expect(res.schemaJsonLd.itemListElement).toHaveLength(4);
    expect(res.schemaJsonLd.itemListElement[2].name).toBe("Golf Cart Care");
    expect(res.schemaJsonLd.itemListElement[3].name).toBe("Battery Maintenance Guide");
  });

  it("resolves single top-level page without duplicates", () => {
    const res = BreadcrumbService.resolveBreadcrumbs({
      slug: "/about",
      title: "About Us",
    });

    expect(res.items).toEqual([
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
    ]);
  });
});

