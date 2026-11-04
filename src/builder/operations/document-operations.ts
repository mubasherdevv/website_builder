import { PageDocument, SectionNode, SectionStyle } from "@/types/builder";

/**
 * Generate a clean, collision-resistant random node ID
 */
export function generateNodeId(prefix = "node"): string {
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${rand}`;
}

/**
 * Recursively find a node by ID in the tree
 */
export function findNodeById(
  sections: SectionNode[],
  targetId: string
): SectionNode | null {
  for (const section of sections) {
    if (section.id === targetId) return section;
    if (section.children && section.children.length > 0) {
      const found = findNodeById(section.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Insert a new section node at a target index or at the end
 */
export function insertSection(
  doc: PageDocument,
  section: SectionNode,
  targetIndex?: number
): PageDocument {
  const cloned = structuredClone(doc);
  const index =
    typeof targetIndex === "number" && targetIndex >= 0 && targetIndex <= cloned.sections.length
      ? targetIndex
      : cloned.sections.length;

  cloned.sections.splice(index, 0, section);
  return cloned;
}

/**
 * Update properties of a node identified by ID
 */
export function updateNodeProps<T = Record<string, unknown>>(
  doc: PageDocument,
  nodeId: string,
  newProps: Partial<T>
): PageDocument {
  const cloned = structuredClone(doc);

  function updateRecursive(nodes: SectionNode[]): boolean {
    for (const node of nodes) {
      if (node.id === nodeId) {
        node.props = { ...node.props, ...newProps };
        return true;
      }
      if (node.children && updateRecursive(node.children)) {
        return true;
      }
    }
    return false;
  }

  updateRecursive(cloned.sections);
  return cloned;
}

/**
 * Update style of a node identified by ID
 */
export function updateNodeStyle(
  doc: PageDocument,
  nodeId: string,
  newStyle: Partial<SectionStyle>
): PageDocument {
  const cloned = structuredClone(doc);

  function updateRecursive(nodes: SectionNode[]): boolean {
    for (const node of nodes) {
      if (node.id === nodeId) {
        node.style = { ...(node.style || {}), ...newStyle };
        return true;
      }
      if (node.children && updateRecursive(node.children)) {
        return true;
      }
    }
    return false;
  }

  updateRecursive(cloned.sections);
  return cloned;
}

/**
 * Move a section from source index to destination index
 */
export function moveSection(
  doc: PageDocument,
  fromIndex: number,
  toIndex: number
): PageDocument {
  if (
    fromIndex < 0 ||
    fromIndex >= doc.sections.length ||
    toIndex < 0 ||
    toIndex >= doc.sections.length ||
    fromIndex === toIndex
  ) {
    return doc;
  }

  const cloned = structuredClone(doc);
  const [removed] = cloned.sections.splice(fromIndex, 1);
  cloned.sections.splice(toIndex, 0, removed);
  return cloned;
}

/**
 * Duplicate a section, assigning unique new IDs to it and all its children
 */
export function duplicateSection(
  doc: PageDocument,
  nodeId: string
): PageDocument {
  const cloned = structuredClone(doc);
  const targetIndex = cloned.sections.findIndex((s) => s.id === nodeId);
  if (targetIndex === -1) return doc;

  const original = cloned.sections[targetIndex];

  function cloneWithNewIds(node: SectionNode): SectionNode {
    return {
      ...node,
      id: generateNodeId("sec"),
      children: node.children ? node.children.map(cloneWithNewIds) : [],
    };
  }

  const duplicated = cloneWithNewIds(original);
  cloned.sections.splice(targetIndex + 1, 0, duplicated);
  return cloned;
}

/**
 * Delete a node by ID anywhere in the hierarchy
 */
export function deleteNode(doc: PageDocument, nodeId: string): PageDocument {
  const cloned = structuredClone(doc);

  function removeRecursive(nodes: SectionNode[]): boolean {
    const idx = nodes.findIndex((n) => n.id === nodeId);
    if (idx !== -1) {
      nodes.splice(idx, 1);
      return true;
    }
    for (const node of nodes) {
      if (node.children && removeRecursive(node.children)) {
        return true;
      }
    }
    return false;
  }

  removeRecursive(cloned.sections);
  return cloned;
}

