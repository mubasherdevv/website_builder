import { describe, it, expect } from "vitest";
import {
  validatePageDocument,
  PageDocumentSchema,
  NodeIdRegex,
  ComponentIdRegex,
} from "@/builder/schemas/document.schema";

describe("Document Schemas & Validation", () => {
  it("validates correct node ID and component ID regex formats", () => {
    expect(NodeIdRegex.test("section_header_1")).toBe(true);
    expect(NodeIdRegex.test("hero-split-v1")).toBe(true);
    expect(NodeIdRegex.test("bad id with spaces")).toBe(false);
    expect(NodeIdRegex.test("<script>alert(1)</script>")).toBe(false);

    expect(ComponentIdRegex.test("hero.split.v1")).toBe(true);
    expect(ComponentIdRegex.test("header.simple.v2")).toBe(true);
    expect(ComponentIdRegex.test("footer.v1")).toBe(true);
    expect(ComponentIdRegex.test("InvalidComponent")).toBe(false);
    expect(ComponentIdRegex.test("../../etc/passwd")).toBe(false);
  });

  it("successfully validates a complete valid PageDocument", () => {
    const validDoc = {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: "Home Page",
        slug: "/",
        status: "draft",
        description: "Welcome to our local business",
      },
      sections: [
        {
          id: "sec_header",
          componentId: "header.simple.v1",
          componentVersion: 1,
          props: {
            logoAlt: "Acme Corp",
            ctaLabel: "Contact Us",
          },
          style: {
            background: "surface",
            paddingY: "compact",
          },
          children: [],
        },
        {
          id: "sec_hero",
          componentId: "hero.split.v1",
          componentVersion: 1,
          props: {
            title: "Premium Plumbing in Austin",
            description: "24/7 fast emergency plumbing.",
          },
        },
      ],
    };

    const res = validatePageDocument(validDoc);
    expect(res.success).toBe(true);
    expect(res.data?.page.title).toBe("Home Page");
    expect(res.data?.sections.length).toBe(2);
  });

  it("rejects documents with missing schemaVersion or unsupported version", () => {
    const invalidVersion = {
      schemaVersion: 999,
      page: {
        id: "page_home",
        title: "Home",
        slug: "/",
        status: "draft",
      },
      sections: [],
    };

    const res = validatePageDocument(invalidVersion);
    expect(res.success).toBe(false);
  });

  it("rejects dangerous script tags in strings", () => {
    const maliciousDoc = {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: "<script>alert('xss')</script>",
        slug: "/",
        status: "draft",
      },
      sections: [],
    };

    const res = validatePageDocument(maliciousDoc);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Script tags are forbidden");
  });

  it("rejects invalid page slugs", () => {
    const badSlugDoc = {
      schemaVersion: 1,
      page: {
        id: "page_home",
        title: "Test Page",
        slug: "invalid slug with spaces",
        status: "draft",
      },
      sections: [],
    };

    const res = validatePageDocument(badSlugDoc);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Invalid URL slug format");
  });
});

