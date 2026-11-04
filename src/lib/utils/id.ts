/**
 * Unique ID Generation Utilities
 * Follows improve-backend-code guidelines: uniform, collision-resistant, and schema-safe.
 */

/**
 * Generates a clean, schema-safe unique ID with an optional prefix
 * Format: [prefix]_[random8]
 */
export function generateEntityId(prefix = "id"): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${randomPart}`;
}

/**
 * Generates an incremental revision ID with timestamp
 */
export function generateRevisionId(pageId: string, revisionNumber: number): string {
  const timestamp = Date.now();
  return `rev_${pageId}_${revisionNumber}_${timestamp}`;
}

