import { describe, it, expect } from "vitest";
import { PageDocument, SectionNode } from "@/types/builder";
import {
  insertSection,
  updateNodeProps,
  updateNodeStyle,
  moveSection,
  duplicateSection,
  deleteNode,
  findNodeById,
  generateNodeId,
} from "@/builder/operations/document-operations";

describe("Document Operations", () => {
  const initialDoc: PageDocument = {
    schemaVersion: 1,
    page: {
      id: "page_home",
      title: "Home",
      slug: "/",
      status: "draft",
    },
    sections: [
      {
        id: "sec_1",
        componentId: "header.simple.v1",
        componentVersion: 1,
        props: { logoAlt: "Brand" },
      },
      {
        id: "sec_2",
        componentId: "hero.split.v1",
        componentVersion: 1,
        props: { title: "Hero Title" },
      },
    ],
  };

  it("finds a node by ID", () => {
    const found = findNodeById(initialDoc.sections, "sec_2");
    expect(found).not.toBeNull();
    expect(found?.componentId).toBe("hero.split.v1");

    const notFound = findNodeById(initialDoc.sections, "sec_nonexistent");
    expect(notFound).toBeNull();
  });

  it("inserts a section at a specified position or end", () => {
    const newSection: SectionNode = {
      id: "sec_3",
      componentId: "footer.simple.v1",
      componentVersion: 1,
      props: { copyright: "2026" },
    };

    const docAfterInsert = insertSection(initialDoc, newSection);
    expect(docAfterInsert.sections.length).toBe(3);
    expect(docAfterInsert.sections[2].id).toBe("sec_3");

    // Insert at index 1
    const docInsertMiddle = insertSection(initialDoc, newSection, 1);
    expect(docInsertMiddle.sections[1].id).toBe("sec_3");
    expect(docInsertMiddle.sections[2].id).toBe("sec_2");
  });

  it("updates node props immutably", () => {
    const updated = updateNodeProps(initialDoc, "sec_2", {
      title: "Updated Hero Headline",
      eyebrow: "New Eyebrow",
    });

    expect(updated.sections[1].props.title).toBe("Updated Hero Headline");
    expect(updated.sections[1].props.eyebrow).toBe("New Eyebrow");
    // Ensure original is untouched
    expect(initialDoc.sections[1].props.title).toBe("Hero Title");
  });

  it("updates node style", () => {
    const updated = updateNodeStyle(initialDoc, "sec_1", {
      background: "brand",
      paddingY: "compact",
    });

    expect(updated.sections[0].style?.background).toBe("brand");
    expect(updated.sections[0].style?.paddingY).toBe("compact");
  });

  it("moves a section between indices", () => {
    const moved = moveSection(initialDoc, 0, 1);
    expect(moved.sections[0].id).toBe("sec_2");
    expect(moved.sections[1].id).toBe("sec_1");
  });

  it("duplicates a section with new unique IDs", () => {
    const duplicated = duplicateSection(initialDoc, "sec_1");
    expect(duplicated.sections.length).toBe(3);
    expect(duplicated.sections[1].componentId).toBe("header.simple.v1");
    expect(duplicated.sections[1].id).not.toBe("sec_1");
    expect(duplicated.sections[1].id.startsWith("sec_")).toBe(true);
  });

  it("deletes a node by ID", () => {
    const deleted = deleteNode(initialDoc, "sec_1");
    expect(deleted.sections.length).toBe(1);
    expect(deleted.sections[0].id).toBe("sec_2");
  });

  it("generates random valid IDs", () => {
    const id1 = generateNodeId("test");
    const id2 = generateNodeId("test");
    expect(id1.startsWith("test_")).toBe(true);
    expect(id1).not.toBe(id2);
  });
});

