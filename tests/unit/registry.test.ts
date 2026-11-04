import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  componentRegistry,
  isComponentRegistered,
  getComponentDefinition,
  listRegisteredComponents,
  validateComponentProps,
} from "@/builder/registry";

describe("Component Registry & Initial Component Library", () => {
  it("contains all initial business components", () => {
    const registeredIds = Object.keys(componentRegistry);
    expect(registeredIds).toContain("header.simple.v1");
    expect(registeredIds).toContain("hero.split.v1");
    expect(registeredIds).toContain("services.grid.v1");
    expect(registeredIds).toContain("testimonials.cards.v1");
    expect(registeredIds).toContain("contact.form.v1");
    expect(registeredIds).toContain("footer.simple.v1");
    expect(registeredIds).toContain("about.split.v1");
    expect(registeredIds).toContain("features.grid.v1");
    expect(registeredIds).toContain("gallery.grid.v1");
    expect(registeredIds).toContain("cta.banner.v1");
    expect(registeredIds).toContain("custom.embed.v1");
  });

  it("safely rejects arbitrary or malicious component IDs", () => {
    expect(isComponentRegistered("../../etc/passwd")).toBe(false);
    expect(isComponentRegistered("arbitrary.eval.v1")).toBe(false);
    expect(getComponentDefinition("non.existent.v1")).toBeNull();
  });

  it("lists all registered components with categories and editor controls", () => {
    const list = listRegisteredComponents();
    expect(list.length).toBeGreaterThanOrEqual(11);
    for (const comp of list) {
      expect(comp.id).toBeTruthy();
      expect(comp.name).toBeTruthy();
      expect(comp.category).toBeTruthy();
      expect(comp.editor.controls.length).toBeGreaterThan(0);
      expect(comp.defaults).toBeDefined();
    }
  });

  it("validates props against schema and populates defaults", () => {
    const validRes = validateComponentProps("hero.split.v1", {
      title: "Austin Emergency Plumbing",
    });
    expect(validRes.success).toBe(true);
    expect(validRes.data?.title).toBe("Austin Emergency Plumbing");
    expect(validRes.data?.eyebrow).toBe("Verified & Licensed Local Experts");

    const unregRes = validateComponentProps("bad.comp.v1", {});
    expect(unregRes.success).toBe(false);
    expect(unregRes.error).toContain("Unregistered component ID");
  });

  it("renders HeroSplit component with custom props in DOM", () => {
    const def = getComponentDefinition("hero.split.v1");
    expect(def).not.toBeNull();
    if (!def) return;

    const Component = def.component as React.ComponentType<any>;
    render(
      React.createElement(Component, {
        title: "24/7 Top Roofing in Dallas",
        eyebrow: "Certified Roofers",
        description: "We protect your home from hail and storms.",
        primaryButtonLabel: "Request Estimate",
        primaryButtonHref: "#quote",
        secondaryButtonLabel: "Call Hotline",
        secondaryButtonHref: "tel:12345",
        imageUrl: "https://example.com/roof.jpg",
        imageAlt: "Roof repair",
        badgeText: "10-Year Warranty",
      })
    );

    expect(screen.getByText("24/7 Top Roofing in Dallas")).toBeDefined();
    expect(screen.getByText("Certified Roofers")).toBeDefined();
    expect(screen.getByText("Request Estimate")).toBeDefined();
  });

  it("renders ServicesGrid component in DOM", () => {
    const def = getComponentDefinition("services.grid.v1");
    expect(def).not.toBeNull();
    if (!def) return;

    const Component = def.component as React.ComponentType<any>;
    render(
      React.createElement(Component, {
        title: "Our Specialties",
        eyebrow: "Services",
        subtitle: "Check out what we offer.",
        columns: "3",
        services: [
          { title: "Pipe Cleaning", description: "Clear blockages fast.", icon: "wrench" },
          { title: "Heater Repair", description: "Hot water all year.", icon: "check" },
        ],
      })
    );

    expect(screen.getByText("Our Specialties")).toBeDefined();
    expect(screen.getByText("Pipe Cleaning")).toBeDefined();
    expect(screen.getByText("Heater Repair")).toBeDefined();
  });
});
